Add-Type -AssemblyName PresentationCore
$m = New-Object Windows.Media.MediaPlayer
$path = [System.IO.Path]::GetFullPath('.claude/hooksounds/success.mp3')
$m.Open($path)
$m.Play()
Start-Sleep -s 2
