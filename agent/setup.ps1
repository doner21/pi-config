# Pi Agent Configuration Setup (PowerShell)
# ============================================
# Run this after cloning the repo on Windows to restore dependencies.
#
# Usage:
#   cd $env:USERPROFILE\.pi\agent
#   powershell -ExecutionPolicy Bypass -File setup.ps1
#
# Optional legacy Ollama web_search/web_fetch tools:
#   powershell -ExecutionPolicy Bypass -File setup.ps1 -InstallOllamaWebSearch

param(
    [switch]$InstallOllamaWebSearch
)

Write-Host "=== Pi Agent Configuration Setup ===" -ForegroundColor Cyan

# 1. Install extension dependencies
Write-Host "`n[1/3] Installing extension dependencies..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\extensions"
npm install
Set-Location $PSScriptRoot

# 2. Prompt for auth.json if missing
$authFile = "$PSScriptRoot\auth.json"
if (-not (Test-Path $authFile)) {
    Write-Host "`n[2/3] Creating auth.json..." -ForegroundColor Yellow
    Write-Host "WARNING: auth.json contains API keys! Never commit it." -ForegroundColor Red
    Write-Host "`n  Example content:"
    Write-Host '  { "providers": { "deepseek": { "apiKey": "sk-..." } } }'
    Write-Host ""
    $authContent = Read-Host "Paste JSON here (or press Enter to skip)"
    if ($authContent) {
        $authContent | Out-File -FilePath $authFile -Encoding utf8
        Write-Host "auth.json created." -ForegroundColor Green
    } else {
        Write-Host "Skipped. Create auth.json manually later." -ForegroundColor Yellow
    }
} else {
    Write-Host "[2/3] auth.json already exists — skipping." -ForegroundColor Green
}

# 3. Web search note / optional legacy package
Write-Host "`n[3/3] Web search setup..." -ForegroundColor Yellow
Write-Host "  Default browser_web_search is bundled; no Ollama/Llama install required." -ForegroundColor Green
if ($InstallOllamaWebSearch) {
    Write-Host "  Installing optional legacy Ollama web_search/web_fetch package..." -ForegroundColor Yellow
    try {
        pi install npm:@ollama/pi-web-search | Out-Null
        Write-Host "Legacy Ollama web search package installed." -ForegroundColor Green
    } catch {
        Write-Host "  (pi not found — run 'pi install npm:@ollama/pi-web-search' after starting pi)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  Skipping optional legacy Ollama web_search/web_fetch package." -ForegroundColor Yellow
    Write-Host "  To install it later: pi install npm:@ollama/pi-web-search" -ForegroundColor White
}

Write-Host "`n=== Setup complete! ===" -ForegroundColor Cyan
Write-Host "Start Pi with: pi" -ForegroundColor White
Write-Host "Then run: /think medium" -ForegroundColor White
