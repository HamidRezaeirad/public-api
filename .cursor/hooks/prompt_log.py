#!/usr/bin/env python3
"""Append Cursor hook events to prompt and tool logs, plus a raw JSONL file.

PROMPT_LOG.md receives each user prompt and the later reply.
TOOL_CALL_LOG.md receives tool calls under the same session heading and timestamp.
Decisions stay in NOTES.md. Session start is recorded only in the JSONL file.

Fails open: a crash still prints valid hook JSON and exits 0.
"""

from __future__ import annotations

import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

try:
    import fcntl
except ImportError:  # pragma: no cover - Windows has no fcntl
    fcntl = None

CAP = 4000
PROMPT_HEADER = """# Prompt log

Each user prompt is one section. Set a title in `.cursor/session-title.txt` (first line); it is locked for that conversation. Tool calls are in `TOOL_CALL_LOG.md`. Decisions are in `NOTES.md`.

"""
TOOL_HEADER = """# Tool call log

Tool calls for each prompt. The session heading and timestamp match `PROMPT_LOG.md`.

"""
SESSION_BOUNDARY = re.compile(r"\n## Session \d+")


def project_root() -> Path:
    env = os.environ.get("CURSOR_PROJECT_DIR")
    if env:
        return Path(env)
    return Path(__file__).resolve().parents[2]


def now_stamp() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def as_text(value: object) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        stripped = value.strip()
        if stripped.startswith("{") or stripped.startswith("["):
            try:
                parsed = json.loads(value)
            except json.JSONDecodeError:
                return value
            return json.dumps(parsed, indent=2, ensure_ascii=False)
        return value
    return json.dumps(value, indent=2, ensure_ascii=False)


def cap(value: object) -> str:
    text = as_text(value)
    if len(text) <= CAP:
        return text
    omitted = len(text) - CAP
    return text[:CAP] + f"\n\n… truncated ({omitted} characters omitted)"


def one_line(value: object) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"
    return " ".join(as_text(value).split())


def fence(text: str) -> str:
    body = text if text.endswith("\n") or text == "" else text + "\n"
    width = 3
    while "`" * width in body:
        width += 1
    ticks = "`" * width
    return f"{ticks}\n{body}{ticks}\n"


def model_of(event: dict) -> str:
    return one_line(event.get("model_id") or event.get("model") or "")


def conversation_of(event: dict) -> str:
    return str(event.get("conversation_id") or event.get("session_id") or "")


def session_heading(number: int, title: str) -> str:
    title = title.strip()
    if title:
        return f"## Session {number} - {title}"
    return f"## Session {number}"


def read_title(root: Path) -> str:
    path = root / ".cursor" / "session-title.txt"
    if not path.is_file():
        return ""
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except OSError:
        return ""
    return lines[0].strip() if lines else ""


def empty_state() -> dict:
    return {"next": 1, "conversations": {}, "generations": {}}


def load_state(path: Path) -> dict:
    if not path.exists():
        return empty_state()
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return empty_state()
    if not isinstance(data, dict):
        return empty_state()
    data.setdefault("next", 1)
    data.setdefault("conversations", {})
    data.setdefault("generations", {})
    return data


def save_state(path: Path, state: dict) -> None:
    path.write_text(json.dumps(state, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def ensure_session(state: dict, event: dict, root: Path, lock_title: bool) -> str:
    conversations = state["conversations"]
    key = conversation_of(event)
    existing = conversations.get(key)
    if isinstance(existing, dict) and existing.get("number"):
        if lock_title and not existing.get("title_locked"):
            existing["title"] = read_title(root)
            existing["title_locked"] = True
        return session_heading(int(existing["number"]), str(existing.get("title") or ""))
    number = int(state.get("next") or 1)
    title = read_title(root) if lock_title else ""
    conversations[key] = {"number": number, "title": title, "title_locked": lock_title}
    state["next"] = number + 1
    return session_heading(number, title)


def ensure_gap(path: Path) -> None:
    with path.open("rb+") as handle:
        handle.seek(0, os.SEEK_END)
        size = handle.tell()
        if size == 0:
            return
        handle.seek(max(0, size - 2))
        tail = handle.read()
        if tail.endswith(b"\n\n"):
            return
        extra = b"\n" if tail.endswith(b"\n") else b"\n\n"
        handle.write(extra)


def ensure_log(path: Path, header: str) -> None:
    if not path.exists() or path.stat().st_size == 0:
        path.write_text(header, encoding="utf-8")
    else:
        ensure_gap(path)


def render_prompt_section(heading: str, timestamp: str, model: str, prompt: str, marker: str) -> str:
    lines = [
        heading,
        f"Timestamp: {timestamp}",
        "Tool: Cursor",
        f"Model: {model}",
        "Prompt:",
        "",
        fence(prompt).rstrip("\n"),
        "AI response summary:",
        "",
        marker,
    ]
    return "\n".join(lines).rstrip() + "\n"


def render_tool_entry(event: dict, failed: bool) -> str:
    name = one_line(event.get("tool_name") or "tool") or "tool"
    label = f"tool-failure {name}" if failed else f"tool {name}"
    lines = [f"### {label}", ""]
    if event.get("tool_use_id"):
        lines.append(f"tool_use_id: {one_line(event.get('tool_use_id'))}")
    if failed and event.get("failure_type"):
        lines.append(f"failure_type: {one_line(event.get('failure_type'))}")
    if event.get("duration") is not None:
        lines.append(f"duration_ms: {one_line(event.get('duration'))}")
    if failed and event.get("is_interrupt") is not None:
        lines.append(f"is_interrupt: {one_line(event.get('is_interrupt'))}")
    lines.append("")
    lines.append("input:")
    lines.append("")
    lines.append(fence(cap(event.get("tool_input"))).rstrip("\n"))
    if failed:
        lines.append("error:")
        lines.append("")
        lines.append(fence(cap(event.get("error_message"))).rstrip("\n"))
    else:
        lines.append("output:")
        lines.append("")
        lines.append(fence(cap(event.get("tool_output"))).rstrip("\n"))
    return "\n".join(lines).rstrip() + "\n"


def place_tool(text: str, heading: str, timestamp: str, entry: str) -> str:
    header = f"{heading}\nTimestamp: {timestamp}\n"
    block = entry.strip() + "\n"
    idx = text.find(header)
    if idx == -1:
        return text.rstrip() + "\n\n" + header + "\n" + block + "\n"
    rest = idx + len(header)
    match = SESSION_BOUNDARY.search(text, rest)
    if match is None:
        return text.rstrip() + "\n\n" + block + "\n"
    before = text[: match.start()].rstrip() + "\n\n" + block + "\n"
    return before + text[match.start() + 1 :]


def record_prompt(event: dict, root: Path, logged_at: str, state: dict) -> None:
    heading = ensure_session(state, event, root, lock_title=True)
    generation = str(event.get("generation_id") or "")
    token = generation if generation else f"none-{logged_at}"
    marker = f"<!-- pending:{token} {logged_at} -->"
    prompt = event.get("prompt")
    prompt_text = prompt if isinstance(prompt, str) else as_text(prompt)
    state["generations"][token] = {
        "heading": heading,
        "timestamp": logged_at,
        "marker": marker,
    }
    path = root / "PROMPT_LOG.md"
    ensure_log(path, PROMPT_HEADER)
    section = render_prompt_section(heading, logged_at, model_of(event), prompt_text, marker)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(section + "\n")


def fill_reply(event: dict, root: Path, state: dict) -> None:
    path = root / "PROMPT_LOG.md"
    if not path.exists():
        return
    text = path.read_text(encoding="utf-8")
    generation = str(event.get("generation_id") or "")
    marker = ""
    if generation:
        info = state["generations"].get(generation)
        if isinstance(info, dict):
            marker = str(info.get("marker") or "")
    else:
        for info in state["generations"].values():
            if not isinstance(info, dict):
                continue
            candidate = str(info.get("marker") or "")
            if candidate and candidate in text:
                marker = candidate
                break
    if not marker or marker not in text:
        return
    reply = event.get("text")
    reply_text = reply if isinstance(reply, str) else as_text(reply)
    path.write_text(text.replace(marker, fence(reply_text).rstrip("\n"), 1), encoding="utf-8")


def record_tool(event: dict, root: Path, logged_at: str, state: dict, failed: bool) -> None:
    generation = str(event.get("generation_id") or "")
    info = state["generations"].get(generation) if generation else None
    if isinstance(info, dict) and info.get("heading") and info.get("timestamp"):
        heading = str(info["heading"])
        timestamp = str(info["timestamp"])
    else:
        heading = ensure_session(state, event, root, lock_title=False)
        timestamp = logged_at
    path = root / "TOOL_CALL_LOG.md"
    ensure_log(path, TOOL_HEADER)
    text = path.read_text(encoding="utf-8")
    path.write_text(
        place_tool(text, heading, timestamp, render_tool_entry(event, failed)),
        encoding="utf-8",
    )


def append_jsonl(path: Path, logged_at: str, event: dict) -> None:
    record = {"logged_at": logged_at, "event": event}
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(record, ensure_ascii=False) + "\n")


def dispatch(event: dict, root: Path, logged_at: str) -> None:
    jsonl_dir = root / ".cursor" / "hook-logs"
    jsonl_dir.mkdir(parents=True, exist_ok=True)
    state_path = jsonl_dir / "session-state.json"
    jsonl_path = jsonl_dir / "events.jsonl"

    def write() -> None:
        append_jsonl(jsonl_path, logged_at, event)
        name = event.get("hook_event_name")
        if name not in {"beforeSubmitPrompt", "afterAgentResponse", "postToolUse", "postToolUseFailure"}:
            return
        state = load_state(state_path)
        if name == "beforeSubmitPrompt":
            record_prompt(event, root, logged_at, state)
            save_state(state_path, state)
        elif name == "afterAgentResponse":
            fill_reply(event, root, state)
        elif name == "postToolUse":
            record_tool(event, root, logged_at, state, failed=False)
            save_state(state_path, state)
        else:
            record_tool(event, root, logged_at, state, failed=True)
            save_state(state_path, state)

    if fcntl is None:
        write()
        return

    lock_path = jsonl_dir / ".lock"
    with lock_path.open("a", encoding="utf-8") as lock:
        fcntl.flock(lock.fileno(), fcntl.LOCK_EX)
        try:
            write()
        finally:
            fcntl.flock(lock.fileno(), fcntl.LOCK_UN)


def respond(event: dict) -> None:
    name = event.get("hook_event_name") if isinstance(event, dict) else ""
    if name == "beforeSubmitPrompt":
        sys.stdout.write(json.dumps({"continue": True}) + "\n")
    else:
        sys.stdout.write("{}\n")


def main() -> None:
    raw = sys.stdin.read()
    event: dict = {}
    try:
        parsed = json.loads(raw) if raw.strip() else {}
        event = parsed if isinstance(parsed, dict) else {"hook_event_name": "invalid-json", "raw": raw}
    except json.JSONDecodeError:
        event = {"hook_event_name": "invalid-json", "raw": raw}

    try:
        dispatch(event, project_root(), now_stamp())
    except Exception as exc:  # noqa: BLE001 - hooks must fail open
        sys.stderr.write(f"prompt_log hook failed: {exc}\n")

    respond(event)


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # noqa: BLE001 - hooks must fail open
        sys.stderr.write(f"prompt_log hook failed: {exc}\n")
        sys.stdout.write("{}\n")
        sys.exit(0)
