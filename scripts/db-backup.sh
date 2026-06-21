#!/bin/bash
# PostgreSQL 백업 (pg_dump → backups/*.sql)
# 실행: cd ~/hanwhagreen_test && ./scripts/db-backup.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

CONTAINER="hanwhagreen-db"
BACKUP_DIR="$ROOT/backups"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
OUT="$BACKUP_DIR/hanwhagreen_${TIMESTAMP}.sql"

mkdir -p "$BACKUP_DIR"

if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "ERROR: $CONTAINER 컨테이너가 실행 중이 아닙니다."
  echo "  docker compose ps 로 상태를 확인한 뒤 다시 시도하세요."
  exit 1
fi

echo "=== DB 백업 시작 ==="
echo "컨테이너: $CONTAINER"
echo "출력: $OUT"
echo ""

docker exec "$CONTAINER" pg_dump \
  -U hanwha \
  -d hanwhagreen \
  --clean \
  --if-exists \
  --no-owner \
  --no-acl \
  > "$OUT"

if [ ! -s "$OUT" ]; then
  echo "ERROR: 백업 파일이 비어 있습니다."
  rm -f "$OUT"
  exit 1
fi

echo "=== 백업 완료 ==="
ls -lh "$OUT"
echo ""
echo "WinSCP로 PC에 내려받아 두면 더 안전합니다."
