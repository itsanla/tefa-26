export interface StrukItemData {
  namaKomoditas: string;
  satuanKomoditas: string;
  kodeProduksi: string;
  ukuran: string;
  kualitas: string;
  asalProduksi: string;
  hargaPersatuan: number;
  jumlahTerjual: number;
  totalHarga: number;
}

type LegacyStrukItem = {
  namaKomoditas?: string;
  satuanKomoditas?: string;
  kodeProduksi?: string;
  ukuran?: string;
  kualitas?: string;
  asalProduksi?: string;
  hargaPersatuan?: number;
  jumlahTerjual?: number;
  totalHarga?: number;
  harga_satuan?: number;
  sub_total?: number;
  komoditas?: {
    nama?: string;
    satuan?: string;
  };
  produksi?: {
    kode_produksi?: string;
    ukuran?: string;
    kualitas?: string;
    asal_produksi?: {
      nama?: string;
    };
  };
};

export interface StrukData {
  items?: LegacyStrukItem[];
  namaKomoditas?: string;
  satuanKomoditas?: string;
  kodeProduksi?: string;
  ukuran?: string;
  kualitas?: string;
  asalProduksi?: string;
  hargaPersatuan?: number;
  jumlahTerjual?: number;
  totalHarga: number;
  keterangan: string;
  tanggal: Date | string;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatTanggal(date: Date | string): string {
  const normalizedDate = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(normalizedDate);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeItem(item: LegacyStrukItem): StrukItemData {
  return {
    namaKomoditas: item.namaKomoditas ?? item.komoditas?.nama ?? "-",
    satuanKomoditas: item.satuanKomoditas ?? item.komoditas?.satuan ?? "-",
    kodeProduksi: item.kodeProduksi ?? item.produksi?.kode_produksi ?? "-",
    ukuran: item.ukuran ?? item.produksi?.ukuran ?? "-",
    kualitas: item.kualitas ?? item.produksi?.kualitas ?? "-",
    asalProduksi:
      item.asalProduksi ?? item.produksi?.asal_produksi?.nama ?? "-",
    hargaPersatuan: item.hargaPersatuan ?? item.harga_satuan ?? 0,
    jumlahTerjual: item.jumlahTerjual ?? 0,
    totalHarga: item.totalHarga ?? item.sub_total ?? 0,
  };
}

export function printStruk(data: StrukData): void {
  const esc = escapeHtml;
  const items = (data.items ?? []).map(normalizeItem);
  const hasMultiItems = items.length > 1;
  const firstItem = items[0] ?? null;

  const singleItem = firstItem ?? {
    namaKomoditas: data.namaKomoditas ?? "-",
    satuanKomoditas: data.satuanKomoditas ?? "-",
    kodeProduksi: data.kodeProduksi ?? "-",
    ukuran: data.ukuran ?? "-",
    kualitas: data.kualitas ?? "-",
    asalProduksi: data.asalProduksi ?? "-",
    hargaPersatuan: data.hargaPersatuan ?? 0,
    jumlahTerjual: data.jumlahTerjual ?? 0,
    totalHarga: data.totalHarga ?? 0,
  };

  const renderItem = (item: StrukItemData, index: number) => `
  <div class="item-block">
    ${items.length > 1 ? `<div class="item-title">Item ${index + 1}</div>` : ""}
    <div class="row"><span class="label">Komoditas</span><span class="value">${esc(item.namaKomoditas)}</span></div>
    <div class="row"><span class="label">Asal Produksi</span><span class="value">${esc(item.asalProduksi)}</span></div>
    <div class="row"><span class="label">Kode Produksi</span><span class="value">${esc(item.kodeProduksi)}</span></div>
    <div class="row"><span class="label">Ukuran</span><span class="value">${esc(item.ukuran)}</span></div>
    <div class="row"><span class="label">Kualitas</span><span class="value">${esc(item.kualitas)}</span></div>
    <div class="row"><span class="label">Harga/Satuan</span><span class="value">${formatRupiah(item.hargaPersatuan)}</span></div>
    <div class="row"><span class="label">Jumlah</span><span class="value">${item.jumlahTerjual} ${esc(item.satuanKomoditas)}</span></div>
    <div class="row"><span class="label">Subtotal</span><span class="value">${formatRupiah(item.totalHarga)}</span></div>
  </div>`;

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Struk Pembelian</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px;
      width: 58mm;
      margin: 0 auto;
      padding: 4mm;
      color: #000;
    }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .divider { border-top: 1px dashed #000; margin: 4px 0; }
    .row { display: flex; justify-content: space-between; margin: 2px 0; }
    .label { flex: 1; }
    .value { text-align: right; }
    .item-block { margin: 4px 0 6px; }
    .item-title { font-weight: bold; margin: 2px 0 4px; font-size: 10px; }
    .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 13px; margin-top: 4px; }
    .footer { text-align: center; margin-top: 8px; font-size: 10px; }
    @media print {
      @page {
        width: 58mm;
        height: auto;
        margin: 0;
      }
      body { width: 58mm; margin: 0; padding: 2mm; }
    }
  </style>
</head>
<body>
  <div class="center bold" style="font-size:13px;">SMK NEGERI 2 BATUSANGKAR</div>
  <div class="center" style="font-size:10px;">Teaching Factory (TEFA)</div>
  <div class="divider"></div>
  <div class="center" style="font-size:10px;">${formatTanggal(data.tanggal)}</div>
  <div class="divider"></div>

  ${
    hasMultiItems
      ? `
      <div class="bold" style="margin-bottom:4px;font-size:10px;">Detail Item</div>
      ${items.map((item, index) => renderItem(item, index)).join('<div class="divider"></div>')}
    `
      : `
      <div class="row"><span class="label">Komoditas</span><span class="value">${esc(singleItem.namaKomoditas)}</span></div>
      <div class="row"><span class="label">Asal Produksi</span><span class="value">${esc(singleItem.asalProduksi)}</span></div>
      <div class="row"><span class="label">Kode Produksi</span><span class="value">${esc(singleItem.kodeProduksi)}</span></div>
      <div class="row"><span class="label">Ukuran</span><span class="value">${esc(singleItem.ukuran)}</span></div>
      <div class="row"><span class="label">Kualitas</span><span class="value">${esc(singleItem.kualitas)}</span></div>

      <div class="divider"></div>

      <div class="row"><span class="label">Harga/Satuan</span><span class="value">${formatRupiah(singleItem.hargaPersatuan)}</span></div>
      <div class="row"><span class="label">Jumlah</span><span class="value">${singleItem.jumlahTerjual} ${esc(singleItem.satuanKomoditas)}</span></div>
    `
  }

  <div class="divider"></div>

  <div class="total-row">
    <span>TOTAL</span>
    <span>${formatRupiah(data.totalHarga)}</span>
  </div>

  <div class="divider"></div>

  ${data.keterangan ? `<div style="font-size:10px;margin:4px 0;">Ket: ${esc(data.keterangan)}</div><div class="divider"></div>` : ""}

  <div class="footer">Terima kasih atas pembelian Anda!</div>
  <div class="footer">-- SMKN 2 Batusangkar --</div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank", "width=320,height=600,scrollbars=no");

  if (!w) {
    URL.revokeObjectURL(url);
    return;
  }

  w.addEventListener(
    "load",
    () => {
      w.focus();
      w.print();
    },
    { once: true },
  );
  // afterprint fires on both print and cancel, ensuring cleanup always happens
  w.addEventListener(
    "afterprint",
    () => {
      URL.revokeObjectURL(url);
      w.close();
    },
    { once: true },
  );
}
