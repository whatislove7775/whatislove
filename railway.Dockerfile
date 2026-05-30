FROM python:3.12-slim AS builder

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

WORKDIR /app

COPY apps/api/requirements.txt .
RUN uv venv /app/.venv && \
    uv pip install --python /app/.venv/bin/python -r requirements.txt

FROM python:3.12-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/.venv /app/.venv
COPY apps/api/ .

ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DJANGO_SETTINGS_MODULE=config.settings

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py create_admin && daphne -b 0.0.0.0 -p ${PORT:-8000} config.asgi:application"]
