---
name: backend-nestjs
description: Design, implement, review, and test modular NestJS TypeScript backend code using SOLID, DRY, dependency injection, clear responsibilities, and maintainable API boundaries. Use when working on backend modules, controllers, services, DTOs, providers, integrations, validation, errors, or tests.
---

# NestJS Backend Engineering Skill

## Purpose
Build and maintain the SEC EDGAR filings backend in the existing NestJS project. Prefer simple, explicit, testable code over speculative abstractions. Follow the repository's established conventions unless they conflict with correctness, security, or maintainability.

## Before changing code
1. Inspect the relevant module, neighboring modules, package scripts, TypeScript configuration, lint rules, and tests.
2. Identify the existing NestJS version and installed libraries. Do not upgrade or add dependencies without explaining the need and checking compatibility.
3. State the files you intend to change and the responsibility of each change.
4. Keep changes within the assignment scope. Do not create a database, authentication system, background jobs, caching infrastructure, or generic framework unless a requirement justifies it.
5. If requirements or existing behavior are unclear, ask a focused question rather than guessing.

## Architecture and module boundaries
- Organize code by business capability, not by technical file type alone.
- Keep each NestJS module cohesive and responsible for one capability, for example companies, filings, and SEC integration.
- A module owns its controller, application/service logic, DTOs, domain types, and providers where appropriate.
- Avoid circular module dependencies. If two modules need the same capability, extract a small well-named provider into an appropriate shared/integration module only when justified.
- Keep `main.ts` focused on application bootstrap and global configuration.
- Keep controllers thin: parse/validate input through DTOs and pipes, delegate to services, and map results to HTTP responses.
- Services should have one clear reason to change. Split a service when it mixes unrelated responsibilities, but do not create a class for every trivial operation.
- Keep SEC transport and response-shape handling behind an integration boundary. Do not leak raw SEC response objects into controllers or public API responses.
- Define explicit public response contracts. Do not return arbitrary upstream payloads.

## SOLID and DRY
- Single Responsibility: each class/module has a cohesive purpose.
- Open/Closed: extend behavior through clear interfaces or composition when needed; avoid premature plugin architectures.
- Liskov Substitution: implementations must honor the contracts of their interfaces.
- Interface Segregation: prefer small, role-specific interfaces over broad service interfaces.
- Dependency Inversion: high-level application logic depends on abstractions where this materially improves testability; use NestJS providers/tokens for replaceable external dependencies.
- DRY: centralize genuinely shared rules, URL construction, validation, and mapping. Do not create abstractions for code used only once unless they clarify a meaningful boundary.
- Prefer composition over inheritance. Avoid base classes used only to share a few lines.
- Avoid service locator patterns and manual `new` construction of injected dependencies.

## Dependency injection
- Use NestJS constructor injection and module providers.
- Register providers in the module that owns them and export only what other modules need.
- Use injection tokens for external clients or interface-typed dependencies where useful.
- Do not instantiate HTTP clients or services inside request handlers.
- Make dependencies explicit; avoid hidden global state.
- Keep configuration in the existing configuration mechanism. Validate required configuration at startup where practical.
- Provide test doubles through Nest testing modules or provider overrides.

## SEC EDGAR integration
- Treat SEC as an upstream provider whose data may be incomplete, delayed, malformed, or temporarily unavailable.
- Send a descriptive `User-Agent` with an application name and a real maintainer contact configured for the project. Never invent a contact address.
- Respect SEC fair-access guidance and rate limits. Centralize outbound HTTP behavior, set timeouts, and avoid unnecessary repeated requests.
- Do not assume the SEC API supports arbitrary server-side filters or pagination. Apply supported filtering and pagination in our API layer.
- Company tickers must resolve to CIKs correctly. Preserve the 10-digit zero-padded CIK in API data; remove leading zeroes only where the SEC Archives URL format requires it.
- Build accession archive paths by removing dashes from the accession number. Obtain the primary document filename from filing metadata; do not guess it from the accession number.
- Handle recent submissions and historical filing files referenced by the submissions response when the requested range requires them. Do not silently claim complete history if only recent filings were inspected.
- Validate and normalize dates consistently. Use filing date for date-range filtering unless the API contract explicitly states otherwise. Define inclusive/exclusive boundaries and document them.
- Sort newest first using filing date, with a deterministic tie-breaker if dates match.
- Return only the required filing fields: form type, filing date, report date, accession number, and primary document URL, plus documented pagination metadata.
- Keep upstream URLs and response quirks inside the SEC integration layer.

## API design
- Use resource-oriented REST routes and consistent naming.
- Use DTO classes and the project's existing validation approach for path/query/body validation.
- Reject invalid dates, invalid page/limit values, reversed date ranges, and malformed accession numbers with clear 4xx responses.
- Apply a documented maximum page size. Use sensible defaults.
- Use appropriate HTTP status codes: 400 for invalid input, 404 for unsupported/missing resources, and 502/503/504 as appropriate for upstream failures.
- Do not expose stack traces, secrets, raw upstream errors, or internal implementation details to clients.
- Keep error response shape consistent with the existing project conventions.
- Avoid returning `null` ambiguously; use explicit not-found behavior or documented optional fields.

## TypeScript practices
- Keep `strict` typing enabled where the existing project supports it.
- Avoid `any`, unsafe casts, non-null assertions, and broad `unknown` suppression. Narrow `unknown` at boundaries.
- Define types for SEC upstream payloads and separate types for internal domain data and public API DTOs.
- Use `readonly` where it communicates immutable data; avoid overengineering types.
- Prefer explicit return types on public service methods and exported functions.
- Do not duplicate type definitions across modules; share only stable contracts.

## Testing
- Unit-test business logic independently from network access.
- Mock the SEC client at the integration boundary; do not make live SEC calls in ordinary unit tests.
- Cover ticker resolution, supported-company rules, mapping, filtering, inclusive date boundaries, sorting, pagination, invalid inputs, missing filings, malformed upstream data, timeouts, and upstream error mapping.
- Test accession lookup across all supported companies and historical data sources as applicable.
- Add controller/e2e tests for route contracts and validation where the project setup supports them.
- Tests must assert meaningful behavior, not merely that a method was called.
- Run the relevant tests, lint, and typecheck. Report exact commands and actual results. Never claim a test passed unless it was run successfully.

## Security, reliability, and dependencies
- Do not log secrets, personal contact details, or full upstream payloads unnecessarily.
- Validate all external input and treat upstream data as untrusted.
- Avoid arbitrary URL fetching or user-controlled SEC hostnames; construct URLs from trusted SEC base URLs and validated identifiers.
- Inspect dependency versions and lockfile before adding packages. Prefer existing NestJS/platform capabilities.
- Do not run automatic major upgrades. Check known vulnerabilities with the repository's package manager audit command when available, and report findings accurately.
- Use structured, useful logs without exposing sensitive data.
- Handle cancellation/timeouts if supported by the existing HTTP client.

## Implementation workflow
For each task:
1. Summarize the requirement and acceptance criteria.
2. Inspect relevant code and propose a minimal plan.
3. Implement one cohesive change at a time.
4. Explain important decisions and trade-offs.
5. Add or update tests.
6. Run relevant checks and report exact results.
7. Update `NOTES.md` with real decisions, assumptions, limitations, and test outcomes.
8. Preserve the automatic prompt log. Never fabricate or reconstruct prompts, timestamps, AI tool calls, or results that were not captured.

## Do not
- Rewrite unrelated modules.
- Introduce abstractions without a concrete need.
- Duplicate business logic between controllers and services.
- Put SEC HTTP calls in controllers.
- Return raw SEC JSON as the public API contract.
- silently truncate historical data.
- fabricate test results, prompt history, or implementation status.
