# 4단계 — DB 복구 (1~3단계 완료 후)

1~3단계(오류 발생, 카카오, 로그 분석)가 끝난 **뒤에만** 실행하세요.

---

## 실행

- **`로컬_DB오류_복구.bat`** 더블클릭  

또는:

```powershell
npm run local:db-fix
```

---

## 확인

- `docker compose ps` — db, api 모두 Up (healthy)
- http://localhost:8081/api/health — `{"status":"ok",...}`
- 로그인 — admin / green1234 성공
