# Notes

## 2026-11-14T12:30+01:00
Decision: the hook writes prompts and replies to `PROMPT_LOG.md`, and tool calls to `TOOL_CALL_LOG.md` under the same session heading and timestamp. Decisions stay in `NOTES.md`.
Rejected: one combined prompt log that includes tool input/output and copied decisions.
Why: the combined log is too large to read, and the hook still records each event when it happens.
