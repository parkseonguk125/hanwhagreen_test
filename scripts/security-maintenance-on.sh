#!/bin/bash
# 유지보수 모드 ON — nginx flags/maintenance.on 생성 후 web 재시작
# 실행: ./scripts/security-maintenance-on.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

FLAG="$ROOT/nginx/flags/maintenance.on"
mkdir -p "$ROOT/nginx/flags"
touch "$FLAG"
echo "maintenance.on 생성: $FLAG"

docker compose restart web
echo ""
echo "확인: curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8081/ || curl ... http://127.0.0.1/"
echo "복구: ./scripts/security-maintenance-off.sh"
