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
  echo Installing project dependencies once...
  call npm install --no-audit --no-fund || goto :fail
)

echo Running the JURE validation gate...
call npm run check || goto :fail

echo.
echo JURE gate passed. Starting Jozz Universal Rig Editor...
start "JURE F0 Dev Server" /D "%~dp0" cmd /k "npm run dev -- --host 127.0.0.1 --open"
exit /b 0

:fail
echo.
echo Workbench startup failed. See the error above.
pause
exit /b 1
