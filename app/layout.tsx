import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./lib/auth";

export const metadata: Metadata = {
  title: "SMK Negeri 26 — Sistem Informasi Kelulusan",
  description:
    "Sistem informasi pengecekan kelulusan dan manajemen data siswa SMK Negeri 26",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
