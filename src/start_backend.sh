#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# SBM Monitor — Start Backend
# Jalankan: bash start_backend.sh
# ─────────────────────────────────────────────────────────────────

set -e

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/backend" && pwd)"
echo ""
echo "  ╔═══════════════════════════════════════╗"
echo "  ║   SBM Monitor — Backend Startup       ║"
echo "  ╚═══════════════════════════════════════╝"
echo ""

# Check Python
if ! command -v python3 &>/dev/null; then
  echo "  ✗ Python 3 tidak ditemukan. Install dari python.org"
  exit 1
fi

cd "$BACKEND_DIR"

# Virtual environment
if [ ! -d ".venv" ]; then
  echo "  ● Membuat virtual environment…"
  python3 -m venv .venv
fi

source .venv/bin/activate

# Install deps
echo "  ● Menginstall dependencies…"
pip install -q -r requirements.txt

echo "  ● Menggunakan target generik Cortex-M untuk pyOCD…"

echo ""
echo "  ✔ Backend berjalan di ws://localhost:8765/ws"
echo "  ✔ Buka frontend di browser"
echo "  ✔ Tancapkan ST-Link untuk mulai monitoring"
echo "  ─────────────────────────────────────────"
echo ""

python3 server.py
