@echo off

chcp 65001 >nul

cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File "mobile\scripts\copy-apk-to-desktop.ps1"

pause

