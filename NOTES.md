## 2026-11-14T12:46+01:00
Decision: Pin glob to 14.0.6, and the typescript-eslint and test-exclude copies of minimatch to 11.0.8, with npm overrides.
Rejected: `npm audit fix --force`, and a global minimatch override.
Why: Force would downgrade Jest 30 to 25. A global minimatch pin would replace ESLint's minimatch 3. deepmerge 4.3.1 has no patched release, so those lows stay; Jest only uses it to merge local config.

## 2026-11-14T13:45+01:00
Decision: Scaffold `frontend/` with Vite 8, React 19, ESLint 10, TypeScript 6.0.3, and Vitest 5. Pin `@typescript-eslint/typescript-estree`'s minimatch to 11.0.8.
Rejected: Oxlint, TypeScript 7, and `npm audit fix --force`.
Why: `typescript-eslint` 8.72 does not support TypeScript 7. The first audit reported 7 moderate findings, all minimatch 10.2.6 under typescript-eslint (GHSA-g3hv-75wg-m249). The suggested fix downgrades typescript-eslint to 8.36.0. After the scoped override, `npm audit` reports 0 vulnerabilities. Vitest 5.1 and jsdom 31 skip Node 25 in their engines; tests, lint, and build still passed on Node 25.9.0.

## 2026-11-15T20:06+01:00
Decision: Install `@nestjs/swagger` 11.4.8. Serve controller routes under `/api`, and mount Swagger UI at `/docs` with the OpenAPI JSON at `/docs-json`. Share that setup through `configureApp` so bootstrap and e2e use the same paths.
Rejected: `@nestjs/swagger` 12, mounting Swagger at `/api`, `useGlobalPrefix`, `addServer('/api')`, and `npm audit fix --force`.
Why: NestJS is 11.2.10, and Swagger 12 peers on Nest 12. A Swagger path of `api` would occupy `GET /api`. Spec paths already include the prefix, so an extra server URL would call `/api/api/...`. Backend `npm audit` reports 6 low findings, all deepmerge via Jest (GHSA-gcqx-w48m-w2h4). Force would install Jest 25.1.0.

## 2026-11-15T20:45+01:00
Decision: Add `sec` with a shared axios `SecClient`, central `common/errors` + `AppExceptionFilter`, `@nestjs/config` 4.0.4, and `axios` 1.21.1. Space SEC calls at 100ms. Require `SEC_USER_AGENT` with an email contact.
Rejected: Per-module `*.errors.ts`, `@nestjs/config` 12, `@nestjs/axios`, `npm audit fix --force`, and inventing a real contact email.
Why: One error shape for later modules. Config 12 peers on Nest 12. Plain axios matches the plan. Audit still shows 6 low deepmerge findings via Jest only.

## 2026-11-15T21:29+01:00
Decision: Load SEC URLs, timeout, and request spacing from `.env` through `loadSecConfig` / `SEC_CONFIG`. Keep only DI tokens in `sec.constants.ts`.
Rejected: A shared `common` axios instance, and leaving Archives URL / interval hardcoded in `SecClient`.
Why: Deploy-time SEC settings belong in env. Axios stays SEC-scoped so fair-access headers do not leak to other callers.

## 2026-11-15T21:41+01:00
Decision: Split `SecClient` into pure `mappers/`, `utils/`, and `sec/http/map-sec-axios-error.ts` helpers; keep `SecClient` as the Nest orchestrator.
Rejected: Moving axios error mapping into `common/errors`, and registering helpers as Nest providers.
Why: SEC transport mapping stays in `sec`. Pure functions stay easy to unit-test without DI.

## 2026-11-15T22:05+01:00
Decision: Add `companies` and `filings` REST modules under `/api/companies/:ticker` and nested filings routes. Static ticker→CIK registry; filings filter on inclusive filing dates; load historical SEC files when `startDate` is older than recent.
Rejected: Enriching company GET via live SEC, and a top-level `/api/filings` accession route without ticker.
Why: Nested routes match the assignment UX. Static company lookup avoids SEC for ticker search. Historical fetch stays scoped to overlapping ranges.

## 2026-11-15T22:16+01:00
Decision: Split `FilingsService` into pure `mappers/` and `utils/` helpers; keep the service as Nest orchestration over CompaniesService + SecClient.
Rejected: Registering filter/sort helpers as Nest providers.
Why: Same pattern as `SecClient` split. Pure functions are easier to unit-test without DI.

## 2026-11-15T22:43+01:00
Decision: Replace Hello World with `GET /health` (version from package.json + ISO datetime), exclude it from the `/api` prefix, enable CORS for Vite `localhost:5173`, case-insensitive formType, and stricter ISO date validation.
Rejected: Leaving health under `/api/health`, and inventing a real SEC contact email.
Why: Load balancers expect `/health`. CORS unblocks the upcoming frontend. Small filter/date fixes close review gaps without redesign.

## 2026-11-15T23:31+01:00
Decision: Build the Vite React filings UI with feature folders (`companies`, `filings`), shared `lib/axios` + `StatusMessage`, TanStack Query hooks, RHF+Zod filters, and Nest-only `/api` calls under SOLID/DRY layering.
Rejected: Calling SEC from the browser, a generic CRUD/service base, inventing a companies-list API, and parking skill deps in a root `package.json`.
Why: Matches the frontend-react skill and Nest contracts. One Axios client and shared status UI avoid duplication without extra abstraction.

## 2026-11-15T23:47+01:00
Decision: Restyle the filings explorer as a slate/teal SaaS dashboard (sticky header, toolbar + Card sections, badges, denser spacing) with presentation-only edits.
Rejected: Purple/dark-default themes, and any API/hook/service or SOLID layering changes.
Why: Keeps Nest contracts and feature architecture intact while fixing flat whitespace and weak hierarchy.

## 2026-11-16T21:40+01:00
Decision: Replace empty/root Nest/Vite template READMEs with beginner-friendly root, backend, and frontend docs (install, env, run, build, test, lint, local URLs, Swagger).
Rejected: Keeping vendor template READMEs, and inventing a frontend format script that does not exist.
Why: New developers need accurate monorepo setup steps; docs stay aligned with real npm scripts and `.env.example` values.

## 2026-11-16T23:04+01:00
Decision: Fix code-review priorities: historical load for endDate-only (recent-only when no dates), accession format check + year-narrowed walk, in-memory SEC TTL cache, merge prefer recent, GET /api/companies + FE select from API, CORS_ORIGINS, SEC href allowlist, AbortSignal/a11y/error gating.
Rejected: Incremental “fetch until page full” historical paging, Nest throttler/Redis, keeping hard-coded SUPPORTED_TICKERS as sole FE source.
Why: Closes real correctness/amplification gaps without overbuilding; cache + validation cut repeat/invalid SEC work; companies list keeps ticker lists in sync.

## 2026-11-22T09:05+01:00
Decision: Simplify filings structure for clarity: two utils modules (`filings-query` validate/fetch policy, `filings-collection` shape list), linear `FilingsService` with private `collectFilings`, clearer AppError ownership + filter status map, FE `getErrorMessage`.
Rejected: Nest-only HttpException rewrite, and one giant service file with no pure helpers.
Why: Interview feedback asked for simpler error handling and responsibility splits; keep SOLID/DRY seams without scattering one-purpose files.



