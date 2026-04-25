import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Kebijakan Privasi resmi website SMK Negeri 2 Batusangkar tentang pengumpulan, penggunaan, dan perlindungan data pengguna.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white text-emerald-950">
      <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Kebijakan Privasi</h1>
        <p className="mt-3 text-sm text-emerald-700">Terakhir diperbarui: 25 April 2026</p>

        <div className="mt-8 space-y-6 leading-7 text-emerald-900/90">
          <section>
            <h2 className="text-xl font-semibold">1. Informasi yang Kami Kumpulkan</h2>
            <p className="mt-2">
              Kami dapat mengumpulkan data yang Anda kirimkan melalui formulir kontak, seperti nama,
              alamat email, dan isi pesan. Kami juga dapat menerima data teknis umum seperti jenis
              perangkat, browser, serta data kunjungan untuk keperluan analitik.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Tujuan Penggunaan Data</h2>
            <p className="mt-2">
              Data digunakan untuk merespons pertanyaan, meningkatkan kualitas layanan website,
              menjaga keamanan sistem, dan menyediakan informasi resmi sekolah kepada masyarakat.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Perlindungan Data</h2>
            <p className="mt-2">
              Kami menerapkan langkah teknis dan organisasi yang wajar untuk menjaga kerahasiaan data
              pengguna. Meski demikian, tidak ada sistem yang 100% bebas risiko.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Cookie dan Teknologi Serupa</h2>
            <p className="mt-2">
              Website dapat menggunakan cookie untuk meningkatkan pengalaman pengguna, analitik,
              serta optimasi performa halaman.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Hak Pengguna</h2>
            <p className="mt-2">
              Anda berhak meminta klarifikasi, pembaruan, atau penghapusan data pribadi yang pernah
              dikirimkan melalui website ini sesuai ketentuan hukum yang berlaku.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Kontak</h2>
            <p className="mt-2">
              Jika Anda memiliki pertanyaan terkait privasi data, silakan hubungi pihak sekolah melalui
              informasi kontak resmi yang tersedia di website.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
