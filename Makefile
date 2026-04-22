.PHONY: up down restart migrate build migration-generate migration-revert logs
name ?= InitialSchema
DC = docker compose --env-file back/.env

up:
	$(DC) up -d

down:
	$(DC) down

restart:
	$(DC) restart

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
