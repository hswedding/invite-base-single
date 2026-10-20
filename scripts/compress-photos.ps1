# Shrink camera photos for the invitation's photo strip.
#   powershell -ExecutionPolicy Bypass -File scripts/compress-photos.ps1 <folder-of-originals>
# Writes 1200px-wide JPEGs (quality 80, EXIF rotation applied) to public/photos,
# keeping file names. Originals are never touched. Then list them in src/data.js.
param([Parameter(Mandatory)][string]$Source, [int]$Width = 1200, [long]$Quality = 80)

Add-Type -AssemblyName System.Drawing
$out = Join-Path $PSScriptRoot '..\public\photos'
New-Item -ItemType Directory -Force $out | Out-Null
$codec = [Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$params = New-Object Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object Drawing.Imaging.EncoderParameter ([Drawing.Imaging.Encoder]::Quality), $Quality
# EXIF orientation tag value -> rotate/flip needed to show the photo upright
$rotations = @{ 2 = 'RotateNoneFlipX'; 3 = 'Rotate180FlipNone'; 4 = 'Rotate180FlipX';
                5 = 'Rotate90FlipX'; 6 = 'Rotate90FlipNone'; 7 = 'Rotate270FlipX'; 8 = 'Rotate270FlipNone' }

Get-ChildItem $Source -File | Where-Object Extension -match '^\.(jpe?g|png)$' | ForEach-Object {
  $img = [Drawing.Image]::FromFile($_.FullName)
  if ($img.PropertyIdList -contains 0x0112) {
    $o = [int]$img.GetPropertyItem(0x0112).Value[0]
    if ($rotations[$o]) { $img.RotateFlip($rotations[$o]) }
  }
  $w = [Math]::Min($Width, $img.Width)
  $h = [int]($img.Height * $w / $img.Width)
  $bmp = New-Object Drawing.Bitmap $w, $h
  $g = [Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.DrawImage($img, 0, 0, $w, $h)
  $dest = Join-Path $out ($_.BaseName + '.jpg')
  $bmp.Save($dest, $codec, $params)
  $g.Dispose(); $bmp.Dispose(); $img.Dispose()
  '{0} -> {1} KB' -f $_.Name, [int]((Get-Item $dest).Length / 1KB)
}
