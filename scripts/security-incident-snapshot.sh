#!/bin/bash
# 침해사고 증거·상태 스냅샷
# 실행: ./scripts/security-incident-snapshot.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

STAMP="$(date +%Y%m%d_%H%M%S)"
OUT="$ROOT/backups/incident_${STAMP}"
mkdir -p "$OUT"

echo "=== incident snapshot -> $OUT ==="

{
  echo "=== Hanwhagreen incident snapshot ==="
  echo "시각: $(date -Iseconds 2>/dev/null || date)"
  echo "경로: $ROOT"
  echo ""
} | tee "$OUT/summary.txt"

docker compose ps > "$OUT/docker-ps.txt" 2>&1 || true
curl -s --max-time 8 http://127.0.0.1:8081/api/health > "$OUT/health.json" 2>&1 \
  || curl -s --max-time 8 http://127.0.0.1/api/health > "$OUT/health.json" 2>&1 \
  || echo "(health 실패)" > "$OUT/health.json"

docker compose logs api --tail 200 > "$OUT/api-logs.txt" 2>&1 || true
docker compose logs web --tail 100 > "$OUT/web-logs.txt" 2>&1 || true

if docker ps --format '{{.Names}}' | grep -qx hanwhagreen-db; then
  docker exec hanwhagreen-db psql -U hanwha -d hanwhagreen -t -c \
    "SELECT 'member_sessions', COUNT(*) FROM member_sessions;" >> "$OUT/db-counts.txt" 2>&1
  docker exec hanwhagreen-db psql -U hanwha -d hanwhagreen -t -c \
    "SELECT 'notice_posts', COUNT(*) FROM notice_posts;" >> "$OUT/db-counts.txt" 2>&1
fi

if [ -f "$ROOT/scripts/ec2-pre-check.sh" ]; then
  bash "$ROOT/scripts/ec2-pre-check.sh" > "$OUT/pre-check.txt" 2>&1 || true
fi

echo ""
echo "저장 완료: $OUT"
ls -la "$OUT"
