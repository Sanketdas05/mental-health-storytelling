Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile("public/media/ws-desk.jpg")
$g = [System.Drawing.Graphics]::FromImage($bmp)
$pen = New-Object System.Drawing.Pen([System.Drawing.Color]::Red, 2)
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 255, 0, 0))

# Switch center in desk: X=211, Y=469
$g.DrawEllipse($pen, 211 - 15, 469 - 15, 30, 30)
$g.FillEllipse($brush, 211 - 4, 469 - 4, 8, 8)

# Crop around it to verify
$rect = New-Object System.Drawing.Rectangle(150, 400, 150, 150)
$cropped = $bmp.Clone($rect, $bmp.PixelFormat)
$cropped.Save("scratch/switch_verified.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)

$g.Dispose()
$pen.Dispose()
$brush.Dispose()
$cropped.Dispose()
$bmp.Dispose()
Write-Output "Saved verification image to scratch/switch_verified.jpg"
