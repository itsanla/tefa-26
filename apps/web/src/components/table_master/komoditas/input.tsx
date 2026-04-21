'use client';

import { useEffect, useState, useMemo } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { apiRequest } from '@/services/api.service';
import { toast } from 'sonner';

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
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Create Komoditas</h3>
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

interface InputKomoditasFormProps {
    isOpen: boolean;
    onClose: () => void;
    formMode?: "create" | "update";
    initialData?: any;
    onSubmitSuccess?: () => void;
}

export default function InputKomoditasForm({
    isOpen,
    onClose,
    formMode = "create",
    initialData,
    onSubmitSuccess,
}: InputKomoditasFormProps) {
    const [id_jenis, setIdJenis] = useState("");
    const [nama, setNama] = useState("");
    const [deskripsi, setDeskripsi] = useState("");
    const [foto, setFoto] = useState<File | null>(null);
    const [satuan, setSatuan] = useState("");
    const [isCustomSatuan, setIsCustomSatuan] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [jenisList, setJenisList] = useState<any[]>([]);

    // Memoize preview URL to prevent memory leak
    const previewUrl = useMemo(() => {
        return foto ? URL.createObjectURL(foto) : null;
    }, [foto]);

    // Cleanup blob URL on unmount or when foto changes
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    useEffect(() => {
        fetchDataJenis();

        if (formMode === "update" && initialData) {
            setIdJenis(initialData.id_jenis?.toString() || "");
            setNama(initialData.nama || "");
            setDeskripsi(initialData.deskripsi || "");
            setSatuan(initialData.satuan || "");
            setIsCustomSatuan(initialData.satuan && !["Kg", "Buah"].includes(initialData.satuan));
        }
        setErrors({}); // Clear errors on modal open/data change
    }, [formMode, initialData]);

    const fetchDataJenis = async () => {
        try {
            const data = await apiRequest({
                endpoint: "/jenis",
            });
            setJenisList(Array.isArray(data) ? data : [data]);
        } catch (err) {
            console.error("Gagal ambil data jenis:", err);
            toast.error("Gagal mengambil data jenis");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({}); // Clear previous errors

        try {
            const formData = new FormData();
            formData.append("id_jenis", id_jenis.toString());
            formData.append("nama", nama);
            formData.append("deskripsi", deskripsi);
            formData.append("satuan", satuan);
            if (foto) {
                formData.append("foto", foto);
            }

            const endpoint =
                formMode === "create"
                    ? "/komoditas"
                    : `/komoditas/${initialData?.id}`;
            const method = formMode === "create" ? "POST" : "PUT";

            await apiRequest({
                endpoint,
                method,
                data: formData,
            });

            toast.success(
                `Komoditas berhasil ${formMode === "create" ? "ditambahkan" : "diperbarui"}`
            );
            if (onSubmitSuccess) onSubmitSuccess();
            onClose();
        } catch (err: any) {
            console.error("Error submitting form:", err);
            if (err.response?.data?.errors) {
                const newErrors: Record<string, string> = {};
                err.response.data.errors.forEach((error: any) => {
                    newErrors[error.path] = error.msg;
                });
                setErrors(newErrors);
                toast.error(err.response.data.message || "Validasi gagal");
            } else {
                toast.error(err.message || "Terjadi kesalahan");
            }
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
                    <div className="flex items-center gap-4">
                        <label>Jenis Komoditas</label>
                    </div>
                    <select
                        value={id_jenis}
                        onChange={(e) => setIdJenis(e.target.value)}
                        className="border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white w-full"
                        required
                    >
                        <option value="">Pilih Jenis Komoditas</option>
                        {jenisList.map((jenis) => (
                            <option key={jenis.id} value={jenis.id}>
                                {jenis.name}
                            </option>
                        ))}
                    </select>

                    <label>Nama</label>
                    <input
                        type="text"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        className="border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                    />

                    <label>Deskripsi</label>
                    <textarea
                        value={deskripsi}
                        onChange={(e) => setDeskripsi(e.target.value)}
                        className="border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-y"
                        rows={4}
                    />


                    <label>Satuan</label>
                    <select
                        value={isCustomSatuan ? "Isi Sendiri" : satuan}
                        onChange={(e) => {
                            const selectedValue = e.target.value;
                            if (selectedValue === "Isi Sendiri") {
                                setIsCustomSatuan(true);
                                setSatuan(""); // Clear satuan when switching to custom
                            } else {
                                setIsCustomSatuan(false);
                                setSatuan(selectedValue);
                            }
                        }}
                        className="border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white w-full"
                    >
                        <option value="">Pilih Satuan</option>
                        <option value="Kg">Kg</option>
                        <option value="Buah">Buah</option>
                        <option value="Isi Sendiri">Isi Sendiri</option>
                    </select>
                    {isCustomSatuan && (
                        <input
                            type="text"
                            value={satuan}
                            onChange={(e) => setSatuan(e.target.value)}
                            className="border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white col-span-2"
                            placeholder="Masukkan satuan custom"
                            required
                        />
                    )}

                    <label>Upload Gambar</label>
                    <div className="flex flex-col gap-2">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    // Check file size (10MB = 10485760 bytes)
                                    if (file.size > 10485760) {
                                        toast.error('Ukuran file terlalu besar! Maksimal 10 MB');
                                        e.target.value = ''; // Reset input
                                        setFoto(null); // Clear state
                                        return;
                                    }
                                    setFoto(file);
                                }
                            }}
                            className="border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Format: JPG, PNG, JPEG. Maksimal ukuran: 10 MB
                        </p>
                    </div>

                    <label>Preview</label>
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-h-48 rounded border"
                        />
                    ) : initialData?.foto ? (
                        <img
                            src={initialData.foto}
                            alt="Preview"
                            className="max-h-48 rounded border"
                        />
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-300">
                            Belum ada gambar
                        </p>
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
