import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Profil singkat SMK Negeri 2 Batusangkar, visi misi, serta komitmen sekolah dalam pendidikan kejuruan dan Teaching Factory.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white text-emerald-950">
      <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Tentang SMK Negeri 2 Batusangkar</h1>

        <div className="mt-8 space-y-6 leading-7 text-emerald-900/90">
          <p>
            SMK Negeri 2 Batusangkar adalah sekolah menengah kejuruan negeri di Kabupaten Tanah Datar,
            Sumatera Barat, yang berfokus pada pengembangan kompetensi siswa melalui pembelajaran berbasis
            praktik industri.
          </p>

          <section>
            <h2 className="text-xl font-semibold">Visi</h2>
            <p className="mt-2">
              Menjadi sekolah kejuruan unggul yang menghasilkan lulusan kompeten, berkarakter, dan siap
              menghadapi dunia kerja serta kewirausahaan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Misi</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>Menyelenggarakan pendidikan vokasi yang relevan dengan kebutuhan industri.</li>
              <li>Menguatkan budaya kerja, kedisiplinan, dan integritas peserta didik.</li>
              <li>Mengembangkan program Teaching Factory sebagai ekosistem pembelajaran nyata.</li>
              <li>Mendorong inovasi, kreativitas, dan kolaborasi dengan dunia usaha dan dunia industri.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Komitmen Kami</h2>
            <p className="mt-2">
              Kami berkomitmen memberikan layanan informasi yang transparan, edukatif, dan mudah diakses
              melalui website resmi sekolah untuk masyarakat, siswa, orang tua, dan mitra.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
