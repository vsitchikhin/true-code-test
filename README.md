# Тестовое задание True Code

## Быстрый старт

### 1. Подготовка окружения

В проекте используются раздельные конфигурации для бэкенда и фронтенда.

**Backend:**
Перейдите в директорию `back/`, создайте файл `.env` и скопируйте в него содержимое `.env.back.example`:

```bash
cp back/.env.back.example back/.env
```

### Запуск

```bash
cp front/.env.front.example front/.env
```

### 2. Запуск проекта

Для запуска всей инфраструктуры (БД, API, Frontend) используйте Docker:

```bash
# Сборка образов
make build

# Запуск контейнеров в фоновом режиме
make up
```

### 3. Инициализация базы данных

После того как контейнеры запущены, необходимо выполнить миграции и (опционально) наполнить базу тестовыми данными. Чтобы запустить проект, нужно выполнить команды:

```bash
# Применение миграций
make migrate

# Наполнение тестовыми данными (сиды)
make seed
```

## Доступ к сервисам

По умолчанию проект доступен по следующим адресам:

- **Frontend**: [http://localhost:5173](http://localhost:5173) (порт настраивается через `FRONTEND_PORT` в `.env`)
- **Backend API**: [http://localhost:3000/api](http://localhost:3000/api)
- **Swagger Documentation**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## Основные команды (Makefile)

- `make build` — Сборка Docker образов.
- `make up` — Запуск контейнеров.
- `make down` — Остановка и удаление контейнеров.
- `make reup` — Перезапуск с пересозданием контейнеров (полезно при изменении `.env`).
- `make migrate` — Выполнение миграций БД внутри контейнера.
- `make seed` — Запуск сидов для наполнения БД.
- `make logs` — Просмотр логов всех сервисов.
- `make api-gen` — Генерация TypeScript клиента для фронтенда на основе Swagger.

## Тестирование

### Backend

- Юнит-тесты: `npm run test` (в папке `back`)
- E2E-тесты: `npm run test:e2e` (в папке `back`)

### Frontend

- Юнит-тесты: `npm run test` (в папке `front`)
- Playwright E2E: `npm run test:e2e` (в папке `front`)
