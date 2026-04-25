import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-800 px-4 text-white">
      <div className="absolute inset-0 opacity-30" aria-hidden>
        <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.35),_transparent_50%)]" />
      </div>

      <section className="relative z-10 w-full max-w-xl rounded-2xl border border-emerald-200/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200">Error 404</p>
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Halaman Tidak Ditemukan</h1>
        <p className="mt-4 text-emerald-100/90">
          Maaf, halaman yang Anda cari tidak tersedia atau mungkin sudah dipindahkan.
        </p>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-100 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-900"
          >
            Kembali ke Home
          </Link>
        </div>
      </section>
    </main>
  );
}
