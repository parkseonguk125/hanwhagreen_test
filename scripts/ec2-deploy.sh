#!/bin/bash
# EC2에서 프로젝트 clone/pull 후 Docker 실행
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/parkseonguk125/hanwhagreen_test.git}"
APP_DIR="${APP_DIR:-$HOME/hanwhagreen_test}"

echo "=== 저장소 준비: $APP_DIR ==="
if [ ! -d "$APP_DIR/.git" ]; then
  git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"
git pull origin main

COMPOSE_FILES="-f docker-compose.yml -f docker-compose.ec2.yml"
if [ -f nginx/ssl-active.conf ] && [ -f .env.ssl ]; then
  COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.ssl.yml"
  echo "=== HTTPS 설정 감지 — SSL compose 포함 ==="
fi

echo "=== Docker 빌드 및 실행 (EC2: 80번 포트) ==="
if [ ! -f .env ]; then
  echo ""
  echo "[경고] .env 파일이 없습니다."
  echo "  WinSCP로 .env 를 업로드하거나 .env.ec2.example 을 참고해 생성하세요."
  echo "  출결서비스: ATTENDANCE_APP_API_KEY, VITE_NAVER_MAP_CLIENT_ID 필수"
  echo ""
elif ! grep -q '^ATTENDANCE_APP_API_KEY=.\+' .env 2>/dev/null; then
  echo ""
  echo "[경고] .env 에 ATTENDANCE_APP_API_KEY 가 비어 있습니다 (출결 앱 API 거부됨)."
  echo ""
fi

docker compose $COMPOSE_FILES up -d --build

echo ""
echo "=== 컨테이너 상태 ==="
docker compose ps

PUBLIC_IP=""
if command -v curl >/dev/null 2>&1; then
  PUBLIC_IP=$(curl -s --max-time 3 http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || true)
fi

echo ""
echo "=== 배포 완료 ==="
if [ -f .env.ssl ]; then
  # shellcheck disable=SC1091
  source .env.ssl
  if [ -n "${SSL_DOMAIN:-}" ]; then
    echo "브라우저에서 접속: https://${SSL_DOMAIN}/"
  fi
fi
if [ -n "$PUBLIC_IP" ]; then
  echo "HTTP (IP): http://${PUBLIC_IP}/"
else
  echo "HTTP (IP): http://(EC2 퍼블릭 IP)/"
fi
echo "관리자 로그인: /bbs/login.php (admin / green1234 — 배포 후 비밀번호 변경 권장)"
echo "출결서비스: /bbs/board.php?bo_table=attendance"
if curl -sf http://127.0.0.1/api/health >/dev/null 2>&1; then
  echo "API health: OK"
else
  echo "[참고] API health 확인 실패 — docker compose logs api"
fi
