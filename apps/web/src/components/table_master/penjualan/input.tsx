"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { apiRequest } from "@/services/api.service";
import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
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

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-[rgba(0,0,0,0.5)] backdrop-blur-sm flex justify-center items-center"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            Tambahkan Penjualan
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-none"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4 text-gray-800 dark:text-gray-200">{children}</div>
      </div>
    </div>
  );
};

interface InputPenjualanFormProps {
  isOpen: boolean;
  onClose: () => void;
  formMode?: "create" | "update";
  initialData?: any;
  onSubmitSuccess?: () => void;
}

export default function InputPenjualanForm({
  isOpen,
  onClose,
  formMode = "create",
  initialData,
  onSubmitSuccess,
}: InputPenjualanFormProps) {
  const [formItems, setFormItems] = useState<PenjualanFormItem[]>([
    createEmptyItem(),
  ]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [keteranganGlobal, setKeteranganGlobal] = useState("");
  const [loading, setLoading] = useState(false);
  const [cetakStruk, setCetakStruk] = useState(true);

  const [komodityList, setKomodityList] = useState<any[]>([]);
  const [produksiList, setProduksiList] = useState<any[]>([]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    fetchDataKomodity();
    fetchDataProduksi();
    fetchPreference();

    if (formMode === "update" && initialData) {
      const updateItems =
        Array.isArray(initialData.items) && initialData.items.length > 0
          ? initialData.items.map((item: any) => ({
              id_komodity: Number(item.id_komodity) || 0,
              id_produksi: Number(item.id_produksi) || 0,
              jumlah_terjual: Number(item.jumlah_terjual) || 0,
              total_harga: Number(item.sub_total ?? 0),
              keterangan: "",
            }))
          : [createEmptyItem()];

      setFormItems(updateItems);
      setKeteranganGlobal(initialData.keterangan ?? "");
    } else {
      setFormItems([createEmptyItem()]);
      setKeteranganGlobal("");
      setFormErrors({});
    }
  }, [isOpen, formMode, initialData]);

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

  const fetchDataKomodity = async () => {
    try {
      const data = await apiRequest({ endpoint: "/komoditas" });
      setKomodityList(Array.isArray(data) ? data : [data]);
    } catch (error) {
      console.error("Error fetching komoditas:", error);
      toast.error("Gagal mengambil data komoditas.");
    }
  };

  const fetchDataProduksi = async () => {
    try {
      const data = await apiRequest({ endpoint: "/produksi" });
      setProduksiList(Array.isArray(data) ? data : [data]);
    } catch (error) {
      console.error("Error fetching produksi:", error);
      toast.error("Gagal mengambil data produksi.");
    }
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

  const getProduksiByKomoditas = (idKomoditas: number) => {
    if (!idKomoditas) return [];
    return produksiList.filter(
      (prod) => Number(prod.komoditas?.id) === idKomoditas,
    );
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
        const selectedProd = produksiList.find(
          (p) => Number(p.id) === current.id_produksi,
        );
        current.id_komodity = Number(selectedProd?.komoditas?.id ?? 0);
      }

      const selectedProduksi = produksiList.find(
        (p) => Number(p.id) === current.id_produksi,
      );
      if (selectedProduksi && current.jumlah_terjual > 0) {
        current.total_harga =
          Number(selectedProduksi.harga_persatuan) * current.jumlah_terjual;
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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    formItems.forEach((item, index) => {
      if (!item.id_komodity) {
        errors[`${index}.id_komodity`] = "Komoditas harus dipilih";
      }
      if (!item.id_produksi) {
        errors[`${index}.id_produksi`] = "Produksi harus dipilih";
      }
      if (!item.jumlah_terjual || item.jumlah_terjual <= 0) {
        errors[`${index}.jumlah_terjual`] = "Jumlah harus lebih dari 0";
      }

      if (item.id_produksi && item.jumlah_terjual) {
        const selected = produksiList.find(
          (p) => Number(p.id) === item.id_produksi,
        );
        if (selected && item.jumlah_terjual > Number(selected.jumlah)) {
          errors[`${index}.jumlah_terjual`] =
            `Stok tidak mencukupi. Tersedia: ${selected.jumlah}`;
        }
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Mohon periksa kembali data yang diisi.");
      return;
    }

    setLoading(true);

    const payload = {
      keterangan: keteranganGlobal,
      items: formItems.map((item) => ({
        id_komodity: item.id_komodity,
        id_produksi: item.id_produksi,
        jumlah_terjual: item.jumlah_terjual,
        total_harga: item.total_harga,
        keterangan: item.keterangan,
      })),
    };

    try {
      const endpoint =
        formMode === "create" ? "/penjualan" : `/penjualan/${initialData.id}`;
      const method = formMode === "create" ? "POST" : "PUT";

      await apiRequest({ endpoint, method, data: payload });

      toast.success(
        formMode === "create"
          ? "Data berhasil ditambahkan."
          : "Data berhasil diperbarui.",
      );

      if (formMode === "create" && cetakStruk) {
        const printableItems = payload.items
          .map((item) => {
            const selectedProd = produksiList.find(
              (p) => Number(p.id) === item.id_produksi,
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
            totalHarga: payload.items.reduce(
              (sum, item) => sum + item.total_harga,
              0,
            ),
            keterangan:
              keteranganGlobal ||
              payload.items
                .map((item) => item.keterangan.trim())
                .filter(Boolean)
                .join(" | "),
            tanggal: new Date(),
          });
        }
      }

      onSubmitSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Gagal menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 text-gray-900 dark:text-gray-100"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Item Penjualan</h4>
            <button
              type="button"
              onClick={addItem}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              + Tambah Item
            </button>
          </div>

          {formItems.map((item, index) => {
            const availableProduksi = getProduksiByKomoditas(item.id_komodity);
            return (
              <div
                key={index}
                className="rounded border border-gray-200 p-3 dark:border-gray-700"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Item {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={formItems.length === 1}
                    className="px-2 py-1 text-sm bg-red-100 text-red-700 rounded disabled:opacity-50"
                  >
                    Hapus
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm">
                      Pilih Komoditas
                    </label>
                    <select
                      value={item.id_komodity || ""}
                      onChange={(e) =>
                        handleItemChange(index, "id_komodity", e.target.value)
                      }
                      className="w-full border rounded px-2 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    >
                      <option value="">Pilih Komoditas</option>
                      {komodityList.map((komoditas) => (
                        <option key={komoditas.id} value={komoditas.id}>
                          {komoditas.nama}
                        </option>
                      ))}
                    </select>
                    {formErrors[`${index}.id_komodity`] ? (
                      <p className="mt-1 text-xs text-red-600">
                        {formErrors[`${index}.id_komodity`]}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm">Pilih Produksi</label>
                    <select
                      value={item.id_produksi || ""}
                      onChange={(e) =>
                        handleItemChange(index, "id_produksi", e.target.value)
                      }
                      className="w-full border rounded px-2 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    >
                      <option value="">Pilih Produksi</option>
                      {availableProduksi.map((produksi) => (
                        <option key={produksi.id} value={produksi.id}>
                          {produksi.kode_produksi} (stok: {produksi.jumlah})
                        </option>
                      ))}
                    </select>
                    {formErrors[`${index}.id_produksi`] ? (
                      <p className="mt-1 text-xs text-red-600">
                        {formErrors[`${index}.id_produksi`]}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm">Jumlah Terjual</label>
                    <input
                      type="number"
                      min={1}
                      value={item.jumlah_terjual || ""}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "jumlah_terjual",
                          e.target.value,
                        )
                      }
                      className="w-full border rounded px-2 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                    {formErrors[`${index}.jumlah_terjual`] ? (
                      <p className="mt-1 text-xs text-red-600">
                        {formErrors[`${index}.jumlah_terjual`]}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm">Subtotal</label>
                    <div className="rounded border bg-gray-50 px-2 py-2 text-sm dark:border-gray-600 dark:bg-gray-800">
                      Rp
                      {new Intl.NumberFormat("id-ID").format(
                        item.total_harga || 0,
                      )}
                      ,-
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="mb-1 block text-sm">
                    Keterangan Item (opsional)
                  </label>
                  <input
                    type="text"
                    value={item.keterangan}
                    onChange={(e) =>
                      handleItemChange(index, "keterangan", e.target.value)
                    }
                    className="w-full border rounded px-2 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            );
          })}

          <div>
            <label className="mb-1 block text-sm">
              Keterangan Transaksi (opsional)
            </label>
            <textarea
              value={keteranganGlobal}
              onChange={(e) => setKeteranganGlobal(e.target.value)}
              className="w-full border rounded px-2 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-y"
              rows={3}
            />
          </div>

          <div className="rounded border bg-gray-50 px-3 py-2 text-sm font-medium dark:border-gray-700 dark:bg-gray-800">
            Total transaksi: Rp
            {new Intl.NumberFormat("id-ID").format(
              formItems.reduce((sum, item) => sum + item.total_harga, 0),
            )}
            ,-
          </div>

          {formMode === "create" && (
            <>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cetakStruk}
                  onChange={(e) => handleCetakStrukChange(e.target.checked)}
                  className="w-4 h-4 accent-green-600"
                />
                <span>Cetak Struk Pembelian</span>
              </label>
            </>
          )}

          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-white text-gray-800 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
              onClick={onClose}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {loading
                ? "Menyimpan..."
                : formMode === "create"
                  ? "Submit"
                  : "Update"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
