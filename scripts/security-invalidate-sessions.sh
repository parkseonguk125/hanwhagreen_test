#!/bin/bash
# 전체 회원 세션 무효화 (S3)
# 실행: ./scripts/security-invalidate-sessions.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! docker ps --format '{{.Names}}' | grep -qx hanwhagreen-db; then
  echo "ERROR: hanwhagreen-db 컨테이너가 실행 중이 아닙니다."
  exit 1
fi

BEFORE=$(docker exec hanwhagreen-db psql -U hanwha -d hanwhagreen -t -c \
  "SELECT COUNT(*) FROM member_sessions;" | tr -d ' ')
echo "삭제 전 세션 수: $BEFORE"

docker exec hanwhagreen-db psql -U hanwha -d hanwhagreen -c "TRUNCATE member_sessions;"

AFTER=$(docker exec hanwhagreen-db psql -U hanwha -d hanwhagreen -t -c \
  "SELECT COUNT(*) FROM member_sessions;" | tr -d ' ')
echo "삭제 후 세션 수: $AFTER"
echo "모든 관리자·회원 로그인이 해제되었습니다."
