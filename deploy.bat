@echo off
echo ========================================
echo Smart Finance Tracker - Deployment Helper
echo ========================================
echo.

echo Checking project structure...
if not exist "index.html" (
    echo ERROR: index.html not found!
    echo Please run this script from the project directory.
    pause
    exit /b 1
)

if not exist "manifest.json" (
    echo ERROR: manifest.json not found!
    echo Please ensure all files are in the correct location.
    pause
    exit /b 1
)

if not exist "css\styles.css" (
    echo ERROR: css\styles.css not found!
    echo Please ensure CSS folder exists.
    pause
    exit /b 1
)

if not exist "js\app.js" (
    echo ERROR: js\app.js not found!
    echo Please ensure JS folder exists.
    pause
    exit /b 1
)

echo ✓ Project structure verified!
echo.

echo ========================================
echo DEPLOYMENT OPTIONS
echo ========================================
echo.
echo 1. Test locally (HTTP)
echo 2. Test with HTTPS (using ngrok)
echo 3. Prepare for GitHub Pages
echo 4. Prepare for Netlify
echo 5. Exit
echo.

set /p choice="Choose an option (1-5): "

if "%choice%"=="1" goto local
if "%choice%"=="2" goto https
if "%choice%"=="3" goto github
if "%choice%"=="4" goto netlify
if "%choice%"=="5" goto exit
goto invalid

:local
echo.
echo ========================================
echo Starting Local HTTP Server
echo ========================================
echo.
echo Your app will be available at: http://localhost:8000
echo.
echo To access from your Pixel 6a:
echo 1. Find your computer's IP address
echo 2. Open http://YOUR_IP:8000 on your phone
echo 3. Install as PWA
echo.
echo Press Ctrl+C to stop the server
echo.
python -m http.server 8000
goto end

:https
echo.
echo ========================================
echo Starting HTTPS Server with ngrok
echo ========================================
echo.
echo Installing ngrok...
npm install -g ngrok
echo.
echo Starting local server...
start python -m http.server 8000
echo.
echo Starting ngrok tunnel...
ngrok http 8000
echo.
echo Use the HTTPS URL provided by ngrok to install PWA on your Pixel 6a
goto end

:github
echo.
echo ========================================
echo GitHub Pages Deployment
echo ========================================
echo.
echo To deploy to GitHub Pages:
echo.
echo 1. Go to github.com and create a new repository
echo 2. Name it: finance-tracker
echo 3. Make it PUBLIC
echo 4. Upload all these files:
echo    - index.html
echo    - manifest.json
echo    - sw.js
echo    - README.md
echo    - css/ folder
echo    - js/ folder
echo 5. Go to Settings > Pages
echo 6. Select "Deploy from a branch"
echo 7. Choose "main" branch
echo 8. Your app will be at: https://yourusername.github.io/finance-tracker
echo.
echo Press any key to continue...
pause
goto end

:netlify
echo.
echo ========================================
echo Netlify Deployment
echo ========================================
echo.
echo To deploy to Netlify:
echo.
echo 1. Go to netlify.com and sign up
echo 2. Click "New site from Git"
echo 3. Connect your GitHub repository
echo 4. Select your finance-tracker repository
echo 5. Click "Deploy site"
echo 6. Your app will be at: https://your-site.netlify.app
echo.
echo Press any key to continue...
pause
goto end

:invalid
echo Invalid choice! Please select 1-5.
pause
goto end

:exit
echo Goodbye!
goto end

:end
echo.
echo ========================================
echo Deployment helper completed!
echo ========================================
pause 