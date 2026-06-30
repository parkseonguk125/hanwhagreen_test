# 모의해킹 — EC2 하드닝 및 조치 (마지막 단계)

> **로컬 S1~S4 연습과 E2E가 모두 통과한 뒤에만** 이 문서를 따르세요.

---

## 적용 전 체크리스트

- [ ] 로컬에서 `security-*` 스크립트 동작 확인
- [ ] `db-backup.sh`로 최신 `.sql` PC 보관
- [ ] `ec2-pre-check.sh` 사전 실행·`pre-check_latest.txt` 저장
- [ ] PuTTY **현재 세션 유지** (UFW 적용 시 SSH 끊김 방지)
- [ ] 비피크 시간대 선택

---

## 1. 코드 배포 (git pull + rebuild)

```bash
cd ~/hanwhagreen_test
git pull origin main
./scripts/ec2-deploy.sh
```

짧은 재시작(수 초~수십 초)이 발생할 수 있습니다.  
배포 후 로그인·공지 목록이 정상인지 확인하세요.

`.env`에 보안 관련 변수 추가 (없으면 기본값 사용):

```env
SECURITY_LOGIN_MAX=10
SECURITY_LOGIN_WINDOW_MS=900000
SECURITY_NOTIFY_MIN_SEVERITY=2
ADMIN_NOTIFY_ENABLED=1
NOTIFY_ENV_LABEL=ec2
```

---

## 2. EC2 하드닝 (1회)

```bash
cd ~/hanwhagreen_test
chmod +x scripts/ec2-security-setup.sh
./scripts/ec2-security-setup.sh
```

설치 내용:

- **UFW** — 22, 80, 443 허용, 나머지 deny
- **fail2ban** — sshd, nginx-limit-req jail

### SSH 끊김 시

AWS 콘솔 → EC2 → **연결** → EC2 Instance Connect 또는 보안 그룹에서 22번 임시 개방.

---

## 3. AWS 보안 그룹 (권장)

[AWS_EC2_배포_안내.md](AWS_EC2_배포_안내.md) 보안 그룹:

| 규칙 | 권장 |
|------|------|
| SSH 22 | **본인 공인 IP /32** 만 (전체 0.0.0.0/0 지양) |
| HTTP 80 | 0.0.0.0/0 |
| HTTPS 443 | 0.0.0.0/0 |

변경 후 PuTTY로 재접속 테스트.

---

## 4. EC2에서 S1/S2 연습

[모의해킹_연습_S1_S2_로컬.md](모의해킹_연습_S1_S2_로컬.md)와 동일 절차.  
차이: IP 차단은 `./scripts/security-block-ip.sh <IP>` 사용.

```bash
./scripts/security-incident-snapshot.sh
# (다른 PC에서) curl 반복 로그인 실패 유발 후
./scripts/security-block-ip.sh <공격IP>
./scripts/security-unblock-ip.sh <공격IP>   # 복구 시
```

---

## 5. EC2에서 S3 연습 (선택, 사전 공지)

[모의해킹_연습_S3_S4_로컬.md](모의해킹_연습_S3_S4_로컬.md) — 유지보수·세션·비밀번호·백업.

---

## 6. S4 — EC2 재해 복구

[서버_삭제_복구_연습_안내.md](서버_삭제_복구_연습_안내.md) 2-B / 2-C 와 연계.

---

## 관련 스크립트

| 파일 | 용도 |
|------|------|
| `scripts/ec2-security-setup.sh` | UFW + fail2ban |
| `scripts/security-block-ip.sh` | UFW deny |
| `scripts/ec2-pre-check.sh` | 사전·사후 점검 (보안 항목 포함) |
| `scripts/ec2-deploy.sh` | 배포 |
