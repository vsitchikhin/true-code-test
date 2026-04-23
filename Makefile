.PHONY: up down restart reup migrate build migration-generate migration-revert logs api-gen seed
name ?= InitialSchema
DC = docker compose --env-file back/.env

up:
	$(DC) up -d

down:
	$(DC) down

restart:
	$(DC) restart

reup: down up

build:
	$(DC) build

migrate:
	$(DC) exec api npm run migration:run

migration-generate:
	$(DC) exec api npm run migration:generate -- src/infrastructure/persistence/migrations/$(name)

migration-revert:
	$(DC) exec api npm run migration:revert

logs:
	$(DC) logs -f

api-gen:
	npm run generate-api --prefix front

seed:
	$(DC) exec api npx ts-node -r tsconfig-paths/register src/scripts/seed.ts
