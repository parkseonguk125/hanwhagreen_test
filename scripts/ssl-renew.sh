#!/bin/bash
# Let's Encrypt 인증서 갱신 + Nginx reload
# cron 예: 0 3,15 * * * /home/ubuntu/hanwhagreen_test/scripts/ssl-renew.sh >> /var/log/certbot-renew.log 2>&1
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$APP_DIR"

COMPOSE="docker compose -f docker-compose.yml -f docker-compose.ec2.yml -f docker-compose.ssl.yml"

if [ ! -f .env.ssl ]; then
  echo "오류: .env.ssl 없음. 먼저 ./scripts/ssl-init.sh 를 실행하세요."
  exit 1
fi

# shellcheck disable=SC1091
source .env.ssl

if [ ! -f nginx/ssl-active.conf ]; then
  echo "오류: nginx/ssl-active.conf 없음. ssl-init.sh 를 먼저 실행하세요."
  exit 1
fi

DRY_RUN=""
if [ "${1:-}" = "--dry-run" ]; then
  DRY_RUN="--dry-run"
  echo "=== 갱신 테스트 (dry-run) ==="
else
  echo "=== 인증서 갱신 시도 ==="
fi

$COMPOSE run --rm certbot renew $DRY_RUN

if [ -z "$DRY_RUN" ]; then
  echo "=== Nginx reload ==="
  $COMPOSE exec web nginx -s reload
  echo "=== 갱신 완료 ==="
else
  echo "=== dry-run 완료 (실제 갱신 없음) ==="
fi
