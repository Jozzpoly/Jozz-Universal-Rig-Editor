@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul || (
  echo Node.js 22.12+ is required.
  pause
  exit /b 1
)

node -e "const [M,m]=process.versions.node.split('.').map(Number); process.exit(M>22 || M===22&&m>=12 ? 0 : 1)" || (
  echo Node.js 22.12+ is required. Found:
  node --version
  pause
  exit /b 1
)

if not exist "node_modules\typescript\bin\tsc" (
  echo Installing exact JURE dependencies from package-lock.json...
  call npm ci --no-audit --no-fund || goto :fail
)

echo Starting Jozz Universal Rig Editor...
echo Full validation belongs to CI / checkpoint work, not every Owner launch.
start "JURE Dev Server" /D "%~dp0" cmd /k "npm run dev -- --host 127.0.0.1 --open"
exit /b 0

:fail
echo.
echo JURE startup failed. See the error above.
pause
exit /b 1
