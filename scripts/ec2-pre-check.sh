#!/bin/bash
# 0단계 — EC2 복구·백업 연습 전 현재 상태 기록
# 실행: cd ~/hanwhagreen_test && ./scripts/ec2-pre-check.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

REPORT_DIR="$ROOT/backups"
REPORT="$REPORT_DIR/pre-check_latest.txt"
mkdir -p "$REPORT_DIR"

run() {
  echo "$@"
  echo "$@"
}

{
  run "=== Hanwhagreen EC2 사전 점검 ==="
  run "시각: $(date -Iseconds 2>/dev/null || date)"
  run "경로: $ROOT"
  run ""

  run "--- Docker 컨테이너 ---"
  docker compose ps 2>&1 || docker ps --filter "name=hanwhagreen" 2>&1
  run ""

  run "--- API health ---"
  curl -s --max-time 8 http://127.0.0.1/api/health 2>&1 || echo "(health 요청 실패)"
  run ""

  run "--- 공지 API (앞 300자) ---"
  curl -s --max-time 8 http://127.0.0.1/api/notice 2>&1 | head -c 300 || echo "(notice 요청 실패)"
  run ""
  run ""

  if docker ps --format '{{.Names}}' | grep -qx hanwhagreen-db; then
    run "--- DB 행 개수 ---"
    docker exec hanwhagreen-db psql -U hanwha -d hanwhagreen -t -c "SELECT 'notice_posts', COUNT(*) FROM notice_posts;" 2>&1
    docker exec hanwhagreen-db psql -U hanwha -d hanwhagreen -t -c "SELECT 'qa_posts', COUNT(*) FROM qa_posts;" 2>&1
    docker exec hanwhagreen-db psql -U hanwha -d hanwhagreen -t -c "SELECT 'members', COUNT(*) FROM members;" 2>&1
    run ""
  else
    run "--- DB 컨테이너(hanwhagreen-db)가 실행 중이 아닙니다 ---"
    run ""
  fi

  run "--- Git 제외 파일 (복구 시 수동 복원 필요) ---"
  if [ -f .env.ssl ]; then
    run "  [있음] .env.ssl"
  else
    run "  [없음] .env.ssl (HTTP만 사용 중이면 OK)"
  fi
  if [ -f nginx/ssl-active.conf ]; then
    run "  [있음] nginx/ssl-active.conf"
  else
    run "  [없음] nginx/ssl-active.conf (HTTP만 사용 중이면 OK)"
  fi
  if [ -f .env ]; then
    run "  [있음] .env (알림 설정)"
  else
    run "  [없음] .env"
  fi
  run ""

  run "--- Docker 볼륨 ---"
  docker volume ls --filter name=postgres_data 2>&1 || true
  docker volume ls --filter name=qa_uploads 2>&1 || true
  run ""

  if docker ps --format '{{.Names}}' | grep -qx hanwhagreen-db; then
    run "--- 보안: 활성 세션 ---"
    docker exec hanwhagreen-db psql -U hanwha -d hanwhagreen -t -c \
      "SELECT 'member_sessions', COUNT(*) FROM member_sessions;" 2>&1
    run ""
  fi

  run "--- 보안: 유지보수 모드 ---"
  if [ -f nginx/flags/maintenance.on ]; then
    run "  [ON] nginx/flags/maintenance.on"
  else
    run "  [OFF] 유지보수 모드 아님"
  fi
  run ""

  run "--- 보안: 호스트 도구 (EC2) ---"
  if command -v ufw >/dev/null 2>&1; then
    ufw status 2>&1 | head -5 || run "  ufw 상태 조회 실패"
  else
    run "  ufw: 미설치"
  fi
  if command -v fail2ban-client >/dev/null 2>&1; then
    fail2ban-client status 2>&1 | head -5 || run "  fail2ban 미동작"
  else
    run "  fail2ban: 미설치"
  fi
  run ""

  run "=== 점검 완료 ==="
  run "이 파일을 복구 후 비교하세요: $REPORT"
} | tee "$REPORT"

echo ""
echo "저장됨: $REPORT"
