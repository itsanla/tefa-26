"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import Link from "next/link";
import {
  FlaskConical,
  ArrowLeft,
  Target,
  Users,
  Building,
  Award,
  CheckCircle,
  Utensils,
  Workflow,
} from "lucide-react";

const AgriteknologiPengolahanHasilPertanianPage = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <main className="pt-24 bg-gradient-to-b from-white to-teal-50">
      {/* Back Navigation */}
      <div className="container mx-auto px-4 pt-4">
        <Link
          href="/#jurusan"
          className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-800 font-medium transition-colors mb-6"
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
            <div className="bg-teal-100 text-teal-800 text-xs font-medium py-1 px-3 rounded-full inline-block mb-4">
              Program Keahlian
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
              Agriteknologi <span className="text-teal-600">Pengolahan Hasil Pertanian</span>
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Mempersiapkan siswa untuk mengolah hasil pertanian menjadi produk bernilai tambah dengan penerapan teknologi pengolahan pangan modern.
            </p>
          </div>
          <div className="w-full md:w-1/2 relative">
            <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden shadow-xl bg-white p-4 flex items-center justify-center">
              <Image
                src="/image/agribisni pengolahan hasil pertanian.webp"
                alt="Agriteknologi Pengolahan Hasil Pertanian"
                width={400}
                height={300}
                className="object-cover w-full h-full"
                style={{ objectFit: 'cover' }}
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
                kurun waktu 1 tahun, sebagai berikut:
              </p>
            </div>

            <div className="space-y-6">
              {[
                "Menerapkan pembelajaran project-based learning yang berpusat pada siswa",
                "Membangun pembelajaran kolaboratif dengan pihak industri (guru tamu) untuk menghasilkan proyek sesuai kebutuhan masyarakat",
                "Memiliki guru pengolahan hasil pertanian yang mampu menerapkan model pembelajaran berdiferensiasi dan berbasis saintifik",
                "Meraih kejuaraan lomba keterampilan siswa tingkat provinsi",
                "Mewujudkan koordinasi pembelajaran yang baik untuk peserta didik",
                "Menumbuhkan jiwa entrepreneur yang kreatif dan inovatif pada siswa",
                "Mengembangkan unit produksi olahan hasil nabati, hewani, dan rempah sesuai dengan standar industri",
                "Mendapatkan reward kepuasan dari pelanggan unit produksi",
                "Aktif melakukan promosi produk di marketplace Batusangkar",
                "Membangun kerjasama dengan DUDIKA (Dunia Usaha dan Dunia Industri) dalam dan luar provinsi",
                "Menyiapkan lulusan yang dapat diterima di DUDIKA dan perguruan tinggi",
              ].map((goal, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100"
                >
                  <div className="bg-teal-100 p-2 rounded-full flex-shrink-0">
                    <Target className="h-5 w-5 text-teal-600" />
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
    </main>
  );
};

export default AgriteknologiPengolahanHasilPertanianPage;
