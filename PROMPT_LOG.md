# Prompt log

Each user prompt is one section. Set a title in `.cursor/session-title.txt` (first line); it is locked for that conversation. Tool calls are in `TOOL_CALL_LOG.md`. Decisions are in `NOTES.md`.

## Session 2
Timestamp: 2026-11-14T12:39:27+01:00
Tool: Cursor
Model: grok-4.7
Prompt:

```
can you fix 26 vulnerabilities (4 low, 22 moderate) in backend project? this project is nest.js
```
AI response summary:

````
Those 26 findings are three dev-dependency advisories, counted once for every package that depends on them. None of them are in the Nest runtime (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`). I can’t apply the fix from Ask mode; switch to Agent mode if you want this written into `backend/package.json` and the lockfile regenerated.

Do not run `npm audit fix --force`. npm’s only automatic “fix” is to downgrade `jest` from 30.5.2 to 25.1.0 and `ts-jest` to 25.5.1, which breaks this Nest 11 test setup.

## What is actually vulnerable

| Advisory | Severity | Installed | Patched release |
|---|---|---|---|
| [minimatch](https://github.com/advisories/GHSA-g3hv-75wg-m249) ReDoS via glob-pattern amplification | moderate | 9.0.9 and 10.2.6 (under `typescript-eslint`, Jest, `test-exclude`) | `minimatch@11.0.1` or newer (latest `11.0.8`) |
| [glob](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) keeps walking the filesystem after `AbortSignal` cancellation | moderate | `glob@13.0.7` (Jest) and `glob@10.5.0` (`test-exclude`) | `glob@14.0.2` or newer (latest `14.0.6`) |
| [deepmerge](https://github.com/advisories/GHSA-gcqx-w48m-w2h4) prototype poisoning in `mergeObject()` | low | `deepmerge@4.3.1`, pulled in by `jest-config` | none published; 4.3.1 is still the latest |

The 22 moderates are the glob and minimatch advisories repeated through Jest, `babel-plugin-istanbul`, `test-exclude`, and `typescript-eslint`. The 4 lows are `deepmerge` plus `jest`, `jest-cli`, and `ts-jest` inheriting it. ESLint’s own `minimatch@3.1.5` is outside the vulnerable range (`>=7.0.0 <11.0.1`).

`npm audit fix` without `--force` will not move these. `typescript-eslint@8.72.2` and `jest@30.5.2` are already the latest, and both still depend on the vulnerable ranges.

## Fix for the 22 moderates

Add a targeted override in `backend/package.json`. A blanket `"minimatch": "11.0.8"` override would also replace ESLint’s `minimatch@3`, which is a different API.

```json
"overrides": {
  "glob": "14.0.6",
  "@typescript-eslint/typescript-estree": {
    "minimatch": "11.0.8"
  },
  "test-exclude": {
    "minimatch": "11.0.8"
  }
}
```

`glob@14.0.6` brings its own `minimatch@^11.0.5`, so the nested copies under Jest and `test-exclude` go away with the glob override. The two nested `minimatch` overrides cover the direct `minimatch@^10.2.2` dependencies that would otherwise stay behind.

Jest calls `glob.glob.sync()`, and `typescript-eslint` calls `minimatch(path, pattern, { dot: true })`. Both of those APIs are unchanged in the patched majors. `minimatch@11.0.4` and later require Node 20 or newer, which this Nest 11 app already needs (`@nestjs/cli` already depends on `minimatch@11.0.5`).

Then reinstall and confirm:

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm audit
npm test
npm run lint
```

## The 4 lows

Those stay. `deepmerge` has no patched version, and Jest 30 still depends on `^4.3.1`. It only runs inside `jest-config` while merging your own Jest config, so it is not on the request path of the API. Replacing it with another merge library would break `jest-config`.
````

## Session 2
Timestamp: 2026-11-14T12:43:57+01:00
Tool: Cursor
Model: grok-4.7
Prompt:

```
Plan changes
```
AI response summary:

```
```

## Session 2
Timestamp: 2026-11-14T12:44:18+01:00
Tool: Cursor
Model: grok-4.7
Prompt:

```
Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.
```
AI response summary:

```
The 22 moderate findings are cleared. `npm audit` in `backend` now reports 6 low findings, all from `deepmerge`, and nothing moderate or higher.

`backend/package.json` now overrides `glob` to 14.0.6, and the `typescript-eslint` and `test-exclude` copies of `minimatch` to 11.0.8. ESLint still uses `minimatch` 3.1.5. A fresh install updated `backend/package-lock.json`.

The earlier count of 4 lows was the `deepmerge` chain while `jest-config` and `@jest/core` were still moderate because they also depended on vulnerable `glob`. Those two are low now, so the remaining total is 6. `deepmerge` 4.3.1 is still the latest release, and the only automatic fix npm offers is downgrading Jest 30 to 25, which was left in place.

`npm test` passed (1 suite, 1 test). `npm run lint` finished with the existing `@typescript-eslint/no-floating-promises` warning in `backend/src/main.ts` and no errors.
```

## Session 3
Timestamp: 2026-11-14T13:36:53+01:00
Tool: Cursor
Model: grok-4.7
Prompt:

```
How can you create a React project in the frontend folder without vulnerabilities I prefer vit with vtest and eslint. what do you recommend
```
AI response summary:

````
Use the official Vite React TypeScript app in `frontend/`, with ESLint turned on at creation time, then add Vitest and Testing Library. Keep it a separate npm package next to `backend/`.

`create-vite@9.3.4` is current. Its React template uses Vite 8, React 19, and Oxlint by default. Pass `--eslint` so it installs ESLint 10, `typescript-eslint`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh` instead. That flag also keeps TypeScript at 6.0.3. TypeScript 7 is what the plain template uses, and `typescript-eslint@8.72` still only accepts TypeScript below 6.1, so adding ESLint yourself onto the TypeScript 7 template fails to install.

Your machine is on Node 25, which satisfies Vite’s requirement (`^20.19.0` or `>=22.12.0`). Use npm, same as the backend.

```bash
cd /Users/drive1/projects/interview/quartr/public-api
npm create vite@9.3.4 frontend -- --template react-ts --eslint --no-interactive --no-immediate
cd frontend
npm install
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

`--no-immediate` installs nothing and does not start the dev server, so you can audit before the app runs.

Point the Vite config at Vitest and add scripts:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

```ts
import '@testing-library/jest-dom/vitest'
```

```json
"test": "vitest run",
"test:watch": "vitest"
```

Import `describe`, `it`, and `expect` from `vitest` in each test. Leaving Vitest globals off means you do not need another ESLint plugin. Put tests under `src/` so the existing `tsconfig.app.json` typechecks them. The generated ESLint config is enough; the backend’s type-checked rules can be enabled later from the scaffold README if you want that parity.

After install, run `npm audit` in `frontend/` and keep the lockfile. Do not run `npm audit fix --force`. If a transitive package has a real fix, pin that package with an `overrides` entry the same way the backend pins `glob` and `minimatch`. A clean audit is the only basis for saying the tree has no known vulnerabilities; the current Vite 8, Vitest 5, and ESLint 10 lines are the maintained set.

Leave the dev server on localhost. Do not pass `--host`. Vite’s past security issues were in the dev server, and the production build is static files. Do not put secrets in `VITE_` variables; anything with that prefix is shipped to the browser. Call SEC only through the Nest API.

Skip Create React App, React Compiler, a UI kit, Redux, and a data-fetching library until a feature needs one. Skip Prettier on the frontend unless you want the same formatter as the backend. I am in Ask mode, so I cannot create the project here. Switch to Agent mode if you want this scaffolded and audited.
````

## Session 3
Timestamp: 2026-11-14T13:40:13+01:00
Tool: Cursor
Model: grok-4.7
Prompt:

```
Plan changes
```
AI response summary:

```
```

## Session 3
Timestamp: 2026-11-14T13:40:45+01:00
Tool: Cursor
Model: grok-4.7
Prompt:

```
Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.
```
AI response summary:

```
The Vite React app is in `frontend/`, as its own npm package. `npm audit` reports 0 vulnerabilities.

The scaffold is `create-vite@9.3.4` with the React TypeScript template and ESLint. That keeps TypeScript at 6.0.3, because `typescript-eslint` 8.72 does not support TypeScript 7. Vitest 5, jsdom, and Testing Library are wired through `frontend/vite.config.ts`, with one smoke test that renders the starter heading.

The first audit reported 7 moderate findings, all `minimatch` 10.2.6 inside `@typescript-eslint/typescript-estree` (GHSA-g3hv-75wg-m249). The suggested audit fix would have downgraded `typescript-eslint` to 8.36.0, so that copy of `minimatch` is pinned to 11.0.8 in `frontend/package.json`, the same pin the backend already uses. A fresh install then audited clean.

Checks run in `frontend/`:

- `npm test` — 1 file, 1 test passed
- `npm run lint` — passed
- `npm run build` — `tsc -b` and the Vite production build passed
- `npm audit` — 0 vulnerabilities

Vitest 5.1 and jsdom 31 omit Node 25 from their engines. This machine is Node 25.9.0, and the checks above still passed. Test commands are in `frontend/README.md`, and the stack decision is in `NOTES.md`.
```

## Session 5
Timestamp: 2026-11-15T19:49:45+01:00
Tool: Cursor
Model: grok-4.7
Prompt:

```
I want to add swagger to the backend project.
```
AI response summary:

````
The backend is still the NestJS 11 starter (`@nestjs/common` 11.2.10) with a single `GET /` route. Swagger belongs in bootstrap, using `@nestjs/swagger` **11.4.8**. The current release, 12.1.2, peers on NestJS 12 and will not install cleanly here.

I'm in Ask mode, so this is the change set only. Switch to Agent mode if you want it applied.

## Install

From `backend/`:

```bash
npm install @nestjs/swagger@11
```

That resolves to 11.4.8 and matches the existing `^11` Nest packages. `class-validator` and `class-transformer` are optional peers, and `@fastify/static` is only for Fastify. This app uses Express and has no validation DTOs yet, so leave those out. Swagger UI ships inside the package via `swagger-ui-dist`.

After install, run `npm audit` in `backend/` and record the result.

## Bootstrap

Keep this in `backend/src/main.ts`. It is global app configuration, same as the listen call.

```typescript
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('SEC EDGAR filings')
    .setDescription('Read-only filings API for the supported tickers.')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

With the server on port 3000:

- UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/docs-json`

`GET /` will show up from the existing controller. There is no global prefix today, so `/docs` stays at the root. The e2e test builds the app through `Test.createTestingModule` and never runs `main.ts`, so that test stays unchanged. Add a docs-route test only if you also call `SwaggerModule.setup` in the test app.

## CLI plugin

Add the plugin in `backend/nest-cli.json` so later DTO classes are picked up from their TypeScript types during `nest start` and `nest build`:

```json
"compilerOptions": {
  "deleteOutDir": true,
  "plugins": [
    {
      "name": "@nestjs/swagger",
      "options": {
        "classValidatorShim": true,
        "introspectComments": true,
        "dtoFileNameSuffix": [".dto.ts"]
      }
    }
  ]
}
```

The plugin runs only inside the Nest compiler. Jest uses `ts-jest`, so inferred `@ApiProperty` metadata is absent in unit tests. Put explicit `@ApiProperty()` (and `@ApiOkResponse()`) on the public filing DTOs when those endpoints exist. `classValidatorShim` does nothing until `class-validator` is added with the validation pipe.

## What to document once the API exists

Decorate the real contracts, not the starter greeting: company lookup, filing list (form type, date range, page, limit), and filing-by-accession. Response fields stay the public ones: form type, filing date, report date, accession number, primary document URL, and pagination metadata. Document status codes the API actually returns (400, 404, and the upstream 502/503/504 mapping).

Mention `http://localhost:3000/docs` in the README next to the endpoint examples. The assignment still expects those examples to be checked against real responses.

Serve the UI in every environment for this assignment. The API is read-only and has no credentials.
````

## Session 5
Timestamp: 2026-11-15T20:01:18+01:00
Tool: Cursor
Model: grok-4.7
Prompt:

```
I want to add Global API prefix, api also
```
AI response summary:

````
Use `api` as the global prefix for controller routes, and keep Swagger at `/docs`. Mounting Swagger at `api` as well would occupy the same path as the prefixed `GET /` handler.

`setGlobalPrefix('api')` rewrites every controller route. The starter `GET /` becomes `GET /api`. A later `@Controller('companies')` becomes `/api/companies`. Leave `api` out of the controller paths.

Swagger does not follow that prefix unless you opt in. With the default `useGlobalPrefix: false`, the UI stays at `/docs` and the spec stays at `/docs-json`. Operation paths in that spec still include `/api`, because `ignoreGlobalPrefix` defaults to false, so Try it out calls `/api` on the host root. Do not also call `DocumentBuilder.addServer('/api')`; the prefix would appear twice.

```typescript
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('SEC EDGAR filings')
    .setDescription('Read-only filings API for the supported tickers.')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

On port 3000 that is:

- `GET http://localhost:3000/api`
- UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/docs-json`

`@nestjs/swagger` is still not installed. Use `@nestjs/swagger@11` (11.4.8) with the NestJS 11.2.10 already in `backend/package.json`.

The e2e test builds the app with `Test.createTestingModule` and never runs `main.ts`, so it still requests `GET /`. Call `setGlobalPrefix('api')` on that test app before `app.init()`, and change the request to `GET /api`. The same applies to `SwaggerModule.setup` if a test should hit `/docs`. A small shared `configureApp(app)` used by `main.ts` and the e2e file keeps those paths identical.

If the UI should live under the prefix, pass `{ useGlobalPrefix: true }` and keep the setup path as `docs`. That serves the UI at `/api/docs` and the JSON at `/api/docs-json`, and it does not take over `GET /api`.
````

## Session 5
Timestamp: 2026-11-15T20:03:28+01:00
Tool: Cursor
Model: grok-4.7
Prompt:

```
plan chnages
```
AI response summary:

```
```

## Session 5
Timestamp: 2026-11-15T20:04:10+01:00
Tool: Cursor
Model: grok-4.7
Prompt:

```
Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.
```
AI response summary:

```
Controller routes are now under `/api`, and Swagger is served beside them at `/docs`.

`configureApp` in `backend/src/configure-app.ts` sets the prefix and mounts the OpenAPI UI. `backend/src/main.ts` and the e2e test both call it, so `GET /api` is the route under test. `@nestjs/swagger` 11.4.8 matches the installed NestJS 11.2.10. The spec lists `/api` and does not add a second `/api` server URL.

On port 3000:

- `GET http://localhost:3000/api`
- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/docs-json`

Files changed: `backend/package.json`, `backend/package-lock.json`, `backend/src/configure-app.ts`, `backend/src/main.ts`, `backend/nest-cli.json`, `backend/test/app.e2e-spec.ts`, `backend/README.md`, and `NOTES.md`.

Checks from `backend/`:

- `npm test`: 1 suite, 1 test passed
- `npm run test:e2e`: 1 suite, 1 test passed (`GET /api` returns `Hello World!`)
- `npm run lint`: 0 errors, 1 existing warning (`bootstrap()` is a floating promise in `main.ts`)
- `npm run build`: passed
- `npm audit`: 6 low findings, all `deepmerge` via Jest (GHSA-gcqx-w48m-w2h4). `npm audit fix --force` would install Jest 25.1.0, so it was not applied

A local smoke test on port 3001 returned `Hello World!` from `GET /api`, HTML 200 from `/docs`, and an OpenAPI document titled “SEC EDGAR filings” 1.0 whose only path is `/api`. Port 3000 was already in use, so that process was left alone.
```

## Session 6
Timestamp: 2026-11-15T20:12:54+01:00
Tool: Cursor
Model: grok-4.7
Prompt:

```
Here are the requirements for the assignment.

I need to build a read-only API for SEC company filings.

The API should support these companies:
- Apple (AAPL)
- Meta (META)
- Alphabet (GOOGL)
- Amazon (AMZN)
- Netflix (NFLX)
- Goldman Sachs (GS)

Users should be able to:
- Search for a company using its ticker.
- View the company's filings, with the newest ones first.
- Filter filings by form type, such as 10-K and 8-K.
- Filter filings by date range.
- Move between pages of results.
- Open a specific filing using its accession number.

Each filing should include:
- Form type
- Filing date
- Report date
- Accession number
- Link to the original document on SEC.gov

I also need a simple frontend where users can search for companies and browse their filings.

The project and prompt logging are already set up.

First, please look through the existing project and understand how it is structured. Don't change any files yet.

Use this prompt as understand the project and requirement I will add more prompt to build the project step by step.
```
AI response summary:

````
The repository is a two-app scaffold. The SEC filings behavior is not built yet. What is already in place is the NestJS API shell, the React starter, Swagger, and the assignment logging.

## Layout

```text
public-api/
  NOTES.md, PROMPT_LOG.md, TOOL_CALL_LOG.md
  .cursor/skills/          assignment, Nest, React, and notes rules
  .cursor/hooks.json       writes the prompt and tool logs
  backend/                 NestJS 11 API
  frontend/                Vite + React 19 UI
```

There is no root `package.json`. Each app installs and runs on its own. `package-lock.json` at the repo root is empty.

## Backend

NestJS 11.2.10 on port `3000` (`PORT` overrides that). The only route is the starter hello endpoint.

| Path | What it does |
|---|---|
| `GET /api` | Returns `Hello World!` |
| `GET /docs` | Swagger UI, titled "SEC EDGAR filings" |
| `GET /docs-json` | OpenAPI JSON |

`configureApp` in `backend/src/configure-app.ts` sets the `/api` prefix and Swagger. `main.ts` and the e2e test both call it, so those paths stay the same in tests. `AppModule` only registers `AppController` and `AppService`.

Installed runtime packages are `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `@nestjs/swagger`, `reflect-metadata`, and `rxjs`. There is no database client, no HTTP client library, and no `class-validator` / `class-transformer`, even though the Swagger compiler plugin is set up for `*.dto.ts` files and a class-validator shim.

`backend/.env` is gitignored and currently contains one variable, `SEC_USER_AGENT=https://data.sec.gov`. SEC fair-access rules expect a descriptive application name plus a real contact in that header. That value will need to be replaced with a real contact before live SEC calls.

Checks already wired in `backend/package.json`: `npm test`, `npm run test:e2e`, `npm run lint`, `npm run build`, `npm run start:dev`. TypeScript has `strictNullChecks` on. `noImplicitAny` is off.

## Frontend

Vite 8, React 19, TypeScript 6, Vitest, and Testing Library. `src/App.tsx` is still the Vite starter: logos, a counter, and docs links. One test checks that the "Get started" heading renders.

There is no router, no data-fetching library, and no API client. The browser is meant to call this Nest API only, never SEC directly. Scripts: `npm run dev`, `npm test`, `npm run lint`, `npm run build`.

## Assignment, mapped to the current code

The API is read-only, with no database. Supported tickers are AAPL, META, GOOGL, AMZN, NFLX, and GS.

| Requirement | Current state |
|---|---|
| Look up a company by ticker | Not implemented |
| List filings, newest first | Not implemented |
| Filter by form type (10-K, 8-K, and others) | Not implemented |
| Filter by date range | Not implemented |
| Paginate | Not implemented |
| Open one filing by accession number | Not implemented |
| Each filing: form type, filing date, report date, accession number, SEC.gov document link | Not implemented |
| Simple UI to search a company and browse filings | Starter page only |

The quality rules already settle a few implementation constraints for later steps: filter on filing date with inclusive boundaries, sort newest first with a stable tie-break, validate page and limit with a default and a maximum, return an empty list when a valid filter matches nothing, and use 400, 404, and 502/503/504 for invalid input, a missing company or filing, and SEC failures. SEC transport stays behind an integration boundary. Public JSON stays independent of the raw SEC payload. The primary document filename comes from filing metadata. The archive path drops dashes from the accession number. CIKs stay 10-digit and zero-padded except in the Archives URL, which strips leading zeros.

Logging is already set up. Hooks append prompts and tool calls. Design choices go in `NOTES.md`. Earlier notes cover dependency pins and the Swagger `/docs` setup. I did not change any files.
````

## Session 6
Timestamp: 2026-11-15T20:21:31+01:00
Tool: Cursor
Model: grok-4.7
Prompt:

```
Let's start with the backend.

Please look at the current NestJS project and suggest how we should organise the code for this assignment.

I want the code to be easy to understand and maintain. Please avoid making it more complicated than necessary.

For example modular code like :
companies
filings
sec

In each module I need to group files in folders like 
__tests__ folder for unit test
dtos for dtos and interfaces naming should follow for example company.dto.ts.
Put multiple simmiler files in one folder doe example test files or pip files

add above instraction the skill file to fillow for all mdules in backend

Don't start coding yet. I want to review the plan first.
```
AI response summary:

````
The backend should stay three feature modules under `backend/src`, with the same folder rules in each one. Nothing is written yet: this is the layout to review, including the section I would add to `.cursor/skills/backend-nestjs/SKILL.md`.

## What each module owns

`AppModule` only imports the feature modules. `main.ts` and `configure-app.ts` stay at `src/` for bootstrap, the `/api` prefix, and Swagger.

| Module | Responsibility |
|---|---|
| `companies` | The six supported tickers, company lookup, ticker to 10-digit CIK. No SEC calls. |
| `filings` | List filings newest first, form-type and date filters, pagination, and lookup by accession number. |
| `sec` | HTTP to SEC, `User-Agent`, timeouts, archive URLs, and raw SEC JSON. No controller. |

`FilingsModule` imports `CompaniesModule` and `SecModule`. `CompaniesModule` does not import `SecModule`. The supported companies are a static list in the companies module, because the assignment fixes those six tickers.

## Folder layout

Jest already picks up any `*.spec.ts` under `src`. End-to-end tests stay in `backend/test/` as `*.e2e-spec.ts`. The existing hello-world files stay where they are until a real route replaces them.

```text
backend/src/
  main.ts
  configure-app.ts
  app.module.ts
  companies/
    companies.module.ts
    companies.controller.ts
    companies.service.ts
    supported-companies.ts
    dtos/
      company.dto.ts
    __tests__/
      companies.service.spec.ts
  filings/
    filings.module.ts
    filings.controller.ts
    filings.service.ts
    dtos/
      filing.dto.ts
      list-filings-query.dto.ts
    __tests__/
      filings.service.spec.ts
  sec/
    sec.module.ts
    sec.client.ts
    dtos/
      sec-filing.interface.ts
    types/
      sec-submissions.type.ts
    __tests__/
      sec.client.spec.ts
```

One controller and one service stay at the module root. Similar files share a folder:

- `dtos/` holds public request and response DTOs, plus interfaces that belong to that contract. DTO files are named `<name>.dto.ts`, for example `company.dto.ts`. Interface files are named `<name>.interface.ts`.
- `__tests__/` holds that module’s unit tests, named `<subject>.spec.ts`.
- `pipes/` is added only when that module has pipe files, using the same grouping for other repeated kinds such as `filters/` or `types/`.
- A folder is created when those files exist. Empty folders are not added.
- SEC upstream payload shapes go in `sec/types/`. Public response types stay in `dtos/`, so raw SEC JSON does not become the API contract.

`sec` has an interface in `dtos/` for the filing shape it hands to `filings`. The raw submissions JSON stays in `types/`.

## Skill text to add

I would insert this after **Architecture and module boundaries** in `.cursor/skills/backend-nestjs/SKILL.md`, so every later backend module follows it:

```markdown
## Module folder layout
Apply this layout to every backend feature module.

- Keep `<module>.module.ts`, `<module>.controller.ts`, and `<module>.service.ts` at the module root when the module has one of each. A module with no HTTP routes, such as `sec`, has no controller.
- Put DTOs and public interfaces in `dtos/`. Name DTO files `<name>.dto.ts`, for example `company.dto.ts`. Name interface files `<name>.interface.ts`.
- Put unit tests in `__tests__/` and name them `<subject>.spec.ts`.
- Put pipes in `pipes/` when a module has them. Use the same folder grouping for other repeated file kinds, such as `filters/` or `types/`.
- Create a folder when that kind of file exists. Do not add empty folders. Leave a single file of its kind at the module root.
- Keep SEC upstream payload types in `sec/types/`. Keep public API contracts in `dtos/`.
- Keep end-to-end tests in `backend/test/` as `*.e2e-spec.ts`.
```

The skill file is unchanged. After you approve this plan, switch to Agent mode and I will add that section.
````

## Session 6
Timestamp: 2026-11-15T20:25:57+01:00
Tool: Cursor
Model: grok-4.7
Prompt:

```
I want to use axios for calling rest api as well. add this to skill later as well.
```
AI response summary:

```
SEC calls will go through one axios client in the `sec` module. The skill file stays unchanged until you approve the layout and we apply it together.

`axios` is not installed. The companies and filings modules will not call HTTP. `SecClient` in `sec/sec.client.ts` will own a single axios instance, created in `SecModule` and injected into the client. That instance carries the SEC base URL, the `User-Agent` from `SEC_USER_AGENT`, and a timeout. Controllers keep using Nest as they do now.

Unit tests mock `SecClient`. They do not call SEC.

When the skill update is applied, these two bullets go into **SEC EDGAR integration** in `.cursor/skills/backend-nestjs/SKILL.md`:

- Use one shared axios instance in the `sec` module for every outbound SEC request. Set the base URL, `User-Agent`, and timeout on that instance.
- Do not call axios from controllers or from the `companies` or `filings` modules. Tests replace `SecClient` with a double.

The `axios` package is added at implementation time, then checked with `npm audit` before it is treated as safe to keep.
```

## Session 6
Timestamp: 2026-11-15T20:28:38+01:00
Tool: Cursor
Model: default
Prompt:

```
Now let's work on getting company and filing information from SEC EDGAR.

Please create the service that communicates with the SEC API.

I want all SEC requests to go through the backend, not directly from the frontend.

Please make sure we handle the SEC requirements properly, including the User-Agent, request limits and errors.

Keep the implementation simple and explain how the company information and filing data are retrieved.

Before finishing, tell me what you implemented and how I can test it.
```
AI response summary:

<!-- pending:9bde48ba-57c7-47eb-9261-d8556f249036 2026-11-15T20:28:38+01:00 -->

## Session 6
Timestamp: 2026-11-15T20:29:01+01:00
Tool: Cursor
Model: default
Prompt:

```
Plan changes
```
AI response summary:

```
```

## Session 6
Timestamp: 2026-11-15T20:37:48+01:00
Tool: Cursor
Model: default
Prompt:

```
I want to have a central error handeling not keep the *.errors.ts in each module. Plan for this changes.
```
AI response summary:

```
The plan now uses one shared error path instead of per-module `*.errors.ts` files.

**Central layout**
- `backend/src/common/errors/app.error.ts` — shared `AppError` with stable codes
- `backend/src/common/filters/app-exception.filter.ts` — global filter → consistent JSON `{ statusCode, code, message }`
- Registered in `configure-app.ts` so bootstrap and e2e share it

**`sec` module**
- No `sec.errors.ts`
- `SecClient` throws `AppError`; the filter maps codes to 400/403/404/429/502/504

The skill update will also say: keep errors/filters in `common/`, not inside `companies`, `filings`, or `sec`.

Say when you want this plan executed.
```

## Session 6
Timestamp: 2026-11-15T20:39:55+01:00
Tool: Cursor
Model: default
Prompt:

```
Is SecClient.ts a controller? why it name has Clinet inside?
```
AI response summary:

```
No. `SecClient` is not a controller.

In NestJS:

| Role | Typical name | What it does |
|---|---|---|
| Controller | `CompaniesController` | HTTP routes (`@Get`, `@Query`, …) for your API |
| Service | `FilingsService` | App logic for that feature |
| Client | `SecClient` | Talks to an **external** system (here, SEC EDGAR over HTTP) |

`Client` means “client of the SEC API,” the same idea as an HTTP client or SDK wrapper. Your backend calls SEC; `SecClient` owns that axios traffic, User-Agent, rate spacing, and mapping of SEC JSON.

`sec` has no controller in the plan because it is not a public API surface. Later, `CompaniesController` / `FilingsController` call services, and those services call `SecClient`.

So the name is intentional: integration boundary, not a Nest route handler. If you prefer Nest-style naming, `SecService` is fine too; `SecClient` just makes the “outbound provider” role clearer.
```

## Session 6
Timestamp: 2026-11-15T20:40:31+01:00
Tool: Cursor
Model: default
Prompt:

```
Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.
```
AI response summary:

````
## What changed

1. **Skill** — module folder layout, axios-only-in-`sec`, and central error handling in `.cursor/skills/backend-nestjs/SKILL.md`
2. **Deps** — `axios`, `@nestjs/config@4`; `ConfigModule` + `SecModule` in `AppModule`; `.env.example` + placeholder `.env`
3. **Common errors** — `AppError` + global `AppExceptionFilter` registered in `configureApp`
4. **`SecClient`** — submissions + historical file fetch, document URL builder, 100ms spacing, User-Agent/timeout, maps failures to `AppError`

## How data is retrieved

- **Company:** `GET https://data.sec.gov/submissions/CIK##########.json` → name, CIK, tickers, exchanges  
- **Recent filings:** `filings.recent` parallel arrays → `SecFilingRecord[]` with Archives document URLs  
- **History:** `filings.files` names → `getSubmissionsFile(name)`  
- **Document URL:** `https://www.sec.gov/Archives/edgar/data/{cikNoZeros}/{accessionNoDashes}/{primaryDocument}`

## How to test

```bash
cd backend
npm test          # 15 unit tests (mocked axios)
npm run lint
npm run build
npm run test:e2e  # GET /api still works
```

For live SEC later: set a real `SEC_USER_AGENT` like `SEC Filings API you@email.com` in `backend/.env` (current value is a placeholder). There is no public SEC route yet; next step is `companies` / `filings`.

## Checks run

| Check | Result |
|---|---|
| `npm test` | 15 passed |
| `npm run lint` | 0 errors (existing `main.ts` floating-promise warning) |
| `npm run build` | passed |
| `npm run test:e2e` | 1 passed |
| `npm audit` | 6 low (deepmerge via Jest); no force fix |

## Gap

No company/filings HTTP API yet — `SecClient` is wired for the next modules to use.
````

## Session 6
Timestamp: 2026-11-15T21:12:18+01:00
Tool: Cursor
Model: default
Prompt:

```
I want to read all const in sec.constants.ts from .env
```
AI response summary:

````
`SEC_AXIOS` should stay a code Symbol for DI. Only the config values belong in `.env`.

Right now:

| In code | Source today |
|---|---|
| `SEC_AXIOS` | Injection token — keep in `sec.constants.ts` |
| `SEC_DATA_BASE_URL` | Hardcoded in `sec.constants.ts` |
| `DEFAULT_SEC_TIMEOUT_MS` | Hardcoded default; already overridable via `SEC_TIMEOUT_MS` |
| `ARCHIVES_BASE_URL` / `MIN_REQUEST_INTERVAL_MS` | Hardcoded in `sec.client.ts`, not in constants |

Also already from env: `SEC_USER_AGENT`.

### Suggested `.env` / `.env.example`

```bash
SEC_USER_AGENT=SEC Filings API your-email@example.com
SEC_DATA_BASE_URL=https://data.sec.gov
SEC_ARCHIVES_BASE_URL=https://www.sec.gov/Archives/edgar/data
SEC_TIMEOUT_MS=10000
SEC_MIN_REQUEST_INTERVAL_MS=100
```

### How to wire it

1. Keep only `SEC_AXIOS` in `sec.constants.ts`.
2. In `sec.module.ts`, read URLs/timeout from `ConfigService` when creating axios.
3. Inject those same values into `SecClient` (config object or individual tokens) so Archives URL and interval are not hardcoded.
4. Validate required strings at startup; use numeric defaults only if you still want optional keys.
5. Prefer trusted SEC hosts only — do not allow arbitrary user-controlled hosts in production without validation.

I'm in Ask mode, so I can't edit the files. Switch to Agent mode if you want this applied.
````

## Session 6
Timestamp: 2026-11-15T21:22:19+01:00
Tool: Cursor
Model: default
Prompt:

```
Why create an Axios instance in sec.module.ts? Wouldn't it be better to create a single-responsibility file, for example axios.instance.ts and create an Axios instance in it, put it in the common folder, and reuse it throughout the whole backend project?
```
AI response summary:

```
Putting axios in `sec.module.ts` is intentional for this project. A shared `common/axios.instance.ts` for the whole backend is usually the worse fit here.

### Why it lives in `SecModule`

1. **SEC-specific config** — That instance is not a generic HTTP client. It is locked to `data.sec.gov`, the SEC `User-Agent`, timeout, and (via `SecClient`) request spacing. Those rules must not silently apply to every future outbound call.
2. **Single responsibility already exists** — Nest’s module boundary *is* the SRP unit. `SecModule` owns “talk to SEC.” `SecClient` owns mapping and rate spacing. A bare `axios.instance.ts` only moves construction; it does not improve the design unless many modules share the *same* upstream.
3. **Assignment skill** — Outbound SEC traffic stays in `sec`. `companies` / `filings` call `SecClient`, not axios. A global client invites the opposite: features importing `common/axios` and talking to SEC (or other hosts) directly.
4. **Nothing else needs it yet** — The backend has one external API. Sharing “for the whole project” is premature.

### When a shared factory *would* make sense

If you later call several unrelated APIs, prefer something like:

- `common/http/create-axios-client.ts` — a small factory that takes `baseURL`, headers, timeout
- Each integration module (`sec`, `payments`, …) creates **its own** instance with its own config

That reuses construction logic without one global client carrying SEC headers everywhere.

### What not to do

| Approach | Problem |
|---|---|
| One `common` axios used everywhere | SEC User-Agent / base URL leak into unrelated calls |
| Export a singleton from `axios.instance.ts` | Harder to test/replace than Nest DI (`SEC_AXIOS` token) |
| Let every module import axios directly | Breaks the integration boundary |

**Recommendation:** keep the SEC axios provider in `SecModule`. If you want a cleaner file split inside `sec/`, a local `sec-axios.provider.ts` is fine. Do not promote it to a project-wide client unless a second upstream with the same needs appears.
```

## Session 6
Timestamp: 2026-11-15T21:26:16+01:00
Tool: Cursor
Model: default
Prompt:

```
ok then plan for moving the conts to .env
```
AI response summary:

```
```

## Session 6
Timestamp: 2026-11-15T21:28:46+01:00
Tool: Cursor
Model: default
Prompt:

```
Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.
```
AI response summary:

```
## What changed

SEC runtime settings now come from `.env` via `loadSecConfig` / `SEC_CONFIG`. `sec.constants.ts` only keeps DI tokens (`SEC_AXIOS`, `SEC_CONFIG`).

**Env keys:** `SEC_USER_AGENT`, `SEC_DATA_BASE_URL`, `SEC_ARCHIVES_BASE_URL`, `SEC_TIMEOUT_MS`, `SEC_MIN_REQUEST_INTERVAL_MS`

**Files:** `.env` / `.env.example`, `sec.config.ts`, updated `sec.module.ts` + `sec.client.ts`, tests, `NOTES.md`

## Checks

- `npm test` — 19 passed  
- `npm run lint` — 0 errors (existing `main.ts` warning)  
- `npm run build` — passed  
- `npm run test:e2e` — passed
```

## Session 6
Timestamp: 2026-11-15T21:34:04+01:00
Tool: Cursor
Model: default
Prompt:

```
SecClient.ts is 290 lines. Can we separate the code in smaller files with similar responsibility
```
AI response summary:

````
Yes. `SecClient` currently mixes three jobs: HTTP + rate limiting, SEC JSON mapping, and CIK/URL helpers. Splitting those keeps one Nest injectable as the public surface.

### Suggested layout

```text
sec/
  sec.client.ts              # thin orchestrator (~80 lines)
  sec.module.ts
  sec.config.ts
  sec.constants.ts
  mappers/
    sec-submissions.mapper.ts
  utils/
    sec-identifiers.ts       # normalizeCik, stripLeadingZeros, SAFE file name
    sec-document-url.ts      # buildPrimaryDocumentUrl*
  http/
    map-sec-axios-error.ts   # axios → AppError
  __tests__/
    sec.client.spec.ts
    sec.config.spec.ts
    sec-submissions.mapper.spec.ts
    sec-identifiers.spec.ts
    sec-document-url.spec.ts
```

| File | Responsibility |
|---|---|
| `sec.client.ts` | Inject axios + config; `getCompanySubmissions` / `getSubmissionsFile`; rate-limited `getJson`; call mappers/utils |
| `mappers/sec-submissions.mapper.ts` | `mapCompany`, `mapFilingArrays`, `mapHistoricalFiles` (pure) |
| `utils/sec-identifiers.ts` | CIK normalize/strip + safe submissions filename check |
| `utils/sec-document-url.ts` | Build Archives URLs from CIK + accession + primary doc |
| `http/map-sec-axios-error.ts` | Map axios failures to `AppError` |

Keep `buildPrimaryDocumentUrl` as a public method on `SecClient` that delegates to `sec-document-url.ts`, so callers and tests do not need to change much.

### What not to do

- Do not turn every private method into its own Nest provider.
- Do not move axios construction into `common/` (still SEC-scoped).
- Avoid a giant `sec.helpers.ts`; group by kind (`mappers/`, `utils/`, `http/`) per your skill layout.

### Test split

Move mapping and URL/CIK cases into focused unit tests. Leave `sec.client.spec.ts` for orchestration + error-path wiring with mocked axios.

I'm in Ask mode, so I can't apply this. Switch to Agent mode if you want the refactor done.
````

## Session 6
Timestamp: 2026-11-15T21:37:17+01:00
Tool: Cursor
Model: default
Prompt:

```
Plan this changes
```
AI response summary:

```
```

## Session 6
Timestamp: 2026-11-15T21:39:05+01:00
Tool: Cursor
Model: default
Prompt:

```
http/
    map-sec-axios-error.ts should not be in common folder in erros
```
AI response summary:

```
Correct — and the plan already keeps it that way.

`map-sec-axios-error.ts` stays under **`sec/http/`**, not `common/errors/`.

| Location | What belongs there |
|---|---|
| `common/errors/app.error.ts` | Shared `AppError` type used by every module |
| `common/filters/` | Global HTTP response mapping |
| `sec/http/map-sec-axios-error.ts` | SEC/axios-specific translation into `AppError` |

Putting SEC axios mapping in `common` would couple the whole app to SEC transport details. `SecClient` imports the helper; other modules only see `AppError`.

No plan change needed for that point. Switch to Agent mode when you want the split implemented.
```

## Session 6
Timestamp: 2026-11-15T21:40:20+01:00
Tool: Cursor
Model: default
Prompt:

```
Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.
```
AI response summary:

```
## What changed

`SecClient` is now a thin Nest orchestrator. Logic moved to:

| Path | Role |
|---|---|
| `sec/mappers/sec-submissions.mapper.ts` | Company / filing / historical file mapping |
| `sec/utils/sec-identifiers.ts` | CIK + safe filename helpers |
| `sec/utils/sec-document-url.ts` | Archives document URLs |
| `sec/http/map-sec-axios-error.ts` | Axios → `AppError` (stays in `sec`, not `common`) |

Tests split to match; client specs cover orchestration only.

## Checks

- `npm test` — 27 passed  
- `npm run lint` — 0 errors  
- `npm run build` — passed
```

## Session 6
Timestamp: 2026-11-15T21:51:27+01:00
Tool: Cursor
Model: default
Prompt:

```
Now let's work on getting company and filing information from SEC EDGAR.

Please create the service that communicates with the SEC API.

I want all SEC requests to go through the backend, not directly from the frontend.

Please make sure we handle the SEC requirements properly, including the User-Agent, request limits and errors.

Keep the implementation simple and explain how the company information and filing data are retrieved.

Before finishing, tell me what you implemented and how I can test it.
```
AI response summary:

````
This is already implemented. I'm in Ask mode, so I can't change files; here's what exists and how to test it.

## What you already have

All SEC traffic goes through the Nest `sec` module. The frontend does not call SEC.

**`SecClient`** (`backend/src/sec/sec.client.ts`) is the service:

| Method | Purpose |
|---|---|
| `getCompanySubmissions(cik)` | Company + recent filings + historical file list |
| `getSubmissionsFile(fileName)` | Older filings from a submissions JSON file |
| `buildPrimaryDocumentUrl(...)` | Link to the filing on sec.gov |

Supporting pieces: env config (`SEC_USER_AGENT`, URLs, timeout, 100ms spacing), axios in `SecModule`, mappers/utils, and `AppError` mapping. Wired in `AppModule` via `SecModule`.

## How data is retrieved

1. **Company** — `GET https://data.sec.gov/submissions/CIK##########.json` → name, CIK, tickers, exchanges  
2. **Recent filings** — `filings.recent` parallel arrays → form, dates, accession, primary doc + Archives URL  
3. **History** — `filings.files` names → `getSubmissionsFile`  
4. **Document URL** — `https://www.sec.gov/Archives/edgar/data/{cik}/{accessionNoDashes}/{primaryDocument}`

Fair access: descriptive User-Agent from env, ≥100ms between requests, timeouts, no uncontrolled retries. Errors become shared `AppError` codes (404/403/429/timeout/502).

## What is not done yet

No public REST routes for companies/filings, and no ticker→CIK `companies` module. `SecClient` is ready for those next.

## How to test

```bash
cd backend
npm test          # mocked SEC (unit tests)
npm run lint
npm run build
npm run start:dev # hello still at GET /api ; Swagger at /docs
```

For a live SEC call later: set a real `SEC_USER_AGENT` like `SEC Filings API you@email.com` in `backend/.env`, then use `companies`/`filings` routes once they exist (or a temporary Nest test that injects `SecClient`).

If you want the next step (companies + filings API), switch to Agent mode and say so.
````

## Session 6
Timestamp: 2026-11-15T21:54:12+01:00
Tool: Cursor
Model: default
Prompt:

```
Plan changes
```
AI response summary:

```
```

## Session 6
Timestamp: 2026-11-15T22:03:18+01:00
Tool: Cursor
Model: default
Prompt:

```
Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.
```
AI response summary:

````
## What changed

Read-only companies/filings API on top of `SecClient`:

| Endpoint | Behavior |
|---|---|
| `GET /api/companies/:ticker` | Static lookup for AAPL, META, GOOGL, AMZN, NFLX, GS |
| `GET /api/companies/:ticker/filings` | Newest first; `formType`, inclusive `startDate`/`endDate`, `page`/`limit` |
| `GET /api/companies/:ticker/filings/:accessionNumber` | One filing (recent, then historical) |

Also: `class-validator` / `class-transformer`, global `ValidationPipe`, historical SEC files when `startDate` is older than recent.

## How to test

```bash
cd backend
npm test
npm run test:e2e
npm run start:dev
```

Then (with a real `SEC_USER_AGENT` in `.env`):

- `GET http://localhost:3000/api/companies/AAPL`
- `GET http://localhost:3000/api/companies/AAPL/filings?formType=10-K&limit=5`
- Swagger: `http://localhost:3000/docs`

## Checks

- `npm test` — 38 passed  
- `npm run test:e2e` — 4 passed  
- `npm run lint` — 0 errors  
- `npm run build` — passed
````

## Session 6
Timestamp: 2026-11-15T22:14:05+01:00
Tool: Cursor
Model: default
Prompt:

```
FilingsService.ts is 200 lines. How can we split it into smaller files based on responsibility
```
AI response summary:

````
Yes. Keep `FilingsService` as the Nest orchestrator (resolve company, call `SecClient`, return DTOs). Move the pure list logic into helpers, same idea as the `sec/` split.

### Suggested layout

```text
filings/
  filings.service.ts              # ~60–80 lines: list + findByAccession
  filings.controller.ts
  filings.module.ts
  dtos/...
  mappers/
    filing.mapper.ts              # toDto
  utils/
    filings-query.ts              # assertDateRange
    filings-filter-sort.ts        # filter, sort, oldestFilingDate, mergeByAccession
    historical-files.ts           # fileOverlapsRange (+ optionally select overlapping refs)
  __tests__/
    filings.service.spec.ts       # orchestration with mocked SecClient
    filings-filter-sort.spec.ts
    historical-files.spec.ts
    filing.mapper.spec.ts
```

| File | Move from current service |
|---|---|
| `mappers/filing.mapper.ts` | `toDto` |
| `utils/filings-query.ts` | `assertDateRange` |
| `utils/filings-filter-sort.ts` | `filterFilings`, `sortFilings`, `oldestFilingDate`, `mergeByAccession` |
| `utils/historical-files.ts` | `fileOverlapsRange` |

`loadHistoricalFilings` can stay on the service (it needs `SecClient`), or become something like `loadOverlappingHistoricalFilings(secClient, files, start, end)` in a small `filings/loaders/` helper if you want the service even thinner.

### What stays in `FilingsService`

1. `list` — validate → company → submissions → maybe history → filter/sort/paginate → map  
2. `findByAccession` — company → recent → walk historical files → map or `not_found`

No new Nest providers for pure helpers.

### Tests

Move inclusive date/form/sort/pagination cases into `filings-filter-sort.spec.ts`. Leave service specs for “calls SEC / merges history / not found”.

I'm in Ask mode, so I can't apply this. Switch to Agent mode if you want the refactor done.
````

## Session 6
Timestamp: 2026-11-15T22:15:10+01:00
Tool: Cursor
Model: default
Prompt:

```
Plan this changes
```
AI response summary:

```
```

## Session 6
Timestamp: 2026-11-15T22:15:39+01:00
Tool: Cursor
Model: default
Prompt:

```
Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.
```
AI response summary:

```
## What changed

`FilingsService` is now a thin orchestrator. Logic moved to:

| Path | Role |
|---|---|
| `filings/mappers/filing.mapper.ts` | `toFilingDto` |
| `filings/utils/filings-query.ts` | Date range validation |
| `filings/utils/filings-filter-sort.ts` | Filter, sort, merge, paginate, oldest date |
| `filings/utils/historical-files.ts` | Historical file range overlap |

Tests split to match; service specs cover SEC orchestration only.

## Checks

- `npm test` — 45 passed  
- `npm run test:e2e` — 4 passed  
- `npm run lint` — 0 errors  
- `npm run build` — passed
```

## Session 6
Timestamp: 2026-11-15T22:32:29+01:00
Tool: Cursor
Model: default
Prompt:

```
Before moving to the frontend, please review the backend we have built so far.

Check whether:
- The endpoints work as expected.
- The error handling makes sense.
- The responses are consistent.
- The SEC document links are correct.
- The filtering and pagination work properly.
- We are handling SEC requests responsibly.
- The code is not unnecessarily complicated.

Please run the available tests.

Tell me if you find anything that should be fixed. Don't make large changes without explaining them first.
```
AI response summary:

```
## Verdict

The backend is in good shape for the frontend. Assignment endpoints, error shape, filtering/pagination, SEC document URLs, and fair-access handling are coherent. Tests pass. Nothing looks like a blocker; a few small gaps are worth knowing before UI work.

## Tests run

| Check | Result |
|---|---|
| `npm test` | 45 passed |
| `npm run test:e2e` | 4 passed |
| `npm run lint` | passed (existing `main.ts` floating-promise warning only) |
| `npm run build` | blocked here by Ask-mode sandbox (`EPERM` on `dist/`); it passed in the earlier Agent run |

## Checklist

**Endpoints** — Match the plan: company by ticker, nested filings list, accession detail. Controllers are thin; services own logic.

**Error handling** — Shared `{ statusCode, code, message }` via `AppError` + `AppExceptionFilter`. ValidationPipe 400s map to `bad_request`. Unsupported ticker / missing filing → `not_found`. Upstream SEC failures map to forbidden/rate_limited/timeout/unavailable. Sensible.

**Response consistency** — Company and filing DTOs are stable and independent of raw SEC JSON. List always returns `{ data, page, limit, total, totalPages }`.

**SEC document links** — Built as  
`{archivesBase}/{cikNoLeadingZeros}/{accessionNoDashes}/{primaryDocument}`  
from SEC metadata (not guessed). Unit tests cover this.

**Filtering / pagination** — Inclusive filing-date filter, exact `formType`, newest-first with accession tie-break, page/limit with max 100. Covered by unit tests.

**SEC responsibility** — Env User-Agent, timeout, trusted hosts, ~100ms spacing, no retries, axios only in `sec`. Good.

**Complexity** — Modular without over-abstraction. Acceptable for the assignment.

## Issues / gaps (fix only if you want)

1. **No CORS yet** — Frontend on Vite will need `enableCors` (or a proxy). Add when starting the UI.
2. **Placeholder `SEC_USER_AGENT`** — Live SEC needs a real contact in `.env`; placeholder can get 403.
3. **History only with `startDate`** — Without `startDate`, list uses recent filings only. Correct and documented in notes; UI should not imply full history unless a start date is set (or you change that later).
4. **`formType` is case-sensitive** — `10-k` ≠ `10-K`. Optional: normalize to uppercase for matching.
5. **Dates are format-only** — `YYYY-MM-DD` regex allows `2024-13-40`. Low priority; optional calendar validation.
6. **Leftover `GET /api` Hello World** — Harmless; remove when polishing.
7. **Accession lookup can walk many historical files** — Rate-limited and correct, but slow for old accessions. Fine for this scope.

## Suggested next step

Start the frontend against these contracts. Before live smoke: set a real `SEC_USER_AGENT`, then hit `/api/companies/AAPL` and `/api/companies/AAPL/filings?formType=10-K&limit=5`. When wiring the UI, add CORS or a Vite proxy.
```

## Session 6
Timestamp: 2026-11-15T22:40:22+01:00
Tool: Cursor
Model: default
Prompt:

```
Plan Change but chnage number 6 to /health and return version and current date time
```
AI response summary:

```
```

## Session 6
Timestamp: 2026-11-15T22:42:02+01:00
Tool: Cursor
Model: default
Prompt:

```
Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.
```
AI response summary:

```
## What changed

1. **`GET /health`** — Returns `{ version, datetime }` from `package.json` + `toISOString()`. Excluded from the `/api` prefix.
2. **CORS** — Allows `http://localhost:5173`.
3. **`formType`** — Case-insensitive matching.
4. **Dates** — `YYYY-MM-DD` format plus `IsISO8601({ strict: true })`.

## Checks

- `npm test` — 46 passed  
- `npm run test:e2e` — 4 passed  
- `npm run lint` — passed  
- `npm run build` — passed  

Smoke: `GET http://localhost:3000/health`
```

## Session 6
Timestamp: 2026-11-15T22:59:44+01:00
Tool: Cursor
Model: default
Prompt:

```
Before making any changes, read and follow the instructions in:
.cursor/skills/frontend-react/SKILL.md

Now let's work on the frontend.

I want a simple and clean interface where users can:

- Search for a company using its ticker.
- See basic company information.
- Browse the company's filings.
- Filter filings by form type.
- Filter filings by date range.
- Move between pages.
- Open the original SEC document.

Please use the existing React and TypeScript setup.

The frontend should get its data from our NestJS backend. It should not communicate directly with SEC EDGAR.

Please keep the components organised and reusable where it makes sense.

Make sure loading, empty and error states are handled properly.

Don't add features that are not required for the assignment.

Follow ## Feature-based structure in .cursor/skills/frontend-react/SKILL.md
```
AI response summary:

````
I'm in **Ask mode**, so I can't edit files yet. Here is the implementation plan aligned with `.cursor/skills/frontend-react/SKILL.md` and your Nest API. Switch to **Agent mode** (or Plan mode first) when you want this built.

## Constraints from the skill

- Call Nest only — never SEC from the browser  
- Feature-based folders (`companies`, `filings`, small `shared`)  
- No router unless needed (one page is enough)  
- No Redux / React Query unless justified — local state + `fetch`  
- Loading / empty / error handled explicitly  
- Assignment scope only  

## Proposed structure

```text
frontend/src/
  app/
    App.tsx
  features/
    companies/
      components/CompanySearch.tsx
      components/CompanyDetails.tsx
      hooks/useCompanySearch.ts
      services/companiesApi.ts
      types/company.ts
    filings/
      components/FilingsFilters.tsx
      components/FilingsTable.tsx
      components/FilingsPagination.tsx
      hooks/useCompanyFilings.ts
      services/filingsApi.ts
      types/filing.ts
  shared/
    components/StatusMessage.tsx   # loading / empty / error
    services/apiClient.ts          # base URL + error parsing
    types/apiError.ts
  main.tsx
  index.css
```

No empty folders. No Context unless something truly cross-cutting appears.

## Data flow

1. User enters/selects ticker (AAPL, META, GOOGL, AMZN, NFLX, GS)  
2. `GET /api/companies/:ticker` → company card  
3. `GET /api/companies/:ticker/filings?formType&startDate&endDate&page&limit` → table  
4. Filters change → reset `page` to 1 → refetch  
5. Document column → `<a href={primaryDocumentUrl} target="_blank" rel="noreferrer">`  

Base URL via `VITE_API_BASE_URL` (default `http://localhost:3000`). CORS already allows Vite on `5173`.

## UX (one page)

- Search/select ticker + Search  
- Company: name, ticker, CIK  
- Filters: form type, start/end date  
- Table: form, filing date, report date, accession, Open document  
- Pagination: prev/next + page info from `{ page, limit, total, totalPages }`  
- States: loading, empty (“No filings”), API error message  

## Config / cleanup

- Add `frontend/.env.example` with `VITE_API_BASE_URL`  
- Replace Vite starter `App.tsx` / CSS with the filings UI  
- Update `App.test.tsx` for the new heading/flow; mock API in tests  

## Out of scope

Auth, charts, Redux, React Router (unless you later want shareable URLs), direct SEC calls.

Switch to **Agent mode** and say “implement the frontend” when you want this applied.
````

## Session 6
Timestamp: 2026-11-15T23:19:46+01:00
Tool: Cursor
Model: default
Prompt:

```
Please consider this as new skill:

Use the rfrontend-react skill as the mandatory
frontend development standard for this entire project.

Read the complete skill file:

.cursor/skills/frontend-react/SKILL.md

Apply these standards to all future frontend tasks,
including new features, modifications, bug fixes and refactoring.

Before implementing anything:
1. Inspect the existing project.
2. Understand the current architecture.
3. Follow the defined folder structure.
4. Reuse existing components and utilities.
5. Follow the mandatory implementation checklist.

Do not overengineer the application.
Prioritize clean code, maintainability, simplicity and
professional UI quality.
```
AI response summary:

```
Understood. For all frontend work in this project I’ll treat [`.cursor/skills/frontend-react/SKILL.md`](.cursor/skills/frontend-react/SKILL.md) as the mandatory standard—new features, fixes, and refactors.

Before any frontend change I’ll:

1. Inspect the existing React/Vite setup and conventions  
2. Match the current architecture  
3. Use the feature-based layout (`features/companies`, `features/filings`, small `shared/`)  
4. Reuse existing pieces instead of inventing parallels  
5. Follow the skill’s implementation checklist (Nest-only API, loading/empty/error, accessible UI, tests, no overengineering)

I’ll keep the UI simple, maintainable, and within assignment scope—no SEC calls from the browser, no unnecessary libraries or global state.

I’m still in **Ask mode**, so I can’t edit files or lock this into `.cursor/rules` yet. Switch to **Agent mode** if you want that written as a persistent project rule, or to start implementing the frontend under this skill.
```

## Session 6
Timestamp: 2026-11-15T23:21:18+01:00
Tool: Cursor
Model: default
Prompt:

```
Plan change in solid and dry principle
```
AI response summary:

```
```

## Session 6
Timestamp: 2026-11-15T23:25:36+01:00
Tool: Cursor
Model: default
Prompt:

```
Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.
```
AI response summary:

```
Frontend SEC filings UI is in place under the skill layout with SOLID/DRY boundaries.

**What you get**
- Feature modules: `companies` + `filings` (types → services → hooks → components)
- Shared `lib/axios` (`ApiError` from Nest `{ statusCode, code, message }`) and `StatusMessage`
- One page: ticker select, company header, RHF+Zod filters, table, pagination
- Stack: Tailwind, shadcn, Router, TanStack Query, Axios, Zod/RHF, Lucide
- `VITE_API_BASE_URL` via `.env` / `.env.example`

**Verify**
- `npm run build`, `lint`, and `test` all pass in `frontend/`

Run Nest on `:3000`, then `npm run dev` in `frontend/`.
```

## Session 6
Timestamp: 2026-11-15T23:43:18+01:00
Tool: Cursor
Model: default
Prompt:

```
I want you to improve the overall UI/UX design of my existing application.

Analyze the current UI before making changes.

The current design is too plain and has too much white space with almost no use of colors. I want a modern, professional SaaS dashboard design.
```
AI response summary:

```
## Current UI analysis

The app is functionally solid (select → company → filter → table), but visually it reads as a **bare form page**, not a SaaS dashboard.

### What’s wrong today

| Area | Current state | Effect |
| --- | --- | --- |
| **Color** | Default shadcn neutral theme: pure white bg, near-black primary, gray borders ([`index.css`](frontend/src/index.css)) | No brand accent; everything feels grayscale |
| **Layout** | Single column, `space-y-8`, loose stacking ([`CompanyFilingsPage`](frontend/src/pages/CompanyFilingsPage.tsx)) | Large empty regions; weak grouping |
| **Header** | Text-only border strip ([`AppHeader`](frontend/src/components/shared/AppHeader.tsx)) | No product identity, no density |
| **Company** | Plain title + muted line ([`CompanyHeader`](frontend/src/features/companies/components/CompanyHeader.tsx)) | No “selected entity” card / status |
| **Filters** | Naked grid of inputs ([`FilingsFilters`](frontend/src/features/filings/components/FilingsFilters.tsx)) | Controls float with no panel |
| **Table** | Border only, no header tint / badges ([`FilingsTable`](frontend/src/features/filings/components/FilingsTable.tsx)) | Low scanability |
| **Hierarchy** | Select → header → “Filings” heading → filters → table all same visual weight | Eye doesn’t know where to land |

### What already works (keep)

- Clear information architecture (company then filings)
- Loading / error / empty via `StatusMessage`
- Responsive filter grid + scrollable table
- shadcn primitives (good base for a polish pass)

---

## Recommended direction (modern SaaS dashboard)

Stay within the skill stack (Tailwind + shadcn). No new libraries. Focus on **surface, color, density, hierarchy**.

### 1. Theme (color without going purple-AI cliché)

Shift tokens in [`index.css`](frontend/src/index.css) to a **slate canvas + teal/emerald accent** (finance-friendly, professional):

- `--background`: soft slate tint (not pure white)
- `--primary`: saturated teal for CTAs / active states
- `--card`: white elevated surfaces
- Optional subtle page gradient or dotted grid behind content

### 2. Shell

- Sticky header with logo mark, product name, short subtitle
- Main: tighter max width / denser padding (`py-6`, `gap-6`)
- Soft muted page background so **cards** pop

### 3. Page composition (reduce whitespace by grouping)

1. **Toolbar row** — company select + optional “live / Nest API” chip  
2. **Company summary card** — name, ticker badge, CIK meta in a grid  
3. **Filings panel card** — title + count badge, filter bar inside card, table below, pagination footer  

That alone cuts “floating in white” by putting related UI in containers.

### 4. Component polish

- **Ticker**: badge / pill (`AAPL`) with primary-muted fill  
- **Form types** in table: small outline badges (`10-K`, `10-Q`)  
- **Filters**: muted inset bar, clearer Apply (primary) vs Reset (ghost)  
- **Table**: muted header row, hover rows, stronger document link as button-ish  
- **Empty/error**: keep `StatusMessage`, wrap in the same card surface  

### 5. Motion (light)

- Short fade/slide on company card / table load (CSS/`tw-animate` only)  
- Avoid decorative noise

---

## Files I’d change (when implementing)

- [`frontend/src/index.css`](frontend/src/index.css) — palette + page atmosphere  
- [`frontend/src/layouts/MainLayout.tsx`](frontend/src/layouts/MainLayout.tsx)  
- [`frontend/src/components/shared/AppHeader.tsx`](frontend/src/components/shared/AppHeader.tsx)  
- [`frontend/src/pages/CompanyFilingsPage.tsx`](frontend/src/pages/CompanyFilingsPage.tsx) — card sections  
- Feature components under `features/companies` and `features/filings`  
- Possibly add shadcn `Card` / `Badge` if not already present  

No API or SOLID layering changes needed—this is presentation only.

---

I'm in **Ask mode**, so I can’t apply these edits. Switch to **Agent mode** and ask to implement the SaaS dashboard polish; I’ll restyle against this analysis without changing Nest contracts or feature architecture.
```

## Session 6
Timestamp: 2026-11-15T23:45:17+01:00
Tool: Cursor
Model: default
Prompt:

```
Plan this chnages make sure only presentation changes no No API or SOLID layering.
```
AI response summary:

```
```

## Session 6
Timestamp: 2026-11-15T23:45:55+01:00
Tool: Cursor
Model: default
Prompt:

```
Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.
```
AI response summary:

```
SaaS dashboard polish is done—presentation only; hooks/services/API untouched.

**Visual changes**
- Slate canvas + teal primary tokens and soft page gradient in `index.css`
- Sticky header with teal mark + denser `MainLayout`
- Toolbar (ticker + Nest API chip), company card, filings card with filter bar / table / footer
- Badges for ticker & form types, muted table header, outline document buttons

**Verify:** `lint`, `test`, and `build` all pass. Run `npm run dev` in `frontend/` to preview.
```

## Session 6
Timestamp: 2026-11-16T21:38:18+01:00
Tool: Cursor
Model: default
Prompt:

```
Please update the README.md files in the root, frontend, and backend directories to make it easy for developers to understand and work with the project.

Project Overview: A short description of the project and its purpose.
Tech Stack: Briefly describe the technologies, frameworks, and libraries used in the frontend and backend.
Installation: Explain how to clone the repository and install all required dependencies.
Environment Configuration: List all required environment variables and explain how to configure the .env files. Include examples where helpful.
Running the Project: Provide step-by-step instructions to start the frontend and backend locally.
Build: Explain how to build the frontend and backend for production.
Testing: Include commands for running tests.
Linting: Include commands for running lint checks and formatting the code.
Local URLs: Provide the local development URLs for the frontend and backend.
API Documentation: If Swagger or other API documentation is available, include its URL and instructions on how to access it.
Keep the documentation simple, clear, and beginner-friendly
```
AI response summary:

```
I'm in **Ask mode**, so I can't edit the README files. Switch to **Agent mode** and ask me to update them—I'll write all three.

Here's the accurate content based on the repo today:

### Current state
- Root [`README.md`](README.md) is **empty**
- [`backend/README.md`](backend/README.md) is the NestJS template
- [`frontend/README.md`](frontend/README.md) is the Vite template

### Facts to document

| Item | Value |
| --- | --- |
| Backend | NestJS 11, TypeScript, Axios (SEC only), Swagger, ConfigModule |
| Frontend | React 19, Vite, Tailwind, shadcn, TanStack Query, Axios, RHF+Zod |
| Backend env | Copy `backend/.env.example` → `.env`; set real `SEC_USER_AGENT` email |
| Frontend env | `VITE_API_BASE_URL=http://localhost:3000` |
| Run | `npm run start:dev` in `backend/`; `npm run dev` in `frontend/` |
| URLs | UI `http://localhost:5173`, API `http://localhost:3000`, health `/health`, Swagger `/docs`, API `/api/...` |
| Format | Backend: `npm run format` (Prettier). Frontend: lint only (`npm run lint`)—no format script |

### Suggested README split
1. **Root** — overview, stack, clone + install both apps, env pointers, run both, local URLs, link to Swagger  
2. **Backend** — Nest details, SEC env vars (from `.env.example`), start/build/test/lint/format, `/docs`  
3. **Frontend** — Vite/React stack, `VITE_API_BASE_URL`, start/build/test/lint, needs backend running  

Switch to Agent mode and say “update the three READMEs” and I’ll apply this.
```

## Session 6
Timestamp: 2026-11-16T21:39:30+01:00
Tool: Cursor
Model: default
Prompt:

```
plan changes
```
AI response summary:

```
```

## Session 6
Timestamp: 2026-11-16T21:39:58+01:00
Tool: Cursor
Model: default
Prompt:

```
Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.
```
AI response summary:

```
Updated all three READMEs and logged the decision in `NOTES.md`.

- **[`README.md`](README.md)** — project overview, stack, install both apps, env pointers, run/build/test/lint, URL table, Swagger link  
- **[`backend/README.md`](backend/README.md)** — Nest API, full `SEC_*` / `PORT` env table, scripts, health + API + `/docs`  
- **[`frontend/README.md`](frontend/README.md)** — React UI, `VITE_API_BASE_URL`, Nest dependency, scripts (lint only—no format script)
```

## Session 7
Timestamp: 2026-11-16T22:24:11+01:00
Tool: Cursor
Model: default
Prompt:

```
Use the code-review skill to review my entire project.

Read:
.cursor/skills/code-review/SKILL.md

Review both frontend (React + TypeScript) and backend (NestJS).

Identify bugs, architectural issues, security risks, performance problems and code quality improvements.
```
AI response summary:

````
### Summary

Solid assignment-scope architecture: Nest modules isolate SEC I/O, filings orchestration, and company lookup; the React app uses a clean feature split with typed Axios + TanStack Query. No CRITICAL security flaws found. The main gaps are **historical filings correctness** (especially `endDate`-only), **unbounded SEC fan-out** on list/accession paths, and a few **frontend error/a11y** inconsistencies. Frontend↔backend contracts otherwise align.

Tests were **not executed** in this review; findings are from source inspection.

---

### Findings

#### 1. HIGH — Historical files never load for `endDate`-only (or any query without `startDate`)

**Where:** `backend/src/filings/filings.service.ts` (`list`)

```42:52:backend/src/filings/filings.service.ts
    if (
      query.startDate &&
      (oldestRecent === undefined || query.startDate < oldestRecent)
    ) {
      const historical = await this.loadHistoricalFilings(
        submissions.historicalFiles,
        query.startDate,
        query.endDate,
      );
      filings = mergeByAccession(filings, historical);
    }
```

**Problem:** Historical loading is gated only on `startDate`. `GET .../filings?endDate=2018-12-31` filters recent-only data and often returns an empty page even when older filings exist.

**Why it matters:** Breaks date-range filtering for a valid, common query shape.

**Fix:** Load historical when the requested window can fall outside recent coverage (e.g. `endDate < oldestRecent`, empty recent, or missing `startDate` with an old `endDate`). Use a synthetic lower bound (`0000-01-01`) when calling `selectOverlappingHistoricalFiles` if `startDate` is absent. Document that the default unfiltered list is recent-only if that remains intentional.

---

#### 2. HIGH — List path materializes all overlapping history before paging

**Where:** `filings.service.ts` (`loadHistoricalFilings` + `paginateFilings`)

**Problem:** Wide `startDate` ranges `Promise.all` every overlapping historical JSON, merge/sort everything, then `slice` one page.

**Why it matters:** High latency, memory use, and SEC request volume for deep history (outbound spacing helps rate, not payload size).

**Fix:** Fetch newest-first until the page is filled; cap fan-out; and/or TTL-cache submissions/historical files.

---

#### 3. HIGH — Accession lookup can scan every historical file with no format check

**Where:** `filings.service.ts` (`findByAccession`), `filings.controller.ts`

**Problem:** Only `trim()` is applied. Misses/typos walk all historical files sequentially before `404`.

**Why it matters:** Easy accidental or abusive amplification against SEC and your process.

**Fix:** Validate accession shape early (`^\d{10}-\d{2}-\d{6}$` → `400`). Prefer files whose date range overlaps the accession year; cache file contents.

---

#### 4. MEDIUM — Merge prefers historical over recent on conflicts

**Where:** `backend/src/filings/utils/filings-filter-sort.ts` (`mergeByAccession`)

```25:34:backend/src/filings/utils/filings-filter-sort.ts
export function mergeByAccession(
  primary: readonly SecFilingRecord[],
  secondary: readonly SecFilingRecord[],
): SecFilingRecord[] {
  const byAccession = new Map<string, SecFilingRecord>();
  for (const filing of [...primary, ...secondary]) {
    byAccession.set(filing.accessionNumber, filing);
  }
  return [...byAccession.values()];
}
```

**Problem:** Later write wins, so historical overwrites recent. The unit test encodes this behavior.

**Why it matters:** Boundary duplicates should keep recent (fresher/canonical).

**Fix:** Iterate `[...secondary, ...primary]`, or `set` only if absent; update the test.

---

#### 5. MEDIUM — Recent-only default list is undocumented

**Where:** `FilingsService.list` behavior vs `backend/README.md` / root README

**Problem:** No dates → recent filings only; `total` looks like full history. Accession route is also missing from README endpoint table.

**Why it matters:** Clients and reviewers can misread coverage and contract.

**Fix:** Document inclusive filing-date semantics, historical load rules, defaults (`page=1`, `limit=20`, max `100`), and `GET .../filings/:accessionNumber`.

---

#### 6. MEDIUM — Company error UI still shows cached `CompanyHeader`

**Where:** `frontend/src/pages/CompanyFilingsPage.tsx`

```72:82:frontend/src/pages/CompanyFilingsPage.tsx
            {companyQuery.isError ? (
              <StatusMessage
                status="error"
                message={errorMessage(companyQuery.error)}
                onRetry={() => void companyQuery.refetch()}
              />
            ) : null}

            {companyQuery.data ? (
              <CompanyHeader company={companyQuery.data} />
            ) : null}
```

**Problem:** On refetch failure, TanStack Query keeps prior `data`, so error and header both render. Filings correctly require `!isError`.

**Fix:** Render header when `companyQuery.data && !companyQuery.isError` (or `isSuccess`).

---

#### 7. MEDIUM — Queries ignore `AbortSignal`

**Where:** `useCompany`, `useFilings` → services

**Problem:** Rapid ticker/filter changes leave in-flight Axios work running.

**Fix:** Pass `signal` from `queryFn` into `apiClient.get(..., { signal, params })`.

---

#### 8. MEDIUM — Accessibility gaps in filters, empty state, and document links

**Where:** `FilingsFilters.tsx`, `StatusMessage.tsx` + `alert.tsx`, `FilingsTable.tsx`

**Problems:**
- Filter errors lack `aria-invalid` / `aria-describedby` (Input styles support it but unused).
- Empty state uses `Alert` with `role="alert"` (assertive; wrong for “No results”).
- “Open” links share the same accessible name; icon is `aria-hidden`.

**Fix:** Wire ARIA on fields; use `role="status"` for empty; add descriptive `aria-label`s on document links.

---

#### 9. MEDIUM — Frontend trusts `primaryDocumentUrl` as `href` without allowlisting

**Where:** `FilingsTable.tsx`

**Problem:** Backend builds SEC archive URLs today, but the UI has no scheme/host check.

**Fix:** Only link `https:` URLs under `www.sec.gov`; otherwise show plain text.

---

#### 10. MEDIUM — Supported tickers duplicated frontend vs backend

**Where:** `frontend/.../company.types.ts` vs `backend/.../supported-companies.ts`

**Problem:** Lists match now; drift causes 404s or missing options with no compile-time link.

**Fix:** Backend `GET /api/companies` (or contract test), and drive the select from the API.

---

#### 11. MEDIUM — CORS hardcoded to Vite localhost

**Where:** `backend/src/configure-app.ts`

**Problem:** Any other origin/port fails browser calls.

**Fix:** `CORS_ORIGINS` env (comma-separated), defaulting to `http://localhost:5173`.

---

#### 12. MEDIUM — No inbound throttling despite SEC fan-out

**Where:** Controllers vs `SecClient.scheduleRequest`

**Problem:** Outbound spacing is process-global; concurrent API clients can still multiply SEC traffic.

**Fix:** Light throttle on filings routes + short TTL cache for submissions/historical files.

---

#### 13. MEDIUM — Frontend `.env` not gitignored

**Where:** `frontend/.gitignore` (no `.env`; only `*.local`). Backend correctly ignores `.env`.

**Problem:** Local env can be committed by accident. Current content is only `VITE_API_BASE_URL`, so risk is hygiene more than secrets.

**Fix:** Add `.env` (keep `.env.example`).

---

#### 14. LOW — `reportDate` required in DTO but often empty string

**Where:** mapper `reportDates[index] ?? ''`; `FilingDto.reportDate`

**Fix:** Document as optional, or use `string | null` in DTO + OpenAPI. Frontend already shows `—`.

---

#### 15. LOW — `primaryDocument` path not sanitized beyond leading slashes

**Where:** `sec-document-url.ts`

**Problem:** Path segments like `../` could produce odd archive URLs if upstream data were hostile.

**Fix:** Reject `/`, `\`, or `..` in document names.

---

#### 16. LOW — Redundant `toApiError` in hooks; thin frontend tests; no 404 route

**Where:** hooks already covered by Axios interceptor; `App.test.tsx` smoke only; `routes/index.tsx`

**Fix:** Map errors in one place; add filter/error/pagination tests; add `path: '*'`.

---

### Positive Observations

- Clear Nest layering: `companies` / `filings` / `sec` / `common`, thin controllers, pure utils/mappers with solid unit tests.
- SEC hygiene: required User-Agent email, trusted data base URL, timeout, outbound spacing, safe historical filenames, no stack traces in client errors.
- ValidationPipe with `whitelist` + `forbidNonWhitelisted`; inclusive filing-date filter; newest-first sort with accession tie-break; `limit` capped at 100.
- Frontend feature folders, shared Axios/`ApiError`, stable query keys, RHF+Zod filters (including start≤end), loading/error/empty/retry for filings, `encodeURIComponent(ticker)`, `rel="noreferrer"` on external links.
- FE/BE shapes for company, paginated filings, and Nest error body match.

---

### Recommendations (priority)

1. Fix historical loading for ranges that need it without `startDate` (especially `endDate`-only).
2. Validate accession format before historical walks; bound/cache historical fetches for list + accession.
3. Prefer recent on merge conflicts; document recent-only default and accession route.
4. Gate `CompanyHeader` on success; pass `AbortSignal`; fix filter/empty/link a11y.
5. Allowlist document URLs; sync supported tickers; make CORS configurable; ignore frontend `.env`.

---

### Overall Assessment

| Area | Assessment |
|------|------------|
| Code quality | Strong — readable, typed, consistent |
| Architecture | Strong for assignment scope; SEC isolation done well |
| Security | Good outbound URL/config hygiene; inbound amplification, CORS, and href trust are the main gaps |
| Performance | Fine for recent lists; historical materialization and accession scans are the risks |
| Maintainability | High — small modules, shared errors, tested helpers |
| Production readiness | Good local demo / interview submission; not deploy-ready without historical-contract clarity, caching/bounds, configurable CORS, and stronger UI a11y/tests |

If you want fixes next, switch to Agent mode and say which severity tier to tackle first (HIGH only vs HIGH+MEDIUM).
````

## Session 7
Timestamp: 2026-11-16T22:57:12+01:00
Tool: Cursor
Model: default
Prompt:

```
Plan for fix the Recommendations (priority) list
```
AI response summary:

```
```

## Session 7
Timestamp: 2026-11-16T23:00:00+01:00
Tool: Cursor
Model: default
Prompt:

```
Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.
```
AI response summary:

```
Implemented all five recommendation groups from the plan.

### Backend
- Historical filings load for `endDate`-only (and when the range is older than recent); no dates stay recent-only
- Accession format validation + year-narrowed historical walk
- In-memory SEC TTL cache (`SEC_CACHE_TTL_MS`, default 5m)
- Merge prefers recent; unsafe `primaryDocument` path segments rejected
- `GET /api/companies`, configurable `CORS_ORIGINS`, README/`.env.example` updates

### Frontend
- Company header gated on success; AbortSignal on queries; filter/empty/link a11y
- SEC URL allowlist; ticker select from companies API; `.env` gitignored

### Verification
- Backend: `npm test` 57 passed; `npm run test:e2e` 6 passed; lint clean
- Frontend: `npm test` 1 passed; lint clean
- Decision recorded in `NOTES.md`
```

