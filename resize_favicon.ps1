Add-Type -AssemblyName System.Drawing

# Create a 32x32 favicon from the icon
$iconSrc = [System.Drawing.Image]::FromFile("C:\Users\shoru\Downloads\SaaS\GYM\logo\icon png.png")

$faviconBmp = New-Object System.Drawing.Bitmap(32, 32)
$faviconBmp.SetResolution(72, 72)
$g = [System.Drawing.Graphics]::FromImage($faviconBmp)
$g.Clear([System.Drawing.Color]::Transparent)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

$ratio = [Math]::Min(32 / $iconSrc.Width, 32 / $iconSrc.Height)
$nW = [int]($iconSrc.Width * $ratio)
$nH = [int]($iconSrc.Height * $ratio)
$oX = [int]((32 - $nW) / 2)
$oY = [int]((32 - $nH) / 2)
$g.DrawImage($iconSrc, $oX, $oY, $nW, $nH)
$g.Dispose()
$iconSrc.Dispose()

$faviconBmp.Save("C:\Users\shoru\Downloads\SaaS\GYM\saas\public\favicon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$faviconBmp.Dispose()
Write-Host "Favicon saved as 32x32"
