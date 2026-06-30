# S2 — 로그인 실패 반복 (rate limit 429 유발)
# Run: npm run local:security-s2

$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

$BaseUrl = "http://localhost:8081/api/auth/login"
$Body = '{"mb_id":"admin","mb_password":"wrong_password"}'
$Attempts = 12

Write-Host ""
Write-Host "========================================"
Write-Host "  S2: 로그인 실패 $Attempts 회 (rate limit)"
Write-Host "========================================"
Write-Host ""

$lastStatus = 0
for ($i = 1; $i -le $Attempts; $i++) {
    Write-Host "[$i/$Attempts] POST $BaseUrl"
    try {
        $r = Invoke-WebRequest -Uri $BaseUrl -Method POST -Body $Body `
            -ContentType "application/json" -UseBasicParsing
        $lastStatus = $r.StatusCode
        Write-Host "  status: $lastStatus"
    } catch {
        if ($_.Exception.Response) {
            $lastStatus = [int]$_.Exception.Response.StatusCode
            Write-Host "  status: $lastStatus"
        } else {
            Write-Host "  error: $_"
        }
    }
    Start-Sleep -Milliseconds 300
}

Write-Host ""
if ($lastStatus -eq 429) {
    Write-Host "OK: 429 rate limit 확인"
} else {
    Write-Host "참고: 마지막 status=$lastStatus (429 기대). API 재빌드 후 재시도."
}
Write-Host ""
Write-Host "복구: docker compose restart api"
Write-Host ""
