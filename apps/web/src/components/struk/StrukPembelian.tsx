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
  total_harga: number;
  keterangan: string;
  created_at: Date | string;
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

  const singleItem = firstItem;

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
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Struk Pembelian</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px;
      color: #000;
      line-height: 1.4;
    }
    .center { text-align: center; word-wrap: break-word; }
    .bold { font-weight: bold; }
    .divider { border-top: 1px dashed #000; margin: 4px 0; page-break-after: avoid; }
    .row { display: flex; justify-content: space-between; margin: 2px 0; word-wrap: break-word; page-break-inside: avoid; }
    .label { flex: 1; word-wrap: break-word; overflow-wrap: break-word; }
    .value { text-align: right; word-wrap: break-word; overflow-wrap: break-word; }
    .item-block { margin: 4px 0 6px; page-break-inside: avoid; }
    .item-title { font-weight: bold; margin: 2px 0 4px; font-size: 10px; page-break-after: avoid; }
    .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 13px; margin-top: 4px; page-break-inside: avoid; }
    .footer { text-align: center; margin-top: 8px; font-size: 10px; page-break-before: avoid; }
    @media print {
      @page {
        size: 58mm auto;
        margin: 0;
        padding: 0;
      }
      html, body {
        width: 58mm;
        margin: 0;
        padding: 2mm;
        widows: 2;
        orphans: 2;
      }
      body {
        background: white;
        color: black;
      }
      * {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="center bold" style="font-size:13px;">SMK NEGERI 2 BATUSANGKAR</div>
  <div class="center" style="font-size:10px;">Teaching Factory (TEFA)</div>
  <div class="divider"></div>
  <div class="center" style="font-size:10px;">${formatTanggal(data.created_at)}</div>
  <div class="divider"></div>

  ${hasMultiItems
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
    <span>${formatRupiah(data.total_harga)}</span>
  </div>

  <div class="divider"></div>

  ${data.keterangan ? `<div style="font-size:10px;margin:4px 0;">Keterangan :<br>${esc(data.keterangan)}</div><div class="divider"></div>` : ""}

  <div class="footer">Terima kasih atas pembelian Anda!</div>
  <div class="footer">-- SMKN 2 Batusangkar --</div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  
  // Calculate center position
  const width = 800;
  const height = 700;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;
  
  const w = window.open(
    url,
    "_blank",
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
  );

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
