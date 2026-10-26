Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile("public/media/ws-desk.jpg")
$w = $bmp.Width
$h = $bmp.Height

# We want to crop around the lamp base/neck on the left desk
# In 1792x1008 space:
# Lamp head was around cx=325, cy=223
# The arm goes down towards the desk surface. Let's inspect x from 15% to 30%, y from 30% to 65%

$cropW = [int]($w * 0.25)
$cropH = [int]($h * 0.45)
$cropX = [int]($w * 0.12)
$cropY = [int]($h * 0.25)

$rect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$cropped = $bmp.Clone($rect, $bmp.PixelFormat)
$cropped.Save("scratch/lamp_crop.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$cropped.Dispose()
$bmp.Dispose()
Write-Output "Lamp cropped to scratch/lamp_crop.jpg, rect: X=$cropX Y=$cropY W=$cropW H=$cropH"
