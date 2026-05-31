#!/bin/bash
# Ubuntu 22.04 EC2 — Docker + Docker Compose 플러그인 설치 (최초 1회)
set -euo pipefail

echo "=== Docker 설치 시작 ==="
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sudo sh
else
  echo "Docker가 이미 설치되어 있습니다."
fi

sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker "$USER" || true

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose 플러그인 확인 중..."
  docker compose version || sudo apt-get install -y docker-compose-plugin 2>/dev/null || true
fi

if ! command -v git >/dev/null 2>&1; then
  sudo apt-get update -y
  sudo apt-get install -y git
fi

echo ""
echo "=== 설치 완료 ==="
docker --version
docker compose version
echo ""
echo "※ 'docker' 권한 오류가 나면: exit 후 SSH 다시 접속하거나"
echo "   newgrp docker 를 실행한 뒤 배포 스크립트를 돌리세요."
