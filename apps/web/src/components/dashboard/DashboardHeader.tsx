"use client";

type DashboardHeaderProps = {
  title: string;
  role: any;
};

export default function DashboardHeader({ title, role }: DashboardHeaderProps) {
  return (
    <>
      <header
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 28,
          flexWrap: "wrap",
          animation: "dh-fadeIn .35s ease",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#111827",
              letterSpacing: "-0.5px",
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            {title}
          </h1>
          {role ? (
            <p style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>
              Selamat datang,{" "}
              <span style={{ color: "#111827", fontWeight: 600 }}>{role}</span>
            </p>
          ) : null}
        </div>
      </header>

      <style jsx global>{`
        @keyframes dh-fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
