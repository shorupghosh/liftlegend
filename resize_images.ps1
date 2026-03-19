Add-Type -AssemblyName System.Drawing

# --- Resize Logo to 250x100 (horizontal) ---
$logoSrc = [System.Drawing.Image]::FromFile("C:\Users\shoru\Downloads\SaaS\GYM\logo\main.png")
Write-Host "Original logo size: $($logoSrc.Width)x$($logoSrc.Height)"

$targetW = 250
$targetH = 100
# Calculate aspect-fit dimensions
$ratioW = $targetW / $logoSrc.Width
$ratioH = $targetH / $logoSrc.Height
$ratio = [Math]::Min($ratioW, $ratioH)
$newW = [int]($logoSrc.Width * $ratio)
$newH = [int]($logoSrc.Height * $ratio)

$logoBmp = New-Object System.Drawing.Bitmap($targetW, $targetH)
$logoBmp.SetResolution(72, 72)
$g = [System.Drawing.Graphics]::FromImage($logoBmp)
$g.Clear([System.Drawing.Color]::Transparent)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

$offsetX = [int](($targetW - $newW) / 2)
$offsetY = [int](($targetH - $newH) / 2)
$g.DrawImage($logoSrc, $offsetX, $offsetY, $newW, $newH)
$g.Dispose()
$logoSrc.Dispose()

$logoBmp.Save("C:\Users\shoru\Downloads\SaaS\GYM\saas\public\main-logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
$logoBmp.Dispose()
Write-Host "Logo saved as 250x100 to public/main-logo.png"

# --- Resize Icon to 160x160 (square) ---
$iconSrc = [System.Drawing.Image]::FromFile("C:\Users\shoru\Downloads\SaaS\GYM\saas\public\icon.png")
Write-Host "Original icon size: $($iconSrc.Width)x$($iconSrc.Height)"

$iconTarget = 160
$ratioI = [Math]::Min($iconTarget / $iconSrc.Width, $iconTarget / $iconSrc.Height)
$iW = [int]($iconSrc.Width * $ratioI)
$iH = [int]($iconSrc.Height * $ratioI)

$iconBmp = New-Object System.Drawing.Bitmap($iconTarget, $iconTarget)
$iconBmp.SetResolution(72, 72)
$gi = [System.Drawing.Graphics]::FromImage($iconBmp)
$gi.Clear([System.Drawing.Color]::Transparent)
$gi.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gi.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gi.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$gi.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

$iOffX = [int](($iconTarget - $iW) / 2)
$iOffY = [int](($iconTarget - $iH) / 2)
$gi.DrawImage($iconSrc, $iOffX, $iOffY, $iW, $iH)
$gi.Dispose()
$iconSrc.Dispose()

$iconBmp.Save("C:\Users\shoru\Downloads\SaaS\GYM\saas\public\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$iconBmp.Dispose()
Write-Host "Icon saved as 160x160 to public/icon.png"

Write-Host "Done! Both images resized successfully."
