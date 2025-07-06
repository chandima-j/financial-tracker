@echo off
echo ========================================
echo Smart Finance Tracker - Test Script
echo ========================================
echo.

echo Starting local server...
start python -m http.server 8000

echo.
echo ========================================
echo Testing Instructions:
echo ========================================
echo.
echo 1. Open your browser and go to:
echo    http://localhost:8000
echo.
echo 2. Test on your Pixel 6a:
echo    http://192.168.1.12:8000
echo.
echo 3. Test these features:
echo    - Add income/expense transactions
echo    - Change currency (LKR, USD, EUR)
echo    - Add recurring payments
echo    - View charts and forecasts
echo    - Install as PWA
echo.
echo 4. Check browser console for errors
echo.
echo ========================================
echo Press any key to stop the server...
pause

echo Stopping server...
taskkill /f /im python.exe 2>nul
echo Server stopped.
pause 