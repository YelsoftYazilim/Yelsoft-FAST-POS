@echo off
echo PosSatis Kurulum Basliyor...
echo.
echo Bu islem tum gerekli paketleri kuracak ve uygulamayi kullanima hazirlayacak.
echo.
echo Lutfen bekleyin...
echo =====================================
echo.

:: Sunucu paketlerini kur
echo Ana dizin paketleri yukleniyor...
call npm install
if %ERRORLEVEL% NEQ 0 (
  echo Hata: Ana dizin paketleri yuklenemedi!
  pause
  exit /b 1
)
echo Ana dizin paketleri basariyla yuklendi.
echo.

:: Client paketlerini kur
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

echo =====================================
echo Kurulum basariyla tamamlandi!
echo.
echo Uygulamayi baslatmak icin "PosSatis.bat" dosyasina cift tiklayabilirsiniz.
echo veya
echo Arkaplanda calistirmak icin "baslat.vbs" dosyasina cift tiklayabilirsiniz.
echo.
pause 