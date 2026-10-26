Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile("scratch/lamp_crop.jpg")
# Find dark cluster on the circular lamp base (bottom-left of crop)
# Let's search around X: 30 to 70, Y: 250 to 300 in lamp_crop
for ($y = 240; $y -lt 300; $y += 2) {
    for ($x = 30; $x -lt 80; $x += 2) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -lt 50 -and $c.G -lt 50 -and $c.B -lt 50) {
            # Candidate dark pixel of the switch
            Write-Output "Dark pixel at crop local: X=$x, Y=$y (R=$($c.R), G=$($c.G), B=$($c.B))"
        }
    }
}
$bmp.Dispose()
