import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, Plus } from "lucide-react";

interface DataTableProps<T> {
  data: T[];
  columns: {
    header: string;
    accessorKey: keyof T;
    cell?: (item: T) => React.ReactNode;
    sortable?: boolean;
  }[];
  pageSize?: number;
  emptyMessage?: string;
  loading?: boolean;
  _create?: () => void;
  title?: string;
}

type SortDirection = "asc" | "desc" | null;

interface SortConfig<T> {
  key: keyof T | null;
  direction: SortDirection;
}

export function DataTable<T>({
  data,
  columns,
  _create,
  pageSize = 10,
  loading,
  emptyMessage = "Tidak ada data ditemukan.",
  title = "Daftar Data",
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({
    key: null,
    direction: null,
  });

  const handleSort = (key: keyof T) => {
    let direction: SortDirection = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    else if (sortConfig.key === key && sortConfig.direction === "desc") direction = null;
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const getSortIcon = (columnKey: keyof T) => {
    if (sortConfig.key !== columnKey)
      return <ChevronsUpDown className="w-3.5 h-3.5" style={{ opacity: 0.4 }} />;
    if (sortConfig.direction === "asc")
      return <ChevronUp className="w-3.5 h-3.5" style={{ color: "#16A34A" }} />;
    if (sortConfig.direction === "desc")
      return <ChevronDown className="w-3.5 h-3.5" style={{ color: "#16A34A" }} />;
    return <ChevronsUpDown className="w-3.5 h-3.5" style={{ opacity: 0.4 }} />;
  };

  const filteredData = data.filter((item: any) =>
    Object.values(item).some((value: any) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key || !sortConfig.direction) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortConfig.direction === "asc" ? 1 : -1;
    if (bValue == null) return sortConfig.direction === "asc" ? -1 : 1;
    const aNum = Number(aValue);
    const bNum = Number(bValue);
    if (!isNaN(aNum) && !isNaN(bNum))
      return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
    if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const totalItems = sortedData.length;
  const pageData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
          flexWrap: "wrap",
          animation: "dt-slideUp .3s .05s ease both",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search
            className="w-4 h-4"
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9CA3AF",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari..."
            style={{
              padding: "11px 14px 11px 36px",
              borderRadius: 12,
              border: "1.5px solid #E5E7EB",
              fontSize: 15,
              color: "#111827",
              background: "#F9FAFB",
              outline: "none",
              fontFamily: "inherit",
              width: "100%",
              transition: "all .15s",
            }}
            className="dt-input"
          />
        </div>

        {_create && (
          <button onClick={_create} className="dt-btn-green" type="button">
            <Plus className="w-4 h-4" /> Tambahkan
          </button>
        )}
      </div>

      {/* Card */}
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 1px 3px rgba(0,0,0,.06), 0 4px 20px rgba(0,0,0,.05)",
          border: "1px solid rgba(0,0,0,.06)",
          overflow: "hidden",
          animation: "dt-slideUp .3s .1s ease both",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #F3F4F6",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
              {title}
            </div>
            <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 1 }}>
              {totalItems} dari {data.length} entri
            </div>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                {columns.map((col, i) => {
                  const isSorted = sortConfig.key === col.accessorKey && sortConfig.direction;
                  return (
                    <th
                      key={i}
                      style={{
                        padding: "11px 16px",
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 600,
                        color: isSorted ? "#16A34A" : "#9CA3AF",
                        textTransform: "uppercase",
                        letterSpacing: ".06em",
                        borderBottom: "1px solid #F3F4F6",
                        whiteSpace: "nowrap",
                        cursor: col.sortable !== false ? "pointer" : "default",
                        userSelect: "none",
                        transition: "color .15s",
                      }}
                      onClick={() =>
                        col.sortable !== false && handleSort(col.accessorKey)
                      }
                      className={col.sortable !== false ? "dt-sort-th" : ""}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {col.header}
                        {col.sortable !== false && getSortIcon(col.accessorKey)}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    style={{
                      textAlign: "center",
                      padding: "48px",
                      color: "#9CA3AF",
                      fontSize: 14,
                    }}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <span
                        style={{
                          width: 16,
                          height: 16,
                          border: "2px solid #16A34A",
                          borderTopColor: "transparent",
                          borderRadius: "50%",
                          display: "inline-block",
                          animation: "dt-spin .8s linear infinite",
                        }}
                      />
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : pageData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    style={{
                      textAlign: "center",
                      padding: "56px",
                      color: "#D1D5DB",
                      fontSize: 14,
                    }}
                  >
                    <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                pageData.map((item, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="dt-row"
                    style={{
                      borderBottom: "1px solid #F9FAFB",
                      animation: `dt-rowIn .3s ${rowIdx * 0.03}s ease both`,
                    }}
                  >
                    {columns.map((col, colIdx) => (
                      <td
                        key={colIdx}
                        style={{
                          padding: "13px 16px",
                          fontSize: 14,
                          color: "#374151",
                        }}
                      >
                        {col.cell
                          ? col.cell(item)
                          : (item[col.accessorKey] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            padding: "13px 20px",
            borderTop: "1px solid #F3F4F6",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 13, color: "#9CA3AF" }}>
            Menampilkan{" "}
            {totalItems === 0 ? 0 : Math.min((currentPage - 1) * pageSize + 1, totalItems)}{" "}
            – {Math.min(currentPage * pageSize, totalItems)} dari {totalItems}
          </span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="dt-page-btn"
              style={{ opacity: currentPage === 1 ? 0.45 : 1 }}
              type="button"
            >
              Prev
            </button>
            <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 600 }}>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="dt-page-btn"
              style={{ opacity: currentPage >= totalPages ? 0.45 : 1 }}
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes dt-slideUp {
          from {
            transform: translateY(8px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes dt-rowIn {
          from {
            opacity: 0;
            transform: translateX(-4px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes dt-spin {
          to {
            transform: rotate(360deg);
          }
        }
        .dt-row:hover {
          background: #F9FBF9;
        }
        .dt-sort-th:hover {
          color: #16A34A !important;
        }
        .dt-input:focus {
          border-color: #16A34A !important;
          background: #fff !important;
          box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.12) !important;
        }
        .dt-btn-green {
          background: #16A34A;
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-family: inherit;
          transition: transform .15s, box-shadow .15s;
          box-shadow: 0 2px 10px rgba(22, 163, 74, 0.3);
        }
        .dt-btn-green:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 18px rgba(22, 163, 74, 0.4);
        }
        .dt-btn-green:active {
          transform: scale(0.97);
        }
        .dt-page-btn {
          padding: 6px 14px;
          border-radius: 9px;
          border: 1.5px solid #E5E7EB;
          background: #fff;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          font-family: inherit;
          transition: all .15s;
        }
        .dt-page-btn:hover:not(:disabled) {
          border-color: #16A34A;
          color: #16A34A;
        }
        .dt-page-btn:disabled {
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}
