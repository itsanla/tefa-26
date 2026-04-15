"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth";
import { getKelulusanSiswa } from "../../lib/api";

interface SiswaInfo {
  id: number;
  nisn: string;
  nama: string;
  kelas: string;
  jurusan: string;
  tahun_ajaran: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
}

interface KelulusanInfo {
  status: "lulus" | "tidak_lulus";
  nilai_rata_rata: number | null;
  nilai_ujian: number | null;
  nilai_sikap: string | null;
  keterangan: string | null;
  tanggal_pengumuman: string | null;
}

export default function SiswaDashboard() {
  const { user, loading, handleLogout } = useAuth();
  const [siswaData, setSiswaData] = useState<SiswaInfo | null>(null);
  const [kelulusanData, setKelulusanData] = useState<KelulusanInfo | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/";
      return;
    }
    if (!loading && user && user.role !== "siswa") {
      window.location.href = `/dashboard/${user.role}`;
      return;
    }
  }, [user, loading]);

  useEffect(() => {
    if (user && user.role === "siswa") {
      fetchKelulusan();
    }
  }, [user]);

  const fetchKelulusan = async () => {
    try {
      const res = await getKelulusanSiswa();
      const data = res as unknown as {
        siswa: SiswaInfo;
        kelulusan: KelulusanInfo | null;
      };
      setSiswaData(data.siswa);
      setKelulusanData(data.kelulusan);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setFetching(false);
    }
  };

  if (loading || fetching) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Memuat data kelulusan...</p>
      </div>
    );
  }

  return (
    <div className="bg-animated" style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* Top bar */}
      <header
        className="glass"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "none",
          borderLeft: "none",
          borderRight: "none",
          borderRadius: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "24px" }}>🎓</span>
          <div>
            <h1 style={{ fontSize: "16px", fontWeight: 700 }}>SMK Negeri 26</h1>
            <p style={{ fontSize: "12px", color: "#94a3b8" }}>
              Sistem Informasi Kelulusan
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "14px", fontWeight: 600 }}>
              {user?.nama_lengkap}
            </p>
            <p style={{ fontSize: "11px", color: "#94a3b8" }}>Siswa</p>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">
            Keluar
          </button>
        </div>
      </header>

      {/* Main content */}
      <main
        style={{
          position: "relative",
          zIndex: 10,
          padding: "48px 20px",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {error && (
          <div className="alert alert-error" style={{ marginBottom: "24px" }}>
            <span>⚠️</span>
            {error}
          </div>
        )}

        {/* Student info card */}
        {siswaData && (
          <div
            className="card"
            style={{ marginBottom: "32px", borderRadius: "20px" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #1e3a5f, #2d5a8e)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                }}
              >
                {siswaData.jenis_kelamin === "L" ? "👨‍🎓" : "👩‍🎓"}
              </div>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 700 }}>
                  {siswaData.nama}
                </h2>
                <p style={{ fontSize: "13px", color: "#94a3b8" }}>
                  NISN: {siswaData.nisn}
                </p>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "12px",
              }}
            >
              {[
                { label: "Kelas", value: siswaData.kelas },
                { label: "Jurusan", value: siswaData.jurusan },
                { label: "Tahun Ajaran", value: siswaData.tahun_ajaran },
                {
                  label: "Tempat, Tanggal Lahir",
                  value: `${siswaData.tempat_lahir}, ${new Date(siswaData.tanggal_lahir).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: "12px",
                    background: "rgba(15, 23, 42, 0.4)",
                    borderRadius: "12px",
                    border: "1px solid rgba(148, 163, 184, 0.1)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: "4px",
                    }}
                  >
                    {item.label}
                  </p>
                  <p style={{ fontSize: "14px", fontWeight: 600 }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kelulusan Result */}
        {kelulusanData ? (
          <div
            className={`result-card ${kelulusanData.status === "lulus" ? "lulus" : "tidak-lulus"}`}
          >
            <div className="result-icon">
              {kelulusanData.status === "lulus" ? "✅" : "❌"}
            </div>

            <h2
              style={{
                fontSize: "14px",
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "8px",
              }}
            >
              Status Kelulusan
            </h2>

            <div
              className={
                kelulusanData.status === "lulus"
                  ? "status-lulus"
                  : "status-tidak-lulus"
              }
              style={{ justifyContent: "center", margin: "0 auto" }}
            >
              {kelulusanData.status === "lulus"
                ? "🎉 LULUS"
                : "TIDAK LULUS"}
            </div>

            {kelulusanData.keterangan && (
              <p
                style={{
                  marginTop: "16px",
                  fontSize: "14px",
                  color: "#94a3b8",
                  fontStyle: "italic",
                }}
              >
                &quot;{kelulusanData.keterangan}&quot;
              </p>
            )}

            <div className="result-details">
              {kelulusanData.nilai_rata_rata !== null && (
                <div className="result-detail-item">
                  <div className="detail-value">
                    {kelulusanData.nilai_rata_rata}
                  </div>
                  <div className="detail-label">Rata-Rata</div>
                </div>
              )}
              {kelulusanData.nilai_ujian !== null && (
                <div className="result-detail-item">
                  <div className="detail-value">
                    {kelulusanData.nilai_ujian}
                  </div>
                  <div className="detail-label">Nilai Ujian</div>
                </div>
              )}
              {kelulusanData.nilai_sikap && (
                <div className="result-detail-item">
                  <div
                    className="detail-value"
                    style={{ fontSize: "20px" }}
                  >
                    {kelulusanData.nilai_sikap}
                  </div>
                  <div className="detail-label">Nilai Sikap</div>
                </div>
              )}
            </div>

            {kelulusanData.tanggal_pengumuman && (
              <p
                style={{
                  marginTop: "24px",
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                Diumumkan:{" "}
                {new Date(kelulusanData.tanggal_pengumuman).toLocaleDateString(
                  "id-ID",
                  { day: "numeric", month: "long", year: "numeric" }
                )}
              </p>
            )}
          </div>
        ) : (
          <div
            className="result-card"
            style={{ borderColor: "rgba(148, 163, 184, 0.2)" }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(100, 116, 139, 0.15)",
                border: "2px solid rgba(100, 116, 139, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "40px",
                margin: "0 auto 24px",
              }}
            >
              ⏳
            </div>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 700,
                marginBottom: "8px",
              }}
            >
              Belum Ada Pengumuman
            </h3>
            <p style={{ fontSize: "14px", color: "#94a3b8" }}>
              Hasil kelulusan Anda belum tersedia. Silakan cek kembali nanti.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
