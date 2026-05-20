"use client";
import { useState } from "react";
import { PenBox, Trash2 } from "lucide-react";
import { apiRequest } from "@/services/api.service";
import { DataTable } from "@/components/table/DataTable";
import { StokVariabel } from "@/types";
import ConfirmButton from "@/components/common/ConfirmButton";
import toast from "react-hot-toast";
import { usePaginatedApi } from "@/hooks/usePaginatedApi";

type Props = {
  onEdit: (item: StokVariabel) => void;
  reloadTrigger: boolean;
};

export default function StokVariabelTable({ onEdit, reloadTrigger }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: stokList, meta, page, setPage, loading, refresh } =
    usePaginatedApi<StokVariabel>("/stok-variabel", [reloadTrigger]);
  const pageSize = meta?.pageSize ?? 10;

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (deleteId !== null) {
      try {
        await apiRequest({ endpoint: `/stok-variabel/${deleteId}`, method: "DELETE" });
        toast.success("Variabel stok berhasil dihapus.");
        refresh(1);
      } catch (error) {
        toast.error("Gagal menghapus variabel stok.");
      } finally {
        setShowConfirm(false);
        setDeleteId(null);
      }
    }
  };

  const columns = [
    {
      header: "#",
      accessorKey: "id" as keyof StokVariabel,
      cell: (item: StokVariabel) =>
        ((page - 1) * pageSize + stokList.findIndex((s) => s.id === item.id) + 1).toString(),
    },
    { header: "Nama Variabel", accessorKey: "nama" as keyof StokVariabel },
    {
      header: "Jumlah Stok",
      accessorKey: "jumlah" as keyof StokVariabel,
      cell: (item: StokVariabel) => `${item.jumlah.toLocaleString("id-ID")}`,
    },
    {
      header: "Dipakai Produksi",
      accessorKey: "jumlah_produksi" as keyof StokVariabel,
      cell: (item: StokVariabel) => (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200">
          {item.jumlah_produksi ?? 0} produksi
        </span>
      ),
    },
    {
      header: "Aksi",
      accessorKey: "id" as keyof StokVariabel,
      cell: (item: StokVariabel) => (
        <div className="flex gap-2">
          <button onClick={() => onEdit(item)} className="tf-action tf-action-edit">
            <PenBox size={16} />
          </button>
          <button onClick={() => handleDeleteClick(item.id)} className="tf-action tf-action-delete">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={stokList}
        columns={columns}
        loading={loading}
        title="Daftar Variabel Stok"
        emptyMessage="Belum ada variabel stok. Tambahkan di atas."
        serverPagination={
          meta
            ? {
                page,
                pageSize: meta.pageSize,
                totalItems: meta.totalItems,
                totalPages: meta.totalPages,
                onPageChange: setPage,
              }
            : undefined
        }
      />
      {showConfirm && (
        <ConfirmButton
          message="Yakin ingin menghapus variabel stok ini? Produksi yang memakainya akan dilepas dan stoknya menjadi manual."
          onConfirm={confirmDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
