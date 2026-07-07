@echo off

chcp 65001 >nul

cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File "mobile\scripts\build-android-release.ps1" %*

pause

