# HTTPS 적용 (Let's Encrypt + Docker) — 초보용

DuckDNS 도메인(`http://xxxx.duckdns.org`)에 **자물쇠(HTTPS)** 를 붙이는 단계입니다.

---

## 시작 전 체크리스트

| 항목 | 확인 |
|------|------|
| EC2 실행 중 | AWS 콘솔에서 **running** |
| DuckDNS IP | [duckdns.org](https://www.duckdns.org/) 에 **현재 EC2 퍼블릭 IP** 와 일치 |
| HTTP 접속 | `http://본인도메인.duckdns.org/` 정상 |
| AWS 보안 그룹 | **80(HTTP)** + **443(HTTPS)** 인바운드 개방 |
| PuTTY/SSH | EC2 접속 가능 |

### AWS 보안 그룹에 443 추가

1. AWS 콘솔 → **EC2** → **보안 그룹**
2. 인스턴스에 연결된 그룹 선택 → **인바운드 규칙 편집**
3. 규칙 추가:
   - 유형: **HTTPS**
   - 포트: **443**
   - 소스: **0.0.0.0/0** (실습용; 운영 시 제한 권장)
4. 저장

---

## 전체 순서 (한눈에)

```
① AWS 보안 그룹 443 개방
② PuTTY로 EC2 접속
③ git pull (최신 HTTPS 설정 파일 받기)
④ ssl-init.sh 실행 (도메인·이메일 입력)
⑤ 브라우저 https://도메인/ 확인
⑥ cron 자동 갱신 등록
```

---

## ① EC2 접속 (PuTTY)

1. PuTTY 실행 → Host Name: `ubuntu@EC2_퍼블릭_IP`
2. (또는 Session에 IP, SSH > Auth에 `.ppk` 키)
3. 접속 후:

```bash
cd ~/hanwhagreen_test
git pull origin main
```

> 저장소 경로가 다르면 본인 `APP_DIR` 로 이동하세요.

---

## ② 최초 HTTPS 설정 (1회)

```bash
chmod +x scripts/ssl-init.sh scripts/ssl-renew.sh
./scripts/ssl-init.sh
```

스크립트가 물어보는 값:

| 입력 | 예시 |
|------|------|
| DuckDNS 도메인 | `hanwhagreentest.duckdns.org` |
| 이메일 | 본인 Gmail 등 (만료 알림용) |

**스크립트가 하는 일:**

1. `.env.ssl` 에 도메인·이메일 저장
2. Nginx HTTP 설정으로 서비스 기동
3. Certbot으로 Let's Encrypt 인증서 발급
4. Nginx HTTPS 설정으로 전환 + reload

성공 메시지 예:

```
=== HTTPS 적용 완료 ===
브라우저에서 확인: https://hanwhagreentest.duckdns.org/
```

---

## ③ 브라우저 확인

주소창에 (**https** 포함):

```
https://본인도메인.duckdns.org/
```

| 확인 | 성공 |
|------|------|
| 자물쇠(🔒) 표시 | ✅ |
| `http://` 접속 시 `https://` 로 자동 이동 | ✅ |
| 홈·공지·온라인문의 동작 | ✅ |

---

## ④ 자동 갱신 (cron)

Let's Encrypt 인증서는 **90일**마다 갱신이 필요합니다. Certbot이 만료 전에 자동 갱신합니다.

```bash
crontab -e
```

아래 한 줄 추가 (경로는 본인 홈 디렉터리에 맞게):

```
0 3,15 * * * /home/ubuntu/hanwhagreen_test/scripts/ssl-renew.sh >> /var/log/certbot-renew.log 2>&1
```

갱신 테스트만 (실제 갱신 없음):

```bash
./scripts/ssl-renew.sh --dry-run
```

---

## 이후 배포 (코드 업데이트 시)

```bash
cd ~/hanwhagreen_test
git pull origin main
docker compose -f docker-compose.yml -f docker-compose.ec2.yml -f docker-compose.ssl.yml up -d --build
```

또는:

```bash
./scripts/ec2-deploy.sh
```

(`ssl-active.conf` 가 있으면 HTTPS compose 가 자동 포함됩니다.)

---

## 자주 묻는 것

**Q. 로컬 PC(`localhost:8081`)도 HTTPS 되나요?**  
A. 아니요. HTTPS 설정은 **EC2 배포 전용**입니다. 로컬은 기존처럼 HTTP 8081을 씁니다.

**Q. IP만으로 HTTPS 되나요?**  
A. Let's Encrypt는 **도메인**이 필요합니다. DuckDNS(7번) 완료 후 진행하세요.

**Q. 인증서 발급 실패**  
A. 아래 순서로 확인:
1. DuckDNS IP = EC2 퍼블릭 IP
2. 보안 그룹 80, 443 개방
3. `docker compose logs web` — Nginx 오류
4. `curl -I http://본인도메인/.well-known/acme-challenge/test` (404는 정상, 연결 거부는 방화벽 문제)

**Q. EC2 IP가 바뀌었어요**  
A. DuckDNS IP 먼저 업데이트 → `./scripts/ssl-renew.sh --dry-run` 으로 갱신 가능 여부 확인

---

## 관련 파일

| 파일 | 역할 |
|------|------|
| `docker-compose.ssl.yml` | 443 포트, certbot 볼륨 |
| `nginx/default.acme.conf.template` | 인증서 발급용 HTTP Nginx |
| `nginx/default.ssl.conf.template` | HTTPS + HTTP 리다이렉트 Nginx |
| `nginx/ssl-active.conf` | EC2에서 생성되는 실제 Nginx 설정 (Git 제외) |
| `scripts/ssl-init.sh` | 최초 발급 |
| `scripts/ssl-renew.sh` | 갱신 |
| `.env.ssl` | 도메인·이메일 (Git 제외) |

---

## 관련 문서

- [도메인_연결_안내.md](도메인_연결_안내.md) — 7번 DuckDNS
- [AWS_EC2_배포_안내.md](AWS_EC2_배포_안내.md) — 5~6번 EC2
- [WinSCP_PuTTY_배포_안내.md](WinSCP_PuTTY_배포_안내.md) — SSH 접속
