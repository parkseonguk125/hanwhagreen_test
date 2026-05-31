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

echo "=== Docker 빌드 및 실행 (EC2: 80번 포트) ==="
docker compose -f docker-compose.yml -f docker-compose.ec2.yml up -d --build

echo ""
echo "=== 컨테이너 상태 ==="
docker compose ps

PUBLIC_IP=""
if command -v curl >/dev/null 2>&1; then
  PUBLIC_IP=$(curl -s --max-time 3 http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || true)
fi

echo ""
echo "=== 배포 완료 ==="
if [ -n "$PUBLIC_IP" ]; then
  echo "브라우저에서 접속: http://${PUBLIC_IP}/"
else
  echo "브라우저에서 접속: http://(EC2 퍼블릭 IP)/"
fi
echo "관리자 로그인: /bbs/login.php (admin / green1234 — 배포 후 비밀번호 변경 권장)"
