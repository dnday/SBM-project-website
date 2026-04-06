# SBM Monitor (React + Vite + pyocd)

Aplikasi monitoring STM32F401CCUx via ADC1/TIM1 dengan UI React + Vite dan backend FastAPI + pyocd. Frontend dapat di-deploy di Vercel, backend harus dijalankan lokal/mesin yang punya ST-Link.

## 1. Setup awal (satu kali)

1. Install deps frontend:

```bash
npm install
```

2. Install Python deps backend (di folder `src/backend`):

```bash
cd src/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -r requirements.txt
```

3. Pastikan `pyocd` dan driver ST-Link terpasang:

- Debian/Ubuntu: `sudo apt install -y python3-venv python3-pip libusb-1.0-0-dev`
- jika perlu lanjutan: `pip install pyocd==0.35.0` (versi stabil untuk kode ini)

## 2. Menjalankan backend

### Linux/macOS

Jalankan dari root proyek:

```bash
bash src/start_backend.sh
```

or gunakan secara manual:

```bash
cd src/backend
source .venv/bin/activate
python server.py
```

### Windows (PowerShell)

```powershell
cd .\src\backend
.\.venv\Scripts\Activate.ps1
python server.py
```

> **Catatan penting:** backend harus aktif secara manual di mesin lokal (atau server dengan ST-Link fisik) setiap kali reboot/boot. Vercel tidak bisa menjalankan backend pyocd/ST-Link.

## 3. Menjalankan frontend

Jika backend sudah berjalan (default ws://localhost:8765/ws):

```bash
npm run dev
```

Buka `http://localhost:5173`.

### Mode koneksi yang dipakai frontend

Default sekarang adalah **direct ke backend pyOCD** (tanpa CubeMonitor/Node-RED):

- WebSocket: `ws://localhost:8765/ws`
- REST write: `http://localhost:8765/write`

Jika ingin mengaktifkan fallback legacy ke Node-RED/CubeMonitor, buat file `.env` dari `.env.example` lalu set:

```bash
VITE_ENABLE_NODERED_FALLBACK=true
```

Jika mode direct sudah konek tapi LED/Mode/Chart tidak sesuai, biasanya alamat variabel RAM berubah setelah rebuild firmware.
Sesuaikan environment backend sebelum menjalankan `server.py`:

```powershell
$env:LED_STATUS_ADDR="0x200000bc"
$env:MODE_ADDR="0x200000b8"
$env:VAR1_ADDR="0x200000c4"
$env:ADC_VALUE_ADDR="0x200000cc"
$env:EXTI_FLAG_ADDR="0x200000d0"
python server.py
```

## 4. Deploy

- Frontend: bisa di Vercel (static output `npm run build`).
- Backend: tidak bisa di Vercel (tidak ada akses USB ST-Link). Jalankan di server lokal yang terhubung ST-Link.
  Pastikan Anda mengunduh folder backend (`src/backend`) dan script `src/start_backend.sh` / `src/start_backend.ps1` untuk setup.

## 5. Mengatasi error "blocking" pada `pyocd`

Jika pesan:

```
USB scan error: DebugProbeAggregator.get_all_connected_probes() got an unexpected keyword argument 'blocking'
```

Artinya `pyocd` versi baru tidak menerima argumen `blocking`.

Solusi:

```bash
source src/backend/.venv/bin/activate
pip install "pyocd==0.35.0"
```

Atau edit `src/backend/server.py`:

```python
# from pyocd.probe.aggregator import DebugProbeAggregator
try:
    probes = DebugProbeAggregator.get_all_connected_probes(blocking=False)
except TypeError:
    probes = DebugProbeAggregator.get_all_connected_probes()
```

## 6. Tips mode production backend

- Siapkan `systemd` service:
  - `sudo cp deploy/sbm-backend.service /etc/systemd/system/`
  - `sudo systemctl enable sbm-backend`
  - `sudo systemctl start sbm-backend`
- Pastikan `nginx`/`traefik` terkonfigurasi untuk `wss://` dan API endpoint.

---

## 7. Pengembangan dan linting

- Run lint: `npm run lint`
- Run build: `npm run build`
- Sumber: `src/main.jsx`, `src/backend/server.py`.
