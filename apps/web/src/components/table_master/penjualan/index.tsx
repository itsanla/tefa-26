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
import { usePaginatedApi } from "@/hooks/usePaginatedApi";

export default function Penjualan() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
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

  const trimmedSearchTerm = debouncedSearchTerm.trim().toLowerCase();
  const penjualanEndpoint = trimmedSearchTerm
    ? `/penjualan?search=${encodeURIComponent(trimmedSearchTerm)}`
    : "/penjualan";

  useEffect(() => {
    const debounceId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(debounceId);
  }, [searchTerm]);

  const {
    data: penjualanList,
    meta,
    page,
    setPage,
    loading: loadingList,
    refresh,
  } = usePaginatedApi<PenjualanType>(penjualanEndpoint, [trimmedSearchTerm]);
  const pageSize = meta?.pageSize ?? 10;

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
        (
          (page - 1) * pageSize +
          penjualanList.findIndex((p) => p.id === item.id) +
          1
        ).toString(),
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
            onClick={() => togglePenjualanDropdown(item.id)}
            type="button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 12px",
              borderRadius: 9,
              border: "1.5px solid #E5E7EB",
              background: expandedPenjualanId === item.id ? "#EFF6FF" : "#fff",
              color: expandedPenjualanId === item.id ? "#2563EB" : "#374151",
              borderColor:
                expandedPenjualanId === item.id ? "#BFDBFE" : "#E5E7EB",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all .15s",
            }}
          >
            Detail
            {expandedPenjualanId === item.id ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
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

          {/* modal dirender di level atas, bukan di sini */}
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
            refresh(1);
          }}
        />
      </div>

      <DataTable
        data={penjualanList}
        columns={columns}
        loading={loadingList || loading}
        title="Daftar Penjualan"
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        searchPlaceholder="Cari id, kode produksi, keterangan, kualitas, atau ukuran..."
        emptyMessage="Tidak ada data penjualan."
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

      {/* ── Detail Modal — dirender di luar tabel agar fixed positioning bekerja ── */}
      {expandedPenjualanId !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            background: "rgba(0,0,0,0.35)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
          onClick={() => setExpandedPenjualanId(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              width: "100%",
              maxWidth: 480,
              boxShadow: "0 32px 80px rgba(0,0,0,.2)",
              animation: "dt-slideUp .25s cubic-bezier(.34,1.56,.64,1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: "18px 20px 14px",
                borderBottom: "1px solid #F3F4F6",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#111827",
                    margin: 0,
                  }}
                >
                  Item Penjualan
                </p>
                <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                  {penjualanDetails[expandedPenjualanId]?.items?.length ?? 0}{" "}
                  item
                </p>
              </div>
              <button
                type="button"
                onClick={() => setExpandedPenjualanId(null)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "none",
                  background: "#F3F4F6",
                  cursor: "pointer",
                  fontSize: 13,
                  color: "#6B7280",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            {loadingPenjualanDetailId === expandedPenjualanId ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "48px 20px",
                  color: "#9CA3AF",
                  fontSize: 14,
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    border: "2px solid #2563EB",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "dt-spin .8s linear infinite",
                  }}
                />
                Memuat item penjualan...
              </div>
            ) : (
              <div
                style={{
                  padding: "14px 20px 20px",
                  maxHeight: "60vh",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {(penjualanDetails[expandedPenjualanId]?.items ?? []).length >
                0 ? (
                  penjualanDetails[expandedPenjualanId]!.items!.map(
                    (detailItem) => (
                      <div
                        key={detailItem.id}
                        style={{
                          border: "1px solid #F3F4F6",
                          borderRadius: 12,
                          padding: "12px 14px",
                          background: "#FAFAFA",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: 12,
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <p
                              style={{
                                fontWeight: 600,
                                fontSize: 14,
                                color: "#111827",
                                margin: 0,
                              }}
                            >
                              {detailItem.komoditas?.nama ?? "-"}
                            </p>
                            <p
                              style={{
                                fontSize: 12,
                                color: "#9CA3AF",
                                marginTop: 2,
                              }}
                            >
                              {detailItem.produksi?.kode_produksi ?? "-"} ·{" "}
                              {detailItem.produksi?.ukuran ?? "-"} ·{" "}
                              {detailItem.produksi?.kualitas ?? "-"}
                            </p>
                          </div>
                          <span
                            style={{
                              background: "#EFF6FF",
                              color: "#2563EB",
                              borderRadius: 20,
                              padding: "3px 10px",
                              fontSize: 12,
                              fontWeight: 600,
                              flexShrink: 0,
                            }}
                          >
                            {detailItem.jumlah_terjual} pcs
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: 8,
                            fontSize: 12,
                            color: "#6B7280",
                          }}
                        >
                          <span>
                            Rp
                            {new Intl.NumberFormat("id-ID").format(
                              detailItem.harga_satuan,
                            )}
                            ,-
                          </span>
                          <span style={{ fontWeight: 600, color: "#111827" }}>
                            Subtotal Rp
                            {new Intl.NumberFormat("id-ID").format(
                              detailItem.sub_total,
                            )}
                            ,-
                          </span>
                        </div>
                      </div>
                    ),
                  )
                ) : (
                  <div
                    style={{
                      border: "1.5px dashed #E5E7EB",
                      borderRadius: 12,
                      padding: "32px 16px",
                      textAlign: "center",
                      fontSize: 14,
                      color: "#9CA3AF",
                    }}
                  >
                    Tidak ada detail item.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
