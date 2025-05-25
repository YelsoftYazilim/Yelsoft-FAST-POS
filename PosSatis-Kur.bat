@echo off
:: Çalışma dizinini bat dosyasının bulunduğu dizin olarak ayarla
cd /d "%~dp0"

echo PosSatis Kurulum Basliyor...
echo.
echo Bu islem tum gerekli paketleri kuracak ve uygulamayi kullanima hazirlayacak.
echo.
echo Lutfen bekleyin...
echo =====================================
echo.

:: Önce client paketlerini kur - daha önemli ve daha fazla bağımlılık var
echo Client paketleri yukleniyor...
cd client
call npm install
if %ERRORLEVEL% NEQ 0 (
  echo Hata: Client paketleri yuklenemedi!
  cd ..
  pause
  exit /b 1
)
cd ..
echo Client paketleri basariyla yuklendi.
echo.

:: Sonra server paketlerini kur
echo Server paketleri yukleniyor...
cd server
call npm install
if %ERRORLEVEL% NEQ 0 (
  echo Hata: Server paketleri yuklenemedi!
  cd ..
  pause
  exit /b 1
)
cd ..
echo Server paketleri basariyla yuklendi.
echo.

echo =====================================
echo Kurulum basariyla tamamlandi!
echo.
echo Uygulamayi baslatmak icin "PosSatis.bat" dosyasina cift tiklayabilirsiniz.
echo veya
echo Arkaplanda calistirmak icin "baslat.vbs" dosyasina cift tiklayabilirsiniz.
echo.
pause 