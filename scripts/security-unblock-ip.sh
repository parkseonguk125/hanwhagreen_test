#!/bin/bash
# IP 차단 해제
# 사용: ./scripts/security-unblock-ip.sh 203.0.113.10

set -euo pipefail

IP="${1:-}"
if [ -z "$IP" ]; then
  echo "사용법: $0 <IP>"
  exit 1
fi

if command -v ufw >/dev/null 2>&1 && [ "$(uname -s)" = "Linux" ]; then
  echo "UFW allow from $IP (deny 규칙은 numbered delete로 수동 제거할 수 있음)"
  sudo ufw delete deny from "$IP" 2>/dev/null || sudo ufw status numbered
else
  ROOT="$(cd "$(dirname "$0")/.." && pwd)"
  echo "$(date -Iseconds 2>/dev/null || date) UNBLOCK $IP" >> "$ROOT/backups/blocked-ips.log"
  echo "[시뮬레이션] 차단 해제 기록: $IP"
fi
