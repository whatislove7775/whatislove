#!/bin/bash
# ──────────────────────────────────────────────────────────────────
# init-letsencrypt.sh
# First-time SSL certificate setup for aprosop.ru
#
# Usage:
#   chmod +x init-letsencrypt.sh
#   sudo ./init-letsencrypt.sh
#
# What it does:
#   1. Creates a temporary self-signed cert so nginx can start
#   2. Starts nginx (HTTP + HTTPS with dummy cert)
#   3. Runs certbot to obtain real Let's Encrypt certificate
#   4. Reloads nginx with the real certificate
#
# After this script completes, the certbot container handles
# automatic renewal (every 12h check, certs renewed at 60 days).
# ──────────────────────────────────────────────────────────────────

set -e

DOMAINS=(aprosop.ru www.aprosop.ru)
EMAIL=""            # recommended: your email for expiry notices
STAGING=0           # set to 1 to test against staging (no rate limits)
RSA_KEY_SIZE=4096
COMPOSE="docker compose"

# Check if docker compose works
if ! $COMPOSE version &>/dev/null; then
  COMPOSE="docker-compose"
  if ! $COMPOSE version &>/dev/null; then
    echo "ERROR: docker compose is not installed."
    exit 1
  fi
fi

echo "==> Domains: ${DOMAINS[*]}"

# ── Step 1: Create dummy certificate ──────────────────────────────
echo ""
echo "==> Creating temporary self-signed certificate..."

$COMPOSE run --rm --entrypoint "\
  sh -c 'mkdir -p /etc/letsencrypt/live/aprosop.ru && \
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout /etc/letsencrypt/live/aprosop.ru/privkey.pem \
    -out /etc/letsencrypt/live/aprosop.ru/fullchain.pem \
    -subj \"/CN=localhost\"'" certbot

echo "    Done."

# ── Step 2: Start nginx ──────────────────────────────────────────
echo ""
echo "==> Starting nginx..."
$COMPOSE up --force-recreate -d nginx
echo "    Waiting 5s for nginx to start..."
sleep 5

# ── Step 3: Delete dummy certificate ──────────────────────────────
echo ""
echo "==> Removing temporary certificate..."
$COMPOSE run --rm --entrypoint "\
  rm -rf /etc/letsencrypt/live/aprosop.ru && \
  rm -rf /etc/letsencrypt/archive/aprosop.ru && \
  rm -rf /etc/letsencrypt/renewal/aprosop.ru.conf" certbot
echo "    Done."

# ── Step 4: Request real certificate ──────────────────────────────
echo ""
echo "==> Requesting Let's Encrypt certificate..."

# Build domain arguments
domain_args=""
for domain in "${DOMAINS[@]}"; do
  domain_args="$domain_args -d $domain"
done

# Email or unsafe mode
email_arg="--register-unsafely-without-email"
if [ -n "$EMAIL" ]; then
  email_arg="--email $EMAIL --no-eff-email"
fi

# Staging flag
staging_arg=""
if [ "$STAGING" -ne 0 ]; then
  staging_arg="--staging"
fi

$COMPOSE run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $staging_arg \
    $email_arg \
    $domain_args \
    --rsa-key-size $RSA_KEY_SIZE \
    --agree-tos \
    --force-renewal" certbot

echo "    Certificate obtained!"

# ── Step 5: Reload nginx with real certificate ────────────────────
echo ""
echo "==> Reloading nginx with real certificate..."
$COMPOSE exec nginx nginx -s reload
echo "    Done."

# ── Step 6: Start remaining services ─────────────────────────────
echo ""
echo "==> Starting certbot renewal service..."
$COMPOSE up -d certbot

echo ""
echo "=============================================="
echo "  SSL setup complete!"
echo ""
echo "  https://aprosop.ru     — ready"
echo "  https://www.aprosop.ru — ready"
echo ""
echo "  Auto-renewal: certbot checks every 12h"
echo "  nginx reloads certs every 6h"
echo "=============================================="
