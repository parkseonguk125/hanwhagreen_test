# 출결서비스 AWS 배포 준비 (PC에서 실행)
# Usage:
#   .\scripts\prepare-aws-deploy.ps1
#   .\scripts\prepare-aws-deploy.ps1 -Domain "hanwhagreentest.duckdns.org" -BuildApk

param(
    [string]$Domain = "",
    [switch]$BuildApk,
    [switch]$SkipApk,
    [switch]$SkipGitCheck
)

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
$EnvFile = Join-Path $Root ".env"
$UploadEnv = Join-Path $Root "ec2.env.upload"
$BuildScript = Join-Path $Root "mobile\scripts\build-android-release.ps1"

function Read-EnvValue([string]$Name) {
    if (-not (Test-Path $EnvFile)) { return "" }
    $content = Get-Content $EnvFile -Raw -Encoding UTF8
    if ($content -match "(?m)^${Name}=(.+)$") {
        return $Matches[1].Trim()
    }
    return ""
}

Write-Host ""
Write-Host "=== 출결서비스 AWS 배포 준비 ===" -ForegroundColor Cyan
Write-Host ""

if (-not $SkipGitCheck) {
    Push-Location $Root
    $status = git status --porcelain 2>$null
    if ($LASTEXITCODE -eq 0 -and $status) {
        Write-Host "[주의] 커밋되지 않은 변경이 있습니다." -ForegroundColor Yellow
        Write-Host "       EC2는 GitHub main 기준으로 배포됩니다." -ForegroundColor Yellow
        Write-Host "       git add / commit / push 후 EC2에서 git pull 하세요." -ForegroundColor Yellow
        Write-Host ""
        git status -sb
        Write-Host ""
    } else {
        Write-Host "[OK] Git 작업 트리 깨끗함 (또는 git 없음)" -ForegroundColor Green
    }
    Pop-Location
}

if (-not $Domain) {
    $defaultDomain = "hanwhagreentest.duckdns.org"
    $inputDomain = Read-Host "DuckDNS 도메인 입력 (Enter=$defaultDomain)"
    if ([string]::IsNullOrWhiteSpace($inputDomain)) {
        $Domain = $defaultDomain
    } else {
        $Domain = $inputDomain.Trim().TrimEnd("/")
    }
}

$Domain = $Domain -replace "^https?://", ""
$HttpsBase = "https://$Domain"
$ApiBaseUrl = "$HttpsBase/api"

Write-Host ""
Write-Host "도메인: $HttpsBase" -ForegroundColor White
Write-Host "API:    $ApiBaseUrl" -ForegroundColor White
Write-Host ""

$apiKey = Read-EnvValue "ATTENDANCE_APP_API_KEY"
$viteNaver = Read-EnvValue "VITE_NAVER_MAP_CLIENT_ID"
$kakaoKey = Read-EnvValue "KAKAO_REST_API_KEY"
$kakaoToken = Read-EnvValue "KAKAO_REFRESH_TOKEN"
$kakaoSecret = Read-EnvValue "KAKAO_CLIENT_SECRET"

$missing = @()
if (-not $apiKey) { $missing += "ATTENDANCE_APP_API_KEY" }
if (-not $viteNaver) { $missing += "VITE_NAVER_MAP_CLIENT_ID" }

if ($missing.Count -gt 0) {
    Write-Host "[경고] 로컬 .env 에 없는 항목: $($missing -join ', ')" -ForegroundColor Yellow
    Write-Host "       EC2 .env 업로드 전에 값을 채워 주세요." -ForegroundColor Yellow
    Write-Host ""
}

$ec2Env = @"
# EC2 업로드용 — WinSCP로 ~/hanwhagreen_test/.env 에 복사
# 생성: $(Get-Date -Format "yyyy-MM-dd HH:mm")

ADMIN_NOTIFY_ENABLED=1
NOTIFY_PROVIDER=kakao
NOTIFY_ENV_LABEL=ec2
NOTIFY_LINK_URL=$HttpsBase/

KAKAO_REST_API_KEY=$kakaoKey
KAKAO_REFRESH_TOKEN=$kakaoToken
$(if ($kakaoSecret) { "KAKAO_CLIENT_SECRET=$kakaoSecret" })

VITE_NAVER_MAP_CLIENT_ID=$viteNaver

ATTENDANCE_APP_API_KEY=$apiKey
ATTENDANCE_UPLOAD_DIR=/app/uploads/attendance
"@

Set-Content -Path $UploadEnv -Value $ec2Env.TrimEnd() -Encoding UTF8
Write-Host "[생성] $UploadEnv" -ForegroundColor Green
Write-Host "       WinSCP로 EC2 ~/hanwhagreen_test/.env 에 업로드하세요." -ForegroundColor Gray
Write-Host ""

if ($BuildApk) {
    $doBuildApk = $true
} elseif ($SkipApk) {
    $doBuildApk = $false
} else {
    $doBuildApk = (Read-Host "프로덕션 APK 빌드? (Y/n)") -notmatch '^[Nn]'
}

if ($doBuildApk) {
    if (-not (Test-Path $BuildScript)) {
        Write-Host "[ERROR] 빌드 스크립트 없음: $BuildScript" -ForegroundColor Red
        exit 1
    }
    Write-Host ""
    Write-Host "=== APK 빌드 (API: $ApiBaseUrl) ===" -ForegroundColor Cyan
    & $BuildScript -ApiBaseUrl $ApiBaseUrl
}

Write-Host ""
Write-Host "=== 다음: EC2 SSH/PuTTY 에서 실행 ===" -ForegroundColor Cyan
Write-Host @"

# 1) 최신 코드
cd ~/hanwhagreen_test
git pull origin main

# 2) .env 확인 (WinSCP로 ec2.env.upload 내용을 .env 로 업로드했는지)
test -f .env && grep ATTENDANCE_APP_API_KEY .env | head -1

# 3) 배포
chmod +x scripts/ec2-deploy.sh scripts/ssl-init.sh 2>/dev/null
./scripts/ec2-deploy.sh

# 4) HTTPS 미적용 시 (ROADMAP 8번) — 보안그룹 443 열고 1회 실행
# ./scripts/ssl-init.sh

# 5) 확인
curl -s http://127.0.0.1/api/health
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1/bbs/board.php?bo_table=attendance

"@ -ForegroundColor Gray

Write-Host "=== PC 브라우저 확인 ===" -ForegroundColor Cyan
Write-Host "  $HttpsBase/bbs/board.php?bo_table=attendance" -ForegroundColor White
Write-Host ""
Write-Host "=== 휴대폰 APK ===" -ForegroundColor Cyan
Write-Host "  mobile\dist\ 최신 APK 설치 후 출결 등록 → 홈페이지에서 확인" -ForegroundColor Gray
Write-Host ""
