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
