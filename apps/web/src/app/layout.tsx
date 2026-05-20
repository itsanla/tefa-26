import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/landing/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { Toaster as HotToaster } from "react-hot-toast";
import AuthGuard from "@/components/common/AuthGuard";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
  preload: true,
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#015E23" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "SMK Negeri 2 Batusangkar - Sekolah Menengah Kejuruan Unggulan di Tanah Datar",
    template: "%s | SMK Negeri 2 Batusangkar"
  },
  description: "SMK Negeri 2 Batusangkar adalah sekolah menengah kejuruan negeri terakreditasi B di Kecamatan Lima Kaum, Kabupaten Tanah Datar, Sumatera Barat. Menyediakan program keahlian Teknik Pengelasan, Teknik Kendaraan Ringan Otomotif, Agribisnis Tanaman Pangan dan Hortikultura, Agribisnis Ternak Unggas, dan Agribisnis Pengolahan Hasil Pertanian dengan program Teaching Factory (TEFA), seo dikembangkan anla harpanda.",
  keywords: [
    "SMK Negeri 2 Batusangkar",
    "SMKN 2 Batusangkar",
    "SMK Tanah Datar",
    "Sekolah Kejuruan Batusangkar",
    "Teknik Pengelasan",
    "Teknik Otomotif",
    "Agribisnis",
    "Teaching Factory",
    "TEFA",
    "SMK Sumatera Barat",
    "Pendidikan Kejuruan",
    "Lima Kaum",
    "Hidroponik",
    "Melon Hidroponik",
    "SMK Pertanian",
  ],
  authors: [
    { name: "SMK Negeri 2 Batusangkar" },
    { name: "Anla Harpanda", url: "https://anla.my.id" }
  ],
  creator: "Anla Harpanda",
  publisher: "SMK Negeri 2 Batusangkar",
  metadataBase: new URL("https://smk2batusangkar.tech"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://smk2batusangkar.tech",
    siteName: "SMK Negeri 2 Batusangkar",
    title: "SMK Negeri 2 Batusangkar - Sekolah Menengah Kejuruan Unggulan di Tanah Datar",
    description: "Sekolah menengah kejuruan negeri terakreditasi B dengan program keahlian Teknik, Agribisnis, dan Busana. Berlokasi di Jl. Raya Bukit Gombak, Kecamatan Lima Kaum, Kabupaten Tanah Datar, Sumatera Barat, seo dikembangkan anla harpanda.",
    images: [
      {
        url: "/image/fotosama.webp",
        width: 1200,
        height: 630,
        alt: "SMK Negeri 2 Batusangkar - Foto Bersama Siswa dan Guru",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SMK Negeri 2 Batusangkar - Sekolah Menengah Kejuruan Unggulan",
    description: "Sekolah menengah kejuruan negeri terakreditasi B di Tanah Datar, Sumatera Barat dengan program Teaching Factory (TEFA), seo dikembangkan anla harpanda.",
    images: ["/image/fotosama.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // google: "your-google-verification-code",
  },
  category: "education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD Structured Data — EducationalOrganization
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": "https://smk2batusangkar.tech/#organization",
    name: "SMK Negeri 2 Batusangkar",
    alternateName: ["SMKN 2 Batusangkar", "SMK 2 Batusangkar"],
    url: "https://smk2batusangkar.tech",
    logo: "https://smk2batusangkar.tech/image/fotosama.webp",
    image: "https://smk2batusangkar.tech/image/fotosama.webp",
    description:
      "SMK Negeri 2 Batusangkar adalah sekolah menengah kejuruan negeri terakreditasi B dengan program keahlian Teknik Pengelasan, Teknik Kendaraan Ringan Otomotif, Agribisnis, dan Teaching Factory (TEFA).",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Jl. Raya Bukit Gombak",
      addressLocality: "Lima Kaum",
      addressRegion: "Sumatera Barat",
      postalCode: "27211",
      addressCountry: "ID",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "-0.4830983",
      longitude: "100.6144119",
    },
    telephone: "+6282269696489",
    email: "smkpkbatusangkar@gmail.com",
    foundingDate: "1990",
    numberOfEmployees: {
      "@type": "QuantitativeValue",
      value: 27,
    },
    sameAs: [
      "https://www.facebook.com/groups/159755090756204/",
      "https://www.instagram.com/smkn2_batusangkar/",
    ],
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Kabupaten Tanah Datar, Sumatera Barat",
    },
  };

  // WebSite schema — triggers sitelinks search box in SERP
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://smk2batusangkar.tech/#website",
    url: "https://smk2batusangkar.tech",
    name: "SMK Negeri 2 Batusangkar",
    description: "Website resmi SMK Negeri 2 Batusangkar - Sekolah Menengah Kejuruan Unggulan di Tanah Datar",
    publisher: {
      "@id": "https://smk2batusangkar.tech/#organization",
    },
    author: {
      "@type": "Person",
      "name": "Anla Harpanda",
      "url": "https://anla.my.id",
      "sameAs": [
        "https://www.linkedin.com/in/anlaharpanda/",
        "https://github.com/itsanla"
      ]
    },
    developer: {
      "@type": "Person",
      "name": "Anla Harpanda",
      "url": "https://anla.my.id",
      "sameAs": [
        "https://www.linkedin.com/in/anlaharpanda/",
        "https://github.com/itsanla"
      ]
    },
    inLanguage: "id-ID",
  };

  return (
    <html lang="id">
      <head>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Organization structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {/* WebSite structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <AuthGuard>{children}</AuthGuard>
        <Toaster/>
        <SonnerToaster position="top-right" richColors />
        <HotToaster position="top-right" />
      </body>
    </html>
  );
}
