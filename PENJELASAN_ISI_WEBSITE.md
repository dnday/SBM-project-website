# Penjelasan Isi Website SBM Monitor (Sinkron dengan Implementasi)

Dokumen ini menjelaskan isi website sesuai kondisi aplikasi saat ini, sekaligus memberi panduan deploy frontend dan backend.

## 1. Ringkasan Website

SBM Monitor adalah website monitoring real-time untuk STM32F401CCUx.

Arsitektur data:

1. STM32 dibaca oleh backend Python (FastAPI + pyOCD) melalui ST-Link.
2. Backend mengirim telemetri ke frontend lewat WebSocket.
3. Frontend React menampilkan data dalam bentuk panel numerik, status, gauge, dan grafik.

Fungsi inti website:

- Monitoring nilai ADC dan sinyal secara live.
- Monitoring mode firmware, status LED, dan EXTI event.
- Menyediakan halaman dokumentasi laporan teknis di aplikasi yang sama.

## 2. Struktur Halaman Website

Website memiliki 2 tampilan utama:

1. Dashboard Monitoring.
2. Docs Page (Dokumentasi Laporan SBM).

Perpindahan dari dashboard ke docs dilakukan melalui tombol Buka Dokumentasi Laporan SBM.

## 3. Isi Dashboard Monitoring

### 3.1 Header Utama

Header menampilkan:

- Nama aplikasi: SBM Monitor.
- Identitas target: STM32F401CCUx.
- Badge runtime: MCU, CLK, MODE, VAR1, LED ON, EXTI, UPTIME.
- Chip status koneksi: CONNECTED, BACKEND OFFLINE, atau WAITING.

### 3.2 Overlay Menunggu ST-Link

Saat perangkat belum siap, muncul overlay Menunggu ST-Link.

Peran overlay:

- Memberi instruksi sambungkan USB ST-Link.
- Menampilkan status WebSocket backend (connecting/open/closed/error).
- Menahan interaksi dashboard sementara.

### 3.3 Mode Hero

Panel ini menampilkan mode aktif dengan label berikut:

- Mode 0 - Shift Left.
- Mode 1 - Sawtooth 0..2 lalu 0..52.
- Mode 2 - Potensio Bar Graph.
- Mode 3 - Potensio RGB.

### 3.4 Panel ADC

Bagian ADC menampilkan:

- Nilai ADC 12-bit (0-4095).
- Konversi tegangan ke Volt.
- Progress bar level ADC.
- Statistik rolling: Min, Max, Avg.

Catatan implementasi:

- Pada Mode 3, tampilan gauge menggunakan nilai terbalik (4095 - adc) agar konsisten dengan logika RGB mode di firmware.

### 3.5 LED Sequence Activity

Panel ini berisi:

- LED0 sampai LED7 (indikator visual realtime).
- Ringkasan jumlah LED menyala.
- Representasi status LED dalam BIN dan HEX.
- Efek scan visual pada kondisi tertentu.

### 3.6 Panel RGB (Khusus Mode 3)

Saat mode 3 aktif, muncul lampu RGB virtual beserta nama warna hasil mapping nilai ADC.

Rentang warna yang digunakan:

- WHITE, MAGENTA, CYAN, YELLOW, BLUE, GREEN, RED.

### 3.7 Grafik Tren Realtime

Tiga grafik yang ditampilkan:

1. CubeMonitor Signal Trend.
2. VAR1 / Count Trend.
3. LED ON Count Trend.

Sumbu X memakai Relative Time (s).

### 3.8 Realtime Gauge Panel

Terdapat 3 ring gauge:

- ADC Raw.
- Voltage.
- Signal Activity.

Gauge menampilkan ringkas kondisi sinyal secara visual dan cepat.

### 3.9 Bottom Information Panels

Terdiri dari tiga panel informasi:

- System Info: family, package, flash, RAM, firmware, toolchain, compiler.
- Pin Configuration: pemetaan pin penting (PA0, PA8, NRST, VDD, VSS).
- NVIC Interrupt Config: daftar IRQ, prioritas, dan priority group.

### 3.10 Notifikasi EXTI

Jika exti_flag aktif, dashboard menampilkan banner peringatan bahwa seluruh LED ON sementara sebelum kembali ke state normal.

## 4. Isi Docs Page (Dokumentasi Laporan)

Docs page berisi section laporan:

1. Pendahuluan.
2. Landasan Teori.
3. Spesifikasi Hardware.
4. Perancangan Sistem.
5. Konfigurasi Peripheral.
6. Firmware dan Kode.
7. Pengujian dan Hasil.
8. Analisis dan Pembahasan.
9. Kesimpulan.
10. Referensi.

Komponen pendukung pada docs page:

- Section title terstruktur.
- Tabel parameter.
- Code block dengan tombol copy.
- Info box bertipe info/warn/note.

## 5. Alur Koneksi Data (Sinkron Implementasi)

Frontend membaca daftar URL WebSocket berurutan:

1. VITE_WS_URL (jika diset).
2. VITE_WS_DIRECT_URL (default ws://localhost:8765/ws).
3. VITE_WS_NODERED_URL (opsional, jika fallback diaktifkan).

Mekanisme runtime:

- Frontend mencoba URL pertama, lalu fallback ke URL berikutnya jika gagal.
- Auto-reconnect berjalan periodik saat koneksi putus.
- Payload dari backend direct dan payload Node-RED diformat ulang agar state dashboard tetap konsisten.
- Jika field signal tidak tersedia, frontend memakai fallback dari adc_value dan data LED state sesuai logika aplikasi.

## 6. Teknologi yang Digunakan

- Frontend: React + Vite.
- Backend: FastAPI + pyOCD (Python).
- Real-time transport: WebSocket.
- Hardware interface: ST-Link ke STM32F401CCUx.

## 7. Guide Deploy dan Menjalankan Sistem

### 7.1 Prasyarat

- Node.js dan npm terpasang.
- Python 3 terpasang.
- ST-Link driver terpasang di mesin backend.
- Perangkat STM32 + ST-Link tersedia (untuk data live).

### 7.2 Setup Frontend (sekali)

Jalankan di root project:

```bash
npm install
```

### 7.3 Setup Backend (sekali)

Masuk ke folder backend lalu install dependency:

```bash
cd src/backend
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
pip install -U pip
pip install -r requirements.txt
```

Linux/macOS:

```bash
source .venv/bin/activate
pip install -U pip
pip install -r requirements.txt
```

### 7.4 Menjalankan Backend

Windows PowerShell:

```powershell
cd src/backend
.\.venv\Scripts\Activate.ps1
python server.py
```

Linux/macOS:

```bash
bash src/start_backend.sh
```

Backend default melayani:

- WebSocket di ws://localhost:8765/ws.
- Endpoint write di http://localhost:8765/write.

### 7.5 Menjalankan Frontend

Di root project:

```bash
npm run dev
```

Lalu buka:

- http://localhost:5173

### 7.6 Konfigurasi Environment Frontend

Buat file .env bila perlu, lalu isi variabel berikut:

```env
VITE_WS_URL=
VITE_WS_DIRECT_URL=ws://localhost:8765/ws
VITE_ENABLE_NODERED_FALLBACK=false
VITE_WS_NODERED_URL=ws://localhost:1880/ws/stm32
```

Catatan:

- Jika memakai backend direct pyOCD, cukup gunakan VITE_WS_DIRECT_URL.
- Aktifkan VITE_ENABLE_NODERED_FALLBACK=true hanya bila memang memakai jalur Node-RED.

### 7.7 Deploy Frontend ke Vercel

Frontend bisa dideploy sebagai static site.

Build command:

```bash
npm run build
```

Konfigurasi umum Vercel:

- Framework preset: Vite.
- Build command: npm run build.
- Output directory: dist.

Penting:

- Set environment variable VITE_WS_URL ke alamat backend publik (ws/wss) agar frontend production terhubung.

### 7.8 Deploy Backend (Bukan di Vercel)

Backend pyOCD tidak cocok dijalankan di Vercel karena membutuhkan akses USB fisik ke ST-Link.

Rekomendasi deploy backend:

1. Jalankan backend di PC lokal/lab mini PC/server fisik yang terhubung ST-Link.
2. Jalankan sebagai service (misalnya systemd pada Linux) agar auto-start saat boot.
3. Gunakan reverse proxy (nginx/traefik/caddy) untuk endpoint WebSocket secure (wss) jika diakses publik.

### 7.9 Troubleshooting Cepat

Jika backend gagal membaca probe atau error kompatibilitas pyOCD, gunakan versi stabil yang dipakai project:

```bash
pip install "pyocd==0.35.0"
```

Jika mode/ADC/LED tidak sinkron setelah update firmware, sesuaikan alamat variabel RAM pada environment backend sebelum menjalankan server.py.

## 8. Poin Presentasi untuk Laporan

Hal yang bisa ditekankan saat presentasi:

- Integrasi embedded dan web monitoring realtime end-to-end.
- Dashboard visual lengkap: numerik, status, trend, dan gauge.
- Mekanisme fallback payload serta reconnect otomatis.
- Pemisahan deploy frontend cloud dan backend hardware-aware.

## 9. Ringkasan

Isi website saat ini sudah mencakup dua kebutuhan utama:

1. Monitoring teknis realtime STM32 berbasis WebSocket.
2. Dokumentasi laporan teknis terstruktur di dalam aplikasi.

Dengan panduan deploy di atas, sistem dapat dijalankan lokal untuk pengujian maupun dipublikasikan (frontend) untuk demo/presentasi.
