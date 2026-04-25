"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import { Award, BookOpen, Users, Target } from "lucide-react";

const ProfileSekolah = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section
      id="about"
      className="py-24 bg-gradient-to-b from-white to-emerald-50"
      ref={ref}
    >
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4">
            <span className="bg-green-100 text-green-800 text-xs font-medium py-1 px-3 rounded-full">
              Tentang Kami
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-800 to-green-600 bg-clip-text text-transparent">
            Profil Sekolah
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            SMK Negeri 2 Batusangkar adalah Sekolah Menengah Kejuruan yang fokus
            pada bidang Teknologi Manufaktur dan Rekayasa, Agribisnis dan
            Agroteknologi, serta Seni dan Ekonomi Kreatif.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: inView ? 1 : 0, x: inView ? 0 : -30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-emerald-50 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-50 rounded-full opacity-70"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-green-50 rounded-full opacity-70"></div>

              <div className="relative">
                <div className="mb-2 inline-flex items-center">
                  <div className="w-6 sm:w-8 lg:w-10 h-1 bg-emerald-500 mr-2 sm:mr-3"></div>
                  <span className="text-emerald-600 font-medium text-xs sm:text-sm uppercase tracking-wider">
                    Sekolah Unggulan
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 leading-tight">
                  Tentang SMK Negeri 2 Batusangkar
                </h3>

                <div className="prose prose-emerald text-gray-600 max-w-none">
                  <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed">
                    SMK Negeri 2 Batusangkar berlokasi di Jalan Bendang Balai
                    Kacang, Nagari Lima Kaum, Kecamatan Lima Kaum, Kabupaten
                    Tanah Datar, Sumatera Barat. Sekolah ini berdiri di atas
                    lahan seluas 2 hektar dengan luas bangunan 7.150 m².
                  </p>
                  <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed">
                    Saat ini, SMK Negeri 2 Batusangkar memiliki total 467 siswa
                    dengan rincian: kelas X (152 siswa), kelas XI (159 siswa),
                    dan kelas XII (156 siswa). Didukung oleh 27 tenaga pendidik
                    berkualitas yang terdiri dari guru PNS dan honorer.
                  </p>
                  <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed">
                    Untuk jurusan Agribisnis Tanaman Pangan dan Hortikultura,
                    tingkat keterserapan lulusan di industri mencapai 65%,
                    sedangkan yang melanjutkan ke perguruan tinggi sebesar 15%,
                    dan 20% berwirausaha.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mt-6 sm:mt-8">
                  <div className="bg-emerald-50 rounded-xl p-3 sm:p-4 hover:bg-emerald-100 transition-colors flex items-start">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500 rounded-lg flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 shadow-md">
                      <Award className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-gray-800 text-sm sm:text-base lg:text-lg leading-tight">
                        Akreditasi B
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                        Status akreditasi saat ini
                      </p>
                    </div>
                  </div>

                  <div className="bg-emerald-50 rounded-xl p-3 sm:p-4 hover:bg-emerald-100 transition-colors flex items-start">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500 rounded-lg flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 shadow-md">
                      <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-gray-800 text-sm sm:text-base lg:text-lg leading-tight">
                        3 Bidang Keahlian
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                        Teknologi, Agribisnis, dan Seni
                      </p>
                    </div>
                  </div>

                  <div className="bg-emerald-50 rounded-xl p-3 sm:p-4 hover:bg-emerald-100 transition-colors flex items-start">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500 rounded-lg flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 shadow-md">
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-gray-800 text-sm sm:text-base lg:text-lg leading-tight">
                        27 Tenaga Pendidik
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                        Guru berpengalaman di bidangnya
                      </p>
                    </div>
                  </div>

                  <div className="bg-emerald-50 rounded-xl p-3 sm:p-4 hover:bg-emerald-100 transition-colors flex items-start">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500 rounded-lg flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 shadow-md">
                      <Target className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-gray-800 text-sm sm:text-base lg:text-lg leading-tight">
                        467 Siswa
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                        Total siswa aktif di semua jurusan
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: inView ? 1 : 0, x: inView ? 0 : 30 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-64 h-64 rounded-full bg-green-100 blur-2xl opacity-30"></div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 rounded-full bg-emerald-100 blur-2xl opacity-30"></div>

              <div className="relative bg-white p-6 rounded-2xl shadow-lg border border-emerald-50">
                <div className="flex flex-col items-center">
                  <div className="relative h-48 w-48 mb-6 rounded-xl overflow-hidden border-4 border-emerald-100 shadow-xl">
                    <Image
                      src="/image/kepsek.webp"
                      alt="Kepala Sekolah SMK NEGERI 2 Batusangkar"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 to-transparent"></div>
                  </div>

                  <div className="text-center">
                    <h3 className="text-xl font-bold text-emerald-800">
                      Budi Dharmawan,S.Pd,.MT
                    </h3>
                    <p className="text-emerald-600 font-medium text-sm mb-4">
                      Kepala Sekolah
                    </p>
                  </div>

                  <div className="mt-4 text-center">
                    <svg
                      className="w-10 h-10 mx-auto mb-2 text-gray-300"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.039 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z" />
                    </svg>
                    <p className="text-gray-600 italic font-light leading-relaxed">
                      "Kami berkomitmen untuk menghasilkan lulusan yang memiliki
                      keterampilan, karakter, dan inovasi dalam bidang
                      Teknologi, Agribisnis, dan Seni Kreatif melalui program
                      Teaching Factory yang terintegrasi dengan kebutuhan
                      industri."
                    </p>
                  </div>

                  <div className="mt-6 flex justify-center space-x-3">
                    <a
                      href="https://www.facebook.com/groups/159755090756204/"
                      className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center hover:bg-emerald-200 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 text-emerald-700"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                      </svg>
                    </a>
                    <a
                      href="https://www.instagram.com/smkn2_batusangkar/"
                      className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center hover:bg-emerald-200 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 text-emerald-700"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProfileSekolah;
