"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Receipt,
  AlertCircle,
  Package,
} from "lucide-react";
import { Komoditas, Penjualan, Produksi } from "@/types";
import { DataTable } from "@/components/table/DataTable";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import ToggleDark from "@/components/common/ToggleDark";
import { toast } from "sonner";
import { apiRequest } from "@/services/api.service";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { printStruk } from "@/components/struk/StrukPembelian";

export default function KasirPage() {
  const username =
    typeof window != "undefined"
      ? (document.cookie
          .split("; ")
          .find((row) => row.startsWith("username="))
          ?.split("=")[1] ?? "User")
      : null;

  const [produksi, setProduksi] = useState<Produksi[]>([]);
  const [penjualan, setPenjualan] = useState<Penjualan[]>([]);

  const [showProdukDropdown, setShowProdukDropdown] = useState(false);
  const [showProduksiDropdown, setShowProduksiDropdown] = useState(false);

  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<{
    keterangan: string;
    id_komodity: number;
    id_produksi: number;
    jumlah_terjual: number;
    total_harga: number;
  }>({
    keterangan: "",
    id_komodity: 0,
    id_produksi: 0,
    jumlah_terjual: 0,
    total_harga: 0,
  });

  const [showPenjualan, setShowPenjualan] = useState(false);
  const [cetakStruk, setCetakStruk] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get unique komoditas from produksi data - Fixed property name
  const uniqueKomoditas = produksi.reduce((acc, prod) => {
    const existing = acc.find((item) => item.id === prod.komoditas?.id);
    if (!existing && prod.komoditas) {
      acc.push(prod.komoditas);
    }
    return acc;
  }, [] as Komoditas[]);

  // Get filtered produksi based on selected komoditas - Fixed property name
  const filteredProduksiByKomoditas = formData.id_komodity
    ? produksi.filter((prod) => prod.komoditas?.id === formData.id_komodity)
    : produksi;

  useEffect(() => {
    const fetchPreference = async () => {
      try {
        const data = await apiRequest({ endpoint: "/user/preference" });
        if (typeof data?.print_struk === "boolean") {
          setCetakStruk(data.print_struk);
        }
      } catch {
        // silently keep default
      }
    };

    const fetchData = async () => {
      try {
        setError(null);
        const [dataPenjualan, dataProduksi] = await Promise.all([
          apiRequest({ endpoint: "/penjualan" }),
          apiRequest({ endpoint: "/produksi" }),
        ]);
        setPenjualan(dataPenjualan);
        setProduksi(dataProduksi);
      } catch (error) {
        console.error("Error fetching data:", error);
        const errorMessage =
          "Gagal memuat data. Periksa koneksi internet Anda.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setShowProdukDropdown(false);
        setShowProduksiDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    fetchPreference();
    fetchData();

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.id_komodity) {
      errors.id_komodity = "Produk harus dipilih";
    }

    if (!formData.id_produksi) {
      errors.id_produksi = "Kode produksi harus dipilih";
    }

    if (!formData.jumlah_terjual || formData.jumlah_terjual <= 0) {
      errors.jumlah_terjual = "Jumlah harus lebih dari 0";
    }

    // Validasi stok tersedia dari produksi
    if (formData.id_produksi && formData.jumlah_terjual) {
      const selectedProduksi = produksi.find(
        (p) => p.id === formData.id_produksi,
      );
      if (
        selectedProduksi &&
        formData.jumlah_terjual > selectedProduksi.jumlah
      ) {
        errors.jumlah_terjual = `Stok tidak mencukupi. Tersedia: ${selectedProduksi.jumlah} ${selectedProduksi.komoditas?.satuan}`;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCetakStrukChange = (checked: boolean) => {
    setCetakStruk(checked);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        await apiRequest({
          endpoint: "/user/preference",
          method: "PUT",
          data: { print_struk: checked },
        });
      } catch {
        // silently ignore preference save errors
      }
    }, 500);
  };

  const NUMBER_FIELDS = ["jumlah_terjual", "id_komodity", "id_produksi"];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      let newValue: string | number = value;

      if (NUMBER_FIELDS.includes(name)) {
        const numValue = Number(value);
        newValue = isNaN(numValue) ? 0 : numValue; // Handle NaN for number fields
      }

      let newFormData = {
        ...prev,
        [name]: newValue,
      };

      if (name === "jumlah_terjual" || name === "id_produksi") {
        const currentIdProduksi =
          name === "id_produksi" ? (newValue as number) : prev.id_produksi;
        const currentJumlahTerjual =
          name === "jumlah_terjual"
            ? (newValue as number)
            : prev.jumlah_terjual;

        const selectedProduksi = produksi.find(
          (p) => p.id === currentIdProduksi,
        );

        // Only set default total_harga if it hasn't been manually set or if id_produksi/jumlah_terjual changes
        if (
          selectedProduksi &&
          currentJumlahTerjual > 0 &&
          (name === "id_produksi" ||
            name === "jumlah_terjual" ||
            prev.total_harga === 0)
        ) {
          newFormData.total_harga =
            selectedProduksi.harga_persatuan * currentJumlahTerjual;
        } else if (!selectedProduksi || currentJumlahTerjual <= 0) {
          newFormData.total_harga = 0;
        }
      } else if (name === "total_harga") {
        // Allow manual input for total_harga
        const numValue = Number(value);
        newFormData.total_harga = isNaN(numValue) ? 0 : numValue;
      }

      return newFormData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Mohon periksa kembali data yang diisi");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const requestBody = {
        keterangan: formData.keterangan,
        id_komodity: formData.id_komodity,
        id_produksi: formData.id_produksi,
        jumlah_terjual: formData.jumlah_terjual,
        total_harga: formData.total_harga,
      };

      await apiRequest({
        endpoint: "/penjualan",
        method: "POST",
        data: requestBody,
      });

      if (cetakStruk) {
        const selectedKomoditas = produksi.find(
          (p) => p.id === formData.id_produksi,
        )?.komoditas;
        const selectedProd = produksi.find(
          (p) => p.id === formData.id_produksi,
        );
        if (selectedKomoditas && selectedProd) {
          printStruk({
            namaKomoditas: selectedKomoditas.nama,
            satuanKomoditas: selectedKomoditas.satuan,
            kodeProduksi: selectedProd.kode_produksi,
            ukuran: selectedProd.ukuran,
            kualitas: selectedProd.kualitas,
            asalProduksi: selectedProd.asal_produksi?.nama ?? "-",
            hargaPersatuan: selectedProd.harga_persatuan,
            jumlahTerjual: formData.jumlah_terjual,
            totalHarga: formData.total_harga,
            keterangan: formData.keterangan,
            tanggal: new Date(),
          });
        }
      }

      // Refresh data
      const [dataPenjualan, dataProduksi] = await Promise.all([
        apiRequest({ endpoint: "/penjualan" }),
        apiRequest({ endpoint: "/produksi" }),
      ]);
      setPenjualan(dataPenjualan);
      setProduksi(dataProduksi);

      // Reset form
      setFormData({
        keterangan: "",
        id_komodity: 0,
        id_produksi: 0,
        jumlah_terjual: 0,
        total_harga: 0,
      });
      setFormErrors({});

      toast.success("Transaksi berhasil disimpan");
    } catch (error) {
      console.error("Error creating penjualan:", error);
      const errorMessage = "Transaksi gagal disimpan. Silakan coba lagi.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintClick = async (id: number) => {
    try {
      setLoading(true);
      const {
        namaKomoditas,
        satuanKomoditas,
        kodeProduksi,
        ukuran,
        kualitas,
        asalProduksi,
        hargaPersatuan,
        jumlahTerjual,
        totalHarga,
        keterangan,
        tanggal,
      } = await apiRequest({
        endpoint: `/penjualan/${id}`,
      });

      printStruk({
        namaKomoditas,
        satuanKomoditas,
        kodeProduksi,
        ukuran,
        kualitas,
        asalProduksi,
        hargaPersatuan,
        jumlahTerjual,
        totalHarga,
        keterangan,
        tanggal: new Date(tanggal),
      });
    } catch (err) {
      console.error("Gagal ambil data Penjualan:", err);
      toast.error("Gagal mengambil data penjualan.");
    } finally {
      setLoading(false);
    }
  };

  const penjualanColumns = [
    {
      header: "Produk",
      accessorKey: "komoditas" as keyof Penjualan,
      cell: (item: Penjualan) => (
        <div className="flex items-center gap-2">
          <Package size={16} className="text-gray-500" />
          <span className="font-medium">{item.komoditas?.nama}</span>
        </div>
      ),
    },
    {
      header: "Kode Produksi",
      accessorKey: "produksi" as keyof Penjualan,
      cell: (item: Penjualan) => (
        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-mono">
          {item.produksi?.kode_produksi}
        </span>
      ),
    },
    {
      header: "Jumlah Terjual",
      accessorKey: "jumlah_terjual" as keyof Penjualan,
      cell: (item: Penjualan) => (
        <span className="font-medium">
          {item.jumlah_terjual} {item.komoditas?.satuan}
        </span>
      ),
    },
    {
      header: "Total harga",
      accessorKey: "total_harga" as keyof Penjualan,
      cell: (item: Penjualan) => (
        <span className="font-medium">
          {item.total_harga
            ? `Rp${new Intl.NumberFormat("id-ID").format(item.total_harga)},-`
            : "-"}
        </span>
      ),
    },
    {
      header: "Keterangan",
      accessorKey: "keterangan" as keyof Penjualan,
      cell: (item: Penjualan) => (
        <span className="text-gray-600 dark:text-gray-400">
          {item.keterangan || "-"}
        </span>
      ),
    },
    {
      header: "Aksi",
      accessorKey: "id" as keyof Penjualan,
      cell: (item: Penjualan) => (
        <button
          className="bg-blue-600 px-4 py-3 rounded text-white"
          onClick={() => handlePrintClick(item.id)}
        >
          Print
        </button>
      ),
    },
  ];

  const ProdukSelect = () => {
    const selectedProduk = uniqueKomoditas.find(
      (k) => k.id === formData.id_komodity,
    );

    return (
      <div className="dropdown-container relative">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Produk *
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProdukDropdown(!showProdukDropdown)}
            className={`w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left flex items-center justify-between transition-colors ${
              formErrors.id_komodity
                ? "border-red-500 dark:border-red-400"
                : "border-gray-300 dark:border-gray-600"
            }`}
          >
            <span
              className={
                selectedProduk
                  ? "text-gray-900 dark:text-gray-100"
                  : "text-gray-500"
              }
            >
              {selectedProduk?.nama || "Pilih Produk"}
            </span>
            <ChevronDown size={16} />
          </button>

          {formErrors.id_komodity && (
            <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
              <AlertCircle size={12} />
              <span>{formErrors.id_komodity}</span>
            </div>
          )}

          {showProdukDropdown && (
            <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {uniqueKomoditas.length > 0 ? (
                uniqueKomoditas.map((item) => {
                  const totalStock = produksi
                    .filter((p) => p.komoditas?.id === item.id)
                    .reduce((sum, p) => sum + p.jumlah, 0);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          id_komodity: item.id,
                          id_produksi: 0,
                        }));
                        setShowProdukDropdown(false);
                      }}
                      className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{item.nama}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.deskripsi}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Total Stok: {totalStock} {item.satuan}
                          </div>
                          {totalStock <= 5 && (
                            <div className="text-xs text-red-500 font-medium">
                              Stok Menipis!
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  Tidak ada produk tersedia
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const ProduksiSelect = () => {
    const selectedProduksi = produksi.find(
      (p) => p.id === formData.id_produksi,
    );

    return (
      <div className="dropdown-container relative">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Kode Produksi *
          {!formData.id_komodity && (
            <span className="text-xs text-gray-500 ml-2">
              (Pilih produk terlebih dahulu)
            </span>
          )}
        </label>
        <div className="relative">
          <button
            type="button"
            disabled={!formData.id_komodity}
            onClick={() => setShowProduksiDropdown(!showProduksiDropdown)}
            className={`w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left flex items-center justify-between transition-colors ${
              formErrors.id_produksi
                ? "border-red-500 dark:border-red-400"
                : "border-gray-300 dark:border-gray-600"
            } ${!formData.id_komodity ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span
              className={
                selectedProduksi
                  ? "text-gray-900 dark:text-gray-100"
                  : "text-gray-500"
              }
            >
              {selectedProduksi?.kode_produksi || "Pilih Kode Produksi"}
            </span>
            <ChevronDown size={16} />
          </button>

          {formErrors.id_produksi && (
            <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
              <AlertCircle size={12} />
              <span>{formErrors.id_produksi}</span>
            </div>
          )}

          {showProduksiDropdown && formData.id_komodity && (
            <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {filteredProduksiByKomoditas.length > 0 ? (
                filteredProduksiByKomoditas.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        id_produksi: item.id,
                        id_komodity:
                          prev.id_komodity || item.komoditas?.id || 0,
                      }));
                      setShowProduksiDropdown(false);
                    }}
                    className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium font-mono">
                          {item.kode_produksi}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.ukuran} - {item.kualitas}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Stok: {item.jumlah} {item.komoditas?.satuan}
                        </div>
                        {item.jumlah <= 5 && (
                          <div className="text-xs text-red-500 font-medium">
                            Stok Menipis!
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  Tidak ada kode produksi ditemukan
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const selectedProduksi = produksi.find((p) => p.id === formData.id_produksi);

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b px-5 pt-4">
        <DashboardHeader role={username} title="Kasir" />
      </div>

      <div className="p-4 space-y-4">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <AlertCircle size={20} />
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Transaction Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Receipt size={20} />
            Transaksi Baru
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ProdukSelect />
              <ProduksiSelect />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {selectedProduksi ? (
                    <div>
                      Jumlah ({selectedProduksi.komoditas?.satuan})
                      <span className="text-xs text-gray-500 ml-2">
                        (Tersedia: {selectedProduksi.jumlah}{" "}
                        {selectedProduksi.komoditas?.satuan})
                      </span>
                    </div>
                  ) : (
                    <div>Jumlah</div>
                  )}
                </label>
                <Input
                  type="number"
                  name="jumlah_terjual"
                  value={formData.jumlah_terjual || ""}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="1"
                  max={selectedProduksi?.jumlah || undefined}
                  className={`w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.jumlah_terjual
                      ? "border-red-500 dark:border-red-400"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {formErrors.jumlah_terjual && (
                  <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                    <AlertCircle size={12} />
                    <span>{formErrors.jumlah_terjual}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Keterangan
                </label>
                <Input
                  type="text"
                  name="keterangan"
                  value={formData.keterangan || ""}
                  onChange={handleInputChange}
                  placeholder="Keterangan tambahan (opsional)"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Total Harga
              </label>
              <Input
                type="number"
                name="total_harga"
                value={formData.total_harga || ""}
                onChange={handleInputChange}
                placeholder="0"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={cetakStruk}
                onChange={(e) => handleCetakStrukChange(e.target.checked)}
                className="w-4 h-4 accent-blue-600"
              />
              Cetak Struk Pembelian
            </label>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                  Memproses...
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  Simpan Transaksi
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Collapsible Sales Data */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
          <button
            onClick={() => setShowPenjualan(!showPenjualan)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg"
          >
            <div className="flex items-center gap-2">
              <Receipt size={20} className="text-blue-600" />
              <span className="font-medium">Riwayat Penjualan</span>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                {penjualan.length} transaksi
              </span>
            </div>
            {showPenjualan ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </button>

          {showPenjualan && (
            <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-600">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Memuat data...</p>
                </div>
              ) : (
                <div className="mt-4">
                  <DataTable
                    data={penjualan}
                    columns={penjualanColumns}
                    pageSize={10}
                    emptyMessage="Belum ada transaksi penjualan"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
