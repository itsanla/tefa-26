# POS TEFA — Aplikasi Kasir Mobile

> Aplikasi Point-of-Sale (POS) mobile untuk sistem **TEFA-26** (Sistem Manajemen Teaching Factory)  
> SMKN 2 Batusangkar, dibangun dengan Flutter untuk penjualan komoditas real-time.

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](../../LICENSE)
[![Flutter](https://img.shields.io/badge/Flutter-3.0+-blue.svg)](https://flutter.dev)
[![Dart](https://img.shields.io/badge/Dart-3.0+-blue.svg)](https://dart.dev)

---

## Tentang Aplikasi

**POS TEFA** adalah aplikasi mobile kasir yang memungkinkan siswa untuk melakukan transaksi penjualan komoditas dengan cepat dan akurat. Aplikasi ini terintegrasi dengan backend API TEFA-26 melalui Cloudflare Workers.

### Fitur Utama

- **Transaksi Penjualan Real-time** — Input penjualan komoditas dengan multiple items
- **Cetak Struk Termal** — Support printer Bluetooth thermal untuk resi pembelian
- **Riwayat Transaksi** — Lihat log penjualan harian
- **Autentikasi JWT** — Keamanan berbasis JWT token dengan backend API
- **UI/UX Modern** — Antarmuka intuitif untuk operasional cepat

---

## Tech Stack

```
Framework    │ Flutter (Dart)
Platform     │ Android
API          │ Hono.js + Cloudflare Workers (TEFA-26)
Auth         │ JWT HS256
Printing     │ Bluetooth Thermal Printer
```

---

## Struktur Direktori

```
lib/
├── main.dart                 # Entry point aplikasi
├── models/                   # Data models (komoditas, transaksi, user)
├── screens/                  # UI screens (kasir, histori, dashboard)
├── services/                 # API service, auth, printer service
└── utils/                    # Helper functions, constants
```

---

## Persyaratan

- **Flutter**: 3.0 atau lebih baru
- **Dart**: 3.0 atau lebih baru
- **Android SDK**: API 21+

---

## Installasi & Setup

```bash
# Clone repository utama
git clone https://github.com/itsanla/tefa-26.git
cd tefa-26/apps/pos_tefa

# Install dependencies
flutter pub get

# Setup Dart code generation (jika diperlukan)
flutter pub run build_runner build

# Jalankan aplikasi di emulator/device
flutter run

# Build APK untuk production
flutter build apk --release

# Build iOS untuk production
flutter build ios --release
```

---

## Konfigurasi

Update file konfigurasi untuk menyesuaikan dengan environment:

```dart
// lib/utils/constants.dart
const String API_BASE_URL = 'https://api.tefa26.example.com';
```

---

## Pengembangan

### Setup Development Environment

```bash
pnpm install
flutter pub get
```

### Menjalankan di Debug Mode

```bash
flutter run -v
```

### Testing

```bash
flutter test
```

### Build APK Development

```bash
flutter build apk --debug
```

---

## Integrasi dengan TEFA-26

**POS TEFA** adalah bagian dari ekosistem TEFA-26:

- **API Backend**: [apps/api/](../api/) — Backend API berbasis Hono.js + Cloudflare Workers
- **Web Dashboard**: [apps/web/](../web/) — Dashboard admin & laporan (Next.js)
- **Documentation**: [docs/](../../docs/) — Dokumentasi lengkap sistem

### Endpoint API yang Digunakan

- `POST /auth/login` — Autentikasi pengguna
- `GET /komoditas` — Daftar komoditas yang dijual
- `POST /penjualan` — Submit transaksi penjualan
- `GET /penjualan/history` — Riwayat transaksi pengguna

Referensi lengkap: [docs/api-reference.md](../../docs/api-reference.md)

---

## Troubleshooting

### Printer Tidak Terdeteksi

```bash
# Cek izin Bluetooth pada manifest
adb shell dumpsys package com.example.pos_tefa | grep PERMISSION
```

### Koneksi API Timeout

- Pastikan device terhubung ke internet
- Verifikasi API_BASE_URL di constants.dart
- Check backend logs

### Build Error

```bash
# Clean build artifacts
flutter clean
flutter pub get
flutter pub run build_runner clean
flutter pub run build_runner build
```

---

## Lisensi

ISC © 2024 SMKN 2 Batusangkar

---

## Informasi Lebih Lanjut

📖 Baca dokumentasi lengkap: [TEFA-26 Main Repository](../../README.md)  
🐛 Report issues: [GitHub Issues](https://github.com/itsanla/tefa-26/issues)
