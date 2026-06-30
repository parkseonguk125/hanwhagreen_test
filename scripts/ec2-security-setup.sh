#!/bin/bash
# EC2 1회 하드닝 — UFW + fail2ban (마지막 단계에서만 실행)
# 실행: ./scripts/ec2-security-setup.sh

set -euo pipefail

if [ "$(uname -s)" != "Linux" ]; then
  echo "이 스크립트는 EC2(Ubuntu)에서만 실행하세요."
  exit 1
fi

echo "=== UFW 기본 규칙 ==="
if command -v ufw >/dev/null 2>&1; then
  sudo ufw default deny incoming || true
  sudo ufw default allow outgoing || true
  sudo ufw allow 22/tcp comment 'SSH' || true
  sudo ufw allow 80/tcp comment 'HTTP' || true
  sudo ufw allow 443/tcp comment 'HTTPS' || true
  echo "y" | sudo ufw enable || sudo ufw status
else
  echo "ufw 미설치 — sudo apt install ufw"
fi

echo ""
echo "=== fail2ban ==="
if ! command -v fail2ban-client >/dev/null 2>&1; then
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y fail2ban
fi

sudo tee /etc/fail2ban/jail.d/hanwhagreen.local >/dev/null <<'EOF'
[sshd]
enabled = true
maxretry = 5
bantime = 3600

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 5
bantime = 3600
EOF

sudo systemctl enable fail2ban
sudo systemctl restart fail2ban
sudo fail2ban-client status || true

echo ""
echo "=== 완료 ==="
echo "SSH 세션이 유지되는지 확인하세요."
echo "보안 그룹 SSH(22)를 본인 IP로 제한하는 것을 권장합니다."
