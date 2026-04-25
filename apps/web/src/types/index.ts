export type RoleUser = "admin" | "guru" | "kepsek" | "siswa";

export interface User {
  id: number;
  nama: string;
  email: string;
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

export interface Produksi {
  id: number;
  id_asal: number;
  id_komoditas: number;
  jumlah: number;
  kode_produksi: string;
  harga_persatuan: number;
  ukuran: string;
  kualitas: string;
  createdAt: string;
  updatedAt: string;
  asal_produksi: AsalProduksi;
  komoditas: Komoditas;
}

export interface PenjualanItem {
  id: number;
  id_penjualan: number;
  id_komodity: number;
  id_produksi: number;
  jumlah_terjual: number;
  harga_satuan: number;
  sub_total: number;
  createdAt: string;
  updatedAt: string;
  komoditas?: Komoditas;
  produksi?: Produksi;
}

export interface Penjualan {
  id: number;
  total_harga: number;
  keterangan: string;
  createdAt: string;
  updatedAt: string;
  jumlah_produk?: number;
  kode_produksi_list?: string[];
  id_komodity?: number;
  jumlah_terjual?: number;
  id_produksi?: number;
  komoditas?: Komoditas;
  produksi?: Produksi;
  items?: PenjualanItem[];
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
