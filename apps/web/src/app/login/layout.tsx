import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Halaman login portal SMK Negeri 2 Batusangkar untuk akses pengguna terdaftar ke layanan internal sekolah.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
