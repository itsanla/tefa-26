"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// Data struktur bidang keahlian dengan program keahlian dan konsentrasi
const bidangKeahlian = [
  {
    id: "teknologi-manufaktur",
    name: "Teknologi Manufaktur dan Rekayasa",
    description:
      "Membekali siswa dengan keterampilan teknis dalam bidang rekayasa dan manufaktur untuk memenuhi kebutuhan industri modern.",
    color: "bg-blue-600",
    image: "/image/teknik kendaraan ringan otomotif.webp",
    programKeahlian: [
      {
        id: "teknik-otomotif",
        name: "Teknik Otomotif",
        description: "Membekali siswa dengan keterampilan perawatan, perbaikan, dan pemeliharaan kendaraan dengan standar industri otomotif modern.",
        konsentrasi: [
          {
            id: "tkr",
            name: "Teknik Kendaraan Ringan",
            description: "Fokus pada perawatan dan perbaikan mobil penumpang dan kendaraan ringan lainnya."
          },
          {
            id: "tsm",
            name: "Teknik Sepeda Motor",
            description: "Fokus pada perawatan dan perbaikan sepeda motor dan kendaraan roda dua."
          }
        ]
      },
      {
        id: "teknik-pengelasan",
        name: "Teknik Pengelasan dan Fabrikasi Logam",
        description: "Mempersiapkan siswa dengan keterampilan pengelasan profesional sesuai standar industri untuk berbagai aplikasi konstruksi dan manufaktur.",
        konsentrasi: [
          {
            id: "teknik-las",
            name: "Teknik Pengelasan",
            description: "Fokus pada teknik-teknik pengelasan modern dan aplikasi industri."
          }
        ]
      }
    ]
  },
  {
    id: "agribisnis-agroteknologi",
    name: "Agribisnis dan Agroteknologi",
    description:
      "Membekali siswa dengan pengetahuan dan keterampilan dalam bidang pertanian, peternakan, dan pengolahan hasil pertanian modern.",
    color: "bg-green-600",
    image: "/image/agribisni pengolahan hasil pertanian.webp",
    programKeahlian: [
      {
        id: "agribisnis-tanaman",
        name: "Agribisnis Tanaman",
        description: "Membekali siswa dengan keterampilan budidaya tanaman pangan dan hortikultura menggunakan teknologi pertanian modern dan berkelanjutan.",
        konsentrasi: [
          {
            id: "tph",
            name: "Agribisnis Tanaman Pangan Hortikultura",
            description: "Fokus pada budidaya tanaman pangan dan hortikultura dengan teknologi modern."
          }
        ]
      },
      {
        id: "agribisnis-ternak",
        name: "Agribisnis Ternak",
        description: "Program keahlian yang memfokuskan pada budidaya ternak dengan metode modern untuk memenuhi kebutuhan protein hewani berkualitas.",
        konsentrasi: [
          {
            id: "atu",
            name: "Agribisnis Ternak Unggas",
            description: "Fokus pada budidaya dan pengembangan ternak unggas dengan teknologi modern."
          }
        ]
      },
      {
        id: "agriteknologi-pengolahan",
        name: "Agriteknologi Pengolahan Hasil Pertanian",
        Image: "/image/agribisni pengolahan hasil pertanian.webp",
        description: "Mempersiapkan siswa untuk mengolah hasil pertanian menjadi produk bernilai tambah dengan penerapan teknologi pengolahan pangan modern.",
        konsentrasi: [
          {
            id: "aphp",
            name: "Agribisnis Pengolahan Hasil Pertanian",
            description: "Fokus pada pengolahan hasil pertanian menjadi produk bernilai tambah."
          }
        ]
      }
    ]
  },
  {
    id: "seni-ekonomi-kreatif",
    name: "Seni dan Ekonomi Kreatif",
    description:
      "Mengembangkan kreativitas dan keterampilan dalam bidang seni dan desain untuk mendukung industri kreatif.",
    color: "bg-purple-600",
    image: "/image/busana.webp",
    programKeahlian: [
      {
        id: "busana",
        name: "Busana",
        description: "Mengembangkan keterampilan desain, pola, dan produksi busana dengan memadukan teknik tradisional dan teknologi modern.",
        konsentrasi: [
          {
            id: "dpb",
            name: "Desain dan Produksi Busana",
            description: "Fokus pada desain dan produksi busana dengan teknik modern."
          }
        ]
      }
    ]
  }
];

const Jurusans = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const [selectedBidang, setSelectedBidang] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [view, setView] = useState<'bidang' | 'program' | 'konsentrasi'>('bidang');

  // Fungsi untuk memilih bidang keahlian
  const handleSelectBidang = (bidangId: string) => {
    setSelectedBidang(bidangId);
    setSelectedProgram(null);
    setView('program');
  };

  // Fungsi untuk memilih program keahlian
  const handleSelectProgram = (programId: string) => {
    setSelectedProgram(programId);
    setView('konsentrasi');
  };

  // Fungsi untuk kembali ke tampilan sebelumnya
  const handleBack = () => {
    if (view === 'konsentrasi') {
      setView('program');
      setSelectedProgram(null);
    } else if (view === 'program') {
      setView('bidang');
      setSelectedBidang(null);
    }
  };

  // Mendapatkan data bidang keahlian, program keahlian, atau konsentrasi keahlian berdasarkan tampilan saat ini
  const getCurrentViewData = () => {
    if (view === 'bidang') {
      return bidangKeahlian;
    } else if (view === 'program') {
      const bidang = bidangKeahlian.find((b) => b.id === selectedBidang);
      return bidang?.programKeahlian || [];
    } else if (view === 'konsentrasi') {
      const bidang = bidangKeahlian.find((b) => b.id === selectedBidang);
      const program = bidang?.programKeahlian.find((p) => p.id === selectedProgram);
      return program?.konsentrasi || [];
    }
    return [];
  };

  // Mendapatkan judul untuk tampilan saat ini
  const getViewTitle = () => {
    if (view === 'bidang') {
      return 'Bidang Keahlian';
    } else if (view === 'program') {
      const bidang = bidangKeahlian.find((b) => b.id === selectedBidang);
      return `Program Keahlian: ${bidang?.name}`;
    } else if (view === 'konsentrasi') {
      const bidang = bidangKeahlian.find((b) => b.id === selectedBidang);
      const program = bidang?.programKeahlian.find((p) => p.id === selectedProgram);
      return `Konsentrasi Keahlian: ${program?.name}`;
    }
    return '';
  };

  return (
    <section
      id="jurusan"
      className="py-24 bg-gradient-to-b from-emerald-50 to-white"
      ref={ref}
    >
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }
      `}</style>
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-medium py-1 px-3 rounded-full">
              {view === 'bidang' ? 'Bidang Keahlian' : (view === 'program' ? 'Program Keahlian' : 'Konsentrasi Keahlian')}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-emerald-800">
            {view === 'bidang' && (
              <>
                Program  <span className="text-emerald-600">Keahlian</span>
              </>
            )}
            {view === 'program' && (
              <>
                Program <span className="text-emerald-600">Keahlian</span>
              </>
            )}
            {view === 'konsentrasi' && (
              <>
                Konsentrasi <span className="text-emerald-600">Keahlian</span>
              </>
            )}
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            SMK NEGERI 2 Batusangkar menawarkan berbagai program keahlian dengan fokus
            unggulan di bidang agribisnis dan teknik yang dirancang untuk
            mempersiapkan siswa menghadapi kebutuhan dunia industri modern.
          </p>

          {/* Breadcrumb navigation */}
          {(view === 'program' || view === 'konsentrasi') && (
            <div className="flex justify-center items-center mt-4 space-x-2 text-sm">
              <button 
                onClick={() => setView('bidang')}
                className="text-emerald-600 hover:text-emerald-800 font-medium"
              >
                Bidang Keahlian
              </button>
              
              {view === 'program' && (
                <>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-600">
                    {bidangKeahlian.find(b => b.id === selectedBidang)?.name}
                  </span>
                </>
              )}
              
              {view === 'konsentrasi' && (
                <>
                  <span className="text-gray-400">/</span>
                  <button 
                    onClick={() => {
                      setView('program');
                      setSelectedProgram(null);
                    }}
                    className="text-emerald-600 hover:text-emerald-800 font-medium"
                  >
                    {bidangKeahlian.find(b => b.id === selectedBidang)?.name}
                  </button>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-600">
                    {bidangKeahlian
                      .find(b => b.id === selectedBidang)
                      ?.programKeahlian.find(p => p.id === selectedProgram)?.name}
                  </span>
                </>
              )}
            </div>
          )}
        </motion.div>

        <div className="relative">
          {/* Decorative elements */}
          <div className="absolute -right-20 top-20 w-80 h-80 bg-green-100 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute -left-10 bottom-10 w-60 h-60 bg-emerald-50 rounded-full blur-3xl opacity-40"></div>

          {/* Back button for navigation */}
          {view !== 'bidang' && (
            <div className="mb-6">
              <button
                onClick={handleBack}
                className="flex items-center text-emerald-700 hover:text-emerald-900 font-medium transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  ></path>
                </svg>
                Kembali ke {view === 'konsentrasi' ? 'Program Keahlian' : 'Bidang Keahlian'}
              </button>
            </div>
          )}

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10"
          >
            {view === 'bidang' &&
              bidangKeahlian.map((bidang, index) => (
                <motion.div
                  key={bidang.id}
                  variants={itemVariants}
                  className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col border border-gray-100 cursor-pointer"
                  onClick={() => handleSelectBidang(bidang.id)}
                >
                  <div className="relative h-48 md:h-56 overflow-hidden">
                    <Image
                      src={bidang.image}
                      alt={bidang.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm text-xs font-semibold py-1 px-3 rounded-full text-gray-800">
                      Bidang Keahlian
                    </div>
                  </div>
                  <div className="p-6 md:p-8 flex-grow">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-emerald-700 transition-colors">
                      {bidang.name}
                    </h3>
                    <p className="text-gray-600">{bidang.description}</p>
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div
                        className="text-sm font-medium text-emerald-600 flex items-center hover:text-emerald-800 transition-colors"
                      >
                        Lihat Program Keahlian
                        <svg
                          className="w-4 h-4 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          ></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            }

            {view === 'program' && selectedBidang &&
              bidangKeahlian
                .find(b => b.id === selectedBidang)
                ?.programKeahlian.map((program, index) => (
                  <motion.div
                    key={program.id}
                    variants={itemVariants}
                    className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col border border-gray-100 cursor-pointer"
                    onClick={() => handleSelectProgram(program.id)}
                  >
                    <div
                      className={`${bidangKeahlian.find(b => b.id === selectedBidang)?.color || 'bg-emerald-600'} relative h-48 md:h-56 flex items-center justify-center overflow-hidden`}
                    >
                      <div className="absolute inset-0 opacity-20">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute rounded-full bg-white/30"
                            style={{
                              width: `${Math.random() * 40 + 10}px`,
                              height: `${Math.random() * 40 + 10}px`,
                              top: `${Math.random() * 100}%`,
                              left: `${Math.random() * 100}%`,
                              animation: `float ${
                                Math.random() * 6 + 3
                              }s infinite ease-in-out`,
                            }}
                          ></div>
                        ))}
                      </div>
                      <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm text-xs font-semibold py-1 px-3 rounded-full text-gray-800">
                        Program Keahlian
                      </div>
                      <h3 className="text-2xl font-bold text-white text-center px-4 relative z-10">
                        {program.name}
                      </h3>
                    </div>
                    <div className="p-6 md:p-8 flex-grow">
                      <p className="text-gray-600">{program.description}</p>
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <div
                          className="text-sm font-medium text-emerald-600 flex items-center hover:text-emerald-800 transition-colors"
                        >
                          Lihat Konsentrasi Keahlian
                          <svg
                            className="w-4 h-4 ml-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 5l7 7-7 7"
                            ></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
            }

            {view === 'konsentrasi' && selectedBidang && selectedProgram &&
              bidangKeahlian
                .find(b => b.id === selectedBidang)
                ?.programKeahlian.find(p => p.id === selectedProgram)
                ?.konsentrasi.map((konsentrasi, index) => (
                  <motion.div
                    key={konsentrasi.id}
                    variants={itemVariants}
                    className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col border border-gray-100"
                  >
                    <div
                      className={`${bidangKeahlian.find(b => b.id === selectedBidang)?.color || 'bg-emerald-600'} relative h-48 md:h-56 flex items-center justify-center overflow-hidden`}
                    >
                      <div className="absolute inset-0 opacity-20">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute rounded-full bg-white/30"
                            style={{
                              width: `${Math.random() * 40 + 10}px`,
                              height: `${Math.random() * 40 + 10}px`,
                              top: `${Math.random() * 100}%`,
                              left: `${Math.random() * 100}%`,
                              animation: `float ${
                                Math.random() * 6 + 3
                              }s infinite ease-in-out`,
                            }}
                          ></div>
                        ))}
                      </div>
                      <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm text-xs font-semibold py-1 px-3 rounded-full text-gray-800">
                        Konsentrasi Keahlian
                      </div>
                      <h3 className="text-2xl font-bold text-white text-center px-4 relative z-10">
                        {konsentrasi.name}
                      </h3>
                    </div>
                    <div className="p-6 md:p-8 flex-grow">
                      <p className="text-gray-600">{konsentrasi.description}</p>
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        {/* <Link
                          href={`/jurusan/${konsentrasi.id}`}
                          className="text-sm font-medium text-emerald-600 flex items-center hover:text-emerald-800 transition-colors"
                        >
                          Pelajari lebih lanjut
                          <svg
                            className="w-4 h-4 ml-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 5l7 7-7 7"
                            ></path>
                          </svg>
                        </Link> */}
                      </div>
                    </div>
                  </motion.div>
                ))
            }
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Jurusans;
