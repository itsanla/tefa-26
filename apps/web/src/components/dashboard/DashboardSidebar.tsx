"use client";

import {
  Menu,
  ChevronDown,
  BadgeCent,
  ClipboardList,
  Boxes,
  Tractor,
  Warehouse,
  Users,
  LogOut,
  UserCircle2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const SIDEBAR_BG = "#1A4731";
const SIDEBAR_W = 240;
const SIDEBAR_WC = 72;
const PANEL_BG = "#F5F7F5";

type ChildItem = { name: string; href: string };
type MenuItem = {
  name: string;
  icon: React.ReactNode;
  href?: string;
  childern?: ChildItem[];
};

type Props = {
  open: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileToggle: () => void;
  onMobileClose: () => void;
};

export default function DashboardSidebar({
  open,
  onToggle,
  mobileOpen,
  onMobileToggle,
  onMobileClose,
}: Props) {
  const pathname = usePathname();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<number, boolean>>({});
  const logoutRef = useRef<HTMLDivElement>(null);

  const role =
    typeof window !== "undefined"
      ? document.cookie
          .split("; ")
          .find((row) => row.startsWith("role="))
          ?.split("=")[1] ?? null
      : null;

  const dashboardMenu: MenuItem[] = [
    {
      name: "Dashboard",
      icon: <ClipboardList className="w-5 h-5" />,
      href: "/dashboard/kepsek",
    },
    {
      name: "Penjualan",
      icon: <BadgeCent className="w-5 h-5" />,
      href: "/dashboard/produksi/penjualan",
    },
    {
      name: "Komoditas",
      icon: <Tractor className="w-5 h-5" />,
      childern: [
        { name: "Daftar Komoditas", href: "/dashboard/produksi/komoditas" },
        { name: "Jenis Komoditas", href: "/dashboard/produksi/jenis_komoditas" },
      ],
    },
    {
      name: "Produksi",
      icon: <Warehouse className="w-5 h-5" />,
      childern: [
        { name: "Daftar Produksi", href: "/dashboard/produksi/produksi" },
        { name: "Asal Produksi", href: "/dashboard/produksi/asal_produksi" },
      ],
    },
    {
      name: "Gudang",
      icon: <Boxes className="w-5 h-5" />,
      childern: [
        { name: "Daftar Barang", href: "/dashboard/gudang/barang" },
        { name: "Barang Masuk/Keluar", href: "/dashboard/gudang/transaksi" },
      ],
    },
    {
      name: "User",
      icon: <Users className="w-5 h-5" />,
      href: "/dashboard/user",
    },
  ];

  const filteredMenu = dashboardMenu.filter((item) => {
    if (role === "guru" && item.href === "/dashboard/user") return false;
    if (role === "guru" && item.href === "/dashboard/kepsek") return false;
    if (role === "kepsek" && item.href === "/dashboard/user") return false;
    if (role === "siswa") return false;
    return true;
  });

  // Close logout popup on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (logoutRef.current && !logoutRef.current.contains(e.target as Node))
        setLogoutOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-open dropdown that contains current path
  useEffect(() => {
    const next: Record<number, boolean> = {};
    filteredMenu.forEach((item, i) => {
      if (item.childern?.some((c) => pathname === c.href)) next[i] = true;
    });
    setOpenDropdowns((prev) => ({ ...prev, ...next }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const isItemActive = (item: MenuItem) =>
    item.href ? pathname === item.href : false;

  const isChildActive = (href: string) => pathname === href;

  const w = open ? SIDEBAR_W : SIDEBAR_WC;

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "/";
    } catch (e) {
      console.log("Gagal logout:", e);
    }
  };

  // Curved notch that makes the active tab look "carved" out of the sidebar
  const Notch = ({ position }: { position: "top" | "bottom" }) => {
    const isTop = position === "top";
    return (
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: isTop ? -16 : "auto",
          bottom: isTop ? "auto" : -16,
          right: 0,
          width: 16,
          height: 16,
          background: SIDEBAR_BG,
          overflow: "hidden",
          zIndex: 3,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: isTop ? "auto" : 0,
            bottom: isTop ? 0 : "auto",
            right: 0,
            width: 32,
            height: 32,
            borderRadius: "50%",
            boxShadow: isTop
              ? `8px 8px 0 8px ${PANEL_BG}`
              : `8px -8px 0 8px ${PANEL_BG}`,
          }}
        />
      </div>
    );
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={onMobileToggle}
        type="button"
        className="fixed top-3 left-3 z-50 inline-flex p-2 text-white rounded-lg sm:hidden"
        style={{ background: SIDEBAR_BG }}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="w-6 h-6" />
      </button>

      <aside
        className={`fixed sm:sticky top-0 left-0 z-40 h-screen flex-shrink-0 transition-transform sm:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          width: w,
          background: SIDEBAR_BG,
          display: "flex",
          flexDirection: "column",
          overflow: "visible",
          transition:
            "width .28s cubic-bezier(.4,0,.2,1), transform .28s cubic-bezier(.4,0,.2,1)",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: open ? "24px 18px 20px" : "24px 0 20px",
            justifyContent: open ? "flex-start" : "center",
            borderBottom: "1px solid rgba(255,255,255,.08)",
            overflow: "hidden",
            flexShrink: 0,
            textDecoration: "none",
            transition: "padding .28s",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              flexShrink: 0,
              background: "#FACC15",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 17,
              color: SIDEBAR_BG,
            }}
          >
            T
          </div>
          {open && (
            <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#fff",
                  letterSpacing: "-.2px",
                }}
              >
                TEFA 26
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,.45)",
                  marginTop: 1,
                }}
              >
                SMK N 2 Batusangkar
              </div>
            </div>
          )}
        </Link>

        {/* Nav */}
        <nav
          style={{
            flex: 1,
            padding: "14px 0",
            overflow: "visible",
          }}
        >
          {open && (
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(255,255,255,.3)",
                textTransform: "uppercase",
                letterSpacing: ".1em",
                padding: "0 18px 8px",
              }}
            >
              Menu
            </div>
          )}

          {filteredMenu.map((item, i) => {
            const childActive =
              !!item.childern?.some((c) => isChildActive(c.href));
            const directActive = isItemActive(item);
            const isActiveBar = directActive; // notch only for direct-link active

            // Plain nav item (no children)
            if (!item.childern) {
              return (
                <div key={`nav-${i}`} style={{ position: "relative", marginBottom: 2 }}>
                  {isActiveBar && <Notch position="top" />}
                  {isActiveBar && <Notch position="bottom" />}

                  <Link
                    href={item.href!}
                    onClick={onMobileClose}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: open ? "11px 18px" : "11px 0",
                      justifyContent: open ? "flex-start" : "center",
                      cursor: "pointer",
                      borderRadius: isActiveBar ? "12px 0 0 12px" : 10,
                      marginLeft: isActiveBar ? 8 : open ? 8 : 6,
                      marginRight: isActiveBar ? 0 : open ? 8 : 6,
                      background: isActiveBar ? PANEL_BG : "transparent",
                      color: isActiveBar ? SIDEBAR_BG : "rgba(255,255,255,.65)",
                      fontWeight: isActiveBar ? 700 : 500,
                      fontSize: 14,
                      transition: "background .15s, color .15s",
                      position: "relative",
                      zIndex: 2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textDecoration: "none",
                    }}
                    className={isActiveBar ? "" : "ds-nav-hover"}
                  >
                    <span style={{ fontSize: 16, flexShrink: 0, display: "inline-flex" }}>
                      {item.icon}
                    </span>
                    {open && <span>{item.name}</span>}
                  </Link>
                </div>
              );
            }

            // Dropdown item
            const expanded = !!openDropdowns[i] && open;
            return (
              <div key={`nav-${i}`} style={{ marginBottom: 2 }}>
                <div
                  onClick={() => {
                    if (!open) {
                      onToggle();
                      setOpenDropdowns((p) => ({ ...p, [i]: true }));
                    } else {
                      setOpenDropdowns((p) => ({ ...p, [i]: !p[i] }));
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: open ? "11px 18px" : "11px 0",
                    justifyContent: open ? "flex-start" : "center",
                    cursor: "pointer",
                    borderRadius: 10,
                    marginLeft: open ? 8 : 6,
                    marginRight: open ? 8 : 6,
                    color: childActive
                      ? "#fff"
                      : "rgba(255,255,255,.65)",
                    fontWeight: childActive ? 700 : 500,
                    fontSize: 14,
                    transition: "background .15s, color .15s",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                  className="ds-nav-hover"
                >
                  <span style={{ fontSize: 16, flexShrink: 0, display: "inline-flex" }}>
                    {item.icon}
                  </span>
                  {open && (
                    <>
                      <span style={{ flex: 1 }}>{item.name}</span>
                      <ChevronDown
                        className="w-4 h-4"
                        style={{
                          transform: expanded ? "rotate(180deg)" : "none",
                          transition: "transform .2s",
                        }}
                      />
                    </>
                  )}
                </div>

                {/* Children */}
                {open && (
                  <div
                    style={{
                      maxHeight: expanded ? 200 : 0,
                      overflow: "hidden",
                      transition: "max-height .25s ease",
                    }}
                  >
                    {item.childern.map((child, j) => {
                      const active = isChildActive(child.href);
                      return (
                        <div
                          key={`child-${i}-${j}`}
                          style={{ position: "relative", marginTop: j === 0 ? 4 : 2 }}
                        >
                          {active && <Notch position="top" />}
                          {active && <Notch position="bottom" />}
                          <Link
                            href={child.href}
                            onClick={onMobileClose}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "9px 18px 9px 46px",
                              cursor: "pointer",
                              borderRadius: active ? "12px 0 0 12px" : 10,
                              marginLeft: active ? 8 : 8,
                              marginRight: active ? 0 : 8,
                              background: active ? PANEL_BG : "transparent",
                              color: active ? SIDEBAR_BG : "rgba(255,255,255,.55)",
                              fontWeight: active ? 700 : 500,
                              fontSize: 13,
                              transition: "background .15s, color .15s",
                              position: "relative",
                              zIndex: 2,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textDecoration: "none",
                            }}
                            className={active ? "" : "ds-nav-hover"}
                          >
                            {child.name}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer / User */}
        <div
          ref={logoutRef}
          style={{
            borderTop: "1px solid rgba(255,255,255,.08)",
            padding: open ? "14px 12px" : "14px 0",
            display: "flex",
            justifyContent: open ? "flex-start" : "center",
            position: "relative",
            flexShrink: 0,
          }}
        >
          <div
            onClick={() => setLogoutOpen((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: open ? "8px 8px" : "8px 0",
              borderRadius: 10,
              cursor: "pointer",
              transition: "background .15s",
              width: open ? "100%" : "auto",
            }}
            className="ds-user-btn"
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                flexShrink: 0,
                background: "linear-gradient(135deg,#22C55E,#16A34A)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {(role ?? "A").charAt(0).toUpperCase()}
            </div>
            {open && (
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#fff",
                    whiteSpace: "nowrap",
                    textTransform: "capitalize",
                  }}
                >
                  {role ?? "Admin"}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,.45)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {role ? `${role}@tefa.id` : "admin@tefa.id"}
                </div>
              </div>
            )}
            {open && (
              <span style={{ color: "rgba(255,255,255,.4)", fontSize: 13 }}>···</span>
            )}
          </div>

          {logoutOpen && (
            <div
              style={{
                position: "absolute",
                bottom: 70,
                left: open ? 12 : "50%",
                transform: open ? "none" : "translateX(-50%)",
                width: 200,
                background: "rgba(255,255,255,.18)",
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
                border: "1px solid rgba(255,255,255,.25)",
                borderRadius: 16,
                padding: 8,
                boxShadow: "0 8px 32px rgba(0,0,0,.3)",
                zIndex: 100,
                animation: "ds-popIn .22s cubic-bezier(.34,1.56,.64,1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 10,
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                className="ds-logout-item"
              >
                <UserCircle2 className="w-4 h-4" /> Profil Saya
              </div>
              <div
                style={{
                  height: 1,
                  background: "rgba(255,255,255,.15)",
                  margin: "4px 8px",
                }}
              />
              <div
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 10,
                  color: "#FCA5A5",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                className="ds-logout-item"
              >
                <LogOut className="w-4 h-4" /> Keluar
              </div>
            </div>
          )}
        </div>

        {/* Toggle (desktop only) */}
        <div
          onClick={onToggle}
          className="hidden sm:flex"
          style={{
            position: "absolute",
            top: "50%",
            right: -14,
            transform: "translateY(-50%)",
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 2px 10px rgba(0,0,0,.2)",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 13,
            color: SIDEBAR_BG,
            zIndex: 30,
            userSelect: "none",
            border: "1.5px solid #E5E7EB",
          }}
        >
          {open ? "‹" : "›"}
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
        />
      )}

      <style jsx global>{`
        @keyframes ds-popIn {
          from {
            transform: scale(0.88) translateY(8px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        .ds-nav-hover:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff !important;
        }
        .ds-user-btn:hover {
          background: rgba(255, 255, 255, 0.08);
        }
        .ds-logout-item:hover {
          background: rgba(255, 255, 255, 0.15);
        }
      `}</style>
    </>
  );
}
