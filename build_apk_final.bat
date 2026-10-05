@echo off
echo ========================================
echo IronPulse APK Build Script v8
echo ========================================
echo.

REM Set Java environment
set JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
set PATH=%JAVA_HOME%\bin;%PATH%

echo [1/5] Checking Java...
java -version
if %errorlevel% neq 0 (
    echo ERROR: Java not found!
    pause
    exit /b 1
)

echo.
echo [2/5] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)

echo.
echo [3/5] Building web app...
call npx vite build
if %errorlevel% neq 0 (
    echo ERROR: Vite build failed!
    pause
    exit /b 1
)

echo.
echo [4/5] Syncing Capacitor...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ERROR: Capacitor sync failed!
    pause
    exit /b 1
)

echo.
echo [5/5] Building APK...
cd android
call gradlew clean
call gradlew assembleDebug
if %errorlevel% neq 0 (
    echo ERROR: APK build failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo  SUCCESS! APK created at:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo ========================================
echo.
echo Transfer to Android device and install!
pause
