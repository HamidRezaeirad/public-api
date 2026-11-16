# Backend (NestJS API)

NestJS API that serves company and filing data for the SEC EDGAR filings explorer. This service is the only place that talks to SEC. The frontend must call this API—not SEC directly.

Supported tickers: `AAPL`, `META`, `GOOGL`, `AMZN`, `NFLX`, `GS`.

## Tech stack

- NestJS 11 + TypeScript
- `@nestjs/config` for environment variables
- Axios for outbound SEC HTTP (scoped to the SEC client)
- `class-validator` / `class-transformer` for request validation
- `@nestjs/swagger` for OpenAPI / Swagger UI

## Installation

```bash
cd backend
npm install
```

## Environment configuration

```bash
cp .env.example .env
```

Edit `.env`. At minimum, set a real contact email in `SEC_USER_AGENT` before making live SEC requests (SEC fair-access policy). See [`.env.example`](.env.example) and [`README.md`](README.md) for every variable.

| Variable                      | Required | Description                                                                                                                     |
| ----------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `SEC_USER_AGENT`              | Yes      | Fair-access User-Agent: app name **plus a real contact email** (not a bare URL). Replace the placeholder before live SEC calls. |
| `SEC_DATA_BASE_URL`           | Yes      | SEC data API base URL. Must be `https://data.sec.gov` (no trailing slash).                                                      |
| `SEC_ARCHIVES_BASE_URL`       | Yes      | Base used to build primary document links. Must start with `https://www.sec.gov/Archives/edgar/data`.                           |
| `SEC_TIMEOUT_MS`              | Yes      | Outbound SEC request timeout in milliseconds (example: `10000`).                                                                |
| `SEC_MIN_REQUEST_INTERVAL_MS` | Yes      | Minimum spacing between SEC requests in milliseconds (example: `100`, about ≤ 10 req/s).                                        |
| `SEC_CACHE_TTL_MS`            | No       | In-memory SEC response cache TTL in milliseconds. Defaults to `300000`. Set `0` to disable.                                     |
| `CORS_ORIGINS`                | No       | Comma-separated browser origins. Defaults to `http://localhost:5173`.                                                           |
| `PORT`                        | No       | HTTP port. Defaults to `3000` if unset.                                                                                         |

Example (from `.env.example`—update the email):

```env
SEC_USER_AGENT=SEC Filings API your-email@example.com
SEC_DATA_BASE_URL=https://data.sec.gov
SEC_ARCHIVES_BASE_URL=https://www.sec.gov/Archives/edgar/data
SEC_TIMEOUT_MS=10000
SEC_MIN_REQUEST_INTERVAL_MS=100
SEC_CACHE_TTL_MS=300000
CORS_ORIGINS=http://localhost:5173
```

## Running locally

```bash
npm run start:dev
```

Other start modes:

```bash
npm run start
npm run start:debug
```

## Build

```bash
npm run build
npm run start:prod
```

`start:prod` runs the compiled app from `dist/`.

## Testing

```bash
npm test
npm run test:watch
npm run test:cov
npm run test:e2e
```

## Linting and formatting

```bash
npm run lint
npm run format
```

`format` runs Prettier on `src/**/*.ts` and `test/**/*.ts`.

## Local URLs

| Endpoint | URL                                                                  |
| -------- | -------------------------------------------------------------------- |
| API base | http://localhost:3000                                                |
| Health   | http://localhost:3000/health                                         |
| Companies | http://localhost:3000/api/companies                                 |
| Company  | http://localhost:3000/api/companies/:ticker                          |
| Filings  | http://localhost:3000/api/companies/:ticker/filings                  |
| Filing   | http://localhost:3000/api/companies/:ticker/filings/:accessionNumber |

Filings query params (optional): `page` (default `1`), `limit` (default `20`, max `100`), `formType`, `startDate`, `endDate` (`YYYY-MM-DD`).

Date filters use **inclusive filing dates**. With no dates, the list returns **recent SEC submissions only**. Historical submission files load when `startDate` and/or `endDate` can fall outside that recent window (including `endDate`-only). Accession numbers must match `##########-##-######`.

CORS allows origins from `CORS_ORIGINS` (default `http://localhost:5173`).

## API documentation

- Swagger UI: [http://localhost:3000/docs](http://localhost:3000/docs)
- OpenAPI JSON: [http://localhost:3000/docs-json](http://localhost:3000/docs-json)

Start the backend, then open `/docs` in a browser to explore and try the endpoints.
