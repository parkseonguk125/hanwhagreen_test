#!/bin/bash
# EC2 최초 1회 — Let's Encrypt 인증서 발급 + HTTPS Nginx 적용
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$APP_DIR"

COMPOSE="docker compose -f docker-compose.yml -f docker-compose.ec2.yml -f docker-compose.ssl.yml"

if [ -f .env.ssl ]; then
  # shellcheck disable=SC1091
  source .env.ssl
fi

DOMAIN="${SSL_DOMAIN:-}"
EMAIL="${SSL_EMAIL:-}"

if [ -z "$DOMAIN" ]; then
  read -r -p "DuckDNS 도메인 (예: hanwhagreentest.duckdns.org): " DOMAIN
fi
if [ -z "$EMAIL" ]; then
  read -r -p "Let's Encrypt 알림용 이메일: " EMAIL
fi

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
  echo "오류: SSL_DOMAIN, SSL_EMAIL 이 필요합니다."
  exit 1
fi

escape_sed() {
  printf '%s' "$1" | sed -e 's/[\/&]/\\&/g'
}

DOMAIN_ESCAPED="$(escape_sed "$DOMAIN")"

echo "=== SSL 설정 저장 (.env.ssl) ==="
cat > .env.ssl <<EOF
SSL_DOMAIN=$DOMAIN
SSL_EMAIL=$EMAIL
EOF

echo "=== Nginx ACME 설정 생성 (HTTP, 인증서 발급용) ==="
sed "s/__SSL_DOMAIN__/${DOMAIN_ESCAPED}/g" nginx/default.acme.conf.template > nginx/ssl-active.conf

echo "=== Docker 서비스 기동 (HTTP) ==="
$COMPOSE up -d --build

echo "=== Let's Encrypt 인증서 발급 ==="
$COMPOSE run --rm certbot certonly \
  --webroot \
  -w /var/www/certbot \
  -d "$DOMAIN" \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  --non-interactive

echo "=== Nginx HTTPS 설정 적용 ==="
sed "s/__SSL_DOMAIN__/${DOMAIN_ESCAPED}/g" nginx/default.ssl.conf.template > nginx/ssl-active.conf
$COMPOSE exec web nginx -s reload

echo ""
echo "=== HTTPS 적용 완료 ==="
echo "브라우저에서 확인: https://${DOMAIN}/"
echo "자동 갱신 등록: crontab -e 후 아래 한 줄 추가"
echo "0 3,15 * * * $APP_DIR/scripts/ssl-renew.sh >> /var/log/certbot-renew.log 2>&1"
