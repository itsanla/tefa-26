"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Receipt,
  AlertCircle,
  Package,
  Plus,
  Trash2,
  LogOut,
} from "lucide-react";
import { Komoditas, Penjualan, Produksi } from "@/types";
import { DataTable } from "@/components/table/DataTable";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { toast } from "sonner";
import { apiRequest } from "@/services/api.service";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { printStruk } from "@/components/struk/StrukPembelian";
import BayarPenjualanModal from "@/components/table_master/penjualan/bayar";

type PenjualanFormItem = {
  id_komodity: number;
  id_produksi: number;
  jumlah_terjual: number;
  berat: number;
  satuan_jual: "kilogram" | "buah";
  total_harga: number;
  keterangan: string;
};

const createEmptyItem = (): PenjualanFormItem => ({
  id_komodity: 0,
  id_produksi: 0,
  jumlah_terjual: 0,
  berat: 0,
  satuan_jual: "kilogram",
  total_harga: 0,
  keterangan: "",
});

export default function KasirPage() {
  const router = useRouter();
  const username =
    typeof window != "undefined"
      ? (document.cookie
          .split("; ")
          .find((row) => row.startsWith("username="))
          ?.split("=")[1] ?? "User")
      : null;

  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "username=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  };

  const [produksi, setProduksi] = useState<Produksi[]>([]);
  const [penjualan, setPenjualan] = useState<Penjualan[]>([]);

  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formItems, setFormItems] = useState<PenjualanFormItem[]>([
    createEmptyItem(),
  ]);
  const [status, setStatus] = useState<"lunas" | "angsuran" | "hutang">("lunas");
  const [uangMuka, setUangMuka] = useState("");

  const [showPenjualan, setShowPenjualan] = useState(false);
  const [cetakStruk, setCetakStruk] = useState(true);
  const [expandedPenjualanId, setExpandedPenjualanId] = useState<number | null>(
    null,
  );
  const [penjualanDetails, setPenjualanDetails] = useState<
    Record<number, Penjualan>
  >({});
  const [loadingPenjualanDetailId, setLoadingPenjualanDetailId] = useState<
    number | null
  >(null);
  const [bayarModalPenjualan, setBayarModalPenjualan] = useState<{
    id: number;
    total_harga: number;
    total_terbayar: number;
    sisa_bayar: number;
    status: string;
  } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const uniqueKomoditas = produksi.reduce((acc, prod) => {
    const existing = acc.find((item) => item.id === prod.komoditas?.id);
    if (!existing && prod.komoditas) {
      acc.push(prod.komoditas);
    }
    return acc;
  }, [] as Komoditas[]);

  const grandTotal = formItems.reduce((sum, item) => sum + item.total_harga, 0);

  const refreshData = async () => {
    try {
      const [dataPenjualan, dataProduksi] = await Promise.all([
        apiRequest({ endpoint: "/penjualan" }),
        apiRequest({ endpoint: "/produksi" }),
      ]);
      setPenjualan(dataPenjualan);
      setProduksi(dataProduksi);
    } catch {
      // silently fail on background refresh
    }
  };

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

    fetchPreference();
    fetchData();

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    formItems.forEach((item, index) => {
      if (!item.id_komodity) {
        errors[`${index}.id_komodity`] = "Produk harus dipilih";
      }

      if (!item.id_produksi) {
        errors[`${index}.id_produksi`] = "Kode produksi harus dipilih";
      }

      if (!item.jumlah_terjual || item.jumlah_terjual <= 0) {
        errors[`${index}.jumlah_terjual`] = "Jumlah buah harus lebih dari 0";
      }

      if (item.satuan_jual === "kilogram" && (!item.berat || item.berat <= 0)) {
        errors[`${index}.berat`] = "Berat harus lebih dari 0";
      }

      if (item.id_produksi && item.jumlah_terjual) {
        const selectedProduksi = produksi.find(
          (p) => p.id === item.id_produksi,
        );
        if (selectedProduksi && item.jumlah_terjual > selectedProduksi.jumlah) {
          errors[`${index}.jumlah_terjual`] =
            `Stok tidak mencukupi. Tersedia: ${selectedProduksi.jumlah} buah`;
        }
      }
    });

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

  const loadPenjualanDetail = async (id: number) => {
    if (penjualanDetails[id]) return penjualanDetails[id];

    setLoadingPenjualanDetailId(id);
    try {
      const detail = await apiRequest({ endpoint: `/penjualan/${id}` });
      setPenjualanDetails((current) => ({ ...current, [id]: detail }));
      return detail;
    } finally {
      setLoadingPenjualanDetailId((current) =>
        current === id ? null : current,
      );
    }
  };

  const togglePenjualanDropdown = async (id: number) => {
    if (expandedPenjualanId === id) {
      setExpandedPenjualanId(null);
      return;
    }

    setExpandedPenjualanId(id);
    try {
      await loadPenjualanDetail(id);
    } catch (error) {
      console.error("Gagal memuat detail penjualan:", error);
      toast.error("Gagal memuat detail item penjualan.");
      setExpandedPenjualanId(null);
    }
  };

  const getProduksiByKomoditas = (idKomoditas: number) => {
    if (!idKomoditas) return [];
    return produksi.filter((prod) => prod.komoditas?.id === idKomoditas);
  };

  const handleItemChange = (
    index: number,
    field: keyof PenjualanFormItem,
    rawValue: string,
  ) => {
    setFormItems((prev) => {
      const updated = [...prev];
      const current = { ...updated[index] };

      const numberFields: Array<keyof PenjualanFormItem> = [
        "id_komodity",
        "id_produksi",
        "jumlah_terjual",
        "berat",
      ];

      if (field === "satuan_jual") {
        current.satuan_jual = rawValue as "kilogram" | "buah";
        if (rawValue === "buah") {
          current.berat = 0;
        }
      } else if (numberFields.includes(field)) {
        const numValue = Number(rawValue);
        current[field] = (Number.isNaN(numValue) ? 0 : numValue) as never;
      } else {
        current[field] = rawValue as never;
      }

      if (field === "id_komodity") {
        current.id_produksi = 0;
        current.jumlah_terjual = 0;
        current.berat = 0;
        current.total_harga = 0;
      }

      if (field === "id_produksi" && !current.id_komodity) {
        const selectedProd = produksi.find((p) => p.id === current.id_produksi);
        current.id_komodity = selectedProd?.komoditas?.id ?? 0;
      }

      const selectedProduksi = produksi.find(
        (p) => p.id === current.id_produksi,
      );
      if (selectedProduksi) {
        if (current.satuan_jual === "buah" && current.jumlah_terjual > 0) {
          current.total_harga = selectedProduksi.harga_per_buah * current.jumlah_terjual;
        } else if (current.satuan_jual === "kilogram" && current.berat > 0) {
          current.total_harga = selectedProduksi.harga_persatuan * current.berat;
        } else {
          current.total_harga = 0;
        }
      } else {
        current.total_harga = 0;
      }

      updated[index] = current;
      return updated;
    });

    setFormErrors((prev) => {
      const next = { ...prev };
      delete next[`${index}.${String(field)}`];
      return next;
    });
  };

  const addItem = () => {
    setFormItems((prev) => [...prev, createEmptyItem()]);
  };

  const removeItem = (index: number) => {
    if (formItems.length === 1) return;
    setFormItems((prev) => prev.filter((_, i) => i !== index));
    setFormErrors((prev) => {
      const next: Record<string, string> = {};
      Object.entries(prev).forEach(([key, value]) => {
        const [idxStr, field] = key.split(".");
        const idx = Number(idxStr);
        if (idx < index) next[key] = value;
        if (idx > index) next[`${idx - 1}.${field}`] = value;
      });
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Mohon periksa kembali data yang diisi");
      return;
    }

    if (status === "angsuran") {
      const dp = Number(uangMuka);
      const total = formItems.reduce((sum, item) => sum + item.total_harga, 0);
      if (!dp || dp <= 0) {
        toast.error("Uang muka harus lebih dari 0 untuk status angsuran.");
        return;
      }
      if (dp >= total) {
        toast.error("Uang muka harus kurang dari total. Gunakan Lunas jika bayar penuh.");
        return;
      }
    }

    try {
      setIsLoading(true);
      setError(null);

      const requestBody: Record<string, unknown> = {
        status,
        ...(status === "angsuran" && uangMuka ? { uang_muka: Number(uangMuka) } : {}),
        items: formItems.map((item) => ({
          id_komodity: item.id_komodity,
          id_produksi: item.id_produksi,
          jumlah_terjual: item.jumlah_terjual,
          berat: item.berat,
          satuan_jual: item.satuan_jual,
          total_harga: item.total_harga,
          keterangan: item.keterangan,
        })),
      };

      await apiRequest({
        endpoint: "/penjualan",
        method: "POST",
        data: requestBody,
      });

      if (cetakStruk) {
        const items = requestBody.items as typeof formItems;
        const printableItems = items
          .map((item) => {
            const selectedProd = produksi.find(
              (p) => p.id === item.id_produksi,
            );
            const selectedKomoditas = selectedProd?.komoditas;

            if (!selectedProd || !selectedKomoditas) return null;

            return {
              namaKomoditas: selectedKomoditas.nama,
              satuanKomoditas: selectedKomoditas.satuan,
              kodeProduksi: selectedProd.kode_produksi,
              ukuran: selectedProd.ukuran,
              kualitas: selectedProd.kualitas,
              asalProduksi: selectedProd.asal_produksi?.nama ?? "-",
              hargaPersatuan: item.satuan_jual === "buah" ? selectedProd.harga_per_buah : selectedProd.harga_persatuan,
              jumlahTerjual: item.jumlah_terjual,
              berat: item.berat,
              satuan_jual: item.satuan_jual,
              totalHarga: item.total_harga,
            };
          })
          .filter((item): item is NonNullable<typeof item> => Boolean(item));

        if (printableItems.length > 0) {
          printStruk({
            items: printableItems,
            total_harga: formItems.reduce(
              (sum, item) => sum + item.total_harga,
              0,
            ),
            keterangan: formItems
              .map((item) => item.keterangan.trim())
              .filter(Boolean)
              .join(" | "),
            created_at: new Date(),
          });
        }
      }

      await refreshData();

      // Reset form
      setFormItems([createEmptyItem()]);
      setFormErrors({});
      setStatus("lunas");
      setUangMuka("");

      toast.success(`${formItems.length} transaksi berhasil disimpan`);
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
      const detail = await apiRequest({
        endpoint: `/penjualan/${id}`,
      });

      printStruk(detail);
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
      accessorKey: "jumlah_produk" as keyof Penjualan,
      cell: (item: Penjualan) => (
        <div className="flex items-center gap-2">
          <Package size={16} className="text-gray-500" />
          <span className="font-medium">
            {item.jumlah_produk ?? item.items?.length ?? 0} produk
          </span>
        </div>
      ),
    },
    {
      header: "Kode Produksi",
      accessorKey: "kode_produksi_list" as keyof Penjualan,
      cell: (item: Penjualan) => {
        const kodeProduksiList = item.kode_produksi_list ?? [];
        const visibleCodes = kodeProduksiList.slice(0, 2);
        const hiddenCount = Math.max(
          kodeProduksiList.length - visibleCodes.length,
          0,
        );

        return (
          <div className="flex flex-wrap items-center gap-2">
            {visibleCodes.length > 0 ? (
              visibleCodes.map((kode) => (
                <span
                  key={kode}
                  className="rounded bg-green-100 px-2 py-1 text-xs font-mono text-green-800 dark:bg-green-900 dark:text-green-200"
                >
                  {kode}
                </span>
              ))
            ) : (
              <span className="text-gray-500 dark:text-gray-400">-</span>
            )}

            {hiddenCount > 0 ? (
              <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                +{hiddenCount} kode lainnya
              </span>
            ) : null}
          </div>
        );
      },
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
      header: "Status",
      accessorKey: "status" as keyof Penjualan,
      cell: (item: Penjualan) => {
        const s = (item.status ?? "lunas") as "lunas" | "angsuran" | "hutang";
        const colors = {
          lunas: "bg-green-100 text-green-800",
          angsuran: "bg-yellow-100 text-yellow-800",
          hutang: "bg-red-100 text-red-800",
        };
        const labels = { lunas: "Lunas", angsuran: "Angsuran", hutang: "Hutang" };
        return (
          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${colors[s]}`}>
            {labels[s]}
          </span>
        );
      },
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
        <div className="relative flex items-center gap-2 justify-end">
          {item.status && item.status !== "lunas" && (
            <button
              className="px-3 py-2 rounded-lg bg-orange-500 text-white text-sm hover:bg-orange-600 font-medium"
              onClick={() => setBayarModalPenjualan({
                id: item.id,
                total_harga: item.total_harga,
                total_terbayar: item.total_terbayar ?? 0,
                sisa_bayar: item.sisa_bayar ?? (item.total_harga - (item.total_terbayar ?? 0)),
                status: item.status ?? "hutang",
              })}
              type="button"
            >
              Bayar
            </button>
          )}
          <button
            className="inline-flex items-center gap-1 rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            onClick={() => togglePenjualanDropdown(item.id)}
            type="button"
          >
            Detail
            {expandedPenjualanId === item.id ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
          <button
            className="bg-green-600 px-4 py-2 rounded text-white text-sm hover:bg-green-700"
            onClick={() => handlePrintClick(item.id)}
            type="button"
          >
            Print
          </button>

          {expandedPenjualanId === item.id && (
            <div className="absolute right-0 top-full z-20 mt-2 w-[28rem] rounded-xl border border-gray-200 bg-white p-4 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
              {loadingPenjualanDetailId === item.id ? (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-500">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
                  Memuat item penjualan...
                </div>
              ) : (
                <>
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Item Penjualan
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {penjualanDetails[item.id]?.items?.length ?? 0} item
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedPenjualanId(null)}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      Tutup
                    </button>
                  </div>

                  <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                    {(penjualanDetails[item.id]?.items ?? []).length > 0 ? (
                      penjualanDetails[item.id]!.items!.map((detailItem) => (
                        <div
                          key={detailItem.id}
                          className="rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {detailItem.komoditas?.nama ?? "-"}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {detailItem.produksi?.kode_produksi ?? "-"} ·{" "}
                                {detailItem.produksi?.ukuran ?? "-"} ·{" "}
                                {detailItem.produksi?.kualitas ?? "-"}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                                {detailItem.jumlah_terjual} buah
                              </span>
                              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                {detailItem.berat ?? 0} kg
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>
                              Rp
                              {new Intl.NumberFormat("id-ID").format(
                                detailItem.harga_satuan,
                              )}
                              {detailItem.satuan_jual === "buah" ? ",-/buah" : ",-/kg"}
                            </span>
                            <span>
                              Subtotal Rp
                              {new Intl.NumberFormat("id-ID").format(
                                detailItem.sub_total,
                              )}
                              ,-
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-lg border border-dashed border-gray-300 px-3 py-6 text-center text-sm text-gray-500 dark:border-gray-600">
                        Tidak ada detail item.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-yellow-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <DashboardHeader role={username} title="Point of Sale" />
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-800">Aplikasi Mobile & Driver Printer</p>
              <p className="text-sm text-gray-600">
                Unduh aplikasi mobile dan driver printer thermal untuk operasional kasir.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com/itsanla/tefa-26/releases/download/v.0.2.4/pos-tefa.apk"
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
                rel="noopener noreferrer"
                target="_blank"
              >
                Download Aplikasi Mobile
              </a>
              <a
                href="https://github.com/itsanla/tefa-26/releases/download/v1.0.1/POS.Printer.Driver.Setup.exe"
                className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 shadow-sm transition-colors hover:bg-amber-100"
                rel="noopener noreferrer"
                target="_blank"
              >
                Download Driver Printer Thermal
              </a>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-3 text-red-800">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertCircle size={20} />
              </div>
              <div>
                <span className="font-semibold">Error:</span>
                <span className="ml-2">{error}</span>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-green-600 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <Receipt size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Transaksi Baru</h2>
                <p className="text-green-100 text-sm">Buat transaksi penjualan baru</p>
              </div>
            </div>
          </div>

          <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {formItems.map((item, index) => {
              const selectedProduksi = produksi.find(
                (p) => p.id === item.id_produksi,
              );
              const filteredProduksi = getProduksiByKomoditas(item.id_komodity);

              return (
                <div
                  key={`item-${index}`}
                  className="border-2 border-gray-200 rounded-xl p-5 space-y-4 bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <h3 className="font-semibold text-gray-800">
                        Item Produk
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={formItems.length === 1}
                      className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:text-gray-400 disabled:hover:bg-transparent"
                    >
                      <Trash2 size={16} />
                      Hapus
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Produk *
                      </label>
                      <select
                        value={item.id_komodity || ""}
                        onChange={(e) =>
                          handleItemChange(index, "id_komodity", e.target.value)
                        }
                        className={`w-full p-3 border-2 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                          formErrors[`${index}.id_komodity`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      >
                        <option value="">Pilih Produk</option>
                        {uniqueKomoditas.map((komoditas) => {
                          const totalStock = produksi
                            .filter((p) => p.komoditas?.id === komoditas.id)
                            .reduce((sum, p) => sum + p.jumlah, 0);
                          return (
                            <option key={komoditas.id} value={komoditas.id}>
                              {komoditas.nama} (Stok: {totalStock} buah)
                            </option>
                          );
                        })}
                      </select>
                      {formErrors[`${index}.id_komodity`] && (
                        <div className="flex items-center gap-1 mt-2 text-red-600 text-xs font-medium bg-red-50 p-2 rounded-lg">
                          <AlertCircle size={14} />
                          <span>{formErrors[`${index}.id_komodity`]}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Kode Produksi *
                      </label>
                      <select
                        value={item.id_produksi || ""}
                        disabled={!item.id_komodity}
                        onChange={(e) =>
                          handleItemChange(index, "id_produksi", e.target.value)
                        }
                        className={`w-full p-3 border-2 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                          formErrors[`${index}.id_produksi`]
                            ? "border-red-500"
                            : "border-gray-300"
                        } ${!item.id_komodity ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <option value="">
                          {!item.id_komodity
                            ? "Pilih produk terlebih dahulu"
                            : "Pilih Kode Produksi"}
                        </option>
                        {filteredProduksi.map((prod) => (
                          <option key={prod.id} value={prod.id}>
                            {prod.kode_produksi} - {prod.ukuran} -{" "}
                            {prod.kualitas} (Stok: {prod.jumlah})
                          </option>
                        ))}
                      </select>
                      {formErrors[`${index}.id_produksi`] && (
                        <div className="flex items-center gap-1 mt-2 text-red-600 text-xs font-medium bg-red-50 p-2 rounded-lg">
                          <AlertCircle size={14} />
                          <span>{formErrors[`${index}.id_produksi`]}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Satuan Jual
                      </label>
                      <select
                        value={item.satuan_jual}
                        onChange={(e) =>
                          handleItemChange(index, "satuan_jual", e.target.value)
                        }
                        className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      >
                        <option value="kilogram">Per Kilogram (kg)</option>
                        <option value="buah">Per Buah</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Jumlah Buah *
                      </label>
                      <Input
                        type="number"
                        value={item.jumlah_terjual || ""}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "jumlah_terjual",
                            e.target.value,
                          )
                        }
                        placeholder="0"
                        min="1"
                        step="1"
                        max={selectedProduksi?.jumlah || undefined}
                        className={`w-full p-3 border-2 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                          formErrors[`${index}.jumlah_terjual`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {selectedProduksi && (
                        <p className="mt-1 text-xs text-gray-500">
                          Tersedia: {selectedProduksi.jumlah} buah
                        </p>
                      )}
                      {formErrors[`${index}.jumlah_terjual`] && (
                        <div className="flex items-center gap-1 mt-2 text-red-600 text-xs font-medium bg-red-50 p-2 rounded-lg">
                          <AlertCircle size={14} />
                          <span>{formErrors[`${index}.jumlah_terjual`]}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {item.satuan_jual === "kilogram" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Berat (kg) *
                        </label>
                        <Input
                          type="number"
                          value={item.berat || ""}
                          onChange={(e) =>
                            handleItemChange(index, "berat", e.target.value)
                          }
                          placeholder="0.0000"
                          min="0.0001"
                          step="0.0001"
                          className={`w-full p-3 border-2 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                            formErrors[`${index}.berat`]
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {formErrors[`${index}.berat`] && (
                          <div className="flex items-center gap-1 mt-2 text-red-600 text-xs font-medium bg-red-50 p-2 rounded-lg">
                            <AlertCircle size={14} />
                            <span>{formErrors[`${index}.berat`]}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Keterangan
                      </label>
                      <Input
                        type="text"
                        value={item.keterangan || ""}
                        onChange={(e) =>
                          handleItemChange(index, "keterangan", e.target.value)
                        }
                        placeholder="Keterangan tambahan (opsional)"
                        className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Total Harga
                      </label>
                      <div className="relative">
                        <Input
                          type="text"
                          value={
                            item.total_harga
                              ? `Rp${new Intl.NumberFormat("id-ID").format(item.total_harga)}`
                              : ""
                          }
                          placeholder="0"
                          className="w-full p-3 border-2 border-gray-300 rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100 text-gray-900 font-bold text-lg"
                          disabled
                        />
                      </div>
                      {item.id_produksi > 0 && (
                        <p className="mt-1 text-xs text-gray-500">
                          {item.satuan_jual === "kilogram" && item.berat > 0 ? (
                            <>{item.berat} kg × Rp{new Intl.NumberFormat("id-ID").format(
                              produksi.find((p) => p.id === item.id_produksi)?.harga_persatuan ?? 0,
                            )}/kg</>
                          ) : item.satuan_jual === "buah" && item.jumlah_terjual > 0 ? (
                            <>{item.jumlah_terjual} buah × Rp{new Intl.NumberFormat("id-ID").format(
                              produksi.find((p) => p.id === item.id_produksi)?.harga_per_buah ?? 0,
                            )}/buah</>
                          ) : null}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex items-center justify-between gap-4 pt-4 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-green-500 text-green-700 bg-green-50 hover:bg-green-100 font-semibold transition-all hover:shadow-md"
              >
                <Plus size={18} />
                Tambah Produk
              </button>

              <div className="text-right bg-gradient-to-br from-yellow-50 to-yellow-100 px-6 py-3 rounded-xl border-2 border-yellow-300">
                <p className="text-sm font-medium text-yellow-800">
                  Total Semua Produk
                </p>
                <p className="text-2xl font-bold text-yellow-900">
                  Rp{new Intl.NumberFormat("id-ID").format(grandTotal)}
                </p>
              </div>
            </div>

            {/* Status Pembayaran */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status Pembayaran
                </label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value as typeof status);
                    setUangMuka("");
                  }}
                  className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                >
                  <option value="lunas">Lunas — Bayar penuh di tempat</option>
                  <option value="angsuran">Angsuran — Bayar sebagian (DP)</option>
                  <option value="hutang">Hutang — Tidak ada pembayaran awal</option>
                </select>
              </div>

              {status === "angsuran" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Uang Muka (Rp) *
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={uangMuka}
                    onChange={(e) => setUangMuka(e.target.value)}
                    placeholder="Masukkan jumlah uang muka"
                    className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />
                </div>
              )}
            </div>

            <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-700 bg-gray-50 p-4 rounded-xl border-2 border-gray-200 hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={cetakStruk}
                onChange={(e) => handleCetakStrukChange(e.target.checked)}
                className="w-5 h-5 accent-green-600 rounded"
              />
              <Receipt size={18} className="text-green-600" />
              Cetak Struk Pembelian
            </label>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span>
                  Memproses Transaksi...
                </>
              ) : (
                <>
                  <ShoppingCart size={22} />
                  Simpan Transaksi
                </>
              )}
            </Button>
          </form>
          </div>
        </div>

        {/* Collapsible Sales Data */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setShowPenjualan(!showPenjualan)}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-gradient-to-r hover:from-green-50 hover:to-yellow-50 transition-all rounded-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl">
                <Receipt size={22} className="text-white" />
              </div>
              <div>
                <span className="font-bold text-lg text-gray-800">Riwayat Penjualan</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-yellow-100 text-green-800 rounded-full text-xs font-semibold">
                    {penjualan.length} transaksi
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 p-2 rounded-lg">
              {showPenjualan ? (
                <ChevronUp size={24} className="text-gray-600" />
              ) : (
                <ChevronDown size={24} className="text-gray-600" />
              )}
            </div>
          </button>

          {showPenjualan && (
            <div className="px-6 pb-6 border-t-2 border-gray-200">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mx-auto"></div>
                  <p className="mt-4 text-gray-600 font-medium">Memuat data...</p>
                </div>
              ) : (
                <div className="mt-6">
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

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="font-semibold text-gray-800">TEFA 26 - Point of Sale</p>
              <p className="text-gray-600 text-sm mt-1">
                SMK Negeri 2 Batusangkar
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-600 text-sm">
                © {new Date().getFullYear()} Teaching Factory Program
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Dibuat dengan <span className="text-green-600">♥</span> oleh Tim TEFA
              </p>
            </div>
          </div>
        </div>
      </footer>

      {bayarModalPenjualan && (
        <BayarPenjualanModal
          isOpen={true}
          onClose={() => setBayarModalPenjualan(null)}
          penjualan={bayarModalPenjualan}
          onSubmitSuccess={() => {
            setBayarModalPenjualan(null);
            setPenjualanDetails({});
            refreshData();
          }}
        />
      )}
    </div>
  );
}
