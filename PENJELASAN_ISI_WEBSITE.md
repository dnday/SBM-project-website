# Penjelasan Isi Website SBM Monitor

## 1. Gambaran Umum Website

Website ini adalah dashboard monitoring real-time untuk sistem embedded STM32F401CCUx. Data dari mikrokontroler dibaca lewat backend (FastAPI + pyOCD + ST-Link), lalu dikirim ke frontend React melalui WebSocket.

Tujuan utama website:

- Menampilkan status sistem STM32 secara live.
- Menampilkan nilai ADC, mode kerja, status LED, dan statistik sinyal.
- Menyediakan halaman dokumentasi laporan teknis dalam satu aplikasi.

## 2. Struktur Halaman Website

Website terdiri dari 2 halaman utama:

1. Dashboard Monitoring (halaman utama).
2. Halaman Dokumentasi Laporan SBM.

Navigasi ke halaman dokumentasi dilakukan melalui tombol "Buka Dokumentasi Laporan SBM" di bagian bawah dashboard.

## 3. Isi Halaman Dashboard Monitoring

### 3.1 Header Status Sistem

Bagian header menampilkan identitas sistem dan status koneksi, meliputi:

- Nama aplikasi: SBM Monitor.
- Informasi perangkat: STM32F401CCUx.
- Status koneksi backend: CONNECTED / BACKEND OFFLINE / WAITING.
- Informasi ringkas: MODE, VAR1, jumlah LED ON, status EXTI, uptime.

### 3.2 Overlay Menunggu Koneksi ST-Link

Jika ST-Link belum terhubung, website menampilkan overlay "Menunggu ST-Link".
Fungsi overlay:

- Memberi instruksi untuk menyambungkan kabel ST-Link.
- Menampilkan status koneksi backend (connecting/open/closed/error).
- Mengunci interaksi sementara agar user tahu sistem belum siap.

### 3.3 Kartu Monitoring ADC

Panel ADC menampilkan:

- Nilai ADC mentah (0-4095).
- Konversi tegangan (Volt).
- Progress bar level ADC.
- Statistik rolling: nilai minimum, maksimum, dan rata-rata.

### 3.4 Panel LED Sequence Activity

Panel ini menampilkan kondisi LED 0 sampai LED 7 secara visual.
Informasi yang ditampilkan:

- LED aktif/nonaktif dalam bentuk lamp indicator.
- Ringkasan mode aktif (Mode 0, 1, 2, atau 3).
- Representasi LED dalam format biner dan heksadesimal.
- Jumlah LED yang sedang ON.

### 3.5 Panel RGB (Khusus Mode 3)

Pada mode 3, website menampilkan lampu RGB virtual.
Karakteristik:

- Warna berubah berdasarkan rentang nilai ADC.
- Menampilkan nama warna hasil mapping (misal: RED, GREEN, BLUE, dst).
- Menampilkan status ACTIVE/STANDBY.

### 3.6 Grafik Tren Real-time

Ada 3 grafik tren utama:

1. CubeMonitor Signal Trend.
2. VAR1 / Count Trend.
3. LED ON Count Trend.

Semua grafik menampilkan perubahan data terhadap waktu relatif (detik) untuk memudahkan analisis dinamika sistem.

### 3.7 Realtime Gauge Panel

Website menampilkan 3 gauge melingkar:

- ADC Raw Gauge.
- Voltage Gauge.
- Signal Activity Gauge.

Gauge membantu pembacaan cepat kondisi sinyal secara visual.

### 3.8 Informasi Sistem (Bottom Row)

Bagian bawah dashboard berisi informasi statis teknis:

- System Info (MCU family, flash, RAM, firmware, toolchain, compiler).
- Pin Configuration (fungsi pin utama seperti PA0, PA8, NRST, VDD, VSS).
- NVIC Interrupt Config (daftar interrupt dan prioritas).

### 3.9 Notifikasi EXTI

Saat EXTI aktif, muncul banner notifikasi bahwa semua LED ON selama periode tertentu, lalu kembali ke kondisi semula.

## 4. Isi Halaman Dokumentasi Laporan SBM

Halaman dokumentasi memuat konten laporan teknis terstruktur dalam beberapa bab:

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

Komponen presentasi pada halaman dokumentasi:

- Judul section dan sub-section.
- Tabel data teknis.
- Blok kode (code block) dengan tombol copy.
- Info box (info/warn/note) untuk catatan penting.

## 5. Alur Data Website

Alur kerja data pada website:

1. Backend membaca nilai memori/variabel STM32 via pyOCD + ST-Link.
2. Backend mengirim data secara periodik melalui WebSocket.
3. Frontend menerima payload, melakukan normalisasi data, lalu update state.
4. Komponen dashboard (angka, indikator, gauge, grafik) diperbarui real-time.
5. Jika koneksi putus, frontend melakukan auto-reconnect.

## 6. Teknologi yang Digunakan

- Frontend: React + Vite.
- Backend: FastAPI (Python) + pyOCD.
- Komunikasi real-time: WebSocket.
- Integrasi perangkat: ST-Link ke STM32F401CCUx.

## 7. Poin Nilai Tambah untuk Laporan

Hal-hal yang bisa ditekankan dalam laporan:

- Integrasi web app dengan perangkat embedded secara real-time.
- Visualisasi data multi-panel (angka, status, gauge, trend chart).
- Penanganan kondisi offline dan recovery koneksi otomatis.
- Penyatuan dashboard monitoring dan halaman dokumentasi dalam satu website.

## 8. Ringkasan Singkat

Secara isi, website SBM Monitor bukan hanya tampilan data ADC, tetapi platform monitoring terintegrasi yang memuat:

- Status koneksi hardware,
- Telemetri sistem real-time,
- Visualisasi mode dan LED,
- Statistik dan grafik historis,
- Serta dokumentasi laporan teknis yang siap presentasi.
