# Notes

The candidate edits these entries.

## YYYY-MM-DDTHH:MM+TZ
Decision: ...
Rejected: ...
Why: ...

## 2026-11-14T10:47+01:00
Decision: A project hook appends each user prompt and tool call to PROMPT_LOG.md. A project skill appends design notes to NOTES.md.
Rejected: Asking the agent to maintain the prompt log.
Why: The log is the record of what was sent and which tools ran. The hook writes that at send time. The agent can miss a turn, and Ask mode cannot write files.
