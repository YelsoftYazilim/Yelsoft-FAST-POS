Option Explicit

' Node.js süreçlerini sonlandır
Dim objShell
Set objShell = CreateObject("WScript.Shell")

' Node.js süreçlerini sonlandır - önce sunucu ardından React geliştirme sunucusu
objShell.Run "taskkill /f /im node.exe", 0, True

' 1 saniye bekle
WScript.Sleep 1000

' Server başlat
Dim serverPath
serverPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
objShell.Run "cmd.exe /c cd """ & serverPath & """ && npm run start", 0, False

' 2 saniye bekle
WScript.Sleep 2000

' Client başlat
Dim clientPath
clientPath = serverPath & "\client"
objShell.Run "cmd.exe /c cd """ & clientPath & """ && npm start", 0, False

Set objShell = Nothing 