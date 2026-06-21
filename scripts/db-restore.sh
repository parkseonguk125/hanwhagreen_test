#!/bin/bash
# PostgreSQL 복원 (backups/*.sql → DB)
# 실행: ./scripts/db-restore.sh backups/hanwhagreen_YYYYMMDD_HHMMSS.sql

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

CONTAINER="hanwhagreen-db"
SQL_FILE="${1:-}"

if [ -z "$SQL_FILE" ]; then
  echo "사용법: $0 backups/hanwhagreen_YYYYMMDD_HHMMSS.sql"
  exit 1
fi

if [ ! -f "$SQL_FILE" ]; then
  echo "ERROR: 파일을 찾을 수 없습니다: $SQL_FILE"
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "ERROR: $CONTAINER 컨테이너가 실행 중이 아닙니다."
  exit 1
fi

compose_files() {
  local files="-f docker-compose.yml"
  if [ -f docker-compose.ec2.yml ]; then
    files="$files -f docker-compose.ec2.yml"
  fi
  if [ -f nginx/ssl-active.conf ] && [ -f .env.ssl ]; then
    files="$files -f docker-compose.ssl.yml"
  fi
  echo "$files"
}

COMPOSE="$(compose_files)"

echo "=== DB 복원 ==="
echo "파일: $SQL_FILE"
echo "주의: 현재 DB 데이터가 백업 시점으로 덮어씌워집니다."
echo ""
read -r -p "계속하시겠습니까? (yes 입력): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "취소됨."
  exit 0
fi

echo ""
echo "[1/3] API 중지 (DB 연결 끊기)..."
docker compose $COMPOSE stop api

echo ""
echo "[2/3] SQL 복원 중..."
docker exec -i "$CONTAINER" psql -U hanwha -d hanwhagreen -v ON_ERROR_STOP=1 < "$SQL_FILE"

echo ""
echo "[3/3] API 재시작..."
docker compose $COMPOSE start api

echo ""
echo "=== 복원 완료 ==="
echo "확인:"
echo "  curl -s http://127.0.0.1/api/health"
echo "  curl -s http://127.0.0.1/api/notice"
