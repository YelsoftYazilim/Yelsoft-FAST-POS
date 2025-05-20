Option Explicit

' Node.js süreçlerini sonlandır
Dim objShell, processKill
Set objShell = CreateObject("WScript.Shell")

' Node.js süreçlerini sonlandır - önce sunucu ardından React geliştirme sunucusu
objShell.Run "taskkill /f /im node.exe", 0, True

' 1 saniye bekle
WScript.Sleep 1000

' Yeni bir instance başlat
objShell.Run chr(34) & CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName) & "\baslat.bat" & Chr(34), 0, False

Set objShell = Nothing 