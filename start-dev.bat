@echo off
echo Starting ACSS in dev mode...

:: Start the Next.js dev server
start cmd /k "pnpm dev"

:: Wait a bit to let the server boot
timeout /t 5 >nul

:: Open browser to localhost:3000
start http://localhost:3000

echo Server started.
exit
