"use client";
import { apiRequest } from "@/services/api.service";
import InputProduksiForm from "./input";
import { DataTable } from "@/components/table/DataTable";
import { Produksi as ProduksiType } from "@/types";
import ConfirmButton from "@/components/common/ConfirmButton";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { PenBox, Trash2 } from "lucide-react";

export default function Produksi() {
    const [produksiList, setProduksiList] = useState<ProduksiType[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [produksiYgDipilih, setProduksiYgDipilih] = useState<ProduksiType | null>(null);
    const [loading, setLoading] = useState(true);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const fetchDataProduksi = async () => {
        try {
            setLoading(true);
            const data = await apiRequest({
                endpoint: "/produksi",
            });
            console.log("DATA DARI BACKEND:", data);
            setProduksiList(Array.isArray(data) ? data : [data]);
        } catch (err) {
            console.error("Gagal ambil data Produksi:", err);
            toast.error("Gagal mengambil data produksi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDataProduksi();
    }, []);

    const handleOpenUpdateModal = (data: ProduksiType) => {
        setProduksiYgDipilih(data);
        setIsUpdateOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
        setShowConfirm(true);
    };

    const confirmDelete = async () => {
        if (deleteId !== null) {
            try {
                await apiRequest({
                    endpoint: `/produksi/${deleteId}`,
                    method: "DELETE",
                });
                toast.success("Data berhasil dihapus.");
                fetchDataProduksi();
            } catch (error) {
                console.error("Gagal hapus data Produksi", error);
                toast.error("Gagal menghapus data.")
            } finally {
                setShowConfirm(false);
                setDeleteId(null);
            }
        }
    };

    const columns = [
        {
            header: "#",
            accessorKey: "id" as keyof ProduksiType,
            cell: (item: ProduksiType) => (produksiList.findIndex((p) => p.id === item.id) + 1).toString(),
        },
        { header: "Kode Produksi", accessorKey: "kode_produksi" as keyof ProduksiType },
        { header: "Asal Produksi", accessorKey: "asal_produksi" as keyof ProduksiType, cell: (item: ProduksiType) => item.asal_produksi.nama },
        { header: "Jenis Komoditas", accessorKey: "komoditas" as keyof ProduksiType, cell: (item: ProduksiType) => item.komoditas?.nama || "" },
        { header: "Ukuran", accessorKey: "ukuran" as keyof ProduksiType },
        { header: "Kualitas", accessorKey: "kualitas" as keyof ProduksiType },
        {
            header: "Harga per Satuan",
            accessorKey: "harga_persatuan" as keyof ProduksiType,
            cell: (item: ProduksiType) => (
                <span className="font-medium">
                    {item.harga_persatuan
                        ? `Rp${new Intl.NumberFormat("id-ID").format(item.harga_persatuan)},-`
                        : "Rp0,-"}
                </span>
            ),
        },
        { header: "Jumlah Produksi", accessorKey: "jumlah" as keyof ProduksiType },
        {
            header: "Aksi",
            accessorKey: "id" as keyof ProduksiType,
            cell: (item: ProduksiType) => (
                <div className="flex gap-2">
                    <button
                        className="tf-action tf-action-edit"
                        onClick={() =>
                            handleOpenUpdateModal(item)
                        }
                    >
                        <PenBox size={16} />
                    </button>
                    <button
                        onClick={() => handleDeleteClick(item.id)}
                        className="tf-action tf-action-delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="tf-toolbar" style={{ justifyContent: "flex-end" }}>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="tf-btn-green"
                    type="button">
                    + Tambah Produksi
                </button>
                <InputProduksiForm
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    formMode="create"
                    initialData={null}
                    onSubmitSuccess={() => {
                        setIsModalOpen(false);
                        fetchDataProduksi();
                    }}
                />
            </div>
            <DataTable
                data={produksiList}
                columns={columns}
                loading={loading}
                title="Daftar Produksi"
                emptyMessage="Tidak ada data produksi."
            />
            <InputProduksiForm
                isOpen={isUpdateOpen}
                onClose={() => setIsUpdateOpen(false)}
                formMode="update"
                initialData={produksiYgDipilih}
                onSubmitSuccess={() => {
                    setIsUpdateOpen(false);
                    fetchDataProduksi();
                }}
            />
            {showConfirm && (
                <ConfirmButton
                    message="Yakin ingin menghapus data ini?"
                    onConfirm={confirmDelete}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
        </>
    );
}
