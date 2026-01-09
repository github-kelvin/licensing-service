# Development convenience targets

DB_URL=postgresql://postgres:postgres@localhost:5432/licensing

.PHONY: dev-up dev-down migrate-dev test-integration

dev-up:
	docker compose -f docker-compose.dev.yml up --build -d

dev-down:
	docker compose -f docker-compose.dev.yml down

migrate-dev:
	@echo "Running migrations against $(DB_URL)"
	cd backend && DATABASE_URL=$(DB_URL) npx prisma migrate dev

test-integration:
	@echo "Running backend integration tests (requires DB at $(DB_URL))"
	cd backend && DATABASE_URL=$(DB_URL) npx vitest run src/__tests__/integration --reporter dot
