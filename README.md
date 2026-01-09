# Licensing Service (MVP)

This repository contains a licensing management service with a Node.js + TypeScript backend and a React + Vite frontend.

## What's included

- Backend: Express + TypeScript + Prisma (Postgres schema in `prisma/schema.prisma`)
- Frontend: Vite + React skeleton
- Docker Compose: `docker-compose.yml` with `db`, `backend` and `frontend` services
- Stripe webhook stub at `/api/webhooks/stripe`

## Local dev

1. Copy `.env.example` to `.env` and fill in secrets.

2. Start Postgres & services locally using the development compose file:

```bash
# using the dev compose file (bind-mounts + hot reload)
docker compose -f docker-compose.dev.yml up --build
```

Or use the Makefile targets:

```bash
# bring the dev environment up (db, backend, frontend)
make dev-up

# stop and remove dev containers
make dev-down

# run migrations against local docker db
make migrate-dev

# run backend integration tests (requires DATABASE_URL)
make test-integration
```

Backend dev server: http://localhost:4000
Frontend (Vite dev server): http://localhost:5173

To run migrations locally against the docker Postgres:

```bash
# from repo root
make migrate-dev
# or
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/licensing" cd backend && npx prisma migrate dev
```

Running tests:

- Backend unit tests:
```bash
cd backend
npm test
```

- Backend integration tests (requires DATABASE_URL pointing at a running Postgres):
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/licensing" npx vitest run src/__tests__/integration --reporter dot
```

- Frontend tests:
```bash
cd frontend
npm test
```

## Frontend updates (2026-01-09)

- Added ESLint configuration (`.eslintrc.cjs` and `eslint.config.cjs`) and a `lint` npm script.
- Fixed a browser runtime bug (replaced `process.env.VITE_API_BASE` with `import.meta.env.VITE_API_BASE`) that caused a blank page in development.
- Resolved lint warnings (removed unused imports/variables and simplified catch blocks).
- Ran frontend tests locally (Vitest) — all frontend tests pass.

## Next steps
- Implement real user/org creation and membership using Prisma
- Implement JWT auth and session handling
- Add license issuance and validation endpoints
- Wire Stripe integration and webhook handlers
- Build dashboard UI (signup/login/dashboard/docs)

Migration note:
- After schema changes run: `cd backend && npx prisma migrate dev --name add_apikey_fields` to apply DB migrations and `npx prisma generate` to refresh the client.
