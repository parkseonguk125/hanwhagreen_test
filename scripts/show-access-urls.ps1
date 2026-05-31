# Show URLs for LAN access (same Wi-Fi)
# Requires: docker compose up -d

$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "=== Hanwhagreen site URLs ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1] This PC" -ForegroundColor Yellow
Write-Host "    http://localhost:8081"
Write-Host ""

Write-Host "[2] Phone / other PC on same Wi-Fi" -ForegroundColor Yellow
$ips = Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object {
    $_.IPAddress -notlike "127.*" -and
    $_.IPAddress -notlike "169.254.*" -and
    $_.PrefixOrigin -ne "WellKnown"
  } |
  Sort-Object InterfaceMetric

if (-not $ips) {
  Write-Host "    (No IPv4 found. Run ipconfig.)" -ForegroundColor Red
} else {
  foreach ($ip in $ips) {
    Write-Host "    http://$($ip.IPAddress):8081"
  }
  Write-Host ""
  Write-Host "    Open the URL above on your phone (same Wi-Fi as this PC)." -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "[3] Internet (public https URL)" -ForegroundColor Yellow
Write-Host "    Run: .\scripts\start-public-url.ps1"
Write-Host "    Then use the https://....trycloudflare.com address from the log."
Write-Host ""

$web = docker compose ps web 2>$null
if ($web -match "Up") {
  Write-Host "Docker web: running" -ForegroundColor Green
} else {
  Write-Host "Docker web: stopped. Run: docker compose up -d" -ForegroundColor Red
}

Write-Host ""
