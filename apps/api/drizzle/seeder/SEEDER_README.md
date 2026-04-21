# Database Seeder Scripts

Script untuk mempermudah seeding database lokal dan remote.

## Prerequisites

Pastikan Anda sudah:
- Install dependencies: `pnpm install`
- Setup wrangler: `pnpm wrangler login`
- Sudah menjalankan migration: `pnpm db:migrate:local` atau `pnpm db:migrate:remote`

## Usage

### Seeding Local Database

```bash
cd apps/api/drizzle/seeder
./seed-local.sh
```

Atau dari root project:
```bash
cd apps/api && ./drizzle/seeder/seed-local.sh
```

### Seeding Remote Database (Production)

⚠️ **WARNING**: Ini akan seed data ke production database!

```bash
cd apps/api/drizzle/seeder
./seed-remote.sh
```

Script akan meminta konfirmasi sebelum melanjutkan.

## Seeder Files

Script akan menjalankan seeder dalam urutan berikut:

1. `01_users.sql` - User accounts (admin, guru, siswa)
2. `02_jenis.sql` - Jenis komoditas
3. `03_asal_produksi.sql` - Asal produksi
4. `04_komoditas.sql` - Data komoditas
5. `05_produksi.sql` - Data produksi
6. `06_penjualan.sql` - Data penjualan
7. `07_barang.sql` - Data barang gudang
8. `08_transaksi_barang.sql` - Transaksi barang

## Troubleshooting

### Permission Denied
```bash
chmod +x seed-local.sh seed-remote.sh
```

### Command Not Found: pnpm
Pastikan pnpm sudah terinstall:
```bash
npm install -g pnpm
```

### Wrangler Not Authenticated
```bash
pnpm wrangler login
```

## Manual Seeding

Jika ingin menjalankan seeder tertentu saja:

**Local:**
```bash
pnpm wrangler d1 execute DB --local --file=drizzle/seeder/01_users.sql
```

**Remote:**
```bash
pnpm wrangler d1 execute DB --remote --file=drizzle/seeder/01_users.sql
```
