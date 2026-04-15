"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../lib/auth";
import {
  getSiswaList,
  exportExcel,
  exportPdf,
  type SiswaData,
} from "../../lib/api";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function GuruDashboard() {
  const { user, loading, handleLogout } = useAuth();
  const [siswaList, setSiswaList] = useState<SiswaData[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/";
      return;
    }
    if (!loading && user && user.role !== "guru") {
      window.location.href = `/dashboard/${user.role}`;
      return;
    }
  }, [user, loading]);

  const fetchData = useCallback(
    async (page = 1, searchQuery = search) => {
      setFetching(true);
      setError("");
      try {
        const res = await getSiswaList(page, 20, searchQuery);
        const response = res as unknown as {
          data: SiswaData[];
          pagination: PaginationInfo;
        };
        setSiswaList(response.data || []);
        if (response.pagination) setPagination(response.pagination);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Gagal memuat data");
      } finally {
        setFetching(false);
      }
    },
    [search]
  );

  useEffect(() => {
    if (user && user.role === "guru") {
      fetchData();
    }
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(1, search);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Memuat...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #2d5a8e, #1e3a5f)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              🎓
            </div>
            <div>
              <h2 style={{ fontSize: "15px", fontWeight: 700 }}>SMK Negeri 26</h2>
              <p style={{ fontSize: "11px", color: "#64748b" }}>Dashboard Guru</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-link active">
            <span>📊</span>
            Data Siswa
          </div>
          <button className="sidebar-link" onClick={() => exportExcel()}>
            <span>📥</span>
            Export Excel
          </button>
          <button className="sidebar-link" onClick={() => exportPdf()}>
            <span>📄</span>
            Export PDF
          </button>
        </nav>

        <div className="sidebar-footer">
          <div
            style={{
              padding: "12px",
              background: "rgba(15, 23, 42, 0.4)",
              borderRadius: "12px",
              marginBottom: "12px",
            }}
          >
            <p style={{ fontSize: "13px", fontWeight: 600 }}>{user?.nama_lengkap}</p>
            <p style={{ fontSize: "11px", color: "#64748b" }}>Guru</p>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-link"
            style={{ color: "#ef4444" }}
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "4px" }}>
            Data Siswa & Kelulusan
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>
            Lihat data siswa dan hasil kelulusan (hanya baca)
          </p>
        </div>

        {/* Stats */}
        <div className="grid-stats">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "rgba(59, 130, 246, 0.15)" }}>
              👥
            </div>
            <div className="stat-value">{pagination.total}</div>
            <div className="stat-label">Total Siswa</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "rgba(5, 150, 105, 0.15)" }}>
              ✅
            </div>
            <div className="stat-value">
              {siswaList.filter((s) => s.status_kelulusan === "lulus").length}
            </div>
            <div className="stat-label">Lulus</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "rgba(220, 38, 38, 0.15)" }}>
              ❌
            </div>
            <div className="stat-value">
              {siswaList.filter((s) => s.status_kelulusan === "tidak_lulus").length}
            </div>
            <div className="stat-label">Tidak Lulus</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "rgba(234, 88, 12, 0.15)" }}>
              ⏳
            </div>
            <div className="stat-value">
              {siswaList.filter((s) => !s.status_kelulusan).length}
            </div>
            <div className="stat-label">Belum Ditentukan</div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: "16px" }}>
            <span>⚠️</span>
            {error}
          </div>
        )}

        {/* Toolbar — NO create button for guru */}
        <div className="toolbar">
          <form onSubmit={handleSearch} className="search-bar" style={{ flex: 1, maxWidth: "400px" }}>
            <span className="search-icon">🔍</span>
            <input
              className="input"
              placeholder="Cari nama, NISN, atau kelas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          <div className="toolbar-spacer" />
          <div
            style={{
              padding: "6px 14px",
              background: "rgba(59, 130, 246, 0.12)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#60a5fa",
              fontWeight: 600,
              border: "1px solid rgba(59, 130, 246, 0.25)",
            }}
          >
            🔒 Mode Hanya Baca
          </div>
        </div>

        {/* Table — NO action buttons for guru */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>NISN</th>
                <th>Nama</th>
                <th>Kelas</th>
                <th>Jurusan</th>
                <th>L/P</th>
                <th>Status</th>
                <th>Rata-Rata</th>
                <th>Ujian</th>
                <th>Sikap</th>
              </tr>
            </thead>
            <tbody>
              {fetching ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: "48px" }}>
                    <div className="spinner" style={{ margin: "0 auto" }} />
                    <p style={{ color: "#94a3b8", marginTop: "12px", fontSize: "13px" }}>
                      Memuat data...
                    </p>
                  </td>
                </tr>
              ) : siswaList.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: "48px", color: "#64748b" }}>
                    <p style={{ fontSize: "32px", marginBottom: "8px" }}>📭</p>
                    <p>Belum ada data siswa</p>
                  </td>
                </tr>
              ) : (
                siswaList.map((s, i) => (
                  <tr key={s.id}>
                    <td style={{ textAlign: "center", color: "#64748b" }}>
                      {(pagination.page - 1) * pagination.limit + i + 1}
                    </td>
                    <td>
                      <code
                        style={{
                          background: "rgba(148, 163, 184, 0.1)",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                        }}
                      >
                        {s.nisn}
                      </code>
                    </td>
                    <td style={{ fontWeight: 600 }}>{s.nama}</td>
                    <td>{s.kelas}</td>
                    <td>
                      <span style={{ fontSize: "12px" }}>{s.jurusan}</span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {s.jenis_kelamin === "L" ? "👨" : "👩"}
                    </td>
                    <td>
                      {s.status_kelulusan === "lulus" ? (
                        <span className="badge badge-success">✓ Lulus</span>
                      ) : s.status_kelulusan === "tidak_lulus" ? (
                        <span className="badge badge-danger">✗ Tidak Lulus</span>
                      ) : (
                        <span className="badge badge-warning">⏳ Pending</span>
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {s.nilai_rata_rata ?? "-"}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {s.nilai_ujian ?? "-"}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {s.nilai_sikap ?? "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              disabled={pagination.page <= 1}
              onClick={() => fetchData(pagination.page - 1)}
            >
              ←
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === pagination.totalPages ||
                  Math.abs(p - pagination.page) <= 2
              )
              .map((p, idx, arr) => (
                <span key={p} style={{ display: "contents" }}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span style={{ color: "#64748b" }}>…</span>
                  )}
                  <button
                    className={`page-btn ${p === pagination.page ? "active" : ""}`}
                    onClick={() => fetchData(p)}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button
              className="page-btn"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchData(pagination.page + 1)}
            >
              →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
