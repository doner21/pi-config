#!/usr/bin/env bash
#
# Pi Agent Configuration Setup
# =============================
# Run this after cloning the repo to restore dependencies.
# Works on macOS, Linux, and Windows (Git Bash / WSL).
#
# Usage:
#   cd ~/.pi/agent && bash setup.sh
#
# Optional legacy Ollama web_search/web_fetch tools:
#   INSTALL_OLLAMA_WEB_SEARCH=1 bash setup.sh

set -euo pipefail

echo "=== Pi Agent Configuration Setup ==="

# 1. Install extension dependencies
echo ""
echo "[1/3] Installing extension dependencies..."
cd "$(dirname "$0")/extensions"
npm install
cd ..

# 2. Prompt for auth.json if missing
AUTH_FILE="$(dirname "$0")/auth.json"
if [ ! -f "$AUTH_FILE" ]; then
    echo ""
    echo "[2/3] Creating auth.json..."
    echo "WARNING: auth.json contains API keys! Never commit it."
    echo ""
    echo "Paste your auth.json content (or press Enter to skip):"
    echo "  Example:"
    echo '  { "providers": { "deepseek": { "apiKey": "sk-..." } } }'
    echo ""
    read -r -p "Paste JSON here (or press Enter): " AUTH_CONTENT
    if [ -n "$AUTH_CONTENT" ]; then
        echo "$AUTH_CONTENT" > "$AUTH_FILE"
        echo "auth.json created."
    else
        echo "Skipped. Create auth.json manually later."
    fi
else
    echo "[2/3] auth.json already exists — skipping."
fi

# 3. Web search note / optional legacy package
echo ""
echo "[3/3] Web search setup..."
echo "  Default browser_web_search is bundled; no Ollama/Llama install required."
if [ "${INSTALL_OLLAMA_WEB_SEARCH:-}" = "1" ]; then
    echo "  Installing optional legacy Ollama web_search/web_fetch package..."
    if command -v pi &> /dev/null; then
        pi install npm:@ollama/pi-web-search 2>/dev/null || echo "  (pi not running — install manually: pi install npm:@ollama/pi-web-search)"
    else
        echo "  (pi not found in PATH — run 'pi install npm:@ollama/pi-web-search' after starting pi)"
    fi
else
    echo "  Skipping optional legacy Ollama web_search/web_fetch package."
    echo "  To install it later: pi install npm:@ollama/pi-web-search"
fi

echo ""
echo "=== Setup complete! ==="
echo "Start Pi with: pi"
echo "Then run: /think medium"
echo ""
