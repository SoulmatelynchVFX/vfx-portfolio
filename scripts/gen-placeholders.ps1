# Generates placeholder videos + poster frames for the VFX portfolio demo.
# Run from project root:
#   powershell -ExecutionPolicy Bypass -File scripts\gen-placeholders.ps1
# (or: npm run gen:media)
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$vidDir = Join-Path $root "public\videos"
$postDir = Join-Path $root "public\posters"
New-Item -ItemType Directory -Force -Path $vidDir, $postDir | Out-Null

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Write-Error "ffmpeg not found in PATH. Install it first: winget install Gyan.FFmpeg"
}

function New-Placeholder {
    param(
        [string]$name,
        [string]$src,
        [string]$vf = "",
        [int]$dur = 8,
        [string]$size = "1280x720"
    )
    $video = Join-Path $vidDir "$name.mp4"
    $poster = Join-Path $postDir "$name.jpg"
    Write-Host "==> $name.mp4  (${dur}s, $size)"
    if ($vf) {
        & ffmpeg -y -loglevel error -f lavfi -i $src -t $dur -r 30 -vf $vf `
            -c:v libx264 -preset veryfast -crf 28 -pix_fmt yuv420p -movflags +faststart -an $video
    } else {
        & ffmpeg -y -loglevel error -f lavfi -i $src -t $dur -r 30 `
            -c:v libx264 -preset veryfast -crf 28 -pix_fmt yuv420p -movflags +faststart -an $video
    }
    if ($LASTEXITCODE -ne 0) { throw "ffmpeg failed for $name" }
    & ffmpeg -y -loglevel error -ss 2 -i $video -frames:v 1 -q:v 3 $poster
    if ($LASTEXITCODE -ne 0) { throw "poster failed for $name" }
}

$S = "1280x720"

# hero: deep blue-black gradient, 1080p
New-Placeholder "hero" "gradients=size=1920x1080:rate=30:speed=0.015:c0=0x000000:c1=0x05060d:c2=0x0a0f24:c3=0x141b3d" "" 12 "1920x1080"

# gallery projects: each with its own dark palette
New-Placeholder "particle-storm" "gradients=size=$($S):rate=30:speed=0.03:c0=0x000000:c1=0x1a0a33:c2=0x3b0f6e:c3=0x7b1fa8" "" 8 $S
New-Placeholder "fluid-vessel"   "gradients=size=$($S):rate=30:speed=0.02:c0=0x000000:c1=0x03222c:c2=0x06414f:c3=0x0b6f80" "" 8 $S
New-Placeholder "magma-dragon"   "gradients=size=$($S):rate=30:speed=0.025:c0=0x000000:c1=0x2a0a03:c2=0x5c1405:c3=0xa33c10" "" 8 $S
New-Placeholder "cyber-street"   "gradients=size=$($S):rate=30:speed=0.02:c0=0x000000:c1=0x0a1230:c2=0x1b2f6e:c3=0x2f6be0" "" 8 $S
New-Placeholder "neon-beacon"    "gradients=size=$($S):rate=30:speed=0.03:c0=0x000000:c1=0x1c0633:c2=0x520d77:c3=0xd420a0" "" 8 $S
New-Placeholder "stealth-jet"    "gradients=size=$($S):rate=30:speed=0.02:c0=0x000000:c1=0x101010:c2=0x2b2b2b:c3=0x5a5a5a" "" 8 $S
New-Placeholder "still-life"     "gradients=size=$($S):rate=30:speed=0.02:c0=0x000000:c1=0x1f1505:c2=0x50380c:c3=0x9a7422" "" 8 $S
# mandelbrot fractal zoom, graded dark (Nuke comp vibe)
New-Placeholder "macro-world" "mandelbrot=s=$($S):rate=30:maxiter=2000" "eq=brightness=-0.25:saturation=0.7:contrast=1.5,format=yuv420p" 10 $S

Write-Host ""
Write-Host "Done. Videos -> $vidDir"
Write-Host "Posters -> $postDir"
