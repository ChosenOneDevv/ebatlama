@echo off
echo ========================================
echo   TurNest - Development Server
echo ========================================
echo.

:: Backend'i arka planda başlat
echo [1/2] Backend baslatiliyor (port 3001)...
cd /d "%~dp0backend"
start "TurNest Backend" cmd /k "npm run dev"

:: Biraz bekle
timeout /t 2 /nobreak > nul

:: Frontend'i başlat
echo [2/2] Frontend baslatiliyor (port 5173)...
cd /d "%~dp0frontend"
start "TurNest Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo   Sunucular baslatildi!
echo ========================================
echo.
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:3001
echo.
echo   Kapatmak icin acilan terminal pencerelerini kapatin.
echo ========================================
pause
