# Perubahan API — Fitur Satuan Jual & Harga per Buah

**Tanggal:** 2026-05-18  
**Versi:** setelah commit `092e7be`

Dokumen ini merangkum seluruh perubahan request body dan response API yang perlu diketahui mobile developer. Semua perubahan bersifat **backward-compatible** — field baru opsional di request, dan penambahan field di response tidak merusak parsing yang sudah ada.

---

## Latar Belakang

Sebelumnya harga penjualan hanya bisa ditentukan berdasarkan **berat (kilogram)**. Fitur baru menambahkan opsi harga berdasarkan **jumlah buah**, sehingga:

- Tabel `Produksi` menyimpan dua harga: `harga_persatuan` (per kg) dan `harga_per_buah` (per buah).
- Tabel `PenjualanItem` menyimpan `satuan_jual` ("kilogram" atau "buah") untuk menandai mode harga yang dipakai saat transaksi.

---

## 1. `GET /produksi` & `GET /produksi/:id`

### Response — tambah field `harga_per_buah`

```diff
{
  "id": 1,
  "kode_produksi": "PROD-001",
  "kualitas": "Premium",
  "harga_persatuan": 15000,
+ "harga_per_buah": 5000,
  "jumlah": 100,
  "asal_produksi": { "id": 1, "nama": "Greenhouse 4" },
  "komoditas": { "id": 2, "nama": "Greenigal" }
}
```

---

## 2. `POST /produksi` — Tambah produksi baru

### Request Body

```diff
{
  "id_asal": 1,
  "id_komoditas": 2,
  "kode_produksi": "PROD-001",
  "kualitas": "Premium",
  "jumlah_diproduksi": 100,
  "harga_persatuan": 15000,
+ "harga_per_buah": 5000
}
```

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `harga_per_buah` | integer | Tidak | Default `0`. Isi jika produk ini bisa dijual per buah. |

---

## 3. `PUT /produksi/:id` — Update produksi

### Request Body

```diff
{
  "id_asal": 1,
  "kode_produksi": "PROD-001",
  "kualitas": "Premium",
  "jumlah_diproduksi": 100,
  "harga_persatuan": 15000,
+ "harga_per_buah": 5000,
  "keterangan": "Alasan update"
}
```

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `harga_per_buah` | integer | Tidak | Default `0`. |

---

## 4. `POST /penjualan` — Buat transaksi penjualan

### Request Body — tambah `satuan_jual` per item

Field `satuan_jual` menentukan bagaimana `sub_total` dihitung. Tersedia dua mode:

#### Mode kilogram (default — perilaku lama)

```json
{
  "keterangan": "Nama pembeli",
  "status": "lunas",
  "items": [
    {
      "id_komodity": 1,
      "id_produksi": 3,
      "jumlah_terjual": 5,
      "berat": 2.5,
      "satuan_jual": "kilogram"
    }
  ]
}
```

- `berat` **wajib** (> 0)
- `sub_total = harga_persatuan × berat`

#### Mode buah (baru)

```json
{
  "keterangan": "Nama pembeli",
  "status": "lunas",
  "items": [
    {
      "id_komodity": 1,
      "id_produksi": 3,
      "jumlah_terjual": 5,
      "satuan_jual": "buah"
    }
  ]
}
```

- `berat` **tidak perlu dikirim** (server otomatis set ke `0`)
- `sub_total = harga_per_buah × jumlah_terjual`

| Field | Tipe | Wajib | Nilai | Keterangan |
|---|---|---|---|---|
| `satuan_jual` | string | Tidak | `"kilogram"` / `"buah"` | Default `"kilogram"` jika tidak dikirim |
| `berat` | float | Kondisional | > 0 | Wajib jika `satuan_jual = "kilogram"`, abaikan jika `"buah"` |

> **Backward-compatible:** jika `satuan_jual` tidak dikirim, server anggap `"kilogram"` sehingga request lama tetap valid.

---

## 5. `PUT /penjualan/:id` — Update transaksi penjualan

Perubahan identik dengan `POST /penjualan` — setiap item dapat menyertakan `satuan_jual`.

---

## 6. `GET /penjualan/:id` — Detail transaksi

### Response — tambah `satuan_jual` di setiap item & `harga_per_buah` di produksi

```diff
{
  "id": 10,
  "total_harga": 25000,
  "items": [
    {
      "id": 1,
      "jumlah_terjual": 5,
      "berat": 2.5,
+     "satuan_jual": "kilogram",
      "harga_satuan": 10000,
      "sub_total": 25000,
      "komoditas": { "id": 1, "nama": "Greenigal" },
      "produksi": {
        "id": 3,
        "kode_produksi": "PROD-001",
        "harga_persatuan": 10000,
+       "harga_per_buah": 3000
      }
    }
  ]
}
```

---

## Ringkasan Semua Endpoint yang Berubah

| Endpoint | Tipe | Field Baru |
|---|---|---|
| `GET /produksi` | Response | `harga_per_buah` |
| `GET /produksi/:id` | Response | `harga_per_buah` |
| `POST /produksi` | Request body | `harga_per_buah` (opsional) |
| `PUT /produksi/:id` | Request body | `harga_per_buah` (opsional) |
| `POST /penjualan` | Request body (per item) | `satuan_jual` (opsional) |
| `PUT /penjualan/:id` | Request body (per item) | `satuan_jual` (opsional) |
| `GET /penjualan/:id` | Response (per item) | `satuan_jual`, `harga_per_buah` (di objek produksi) |

---

## Migrasi Database

File migrasi: `apps/api/drizzle/0002_satuan_jual_harga_per_buah.sql`

```sql
ALTER TABLE `Produksi` ADD `harga_per_buah` integer NOT NULL DEFAULT 0;
ALTER TABLE `PenjualanItem` ADD `satuan_jual` text NOT NULL DEFAULT 'kilogram';
```

Wajib dijalankan sebelum deploy versi ini ke server.
