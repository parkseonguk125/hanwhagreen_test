@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 출결서비스 AWS 배포 준비

echo.
echo ========================================
echo   출결서비스 AWS 배포 준비
echo   (EC2 .env 생성 + 프로덕션 APK 빌드)
echo ========================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\prepare-aws-deploy.ps1" -BuildApk %*

pause
