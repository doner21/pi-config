# Pi-config bootstrap — run once after cloning
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "==> Bootstrapping Pi-config from $ScriptDir" -ForegroundColor Cyan

# --- npm dependencies ---
$npmPkg = Join-Path $ScriptDir "agent\npm\package.json"
if (Test-Path $npmPkg) {
    Write-Host "==> Installing Pi npm packages (gentle-engram, pi-mcp-adapter)..." -ForegroundColor Yellow
    Push-Location (Join-Path $ScriptDir "agent\npm")
    npm install --no-audit --no-fund
    Pop-Location
}

$extPkg = Join-Path $ScriptDir "agent\extensions\package.json"
if (Test-Path $extPkg) {
    Write-Host "==> Installing Pi extension dependencies..." -ForegroundColor Yellow
    Push-Location (Join-Path $ScriptDir "agent\extensions")
    npm install --no-audit --no-fund
    Pop-Location
}

# --- Engram binary ---
$engramWin = Join-Path $ScriptDir "agent\bin\engram.exe"
$engramNix = Join-Path $ScriptDir "agent\bin\engram"

if (Test-Path $engramWin) {
    Write-Host "==> Engram binary found at $engramWin" -ForegroundColor Green
} elseif (Test-Path $engramNix) {
    Write-Host "==> Engram binary found at $engramNix" -ForegroundColor Green
} else {
    Write-Host "==> WARNING: Engram binary not found in agent\bin\" -ForegroundColor Red
    Write-Host "    Download from: https://github.com/Gentleman-Programming/engram/releases"
}

Write-Host ""
Write-Host "==> Pi-config bootstrap complete." -ForegroundColor Green
Write-Host "    Restart Pi and verify with: mem_context"
