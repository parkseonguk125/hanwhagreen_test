#!/bin/bash
# 유지보수 모드 OFF
# 실행: ./scripts/security-maintenance-off.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

FLAG="$ROOT/nginx/flags/maintenance.on"
rm -f "$FLAG"
echo "maintenance.on 삭제"

docker compose restart web
echo "유지보수 모드 해제 완료"
