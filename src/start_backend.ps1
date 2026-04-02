# SBM Monitor — Start Backend (Windows PowerShell)
# Jalankan: .\start_backend.ps1

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "  ╔═══════════════════════════════════════╗"
Write-Host "  ║   SBM Monitor — Backend Startup       ║"
Write-Host "  ╚═══════════════════════════════════════╝"
Write-Host ""

$backendDir = Join-Path $PSScriptRoot "backend"
Set-Location $backendDir

# Virtual environment
if (-not (Test-Path ".venv")) {
    Write-Host "  ● Membuat virtual environment..."
    python -m venv .venv
}

& ".venv\Scripts\Activate.ps1"

Write-Host "  ● Menginstall dependencies..."
pip install -q -r requirements.txt

Write-Host "  ● Menggunakan target generik Cortex-M untuk pyOCD..."

Write-Host ""
Write-Host "  ✔ Backend berjalan di ws://localhost:8765/ws"
Write-Host "  ✔ Tancapkan ST-Link untuk mulai monitoring"
Write-Host ""

python server.py
