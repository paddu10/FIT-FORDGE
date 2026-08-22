Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('d:\SE\gym-app\assets\icon.png')
$img.Save('d:\SE\gym-app\assets\icon_real.png', [System.Drawing.Imaging.ImageFormat]::Png)
$img.Dispose()
Move-Item -Path 'd:\SE\gym-app\assets\icon_real.png' -Destination 'd:\SE\gym-app\assets\icon.png' -Force
