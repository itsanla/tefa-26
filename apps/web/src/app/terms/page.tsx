import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description:
    "Syarat dan ketentuan penggunaan website resmi SMK Negeri 2 Batusangkar bagi seluruh pengunjung.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white text-emerald-950">
      <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Syarat & Ketentuan</h1>
        <p className="mt-3 text-sm text-emerald-700">Terakhir diperbarui: 25 April 2026</p>

        <div className="mt-8 space-y-6 leading-7 text-emerald-900/90">
          <section>
            <h2 className="text-xl font-semibold">1. Penerimaan Ketentuan</h2>
            <p className="mt-2">
              Dengan mengakses website ini, Anda dianggap telah membaca dan menyetujui syarat dan
              ketentuan yang berlaku.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Penggunaan Website</h2>
            <p className="mt-2">
              Website digunakan untuk tujuan informasi dan layanan resmi sekolah. Pengguna dilarang
              menggunakan website untuk tindakan yang melanggar hukum atau merugikan pihak lain.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Akurasi Informasi</h2>
            <p className="mt-2">
              Sekolah berupaya menyediakan informasi yang akurat dan terbaru, namun tidak menjamin bahwa
              seluruh konten selalu bebas dari kekeliruan atau keterlambatan pembaruan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Hak Kekayaan Intelektual</h2>
            <p className="mt-2">
              Konten website, termasuk teks, gambar, dan materi pembelajaran, dilindungi sesuai ketentuan
              hukum. Penggunaan ulang harus mendapatkan izin dari pihak sekolah.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Tautan ke Pihak Ketiga</h2>
            <p className="mt-2">
              Website dapat memuat tautan ke situs pihak ketiga. Kami tidak bertanggung jawab atas isi,
              kebijakan, atau keamanan situs di luar domain resmi sekolah.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Perubahan Ketentuan</h2>
            <p className="mt-2">
              Syarat dan ketentuan ini dapat diperbarui sewaktu-waktu. Perubahan berlaku sejak dipublikasikan
              pada halaman ini.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
