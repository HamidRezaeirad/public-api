# SEC EDGAR Filings Explorer

Read-only app for browsing SEC EDGAR filings for six supported companies: **AAPL**, **META**, **GOOGL**, **AMZN**, **NFLX**, and **GS**.

The React frontend talks only to the NestJS backend. The backend is the only service that calls SEC EDGAR.

More detail:

- Backend: [`backend/README.md`](backend/README.md)
- Frontend: [`frontend/README.md`](frontend/README.md)

## Tech stack

| Layer    | Technologies                                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------------------------------- |
| Backend  | NestJS 11, TypeScript, `@nestjs/config`, Axios (SEC client), class-validator, Swagger                                  |
| Frontend | React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Axios, React Hook Form, Zod, React Router, Lucide |

## Installation

1. Clone the repository.
2. Install dependencies for each app (there is no root `package.json`):

```bash
cd backend
npm install

cd ../frontend
npm install
```

Use a current Node.js LTS release (or compatible modern Node).

## Environment configuration

### Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`. At minimum, set a real contact email in `SEC_USER_AGENT` before making live SEC requests (SEC fair-access policy). See [`backend/.env.example`](backend/.env.example) and [`backend/README.md`](backend/README.md) for every variable.

### Frontend

```bash
cd frontend
cp .env.example .env
```

Default:

```env
VITE_API_BASE_URL=http://localhost:3000
```

## Running the project

Use two terminals.

**Terminal 1 — backend**

```bash
cd backend
npm run start:dev
```

**Terminal 2 — frontend**

```bash
cd frontend
npm run dev
```

CORS is configured for the Vite origin (`http://localhost:5173`).

## Build

```bash
cd backend
npm run build
npm run start:prod

cd ../frontend
npm run build
npm run preview
```

## Testing

```bash
cd backend
npm test
npm run test:e2e

cd ../frontend
npm test
```

## Linting

```bash
cd backend
npm run lint
npm run format

cd ../frontend
npm run lint
```

The frontend has an ESLint script only (no Prettier format script).

## Local URLs

| Service           | URL                                              |
| ----------------- | ------------------------------------------------ |
| Frontend          | http://localhost:5173                            |
| Backend           | http://localhost:3000                            |
| Health check      | http://localhost:3000/health                     |
| API (example)     | http://localhost:3000/api/companies/AAPL         |
| Filings (example) | http://localhost:3000/api/companies/AAPL/filings |
| Swagger UI        | http://localhost:3000/docs                       |
| OpenAPI JSON      | http://localhost:3000/docs-json                  |

## API documentation

With the backend running, open **Swagger UI** at [http://localhost:3000/docs](http://localhost:3000/docs).

You can try company and filings endpoints there. The machine-readable OpenAPI document is at `/docs-json`.
