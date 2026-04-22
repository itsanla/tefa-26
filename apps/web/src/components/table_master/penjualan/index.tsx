"use client";
import { apiRequest } from "@/services/api.service";

import { DataTable } from "@/components/table/DataTable";
import { Penjualan as PenjualanType } from "@/types";
import ConfirmButton from "@/components/common/ConfirmButton";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { PenBox, Trash2 } from "lucide-react";
import InputPenjualanForm from "./input";
import ExportPenjualanModal from "./export";
import { printStruk } from "@/components/struk/StrukPembelian";

export default function Penjualan() {
  const [penjualanList, setPenjualanList] = useState<PenjualanType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [penjualanYgDipilih, setPenjualanYgDipilih] =
    useState<PenjualanType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [dataPenjualan, setDataPenjualan] = useState<PenjualanType[]>([]);

  const fetchDataPenjualan = async () => {
    try {
      setLoading(true);
      const data = await apiRequest({
        endpoint: "/penjualan",
      });
      console.log("DATA DARI BACKEND:", data);
      setPenjualanList(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error("Gagal ambil data Penjualan:", err);
      toast.error("Gagal mengambil data penjualan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataPenjualan();
  }, []);

  const handleOpenUpdateModal = (data: PenjualanType) => {
    setPenjualanYgDipilih(data);
    setIsUpdateOpen(true);
  };

  const handleOpenExportModal = (data: PenjualanType[]) => {
    setDataPenjualan(data);
    setIsExportModalOpen(true);
    console.log("Data untuk ekspor:", data);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setShowConfirm(true);
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

  const confirmDelete = async () => {
    if (deleteId !== null) {
      try {
        await apiRequest({
          endpoint: `/penjualan/${deleteId}`,
          method: "DELETE",
        });
        toast.success("Data berhasil dihapus.");
        fetchDataPenjualan();
      } catch (error) {
        console.error("Gagal hapus data Penjualan", error);
        toast.error("Gagal menghapus data.");
      } finally {
        setShowConfirm(false);
        setDeleteId(null);
      }
    }
  };

  const columns = [
    {
      header: "#",
      accessorKey: "id" as keyof PenjualanType,
      cell: (item: PenjualanType) =>
        (penjualanList.findIndex((p) => p.id === item.id) + 1).toString(),
    },
    {
      header: "Tanggal",
      accessorKey: "createdAt" as keyof PenjualanType,
      cell: (item: PenjualanType) =>
        item.createdAt
          ? new Date(item.createdAt).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "-",
    },
    {
      header: "Komoditas",
      accessorKey: "komoditas" as keyof PenjualanType,
      cell: (item: PenjualanType) => item.komoditas?.nama || "",
    },
    {
      header: "Ukuran",
      accessorKey: "produksi" as keyof PenjualanType,
      cell: (item: PenjualanType) => item.produksi?.ukuran || "",
    },
    {
      header: "Jumlah Terjual",
      accessorKey: "jumlah_terjual" as keyof PenjualanType,
      cell: (item: PenjualanType) => (
        <span className="font-medium">
          {item.jumlah_terjual
            ? `${item.jumlah_terjual} ${item.komoditas?.satuan}`
            : "-"}
        </span>
      ),
    },
    {
      header: "Total Harga",
      accessorKey: "total_harga" as keyof PenjualanType,
      cell: (item: PenjualanType) => (
        <span className="font-medium">
          {item.total_harga
            ? `Rp${new Intl.NumberFormat("id-ID").format(item.total_harga)},-`
            : "-"}
        </span>
      ),
    },
    {
      header: "Kualitas",
      accessorKey: "produksi" as keyof PenjualanType,
      cell: (item: PenjualanType) => item.produksi?.kualitas || "",
    },
    {
      header: "Produksi",
      accessorKey: "produksi" as keyof PenjualanType,
      cell: (item: PenjualanType) => item.produksi?.asal_produksi?.nama || "",
    },
    { header: "Keterangan", accessorKey: "keterangan" as keyof PenjualanType },
    {
      header: "Aksi",
      accessorKey: "id" as keyof PenjualanType,
      cell: (item: PenjualanType) => (
        <button
          className="bg-blue-600 px-4 py-3 rounded text-white"
          onClick={() => handlePrintClick(item.id)}
        >
          Print
        </button>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-end items-center w-full mb-4">
        <button
          onClick={() => handleOpenExportModal(penjualanList)}
          className="ml-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
        >
          Export Penjualan
        </button>

        <ExportPenjualanModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          penjualanList={dataPenjualan}
        />

        <button
          onClick={() => setIsModalOpen(true)}
          className="ml-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
        >
          Buat Penjualan
        </button>
        <InputPenjualanForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          formMode="create"
          onSubmitSuccess={() => {
            setIsModalOpen(false);
            fetchDataPenjualan();
          }}
        />
      </div>

      <DataTable
        data={penjualanList}
        columns={columns}
        loading={loading}
        emptyMessage="Tidak ada data penjualan."
      />
      <InputPenjualanForm
        isOpen={isUpdateOpen}
        onClose={() => setIsUpdateOpen(false)}
        initialData={penjualanYgDipilih}
        formMode="update"
        onSubmitSuccess={() => {
          setIsUpdateOpen(false);
          fetchDataPenjualan();
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
