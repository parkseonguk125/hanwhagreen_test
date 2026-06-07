# Playwright E2E 테스트 (초보용)

## 1. 준비

```bash
docker compose up -d
npm install
npx playwright install
```

## 2. 테스트 실행

```bash
npm run test:e2e
```

## 3. 실패 시 리포트

```bash
npm run test:e2e:report
```

기본 접속 주소: `http://localhost:8081`

EC2에서 테스트할 때:

```bash
set PLAYWRIGHT_BASE_URL=http://13.209.17.85
set PLAYWRIGHT_SKIP_WEBSERVER=1
npm run test:e2e
```
