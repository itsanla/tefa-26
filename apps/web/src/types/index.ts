export type RoleUser = "admin" | "guru" | "kepsek" | "siswa";

export interface User {
  id: number;
  nama: string;
  email?: string | null;
  username: string;
  password: string;
  role: RoleUser;
  createdAt: string;
  updatedAt: string;
}

export interface Jenis {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  komoditas: Komoditas[];
}

export interface Komoditas {
  id: number;
  id_jenis: number;
  jenis: Jenis;
  nama: string;
  deskripsi: string;
  foto: string;
  satuan: string;
  jumlah: number;
  createdAt: string;
  updatedAt: string;
}

export interface AsalProduksi {
  id: number;
  nama: string;
  createdAt: string;
  updatedAt: string;
}

export interface StokVariabel {
  id: number;
  nama: string;
  jumlah: number;
  jumlah_produksi?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Produksi {
  id: number;
  id_asal: number;
  id_komoditas: number;
  id_stok_variabel: number | null;
  jumlah: number;
  kode_produksi: string;
  harga_persatuan: number;
  harga_per_buah: number;
  ukuran: string;
  kualitas: string;
  createdAt: string;
  updatedAt: string;
  asal_produksi: AsalProduksi;
  komoditas: Komoditas;
  stok_variabel?: StokVariabel | null;
}

export interface PenjualanItem {
  id: number;
  id_penjualan: number;
  id_komodity: number;
  id_produksi: number;
  jumlah_terjual: number;
  berat: number;
  satuan_jual: string;
  harga_satuan: number;
  sub_total: number;
  createdAt: string;
  updatedAt: string;
  komoditas?: Komoditas;
  produksi?: Produksi;
}

export type StatusPembayaran = "lunas" | "angsuran" | "hutang";

export interface PembayaranPenjualan {
  id: number;
  id_penjualan: number;
  jumlah_bayar: number;
  keterangan: string;
  createdAt: string;
  updatedAt: string;
}

export interface Penjualan {
  id: number;
  total_harga: number;
  keterangan: string;
  status: StatusPembayaran;
  total_terbayar: number;
  sisa_bayar?: number;
  createdAt: string;
  updatedAt: string;
  jumlah_produk?: number;
  jumlah_buah?: number;
  total_berat_kg?: number;
  kode_produksi_list?: string[];
  id_komodity?: number;
  jumlah_terjual?: number;
  id_produksi?: number;
  komoditas?: Komoditas;
  produksi?: Produksi;
  items?: PenjualanItem[];
  pembayaran?: PembayaranPenjualan[];
}

export interface Barang {
  id: number;
  nama: string;
  jumlah: number;
  satuan: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransaksiBarang {
  id: number;
  id_barang: number;
  nama: string;
  tanggal: string;
  masuk: number;
  keluar: number;
  jumlah: number;
  keterangan: string;
  createdAt: string;
  updatedAt: string;
}

export interface BahanBaku {
  id: number;
  nama: string;
  satuan: string;
  jumlah: number;
  createdAt: string;
  updatedAt: string;
}

export interface StokHistoriProduksi {
  id: number;
  id_produksi: number | null;
  kode_produksi: string;
  jumlah_sebelum: number;
  jumlah_sesudah: number;
  selisih: number;
  tipe: string;
  keterangan: string;
  createdAt: string;
}
