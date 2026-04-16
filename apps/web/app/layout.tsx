import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SMK Negeri 2 Batusangkar",
  description: "SMK Negeri 2 Batu Sangkar adalah sekolah menengah kejuruan negeri di Kabupaten Tanah Datar, Sumatera Barat. Memiliki kompetensi keahlian unggulan di bidang pertanian, agribisnis, teknik pengelasan, dan otomotif. Menyiapkan siswa siap kerja dengan praktik langsung dan berbasis industri.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
