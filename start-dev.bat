@echo off
echo.
echo  ============================================================
echo   qkit Real Estate Website - Dev Server
echo  ============================================================
echo.
echo  Starting at http://localhost:3000
echo  Press Ctrl+C to stop.
echo.

set NODE_PATH=%USERPROFILE%\nodejs\node-v22.11.0-win-x64
set PATH=%NODE_PATH%;%PATH%

:: Disable SSL verification for networks with SSL inspection (e.g., corporate/home firewall)
set NODE_TLS_REJECT_UNAUTHORIZED=0

"%NODE_PATH%\node.exe" "C:\qkit\node_modules\next\dist\bin\next" dev

pause
