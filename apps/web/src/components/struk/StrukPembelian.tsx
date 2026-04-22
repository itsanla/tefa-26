export interface StrukData {
  namaKomoditas: string;
  satuanKomoditas: string;
  kodeProduksi: string;
  ukuran: string;
  kualitas: string;
  asalProduksi: string;
  hargaPersatuan: number;
  jumlahTerjual: number;
  totalHarga: number;
  keterangan: string;
  tanggal: Date;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatTanggal(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function printStruk(data: StrukData): void {
  const esc = escapeHtml;

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

  <div class="row"><span class="label">Komoditas</span><span class="value">${esc(data.namaKomoditas)}</span></div>
  <div class="row"><span class="label">Asal Produksi</span><span class="value">${esc(data.asalProduksi)}</span></div>
  <div class="row"><span class="label">Kode Produksi</span><span class="value">${esc(data.kodeProduksi)}</span></div>
  <div class="row"><span class="label">Ukuran</span><span class="value">${esc(data.ukuran)}</span></div>
  <div class="row"><span class="label">Kualitas</span><span class="value">${esc(data.kualitas)}</span></div>

  <div class="divider"></div>

  <div class="row"><span class="label">Harga/Satuan</span><span class="value">${formatRupiah(data.hargaPersatuan)}</span></div>
  <div class="row"><span class="label">Jumlah</span><span class="value">${data.jumlahTerjual} ${esc(data.satuanKomoditas)}</span></div>

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

  w.addEventListener("load", () => { w.focus(); w.print(); }, { once: true });
  // afterprint fires on both print and cancel, ensuring cleanup always happens
  w.addEventListener("afterprint", () => { URL.revokeObjectURL(url); w.close(); }, { once: true });
}
