# Stop public tunnel

Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
$root = Split-Path $PSScriptRoot -Parent
Remove-Item (Join-Path $root "PUBLIC_URL.txt") -Force -ErrorAction SilentlyContinue
Write-Host "Public tunnel stopped." -ForegroundColor Green
