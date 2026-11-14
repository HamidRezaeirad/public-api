---
name: interview-notes
description: >-
  Appends design decisions, rejections, and changes in approach to NOTES.md.
  Use whenever a prompt in this repo produces a design choice, a rejection,
  or a change in approach.
---

# Interview notes

After a turn that settles a design choice, rejects an option, or changes approach, append one entry to `NOTES.md`. Leave `PROMPT_LOG.md` and `TOOL_CALL_LOG.md` untouched. A hook writes those files. Decisions stay in `NOTES.md`.

Write only in Agent mode, when files can be edited. In Ask mode, skip the write.

Append this shape, using the current local time:

```markdown
## YYYY-MM-DDTHH:MM+TZ
Decision: ...
Rejected: ...
Why: ...
```

State what was chosen, what was set aside, and why. Keep it short. Do not rewrite earlier entries.

If the turn produced no design choice, add nothing.
