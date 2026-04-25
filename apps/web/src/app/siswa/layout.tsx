import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal Siswa",
  description:
    "Portal siswa SMK Negeri 2 Batusangkar untuk akses informasi dan aktivitas belajar siswa yang telah login.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SiswaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
