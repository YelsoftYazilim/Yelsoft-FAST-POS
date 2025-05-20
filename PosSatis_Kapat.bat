@echo off
echo PosSatis uygulamasi kapatiliyor...
echo.

:: Node.js süreçlerini sonlandır
taskkill /f /im node.exe
echo.
echo Tüm Node.js süreçleri sonlandirildi.
echo.
echo Uygulama kapatildi.
timeout /t 3 