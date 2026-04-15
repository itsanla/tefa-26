"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./lib/auth";
import { login as apiLogin } from "./lib/api";

export default function LoginPage() {
  const { user, loading, checkAuth } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      const dest =
        user.role === "admin"
          ? "/dashboard/admin"
          : user.role === "guru"
            ? "/dashboard/guru"
            : "/dashboard/siswa";
      window.location.href = dest;
    }
  }, [user, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await apiLogin(username, password);
      await checkAuth();
      // redirect will happen via useEffect above
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login gagal");
    } finally {
      setIsLoading(false);
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

  if (user) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Mengalihkan...</p>
      </div>
    );
  }

  return (
    <div className="bg-animated" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: "20px" }}>
      {/* Floating orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "440px" }}>
        {/* School Logo / Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "72px",
            height: "72px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: "32px",
            boxShadow: "0 8px 32px rgba(245, 158, 11, 0.3)",
          }}>
            🎓
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#f1f5f9", marginBottom: "4px" }}>
            SMK Negeri 26
          </h1>
          <p style={{ fontSize: "14px", color: "#94a3b8" }}>
            Sistem Informasi Kelulusan Siswa
          </p>
        </div>

        {/* Login Card */}
        <div className="glass" style={{ borderRadius: "24px", padding: "40px 32px", boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px", textAlign: "center" }}>
            Masuk ke Akun Anda
          </h2>
          <p style={{ fontSize: "13px", color: "#94a3b8", textAlign: "center", marginBottom: "28px" }}>
            Masukkan username atau NISN dan password Anda
          </p>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: "20px" }}>
              <span>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="input-group">
              <label htmlFor="username">Username / NISN</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748b", fontSize: "16px" }}>👤</span>
                <input
                  id="username"
                  type="text"
                  className="input"
                  placeholder="Masukkan username atau NISN"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  style={{ paddingLeft: "42px" }}
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748b", fontSize: "16px" }}>🔒</span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="input"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingLeft: "42px", paddingRight: "48px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#64748b",
                    cursor: "pointer",
                    fontSize: "16px",
                    padding: "4px",
                  }}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isLoading}
              style={{ width: "100%", marginTop: "4px" }}
            >
              {isLoading ? (
                <>
                  <div className="spinner" style={{ width: "18px", height: "18px", borderWidth: "2px" }} />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          <div style={{ marginTop: "24px", textAlign: "center", fontSize: "12px", color: "#64748b" }}>
            <p>Siswa login menggunakan NISN sebagai username</p>
            <p style={{ marginTop: "4px" }}>Password default siswa: NISN</p>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "12px", color: "#475569" }}>
          © 2026 SMK Negeri 26. All rights reserved.
        </p>
      </div>
    </div>
  );
}
