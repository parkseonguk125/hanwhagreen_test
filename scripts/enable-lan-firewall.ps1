# Allow inbound TCP 8081 on Windows Firewall (run as Administrator)
#Requires -RunAsAdministrator

$ruleName = "Hanwhagreen Docker 8081"

$existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
if ($existing) {
  Write-Host "Firewall rule already exists: $ruleName" -ForegroundColor Green
} else {
  New-NetFirewallRule `
    -DisplayName $ruleName `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 8081 `
    -Action Allow `
    -Profile Private, Domain | Out-Null
  Write-Host "Added firewall rule: TCP 8081 allow" -ForegroundColor Green
}

Write-Host ""
& "$PSScriptRoot\show-access-urls.ps1"
