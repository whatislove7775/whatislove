#!/bin/bash
# ──────────────────────────────────────────────────────────────────
# fix-ssl.sh  — очищает битые сертификаты и перевыпускает чистый
# Запускать из папки ~/psiho:  sudo ./fix-ssl.sh
# ──────────────────────────────────────────────────────────────────
set -e

DOMAIN="aprosop.ru"
COMPOSE="docker compose"
$COMPOSE version &>/dev/null || COMPOSE="docker-compose"

echo ""
echo "==> Шаг 1: Полная очистка volume certbot-conf ..."
$COMPOSE run --rm --entrypoint "sh -c '\
  rm -rf /etc/letsencrypt/live && \
  rm -rf /etc/letsencrypt/archive && \
  rm -rf /etc/letsencrypt/renewal && \
  rm -rf /etc/letsencrypt/renewal-hooks && \
  echo CLEAN_OK'" certbot
echo "    Volume очищен."

echo ""
echo "==> Шаг 2: Кладём dummy-сертификат (чтобы nginx стартовал) ..."
$COMPOSE run --rm --entrypoint "sh -c '\
  mkdir -p /etc/letsencrypt/live/${DOMAIN} && \
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout /etc/letsencrypt/live/${DOMAIN}/privkey.pem \
    -out    /etc/letsencrypt/live/${DOMAIN}/fullchain.pem \
    -subj \"/CN=localhost\" \
  && echo DUMMY_OK'" certbot
echo "    Dummy-сертификат создан."

echo ""
echo "==> Шаг 3: (Пере)запускаем nginx ..."
$COMPOSE up --force-recreate -d nginx
echo "    Ждём 5 с..."
sleep 5

echo ""
echo "==> Шаг 4: Удаляем dummy и запрашиваем настоящий сертификат ..."
# Убираем dummy, чтобы certbot не нашёл существующих файлов
$COMPOSE run --rm --entrypoint "sh -c '\
  rm -rf /etc/letsencrypt/live/${DOMAIN} && \
  rm -rf /etc/letsencrypt/archive/${DOMAIN} && \
  rm -rf /etc/letsencrypt/renewal/${DOMAIN}.conf && \
  echo REMOVED_OK'" certbot

$COMPOSE run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    --domain ${DOMAIN} \
    --domain www.${DOMAIN} \
    --register-unsafely-without-email \
    --agree-tos \
    --non-interactive \
    --rsa-key-size 4096 \
    --force-renewal" certbot
echo "    Сертификат получен!"

echo ""
echo "==> Шаг 5: Перезагружаем nginx с настоящим сертификатом ..."
$COMPOSE exec nginx nginx -s reload
echo "    nginx перезагружен."

echo ""
echo "==> Шаг 6: Проверяем пути сертификата ..."
$COMPOSE run --rm --entrypoint "sh -c '\
  echo --- live/ --- && ls -la /etc/letsencrypt/live/ && \
  echo --- live/${DOMAIN}/ --- && ls -la /etc/letsencrypt/live/${DOMAIN}/ && \
  echo --- renewal/ --- && ls /etc/letsencrypt/renewal/'" certbot

echo ""
echo "==> Шаг 7: Поднимаем certbot в режиме авто-обновления ..."
$COMPOSE up -d certbot

echo ""
echo "================================================"
echo "  Готово! Сайт должен открываться по HTTPS."
echo ""
echo "  Проверить:  curl -I https://aprosop.ru"
echo "================================================"
