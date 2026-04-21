"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import Link from "next/link";
import {
  Car,
  ArrowLeft,
  Target,
  Users,
  Building,
  Award,
  CheckCircle,
} from "lucide-react";

const TeknikPengelasanFabrikasiLogamPage = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <main className="pt-24 bg-gradient-to-b from-white to-emerald-50">
      {/* Back Navigation */}
      <div className="container mx-auto px-4 pt-4">
        <Link
          href="/#jurusan"
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-800 font-medium transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Program Keahlian
        </Link>
      </div>

      {/* Hero Section */}
      <section ref={ref} className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row gap-8 items-center"
        >
          <div className="w-full md:w-1/2">
            <div className="bg-orange-100 text-orange-800 text-xs font-medium py-1 px-3 rounded-full inline-block mb-4">
              Program Keahlian
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
              Teknik Pengelasan dan <span className="text-orange-600">Fabrikasi Logam</span>
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Mempersiapkan siswa dengan keterampilan pengelasan profesional dan fabrikasi logam sesuai standar industri untuk berbagai aplikasi konstruksi dan manufaktur.
            </p>
          </div>
          <div className="w-full md:w-1/2 relative">
            <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden shadow-xl bg-white p-4 flex items-center justify-center">
              <Image
                src="/image/teknik pengelasan.webp"
                alt="Teknik Pengelasan dan Fabrikasi Logam"
                width={400}
                height={300}
                className="object-contain max-h-full"
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Goals & Objectives */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800">
                Tujuan Program Keahlian
              </h2>
              <p className="text-gray-600 mt-3">
                Tujuan secara bertahap akan dimonitoring, dievaluasi dan dikendalikan setiap
                kurun waktu 1 tahun, sebagai berikut :
              </p>
            </div>

            <div className="space-y-6">
              {[
                "Terwujudnya peserta didik yang kompeten dan terampil di bidang pengelasan dan fabrikasi logam",
                "Terciptanya pembelajaran yang berpusat pada siswa dengan menerapkan project based learning",
                "Terwujudnya pembelajaran kolaboratif dengan pihak industri (guru tamu) menghasilkan project sesuai kebutuhan masyarakat",
                "Memiliki guru pengelasan yang bisa menerapkan model pembelajaran yang berdiferensiasi dan berbasis saintifik",
                "Meraih kejuaraan lomba keterampilan siswa tingkat Provinsi",
                "Terkoordinasinya keberadaan pembelajaran peserta didik teknik pengelasan dengan baik",
                "Menumbuhkan jiwa entrepreneur yang kreatif dan inovatif",
                "Terlaksananya unit produksi pembuatan pagar besi, rak bunga dan lain-lain sebagai unit produksi yang sesuai dengan standar industri",
                "Mendapatkan reward kepuasan dari pelanggan unit produksi",
                "Mengisi iklan promosi di market place Batusangkar",
                "Terjalinnya kerjasama dengan Bengkel las Bukik Gombak",
                "Diterimanya lulusan teknik pengelasan di DUDIKA dan perguruan tinggi",
              ].map((goal, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100"
                >
                  <div className="bg-orange-100 p-2 rounded-full flex-shrink-0">
                    <Target className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-gray-700">{goal}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Facilities
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">Fasilitas Pembelajaran</h2>
            <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
              Didukung dengan peralatan dan fasilitas modern yang memenuhi standar industri otomotif.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Bengkel Otomotif Modern",
                description: "Dilengkapi peralatan diagnostik dan perbaikan kendaraan terkini"
              },
              {
                title: "Laboratorium Mesin",
                description: "Fasilitas untuk mempelajari komponen mesin dan melakukan praktik pembongkaran"
              },
              {
                title: "Unit Servis & Cuci Mobil",
                description: "Unit produksi yang menjadi tempat praktik langsung siswa dengan pelanggan nyata"
              },
              {
                title: "Ruang Simulasi",
                description: "Dilengkapi software simulasi dan trainer untuk pembelajaran interaktif"
              },
              {
                title: "Perpustakaan Teknik",
                description: "Koleksi buku dan manual teknis dari berbagai merek kendaraan"
              },
              {
                title: "Ruang Uji Kendaraan",
                description: "Fasilitas pengujian performa dan kelaikan jalan kendaraan"
              }
            ].map((facility, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-blue-600 mb-3">{facility.title}</h3>
                <p className="text-gray-600">{facility.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}
    </main>
  );
};

export default TeknikPengelasanFabrikasiLogamPage;
