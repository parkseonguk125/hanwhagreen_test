#!/bin/bash
# IP 차단 (EC2 UFW) — 로컬에서는 시뮬레이션만
# 사용: ./scripts/security-block-ip.sh 203.0.113.10

set -euo pipefail

IP="${1:-}"
if [ -z "$IP" ]; then
  echo "사용법: $0 <IP>"
  exit 1
fi

if command -v ufw >/dev/null 2>&1 && [ "$(uname -s)" = "Linux" ]; then
  echo "UFW deny from $IP"
  sudo ufw deny from "$IP" comment "security-incident"
  sudo ufw status numbered | head -20
else
  echo "[시뮬레이션] UFW 없음 — 차단 대상 IP 기록: $IP"
  ROOT="$(cd "$(dirname "$0")/.." && pwd)"
  echo "$(date -Iseconds 2>/dev/null || date) BLOCK $IP" >> "$ROOT/backups/blocked-ips.log"
fi
