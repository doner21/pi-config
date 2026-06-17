#!/usr/bin/env bash
# Pi-config bootstrap — run once after cloning
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "==> Bootstrapping Pi-config from ${SCRIPT_DIR}"

# --- npm dependencies ---
if [ -f "${SCRIPT_DIR}/agent/npm/package.json" ]; then
  echo "==> Installing Pi npm packages (gentle-engram, pi-mcp-adapter)..."
  (cd "${SCRIPT_DIR}/agent/npm" && npm install --no-audit --no-fund)
fi

if [ -f "${SCRIPT_DIR}/agent/extensions/package.json" ]; then
  echo "==> Installing Pi extension dependencies..."
  (cd "${SCRIPT_DIR}/agent/extensions" && npm install --no-audit --no-fund)
fi

# --- Engram binary ---
ENGRAM_BIN="${SCRIPT_DIR}/agent/bin/engram.exe"
ENGARM_LINUX="${SCRIPT_DIR}/agent/bin/engram"

if [ -f "${ENGRAM_BIN}" ]; then
  echo "==> Engram binary found at ${ENGRAM_BIN}"
elif [ -f "${ENGARM_LINUX}" ]; then
  echo "==> Engram binary found at ${ENGARM_LINUX}"
else
  echo "==> WARNING: Engram binary not found in agent/bin/"
  echo "    Download from: https://github.com/Gentleman-Programming/engram/releases"
fi

echo ""
echo "==> Pi-config bootstrap complete."
echo "    Restart Pi and verify with: mem_context"
