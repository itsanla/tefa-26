"use client";
import { apiRequest } from "@/services/api.service";

import { DataTable } from "@/components/table/DataTable";
import { Penjualan as PenjualanType } from "@/types";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Printer, Download, Plus } from "lucide-react";
import InputPenjualanForm from "./input";
import ExportPenjualanModal from "./export";
import { printStruk } from "@/components/struk/StrukPembelian";

export default function Penjualan() {
  const [penjualanList, setPenjualanList] = useState<PenjualanType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [dataPenjualan, setDataPenjualan] = useState<PenjualanType[]>([]);
  const [expandedPenjualanId, setExpandedPenjualanId] = useState<number | null>(
    null,
  );
  const [penjualanDetails, setPenjualanDetails] = useState<
    Record<number, PenjualanType>
  >({});
  const [loadingPenjualanDetailId, setLoadingPenjualanDetailId] = useState<
    number | null
  >(null);

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

  const handleOpenExportModal = (data: PenjualanType[]) => {
    setDataPenjualan(data);
    setIsExportModalOpen(true);
    console.log("Data untuk ekspor:", data);
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

  const loadPenjualanDetail = async (id: number) => {
    if (penjualanDetails[id]) return penjualanDetails[id];

    setLoadingPenjualanDetailId(id);
    try {
      const detail = await apiRequest({ endpoint: `/penjualan/${id}` });
      setPenjualanDetails((current) => ({ ...current, [id]: detail }));
      return detail;
    } finally {
      setLoadingPenjualanDetailId((current) => (current === id ? null : current));
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
      console.error("Gagal memuat detail item penjualan:", error);
      toast.error("Gagal memuat detail item penjualan.");
      setExpandedPenjualanId(null);
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
      header: "Jumlah Produk",
      accessorKey: "jumlah_produk" as keyof PenjualanType,
      cell: (item: PenjualanType) => (
        <span className="font-medium">
          {item.jumlah_produk ?? item.items?.length ?? 0} produk
        </span>
      ),
    },
    {
      header: "Kode Produksi",
      accessorKey: "kode_produksi_list" as keyof PenjualanType,
      cell: (item: PenjualanType) => {
        const kodeList = item.kode_produksi_list ?? [];
        const visible = kodeList.slice(0, 2);
        const moreCount = Math.max(kodeList.length - visible.length, 0);

        return (
          <div className="flex flex-wrap items-center gap-2">
            {visible.length === 0 ? (
              <span className="text-gray-500">-</span>
            ) : (
              visible.map((kode) => (
                <span
                  key={`${item.id}-${kode}`}
                  className="rounded bg-blue-100 px-2 py-1 text-xs font-mono text-blue-800"
                >
                  {kode}
                </span>
              ))
            )}
            {moreCount > 0 ? (
              <span className="text-xs text-gray-500">
                +{moreCount} lainnya
              </span>
            ) : null}
          </div>
        );
      },
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
    { header: "Keterangan", accessorKey: "keterangan" as keyof PenjualanType },
    {
      header: "Aksi",
      accessorKey: "id" as keyof PenjualanType,
      cell: (item: PenjualanType) => (
        <div className="relative flex items-center gap-2 justify-end">
          <button
            className="tf-action tf-action-info"
            onClick={() => togglePenjualanDropdown(item.id)}
            type="button"
            title="Detail"
          >
            {expandedPenjualanId === item.id ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>

          <button
            className="tf-action tf-action-print"
            onClick={() => handlePrintClick(item.id)}
            type="button"
            title="Print struk"
          >
            <Printer size={16} />
          </button>

          {expandedPenjualanId === item.id && (
            <div className="absolute right-0 top-full z-20 mt-2 w-[28rem] rounded-xl border border-gray-200 bg-white p-4 shadow-2xl">
              {loadingPenjualanDetailId === item.id ? (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-500">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  Memuat item penjualan...
                </div>
              ) : (
                <>
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Item Penjualan
                      </p>
                      <p className="text-xs text-gray-500">
                        {penjualanDetails[item.id]?.items?.length ?? 0} item
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedPenjualanId(null)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Tutup
                    </button>
                  </div>

                  <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                    {(penjualanDetails[item.id]?.items ?? []).length > 0 ? (
                      penjualanDetails[item.id]!.items!.map((detailItem) => (
                        <div
                          key={detailItem.id}
                          className="rounded-lg border border-gray-200 p-3 text-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-gray-900">
                                {detailItem.komoditas?.nama ?? "-"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {detailItem.produksi?.kode_produksi ?? "-"} ·{" "}
                                {detailItem.produksi?.ukuran ?? "-"} ·{" "}
                                {detailItem.produksi?.kualitas ?? "-"}
                              </p>
                            </div>
                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                              {detailItem.jumlah_terjual} pcs
                            </span>
                          </div>

                          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
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
                      <div className="rounded-lg border border-dashed border-gray-300 px-3 py-6 text-center text-sm text-gray-500">
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
    <>
      <div className="tf-toolbar" style={{ justifyContent: "flex-end" }}>
        <button
          onClick={() => handleOpenExportModal(penjualanList)}
          className="tf-btn-yellow"
          type="button"
        >
          <Download size={16} /> Export Penjualan
        </button>

        <ExportPenjualanModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          penjualanList={dataPenjualan}
        />

        <button
          onClick={() => setIsModalOpen(true)}
          className="tf-btn-green"
          type="button"
        >
          <Plus size={16} /> Buat Penjualan
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
        title="Daftar Penjualan"
        emptyMessage="Tidak ada data penjualan."
      />
    </>
  );
}
