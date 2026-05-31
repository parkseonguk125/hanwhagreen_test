# Start Cloudflare quick tunnel (public https URL)
# Requires: docker compose up -d

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

Write-Host ""
Write-Host "Starting web/api containers..." -ForegroundColor Cyan
docker compose up -d web api 2>&1 | Out-Host

$status = docker compose ps web --format "{{.Status}}" 2>$null
if ($status -notmatch "Up") {
  Write-Host "web container is not running. Run: docker compose up -d" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "Starting public tunnel (stop with Ctrl+C)..." -ForegroundColor Cyan
Write-Host "Look for https://....trycloudflare.com in the log below."
Write-Host ""

docker compose -f docker-compose.yml -f docker-compose.tunnel.yml --profile tunnel up tunnel
