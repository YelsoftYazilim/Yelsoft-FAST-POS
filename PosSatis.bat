@echo off
echo PosSatis uygulamasi baslatiliyor...
echo (Bu pencere kapanmayacak, uygulamayi durdurmak icin bu pencereyi kapatabilirsiniz)
echo.
cd /d %~dp0
start cmd /k "npm run start"
cd client
start cmd /k "npm start"
echo.
echo Uygulamalar baslatildi!
echo.
echo Tarayiciniz otomatik olarak acilacaktir.
echo Server: http://localhost:5000
echo Client: http://localhost:3000 