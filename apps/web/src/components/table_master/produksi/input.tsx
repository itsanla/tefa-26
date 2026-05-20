"use client";
import { apiRequest, fetchAllPages } from "@/services/api.service";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    // Handle ESC key to close modal
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    // Handle click outside to close
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
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Tambah Produksi</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-none"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-4 text-gray-800 dark:text-gray-200">
                    {children}
                </div>
            </div>
        </div>
    );
};

interface InputFormProps {
    isOpen: boolean,
    onClose: () => void,
    formMode: "create" | "update",
    initialData?: any,
    onSubmitSuccess: () => void
}

export default function InputProduksiForm({
    isOpen,
    onClose,
    formMode = "create",
    initialData,
    onSubmitSuccess }: InputFormProps) {
    const [id_asal, setId_Asal] = useState("");
    const [id_komoditas, setIdKomoditas] = useState("");
    const [kode_produksi, setKode_Produksi] = useState("");
    const [kualitas, setKualitas] = useState("");
    const [jumlah_diproduksi, setJumlahDiproduksi] = useState("");
    const [harga_persatuan, setHargaPersatuan] = useState("");
    const [harga_per_buah, setHargaPerBuah] = useState("");
    const [isCustomKualitas, setIsCustomKualitas] = useState(false);
    const [keterangan, setKeterangan] = useState("");
    const [loading, setLoading] = useState(false);

    const [stokMode, setStokMode] = useState<"manual" | "variabel">("manual");
    const [id_stok_variabel, setIdStokVariabel] = useState("");

    const [asalList, setAsalList] = useState<any[]>([]);
    const [komoditasList, setKomoditasList] = useState<any[]>([]);
    const [stokVariabelList, setStokVariabelList] = useState<any[]>([]);


    useEffect(() => {
        fetchDataAsal();
        fetchDataKomoditas();
        fetchDataStokVariabel();

        if (formMode === "update" && initialData) {
            setId_Asal(initialData.id_asal?.toString() || "");
            setIdKomoditas(initialData.id_komoditas?.toString() || "");
            setKode_Produksi(initialData.kode_produksi || "");
            setKualitas(initialData.kualitas || "");
            setJumlahDiproduksi(initialData.jumlah?.toString() || "");
            setHargaPersatuan(initialData.harga_persatuan?.toString() || "");
            setHargaPerBuah(initialData.harga_per_buah?.toString() || "");
            setIsCustomKualitas(initialData.kualitas && !["Medium", "Premium"].includes(initialData.kualitas));
            setKeterangan("");
            if (initialData.id_stok_variabel) {
                setStokMode("variabel");
                setIdStokVariabel(initialData.id_stok_variabel.toString());
            } else {
                setStokMode("manual");
                setIdStokVariabel("");
            }
        } else if (formMode === "create") {
            setStokMode("manual");
            setIdStokVariabel("");
        }
    }, [formMode, initialData]);

    const selectedVariabel = stokVariabelList.find(
        (variabel) => variabel.id.toString() === id_stok_variabel,
    );

    const fetchDataAsal = async () => {
        try {
            const data = await fetchAllPages({
                endpoint: "/asal-produksi",
            });
            setAsalList(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Gagal ambil data Asal:", error);
            toast.error("Gagal mengambil data asal produksi.");
        }
    };

    const fetchDataKomoditas = async () => {
        try {
            const data = await fetchAllPages({
                endpoint: "/komoditas",
            });
            setKomoditasList(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Gagal ambil data Komoditas:", error);
            toast.error("Gagal mengambil data komoditas.");
        }
    };

    const fetchDataStokVariabel = async () => {
        try {
            const data = await fetchAllPages({
                endpoint: "/stok-variabel",
            });
            setStokVariabelList(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Gagal ambil data Variabel Stok:", error);
            toast.error("Gagal mengambil data variabel stok.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (stokMode === "variabel" && !id_stok_variabel) {
            toast.error("Pilih variabel stok terlebih dahulu.");
            return;
        }

        setLoading(true);

        const payload: Record<string, unknown> = {
            id_asal: parseInt(id_asal),
            id_komoditas: parseInt(id_komoditas),
            kode_produksi,
            kualitas,
            harga_persatuan: parseFloat(harga_persatuan),
            harga_per_buah: parseFloat(harga_per_buah) || 0,
        };
        if (stokMode === "variabel") {
            payload.id_stok_variabel = parseInt(id_stok_variabel);
        } else {
            payload.id_stok_variabel = null;
            payload.jumlah_diproduksi = parseInt(jumlah_diproduksi);
        }
        if (formMode === "update") {
            payload.keterangan = keterangan;
        }

        try {
        
            const endpoint = formMode === "create" ? "/produksi" : `/produksi/${initialData.id}`;
            const method = formMode === "create" ? "POST" : "PUT";

            await apiRequest({
                endpoint,
                method,
                data: payload
            });

            toast.success(
                `produksi berhasil ${formMode === "create" ? "ditambahkan" : "diperbarui"}`
            );
            if (onSubmitSuccess) onSubmitSuccess();
            onClose();
        } catch (error) {
            console.error("Gagal simpan data Produksi:", error);
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
                    className="grid grid-cols-2 gap-4 text-gray-900 dark:text-gray-100"
                >
                    <label>Kode Produksi</label>
                    <input
                        type="text"
                        value={kode_produksi}
                        onChange={(e) => setKode_Produksi(e.target.value)}
                        className="border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                    />

                    <div className="flex items-center gap-4">
                        <label>Asal Produksi</label>
                    </div>
                    <select
                        value={id_asal}
                        onChange={(e) => setId_Asal(e.target.value)}
                        className="border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white w-full"
                        required
                    >
                        <option value="">Pilih Asal Produksi</option>
                        {asalList.map((asal) => (
                            <option key={asal.id} value={asal.id}>
                                {asal.nama}
                            </option>
                        ))}
                    </select>

                    <div className="flex items-center gap-4">
                        <label>Jenis Komoditas</label>
                    </div>
                    <select
                        value={id_komoditas}
                        onChange={(e) => {
                            const selectedKomoditasId = e.target.value;
                            setIdKomoditas(selectedKomoditasId);
                            }}
                        className="border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white w-full"
                        required
                    >
                        <option value="">Pilih Komoditas</option>
                        {komoditasList.map((komoditas) => (
                            <option key={komoditas.id} value={komoditas.id}>
                                {komoditas.nama}
                            </option>
                        ))}
                    </select>

                    <label>Kualitas</label>
                    <select
                        value={isCustomKualitas ? "Isi Sendiri" : kualitas}
                        onChange={(e) => {
                            const selectedValue = e.target.value;
                            if (selectedValue === "Isi Sendiri") {
                                setIsCustomKualitas(true);
                                setKualitas(""); // Clear kualitas when switching to custom
                            } else {
                                setIsCustomKualitas(false);
                                setKualitas(selectedValue);
                            }
                        }}
                        className="border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white w-full"
                    >
                        <option value="">Pilih Kualitas</option>
                        <option value="Medium">Medium</option>
                        <option value="Premium">Premium</option>
                        <option value="Isi Sendiri">Isi Sendiri</option>
                    </select>
                    {isCustomKualitas && (
                        <input
                            type="text"
                            value={kualitas}
                            onChange={(e) => setKualitas(e.target.value)}
                            className="border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white col-span-2"
                            placeholder="Masukkan kualitas custom"
                        />
                    )}

                    <label>Sumber Stok</label>
                    <select
                        value={stokMode}
                        onChange={(e) => setStokMode(e.target.value as "manual" | "variabel")}
                        className="border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white w-full"
                    >
                        <option value="manual">Input Manual</option>
                        <option value="variabel">Gunakan Variabel Stok</option>
                    </select>

                    {stokMode === "manual" ? (
                        <>
                            <label>Jumlah</label>
                            <input
                                type="number"
                                placeholder={`Dalam buah`}
                                value={jumlah_diproduksi}
                                onChange={(e) => setJumlahDiproduksi(e.target.value)}
                                className="border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                min="0"
                                required
                            />
                        </>
                    ) : (
                        <>
                            <label>Variabel Stok</label>
                            <select
                                value={id_stok_variabel}
                                onChange={(e) => setIdStokVariabel(e.target.value)}
                                className="border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white w-full"
                                required
                            >
                                <option value="">Pilih Variabel Stok</option>
                                {stokVariabelList.map((variabel) => (
                                    <option key={variabel.id} value={variabel.id}>
                                        {variabel.nama} (stok: {variabel.jumlah})
                                    </option>
                                ))}
                            </select>
                            <div className="col-span-2 -mt-2">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {selectedVariabel
                                        ? `Stok mengikuti variabel "${selectedVariabel.nama}" = ${selectedVariabel.jumlah}. Mengubah nilai variabel akan tersinkron ke semua produksi yang memakainya.`
                                        : "Pilih variabel stok yang sudah didefinisikan di menu Variabel Stok."}
                                </p>
                            </div>
                        </>
                    )}

                    <label>Harga per kg</label>
                    <input
                        type="number"
                        value={harga_persatuan}
                        onChange={(e) => setHargaPersatuan(e.target.value)}
                        className="border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        min="0"
                    />

                    <label>Harga per buah</label>
                    <input
                        type="number"
                        value={harga_per_buah}
                        onChange={(e) => setHargaPerBuah(e.target.value)}
                        className="border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        min="0"
                        placeholder="0 (jika tidak dijual per buah)"
                    />

                    {formMode === "update" && (
                        <>
                            <label className="col-span-2 font-semibold text-sm text-gray-700 dark:text-gray-300 mt-2">
                                Keterangan <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={keterangan}
                                onChange={(e) => setKeterangan(e.target.value)}
                                className="col-span-2 border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                                rows={2}
                                placeholder="Tuliskan alasan perubahan stok..."
                                required
                            />
                        </>
                    )}

                    <div className="col-span-2 mt-4 flex justify-end space-x-2">
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
                            {loading ? "Menyimpan..." : formMode === "create" ? "Submit" : "Update"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
