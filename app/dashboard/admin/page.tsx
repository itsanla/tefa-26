"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../lib/auth";
import {
  getSiswaList,
  createSiswa,
  updateSiswa,
  deleteSiswa,
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

export default function AdminDashboard() {
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
  const [success, setSuccess] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nisn: "",
    nama: "",
    kelas: "",
    jurusan: "",
    tahun_ajaran: "2025/2026",
    tempat_lahir: "",
    tanggal_lahir: "",
    jenis_kelamin: "L" as "L" | "P",
    status_kelulusan: "" as "" | "lulus" | "tidak_lulus",
    nilai_rata_rata: "",
    nilai_ujian: "",
    nilai_sikap: "",
    keterangan: "",
  });
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/";
      return;
    }
    if (!loading && user && user.role !== "admin") {
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
    if (user && user.role === "admin") {
      fetchData();
    }
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(1, search);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      nisn: "",
      nama: "",
      kelas: "",
      jurusan: "",
      tahun_ajaran: "2025/2026",
      tempat_lahir: "",
      tanggal_lahir: "",
      jenis_kelamin: "L",
      status_kelulusan: "",
      nilai_rata_rata: "",
      nilai_ujian: "",
      nilai_sikap: "",
      keterangan: "",
    });
    setShowModal(true);
  };

  const openEditModal = (s: SiswaData) => {
    setEditingId(s.id);
    setFormData({
      nisn: s.nisn,
      nama: s.nama,
      kelas: s.kelas,
      jurusan: s.jurusan,
      tahun_ajaran: s.tahun_ajaran,
      tempat_lahir: s.tempat_lahir,
      tanggal_lahir: s.tanggal_lahir,
      jenis_kelamin: s.jenis_kelamin as "L" | "P",
      status_kelulusan: (s.status_kelulusan || "") as "" | "lulus" | "tidak_lulus",
      nilai_rata_rata: s.nilai_rata_rata?.toString() || "",
      nilai_ujian: s.nilai_ujian?.toString() || "",
      nilai_sikap: s.nilai_sikap || "",
      keterangan: s.keterangan || "",
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload: Record<string, unknown> = {
        nisn: formData.nisn,
        nama: formData.nama,
        kelas: formData.kelas,
        jurusan: formData.jurusan,
        tahun_ajaran: formData.tahun_ajaran,
        tempat_lahir: formData.tempat_lahir,
        tanggal_lahir: formData.tanggal_lahir,
        jenis_kelamin: formData.jenis_kelamin,
      };

      if (formData.status_kelulusan) {
        payload.status_kelulusan = formData.status_kelulusan;
        if (formData.nilai_rata_rata)
          payload.nilai_rata_rata = parseFloat(formData.nilai_rata_rata);
        if (formData.nilai_ujian)
          payload.nilai_ujian = parseFloat(formData.nilai_ujian);
        if (formData.nilai_sikap) payload.nilai_sikap = formData.nilai_sikap;
        if (formData.keterangan) payload.keterangan = formData.keterangan;
      }

      if (editingId) {
        await updateSiswa(editingId, payload as Partial<SiswaData>);
        setSuccess("Data siswa berhasil diperbarui");
      } else {
        await createSiswa(payload as Partial<SiswaData>);
        setSuccess("Siswa baru berhasil ditambahkan");
      }

      setShowModal(false);
      fetchData(pagination.page);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSiswa(id);
      setSuccess("Siswa berhasil dihapus");
      setShowDeleteConfirm(null);
      fetchData(pagination.page);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menghapus data");
    }
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
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
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
              <p style={{ fontSize: "11px", color: "#64748b" }}>Dashboard Admin</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-link active">
            <span>📊</span>
            Data Siswa
          </div>
          <button
            className="sidebar-link"
            onClick={() => exportExcel()}
          >
            <span>📥</span>
            Export Excel
          </button>
          <button
            className="sidebar-link"
            onClick={() => exportPdf()}
          >
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
            <p style={{ fontSize: "13px", fontWeight: 600 }}>
              {user?.nama_lengkap}
            </p>
            <p style={{ fontSize: "11px", color: "#64748b" }}>Administrator</p>
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
            Manajemen Data Siswa
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>
            Kelola data siswa dan status kelulusan
          </p>
        </div>

        {/* Stats */}
        <div className="grid-stats">
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{ background: "rgba(59, 130, 246, 0.15)" }}
            >
              👥
            </div>
            <div className="stat-value">{pagination.total}</div>
            <div className="stat-label">Total Siswa</div>
          </div>
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{ background: "rgba(5, 150, 105, 0.15)" }}
            >
              ✅
            </div>
            <div className="stat-value">
              {siswaList.filter((s) => s.status_kelulusan === "lulus").length}
            </div>
            <div className="stat-label">Lulus</div>
          </div>
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{ background: "rgba(220, 38, 38, 0.15)" }}
            >
              ❌
            </div>
            <div className="stat-value">
              {
                siswaList.filter((s) => s.status_kelulusan === "tidak_lulus")
                  .length
              }
            </div>
            <div className="stat-label">Tidak Lulus</div>
          </div>
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{ background: "rgba(234, 88, 12, 0.15)" }}
            >
              ⏳
            </div>
            <div className="stat-value">
              {siswaList.filter((s) => !s.status_kelulusan).length}
            </div>
            <div className="stat-label">Belum Ditentukan</div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: "16px" }}>
            <span>⚠️</span>
            {error}
            <button
              onClick={() => setError("")}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        )}
        {success && (
          <div className="alert alert-success" style={{ marginBottom: "16px" }}>
            <span>✅</span>
            {success}
          </div>
        )}

        {/* Toolbar */}
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
          <button className="btn btn-primary" onClick={openCreateModal}>
            <span>➕</span>
            Tambah Siswa
          </button>
        </div>

        {/* Table */}
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
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {fetching ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "48px" }}>
                    <div className="spinner" style={{ margin: "0 auto" }} />
                    <p style={{ color: "#94a3b8", marginTop: "12px", fontSize: "13px" }}>
                      Memuat data...
                    </p>
                  </td>
                </tr>
              ) : siswaList.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      textAlign: "center",
                      padding: "48px",
                      color: "#64748b",
                    }}
                  >
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
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditModal(s)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setShowDeleteConfirm(s.id)}
                        >
                          🗑️
                        </button>
                      </div>
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? "Edit Data Siswa" : "Tambah Siswa Baru"}</h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body">
                <h3
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Data Pribadi
                </h3>

                <div className="form-grid">
                  <div className="input-group">
                    <label>NISN</label>
                    <input
                      className="input"
                      required
                      placeholder="Contoh: 0012345678"
                      value={formData.nisn}
                      onChange={(e) =>
                        setFormData({ ...formData, nisn: e.target.value })
                      }
                      disabled={!!editingId}
                    />
                  </div>
                  <div className="input-group">
                    <label>Nama Lengkap</label>
                    <input
                      className="input"
                      required
                      placeholder="Nama lengkap siswa"
                      value={formData.nama}
                      onChange={(e) =>
                        setFormData({ ...formData, nama: e.target.value })
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label>Kelas</label>
                    <input
                      className="input"
                      required
                      placeholder="Contoh: XII RPL 1"
                      value={formData.kelas}
                      onChange={(e) =>
                        setFormData({ ...formData, kelas: e.target.value })
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label>Jurusan</label>
                    <input
                      className="input"
                      required
                      placeholder="Contoh: Rekayasa Perangkat Lunak"
                      value={formData.jurusan}
                      onChange={(e) =>
                        setFormData({ ...formData, jurusan: e.target.value })
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label>Tahun Ajaran</label>
                    <input
                      className="input"
                      required
                      placeholder="2025/2026"
                      value={formData.tahun_ajaran}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tahun_ajaran: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label>Jenis Kelamin</label>
                    <select
                      className="input"
                      value={formData.jenis_kelamin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          jenis_kelamin: e.target.value as "L" | "P",
                        })
                      }
                    >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Tempat Lahir</label>
                    <input
                      className="input"
                      required
                      placeholder="Contoh: Jakarta"
                      value={formData.tempat_lahir}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tempat_lahir: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label>Tanggal Lahir</label>
                    <input
                      className="input"
                      type="date"
                      required
                      value={formData.tanggal_lahir}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tanggal_lahir: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <hr
                  style={{
                    border: "none",
                    borderTop: "1px solid rgba(148, 163, 184, 0.1)",
                    margin: "8px 0",
                  }}
                />

                <h3
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Data Kelulusan (Opsional)
                </h3>

                <div className="form-grid">
                  <div className="input-group full-width">
                    <label>Status Kelulusan</label>
                    <select
                      className="input"
                      value={formData.status_kelulusan}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status_kelulusan: e.target.value as "" | "lulus" | "tidak_lulus",
                        })
                      }
                    >
                      <option value="">— Belum Ditentukan —</option>
                      <option value="lulus">Lulus</option>
                      <option value="tidak_lulus">Tidak Lulus</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Nilai Rata-Rata</label>
                    <input
                      className="input"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="0.00 - 100.00"
                      value={formData.nilai_rata_rata}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nilai_rata_rata: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label>Nilai Ujian</label>
                    <input
                      className="input"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="0.00 - 100.00"
                      value={formData.nilai_ujian}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nilai_ujian: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label>Nilai Sikap</label>
                    <select
                      className="input"
                      value={formData.nilai_sikap}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nilai_sikap: e.target.value,
                        })
                      }
                    >
                      <option value="">— Pilih —</option>
                      <option value="Sangat Baik">Sangat Baik</option>
                      <option value="Baik">Baik</option>
                      <option value="Cukup">Cukup</option>
                      <option value="Kurang">Kurang</option>
                    </select>
                  </div>
                  <div className="input-group full-width">
                    <label>Keterangan</label>
                    <input
                      className="input"
                      placeholder="Catatan tambahan (opsional)"
                      value={formData.keterangan}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          keterangan: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Menyimpan..." : editingId ? "Perbarui" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm !== null && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div
            className="modal"
            style={{ maxWidth: "420px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-body" style={{ textAlign: "center", paddingTop: "32px" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "rgba(220, 38, 38, 0.15)",
                  border: "2px solid rgba(220, 38, 38, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                  margin: "0 auto 16px",
                }}
              >
                🗑️
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
                Hapus Data Siswa?
              </h3>
              <p style={{ fontSize: "14px", color: "#94a3b8" }}>
                Tindakan ini tidak dapat dibatalkan. Data siswa beserta akun login dan data kelulusan akan dihapus permanen.
              </p>
            </div>
            <div className="modal-footer" style={{ justifyContent: "center" }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Batal
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(showDeleteConfirm)}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
