.PHONY: up down build logs shell-api migrate dev help

# ── Production ────────────────────────────────────────────────────
up:         ## Запустить всё (собрать если нужно)
	docker compose up -d --build

down:       ## Остановить всё
	docker compose down

build:      ## Пересобрать образы без кэша
	docker compose build --no-cache

logs:       ## Смотреть логи всех сервисов
	docker compose logs -f

logs-api:   ## Логи только Django
	docker compose logs -f api

logs-web:   ## Логи только Next.js
	docker compose logs -f web

migrate:    ## Применить миграции Django
	docker compose exec api python manage.py migrate

shell-api:  ## Bash внутри Django контейнера
	docker compose exec api bash

# ── Local dev (без Docker) ────────────────────────────────────────
dev-api:    ## Django локально через uv
	cd apps/api && \
	uv venv .venv && \
	uv pip install -r requirements.txt && \
	.venv/bin/python manage.py migrate && \
	.venv/bin/python manage.py runserver 8000

dev-web:    ## Next.js локально
	cd apps/web && npm install && npm run dev

help:       ## Список команд
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
