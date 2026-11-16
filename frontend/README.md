# Frontend (React + Vite)

React UI for the SEC EDGAR filings explorer. Select a supported company ticker, view company details, and browse paginated filings with form-type and date filters.

The frontend calls **only** the NestJS backend (`VITE_API_BASE_URL`). It never calls SEC EDGAR directly.

Supported tickers: `AAPL`, `META`, `GOOGL`, `AMZN`, `NFLX`, `GS`.

## Tech stack

- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn/ui + Lucide icons
- TanStack Query for server state
- Axios for HTTP (shared client in `src/lib/axios.ts`)
- React Hook Form + Zod for filings filters
- React Router (single-page app route)

## Installation

```bash
cd frontend
npm install
```

Make sure the backend is installed and configured as well (see the root and [`backend/README.md`](../backend/README.md)).

## Environment configuration

```bash
cp .env.example .env
```

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Yes | Nest API origin (no `/api` suffix). Local default: `http://localhost:3000`. |

Example:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Restart `npm run dev` after changing env values (Vite reads them at startup).

## Running locally

1. Start the Nest backend on port 3000 (`cd backend && npm run start:dev`).
2. Start the UI:

```bash
npm run dev
```

Open http://localhost:5173.

## Build

```bash
npm run build
npm run preview
```

`build` type-checks and produces a production bundle in `dist/`. `preview` serves that bundle locally.

## Testing

```bash
npm test
npm run test:watch
```

Tests use Vitest and Testing Library.

## Linting

```bash
npm run lint
```

There is no Prettier format script in this package; use ESLint via `npm run lint`.

## Local URLs

| Service | URL |
| --- | --- |
| Frontend | http://localhost:5173 |
| Backend API (dependency) | http://localhost:3000 |
| Swagger (backend) | http://localhost:3000/docs |

## API documentation

API shapes and try-it-out live on the backend Swagger UI: [http://localhost:3000/docs](http://localhost:3000/docs) (backend must be running).
