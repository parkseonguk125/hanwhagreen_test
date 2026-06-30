#!/bin/bash
# admin 비밀번호 변경 (S3)
# 실행: ./scripts/security-rotate-admin-password.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

read -r -s -p "새 admin 비밀번호: " NEW_PW
echo ""
read -r -s -p "비밀번호 확인: " NEW_PW2
echo ""

if [ "$NEW_PW" != "$NEW_PW2" ]; then
  echo "ERROR: 비밀번호가 일치하지 않습니다."
  exit 1
fi

if [ ${#NEW_PW} -lt 8 ]; then
  echo "ERROR: 8자 이상 입력하세요."
  exit 1
fi

docker compose exec -T -e ROTATE_PW="$NEW_PW" api node --input-type=module -e "
import bcrypt from 'bcryptjs';
import pg from 'pg';

const pw = process.env.ROTATE_PW;
const hash = await bcrypt.hash(pw, 10);
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query('UPDATE members SET mb_password_hash = \$1 WHERE mb_id = \$2', [hash, 'admin']);
await client.end();
console.log('admin 비밀번호가 변경되었습니다.');
" 

echo "docs/로그인_안내.md 의 임시 비밀번호 안내도 갱신하세요."
