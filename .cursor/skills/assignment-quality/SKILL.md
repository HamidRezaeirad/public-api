---
name: assignment-quality
description: Apply cross-cutting engineering standards for the SEC EDGAR coding assignment, including scope control, API contracts, documentation integrity, security, accessibility, testing, and delivery readiness. Use throughout the assignment and before reviews or submission.
---

# Assignment Quality and Delivery Skill

## Assignment objective
Deliver a working, read-only REST API in NestJS/TypeScript exposing SEC EDGAR filings for AAPL, META, GOOGL, AMZN, NFLX, and GS, with a React/TypeScript demonstration UI if the existing frontend is part of the submission.

Required API capabilities:
- Look up a supported company by ticker.
- List filings newest first.
- Filter by form type and date range.
- Paginate results.
- Return form type, filing date, report date, accession number, and primary SEC document URL.
- Fetch a filing by accession number.
- No database is required.

## Scope discipline
- Treat the written assignment as the source of truth.
- Implement required behavior before optional polish.
- Do not add authentication, database persistence, user accounts, alerts, analytics, charts, or unrelated features unless explicitly requested.
- Prefer a complete, understandable solution over a broad but unfinished one.
- If a requirement is ambiguous, record the assumption and ask for clarification when it affects the API contract.

## API contract quality
- Keep endpoint names, query parameters, response shapes, validation, and error semantics consistent.
- Document examples in README and verify examples against actual responses.
- Use stable, predictable JSON contracts independent of SEC upstream response shapes.
- Define date filtering semantics clearly. Use filing date unless the assignment or agreed contract says otherwise.
- Make date boundaries inclusive and test them, unless another behavior is explicitly chosen and documented.
- Validate page and limit; use defaults and a maximum page size.
- Sort newest first and define deterministic tie-breaking.
- Return an empty list for valid filters with no matches.
- Distinguish invalid input, unsupported company, missing filing, and upstream provider failure.

## Upstream provider reliability
- Treat SEC data as untrusted external input.
- Use a descriptive User-Agent and respect SEC fair-access/rate-limit guidance.
- Configure timeouts and map upstream errors to suitable API errors.
- Avoid uncontrolled retries and repeated requests.
- Handle historical submission files when required by the requested range or accession lookup.
- Never fabricate filing data, accession numbers, primary document filenames, or SEC URLs.
- Do not claim full historical coverage unless the implementation actually supports it.

## Security and dependency hygiene
- Validate and normalize all user input.
- Construct SEC URLs only from trusted SEC base URLs and validated identifiers.
- Do not expose secrets, stack traces, or raw provider error bodies.
- Keep contact details and other configuration out of source control where appropriate.
- Inspect existing dependencies before adding packages.
- Prefer maintained, compatible packages and existing project capabilities.
- Check the lockfile and use the package manager's audit command when available. Report findings without automatically applying risky major upgrades.
- Do not claim dependencies are vulnerability-free unless a scan was actually run.

## Quality gates
Before considering the work complete, run the checks supported by the repository:
- Backend unit tests and relevant e2e tests.
- Frontend tests.
- TypeScript typecheck/build.
- Lint/format checks.
- Dependency audit, if available.
- Manual smoke test of the required API endpoints.
- Manual smoke test of the frontend's core flow, if included.

Record exact commands, environment assumptions, and real outcomes. If a check cannot be run, state why and what remains unverified.

## Required documentation
Maintain `README.md`, `NOTES.md`, and the existing automatic `PROMPT_LOG.md`.

### PROMPT_LOG.md
- It is the evidence of actual AI-assisted work.
- Preserve exact user prompts where the logger captures them, timestamps, AI tool/model details where available, and actual tool calls/actions where available.
- Do not fabricate or reconstruct missing conversation history.
- If information is unavailable, label it as unavailable rather than guessing.
- Do not rewrite history to make decisions appear more deliberate than they were.

### NOTES.md
Keep a concise record of:
- What was built.
- Architecture and key technical decisions, including reasons.
- Assumptions and trade-offs.
- What was skipped and why.
- Known limitations and incomplete requirements.
- Tests/checks run and actual results.
- What would be done next with more time.

### README.md
Include:
- Project overview and architecture.
- Prerequisites and setup.
- Required environment variables and safe examples.
- Commands to run backend and frontend.
- Commands to run tests, lint, and typecheck.
- Endpoint documentation with query parameters and response examples.
- Any known limitations relevant to running the application.

## AI ownership and review behavior
- Do not implement a large feature blindly. Work in small, reviewable steps.
- Explain important choices and alternatives before significant changes.
- Ask the developer to decide when a trade-off materially changes the contract, scope, security, or architecture.
- Highlight assumptions, edge cases, and risks.
- Encourage the developer to inspect and challenge generated code.
- Never state that code is correct merely because it compiles.
- Never claim a test, command, manual check, or audit ran unless it actually ran.
- Distinguish AI suggestions from developer decisions in notes.

## Git and delivery
- Keep changes cohesive and reviewable.
- Do not commit secrets, local environment files, build artifacts, or dependency caches.
- Review `git diff` before finalizing.
- Do not rewrite or discard user changes.
- Ensure the repository starts using documented commands.
- Final review should map every assignment requirement to implementation files and test evidence.

## Final response format after a task
When completing a task, report:
1. What changed.
2. Files created/modified.
3. Important decisions and assumptions.
4. Tests/checks actually run and results.
5. Known gaps or risks.
6. Suggested next step.

Be concise and factual.
