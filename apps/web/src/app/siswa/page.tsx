"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Receipt,
  AlertCircle,
  Package,
  Plus,
  Trash2,
} from "lucide-react";
import { Komoditas, Penjualan, Produksi } from "@/types";
import { DataTable } from "@/components/table/DataTable";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { toast } from "sonner";
import { apiRequest } from "@/services/api.service";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { printStruk } from "@/components/struk/StrukPembelian";

type PenjualanFormItem = {
  id_komodity: number;
  id_produksi: number;
  jumlah_terjual: number;
  total_harga: number;
  keterangan: string;
};

const createEmptyItem = (): PenjualanFormItem => ({
  id_komodity: 0,
  id_produksi: 0,
  jumlah_terjual: 0,
  total_harga: 0,
  keterangan: "",
});

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

  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formItems, setFormItems] = useState<PenjualanFormItem[]>([
    createEmptyItem(),
  ]);

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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get unique komoditas from produksi data - Fixed property name
  const uniqueKomoditas = produksi.reduce((acc, prod) => {
    const existing = acc.find((item) => item.id === prod.komoditas?.id);
    if (!existing && prod.komoditas) {
      acc.push(prod.komoditas);
    }
    return acc;
  }, [] as Komoditas[]);

  const grandTotal = formItems.reduce((sum, item) => sum + item.total_harga, 0);

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
        errors[`${index}.jumlah_terjual`] = "Jumlah harus lebih dari 0";
      }

      if (item.id_produksi && item.jumlah_terjual) {
        const selectedProduksi = produksi.find(
          (p) => p.id === item.id_produksi,
        );
        if (selectedProduksi && item.jumlah_terjual > selectedProduksi.jumlah) {
          errors[`${index}.jumlah_terjual`] =
            `Stok tidak mencukupi. Tersedia: ${selectedProduksi.jumlah} ${selectedProduksi.komoditas?.satuan}`;
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
      ];

      if (numberFields.includes(field)) {
        const numValue = Number(rawValue);
        current[field] = (Number.isNaN(numValue) ? 0 : numValue) as never;
      } else {
        current[field] = rawValue as never;
      }

      if (field === "id_komodity") {
        current.id_produksi = 0;
        current.jumlah_terjual = 0;
        current.total_harga = 0;
      }

      if (field === "id_produksi" && !current.id_komodity) {
        const selectedProd = produksi.find((p) => p.id === current.id_produksi);
        current.id_komodity = selectedProd?.komoditas?.id ?? 0;
      }

      const selectedProduksi = produksi.find(
        (p) => p.id === current.id_produksi,
      );
      if (selectedProduksi && current.jumlah_terjual > 0) {
        current.total_harga =
          selectedProduksi.harga_persatuan * current.jumlah_terjual;
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

    try {
      setIsLoading(true);
      setError(null);

      const requestBody = {
        items: formItems.map((item) => ({
          id_komodity: item.id_komodity,
          id_produksi: item.id_produksi,
          jumlah_terjual: item.jumlah_terjual,
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
        const printableItems = requestBody.items
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
              hargaPersatuan: selectedProd.harga_persatuan,
              jumlahTerjual: item.jumlah_terjual,
              totalHarga: item.total_harga,
            };
          })
          .filter((item): item is NonNullable<typeof item> => Boolean(item));

        if (printableItems.length > 0) {
          printStruk({
            items: printableItems,
            totalHarga: requestBody.items.reduce(
              (sum, item) => sum + item.total_harga,
              0,
            ),
            keterangan: requestBody.items
              .map((item) => item.keterangan.trim())
              .filter(Boolean)
              .join(" | "),
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
      setFormItems([createEmptyItem()]);
      setFormErrors({});

      toast.success(`${requestBody.items.length} transaksi berhasil disimpan`);
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
                  className="rounded bg-blue-100 px-2 py-1 text-xs font-mono text-blue-800 dark:bg-blue-900 dark:text-blue-200"
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
            className="bg-blue-600 px-4 py-2 rounded text-white text-sm"
            onClick={() => handlePrintClick(item.id)}
            type="button"
          >
            Print
          </button>

          {expandedPenjualanId === item.id && (
            <div className="absolute right-0 top-full z-20 mt-2 w-[28rem] rounded-xl border border-gray-200 bg-white p-4 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
              {loadingPenjualanDetailId === item.id ? (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-500">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
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
                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                              {detailItem.jumlah_terjual} pcs
                            </span>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>
                              Rp
                              {new Intl.NumberFormat("id-ID").format(
                                detailItem.harga_satuan,
                              )}
                              ,-
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
            {formItems.map((item, index) => {
              const selectedProduksi = produksi.find(
                (p) => p.id === item.id_produksi,
              );
              const filteredProduksi = getProduksiByKomoditas(item.id_komodity);

              return (
                <div
                  key={`item-${index}`}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-800 dark:text-gray-200">
                      Item {index + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={formItems.length === 1}
                      className="inline-flex items-center gap-1 text-sm text-red-600 disabled:text-gray-400"
                    >
                      <Trash2 size={16} />
                      Hapus
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Produk *
                      </label>
                      <select
                        value={item.id_komodity || ""}
                        onChange={(e) =>
                          handleItemChange(index, "id_komodity", e.target.value)
                        }
                        className={`w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
                          formErrors[`${index}.id_komodity`]
                            ? "border-red-500 dark:border-red-400"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        <option value="">Pilih Produk</option>
                        {uniqueKomoditas.map((komoditas) => {
                          const totalStock = produksi
                            .filter((p) => p.komoditas?.id === komoditas.id)
                            .reduce((sum, p) => sum + p.jumlah, 0);
                          return (
                            <option key={komoditas.id} value={komoditas.id}>
                              {komoditas.nama} (Stok: {totalStock}{" "}
                              {komoditas.satuan})
                            </option>
                          );
                        })}
                      </select>
                      {formErrors[`${index}.id_komodity`] && (
                        <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                          <AlertCircle size={12} />
                          <span>{formErrors[`${index}.id_komodity`]}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Kode Produksi *
                      </label>
                      <select
                        value={item.id_produksi || ""}
                        disabled={!item.id_komodity}
                        onChange={(e) =>
                          handleItemChange(index, "id_produksi", e.target.value)
                        }
                        className={`w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
                          formErrors[`${index}.id_produksi`]
                            ? "border-red-500 dark:border-red-400"
                            : "border-gray-300 dark:border-gray-600"
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
                        <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                          <AlertCircle size={12} />
                          <span>{formErrors[`${index}.id_produksi`]}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Jumlah
                        {selectedProduksi
                          ? ` (${selectedProduksi.komoditas?.satuan})`
                          : ""}{" "}
                        *
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
                        max={selectedProduksi?.jumlah || undefined}
                        className={`w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
                          formErrors[`${index}.jumlah_terjual`]
                            ? "border-red-500 dark:border-red-400"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      />
                      {selectedProduksi && (
                        <p className="mt-1 text-xs text-gray-500">
                          Tersedia: {selectedProduksi.jumlah}{" "}
                          {selectedProduksi.komoditas?.satuan}
                        </p>
                      )}
                      {formErrors[`${index}.jumlah_terjual`] && (
                        <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                          <AlertCircle size={12} />
                          <span>{formErrors[`${index}.jumlah_terjual`]}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Keterangan
                      </label>
                      <Input
                        type="text"
                        value={item.keterangan || ""}
                        onChange={(e) =>
                          handleItemChange(index, "keterangan", e.target.value)
                        }
                        placeholder="Keterangan tambahan (opsional)"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Total Harga
                      </label>
                      <Input
                        type="text"
                        value={
                          item.total_harga
                            ? `Rp${new Intl.NumberFormat("id-ID").format(item.total_harga)}`
                            : ""
                        }
                        placeholder="0"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        disabled
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700"
              >
                <Plus size={16} />
                Tambah Produk
              </button>

              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Semua Produk
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Rp{new Intl.NumberFormat("id-ID").format(grandTotal)}
                </p>
              </div>
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
