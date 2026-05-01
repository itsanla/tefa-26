"use client";

import { ReactNode, useState } from "react";
import DashboardSidebar from "../dashboard/DashboardSidebar";
import DashboardHeader from "../dashboard/DashboardHeader";

type DashboardLayoutProps = {
  children: ReactNode;
  title: string;
  role: string;
};

export default function DashboardLayout({ children, title, role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#1A4731",
        color: "#111827",
        overflow: "hidden",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", system-ui, sans-serif',
      }}
    >
      <DashboardSidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileToggle={() => setMobileOpen((v) => !v)}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main
        style={{
          flex: 1,
          minWidth: 0,
          background: "#F5F7F5",
          borderRadius: sidebarOpen ? "24px 0 0 24px" : "0",
          transition: "border-radius .28s",
          overflowY: "auto",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: 1,
            padding: "24px clamp(16px, 4vw, 36px)",
            maxWidth: 1280,
            width: "100%",
            margin: "0 auto",
          }}
        >
          <DashboardHeader title={title} role={role} />
          {children}
        </div>

        <footer
          style={{
            borderTop: "1px solid #E5E7EB",
            padding: "16px clamp(16px, 4vw, 36px)",
            fontSize: 12,
            color: "#9CA3AF",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 6,
            background: "#F5F7F5",
          }}
        >
          <span>
            © {new Date().getFullYear()} TEFA 26 · SMK Negeri 2 Batusangkar
          </span>
          <span>
            Dibuat dengan <span style={{ color: "#16A34A" }}>♥</span> oleh tim
            TEFA
          </span>
        </footer>
      </main>
    </div>
  );
}
