#!/bin/bash

# Script untuk seeding database lokal
# Usage: ./seed-local.sh

set -e

echo "🌱 Starting local database seeding..."
echo ""

# Array of seeder files in order
SEEDERS=(
  "01_users.sql"
  "02_jenis.sql"
  "03_asal_produksi.sql"
  "04_komoditas.sql"
  "05_produksi.sql"
  "06_penjualan.sql"
  "07_barang.sql"
  "08_transaksi_barang.sql"
)

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Counter for progress
TOTAL=${#SEEDERS[@]}
CURRENT=0

# Execute each seeder
for seeder in "${SEEDERS[@]}"; do
  CURRENT=$((CURRENT + 1))
  echo "[$CURRENT/$TOTAL] Executing $seeder..."
  
  if [ -f "$SCRIPT_DIR/$seeder" ]; then
    pnpm wrangler d1 execute DB --local --file="drizzle/seeder/$seeder"
    echo "✅ $seeder completed"
    echo ""
  else
    echo "⚠️  Warning: $seeder not found, skipping..."
    echo ""
  fi
done

echo "✨ Local seeding completed successfully!"
echo ""
echo "You can now start your development server with:"
echo "  pnpm dev"
