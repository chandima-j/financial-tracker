@echo off
echo ========================================
echo Smart Finance Tracker - GitHub Deployment
echo ========================================
echo.

echo Step 1: Checking Git status...
git status

echo.
echo Step 2: Adding all files...
git add .

echo.
echo Step 3: Committing changes...
git commit -m "Update Smart Finance Tracker with currency support"

echo.
echo Step 4: Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo Deployment Steps:
echo ========================================
echo 1. Go to your GitHub repository
echo 2. Click Settings ^> Pages
echo 3. Select "Deploy from a branch"
echo 4. Choose "main" branch and "/ (root)"
echo 5. Click Save
echo.
echo Your app will be live at:
echo https://YOUR_USERNAME.github.io/financial-tracker
echo.
echo ========================================
pause 