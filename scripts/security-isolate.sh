#!/bin/bash
# web/api 격리 (S4) — DB는 증거·복원용으로 유지
# 실행: ./scripts/security-isolate.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== web, api 컨테이너 중지 ==="
docker compose stop web api
docker compose ps
echo ""
echo "복구: docker compose up -d"
