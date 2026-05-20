"use client";
import { useEffect, useState } from "react";
import { apiRequest } from "@/services/api.service";
import toast from "react-hot-toast";
import { StokVariabel } from "@/types";

type Props = {
  selectedItem: StokVariabel | null;
  setSelectedItem: (item: StokVariabel | null) => void;
  onSuccess: () => void;
};

export default function InputStokVariabel({
  selectedItem,
  setSelectedItem,
  onSuccess,
}: Props) {
  const [nama, setNama] = useState("");
  const [jumlah, setJumlah] = useState<number>(0);
  const [formMode, setFormMode] = useState<"create" | "update">("create");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedItem) {
      setFormMode("update");
      setNama(selectedItem.nama);
      setJumlah(selectedItem.jumlah);
    } else {
      setFormMode("create");
      setNama("");
      setJumlah(0);
    }
    setErrors({});
  }, [selectedItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const payload = { nama, jumlah };
      if (formMode === "create") {
        await apiRequest({ endpoint: "/stok-variabel", method: "POST", data: payload });
        toast.success("Variabel stok berhasil ditambahkan.");
      } else if (formMode === "update" && selectedItem?.id) {
        await apiRequest({
          endpoint: `/stok-variabel/${selectedItem.id}`,
          method: "PUT",
          data: payload,
        });
        toast.success("Variabel stok diperbarui & produksi tersinkronisasi.");
      }

      setNama("");
      setJumlah(0);
      setFormMode("create");
      setSelectedItem(null);
      onSuccess();
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const newErrors: Record<string, string> = {};
        err.response.data.errors.forEach((error: any) => {
          newErrors[error.path] = error.msg;
        });
        setErrors(newErrors);
        toast.error(err.response.data.message || "Validasi gagal.");
      } else {
        toast.error(err.message || "Terjadi kesalahan.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedItem(null);
    setNama("");
    setJumlah(0);
    setFormMode("create");
    setErrors({});
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-900 p-4 rounded-md shadow-sm w-full"
    >
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Nama Variabel Stok
          </label>
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Contoh: Buah Manggis"
            required
          />
          {errors.nama && <p className="text-red-500 text-xs">{errors.nama}</p>}
        </div>

        <div className="flex flex-col gap-1 w-40">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Jumlah Stok
          </label>
          <input
            type="number"
            value={jumlah}
            min={0}
            onChange={(e) => setJumlah(Number(e.target.value))}
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Contoh: 400"
            required
          />
          {errors.jumlah && <p className="text-red-500 text-xs">{errors.jumlah}</p>}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Menyimpan..." : formMode === "create" ? "Simpan" : "Update"}
          </button>
          {formMode === "update" && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
            >
              Batal
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
