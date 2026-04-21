.PHONY: up down restart migrate build

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

build:
	docker compose build

migrate:
	docker compose exec api npm run migration:run

logs:
	docker compose logs -f
