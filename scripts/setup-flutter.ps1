# SiteReady GCC - Automated Flutter SDK Setup for Windows
$ErrorActionPreference = "Stop"

Write-Host "======================================================"
Write-Host "  SiteReady GCC: Automated Flutter SDK Setup Script   "
Write-Host "======================================================"

$targetDir = "C:\src"
$flutterDir = "C:\src\flutter"
$flutterBin = "C:\src\flutter\bin"
$androidTools = "C:\Users\Parvez\AppData\Local\Android\Sdk\platform-tools"

# 1. Create C:\src if not present
if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    Write-Host "Created directory: $targetDir"
}

# 2. Clone official Flutter SDK shallow repository (fastest method)
if (-not (Test-Path "$flutterBin\flutter.bat")) {
    Write-Host "Cloning official Flutter SDK (stable branch) to $flutterDir..."
    Write-Host "This takes 2-4 minutes depending on your internet connection..."
    & git clone https://github.com/flutter/flutter.git -b stable $flutterDir --depth 1
} else {
    Write-Host "Flutter SDK already present at: $flutterDir"
}

# 3. Add to User PATH permanently
$currentUserPath = [System.Environment]::GetEnvironmentVariable("PATH", "User")
$updated = $false

if ($currentUserPath -notlike "*$flutterBin*") {
    $currentUserPath = $flutterBin + ";" + $currentUserPath
    $updated = $true
    Write-Host "Added $flutterBin to User PATH"
}

if (Test-Path $androidTools) {
    if ($currentUserPath -notlike "*$androidTools*") {
        $currentUserPath = $androidTools + ";" + $currentUserPath
        $updated = $true
        Write-Host "Added $androidTools to User PATH"
    }
}

if ($updated) {
    [System.Environment]::SetEnvironmentVariable("PATH", $currentUserPath, "User")
    Write-Host "User environment PATH variable updated permanently."
}

# 4. Update current session PATH so commands work immediately without restarting PowerShell
$env:PATH = $flutterBin + ";" + $androidTools + ";" + $env:PATH

Write-Host "Initializing Flutter tool and verifying version..."
& "$flutterBin\flutter.bat" --version

Write-Host "Setup Complete! Now navigating to mobile project to run dependencies:"
Set-Location "G:\My Drive\Antigravity\SiteReady\mobile"
& "$flutterBin\flutter.bat" pub get
& "$flutterBin\flutter.bat" test
