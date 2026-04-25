"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import Link from "next/link";
import {
  Loader2,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { demoData } from "./demoData";
import { apiRequest } from "@/services/api.service";

// Import interfaces from shared demoData
import { KomoditasDetails, Komoditas } from "./demoData";
import axios from "axios";

// Extended interface for API response
interface ApiKomoditas {
  id: number;
  nama: string;
  deskripsi: string;
  foto: string;
  jumlah: number;
  satuan: string;
  jenis: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

const Leaf = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21 3V5C21 14.627 15.627 19 9 19H5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 15C3 15 3 9 3 9C9 9 15 3 15 3C15 9 9 15 9 15Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TefaHybrid = () => {
  // State for API data
  const [komoditas, setKomoditas] = useState<Komoditas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for slider
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [featuredItems, setFeaturedItems] = useState<Komoditas[]>([]);

  // State for grid view
  const [showAll, setShowAll] = useState(false);
  const [selectedKomoditas, setSelectedKomoditas] = useState<Komoditas | null>(
    null
  );

  // Intersection observer for animations
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Fetch komoditas data from API
  useEffect(() => {
    const fetchKomoditas = async () => {
      try {
        setIsLoading(true);
        try {
          const response = await apiRequest({
            endpoint: "/komoditas",
            method: "GET",
          });

          console.log("API response for TefaHybrid:", response);

          if (response && Array.isArray(response)) {
            // Process data to match our interface
            const processedData = response.map((item) => ({
              id: String(item.id), // Convert number to string
              nama: item.nama,
              deskripsi: item.deskripsi,
              foto: item.foto?.startsWith("http")
                ? item.foto
                : `/image/${item.foto}`, // Handle image path
              jumlah: item.jumlah,
              satuan: item.satuan,
              jenis: { name: item.jenis?.name || "Komoditas Premium" },
              updated_at: item.updatedAt || new Date().toISOString(),
              features: [
                item.jenis?.name || "Komoditas Premium",
                `Stok: ${item.jumlah} ${item.satuan}`,
              ],
            }));

            console.log("Processed API data for TefaHybrid:", processedData);

            // Set all items for grid view
            setKomoditas(processedData);

            // Get featured items for slider (first 4)
            const featured = processedData
              .slice(0, Math.min(4, processedData.length)) // Take first 4 items or less if not enough
              .map((item) => ({ ...item, isNew: Math.random() > 0.7 })); // Randomly set some as new

            setFeaturedItems(featured);
          }
        } catch (apiError) {
          console.error("API error:", apiError);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch komoditas"
        );
        console.error("Error in TefaHybrid component:", err);

        // Fallback to empty arrays if everything fails
        setKomoditas([]);
        setFeaturedItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKomoditas();
  }, []);

  // Auto-rotate slider
  useEffect(() => {
    if (!isAutoPlaying || featuredItems.length === 0) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev === featuredItems.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, featuredItems]);

  // Slider navigation functions
  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrent((prev) => (prev === 0 ? featuredItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrent((prev) => (prev === featuredItems.length - 1 ? 0 : prev + 1));
  };

  // Modal functions
  const openKomoditasDetail = (item: Komoditas) => {
    setSelectedKomoditas(item);
    document.body.classList.add("overflow-hidden");
  };

  const closeKomoditasDetail = () => {
    setSelectedKomoditas(null);
    document.body.classList.remove("overflow-hidden");
  };

  // Grid view display control
  const displayedItems = showAll ? komoditas : komoditas.slice(0, 6);

  const handleToggleShowAll = () => {
    setShowAll(!showAll);
  };

  // Animation variants
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
      transition: { duration: 0.6 },
    },
  };

  return (
    <section
      id="tefa"
      className="relative bg-gradient-to-b from-emerald-50 to-white overflow-hidden"
      ref={ref}
    >
      {/* FEATURED SLIDER SECTION */}
      {featuredItems.length > 0 && (
        <div className="relative bg-gradient-to-b from-emerald-900 to-green-800 py-20">
          {/* Decorative wave at the top */}
          <div className="absolute top-0 left-0 right-0 h-16 w-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 320"
              className="w-full h-full"
            >
              <path
                fill="#f0fdf4"
                fillOpacity="1"
                d="M0,160L60,181.3C120,203,240,245,360,240C480,235,600,181,720,176C840,171,960,213,1080,218.7C1200,224,1320,192,1380,176L1440,160L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
              ></path>
            </svg>
          </div>

          {/* Light effects */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-400/20 rounded-full blur-[100px]"></div>

          {/* Floating leaf decorations */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              x: [0, 15, 0],
              rotate: [0, 10, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 8,
              ease: "easeInOut",
            }}
            className="absolute top-1/4 left-10 text-green-200/30"
          >
            <Leaf size={120} />
          </motion.div>

          <motion.div
            animate={{
              y: [0, -25, 0],
              x: [0, -10, 0],
              rotate: [0, -5, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 10,
              ease: "easeInOut",
            }}
            className="absolute bottom-1/3 right-10 text-green-200/30"
          >
            <Leaf size={100} />
          </motion.div>

          <div className="container mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20 shadow-lg mb-5">
                <span className="bg-gradient-to-r from-green-400 to-green-200 text-transparent bg-clip-text font-medium">
                  Teaching Factory
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Program TEFA <span className="text-green-300">Unggulan</span>
              </h2>

              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "120px" }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="h-1 bg-green-400 mx-auto mb-6 rounded-full"
              />

              <p className="text-white/90 max-w-3xl mx-auto text-lg">
                Mengembangkan kompetensi siswa melalui pembelajaran berbasis
                produksi dengan standar industri modern
              </p>
            </motion.div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
                <p className="ml-3 text-white text-lg">
                  Memuat data komoditas...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-white text-lg">{error}</p>
                <button
                  className="mt-4 px-6 py-2 bg-white text-green-700 rounded-full hover:bg-green-100 transition-colors"
                  onClick={() => window.location.reload()}
                >
                  Coba lagi
                </button>
              </div>
            ) : (
              <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-6 md:p-10 shadow-2xl overflow-hidden border border-white/20 mb-10">
                {/* Glass effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5" />

                {/* Light accent shapes */}
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-green-400/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-green-500/10 rounded-full blur-3xl"></div>

                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 relative z-10 gap-4">
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {featuredItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setIsAutoPlaying(false);
                          setCurrent(index);
                        }}
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          current === index
                            ? "bg-white w-8"
                            : "bg-white/40 w-2.5 hover:bg-white/60"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-white/70 hidden md:inline-block">
                      <span className="font-medium text-white">
                        {current + 1}
                      </span>
                      /{featuredItems.length}
                    </span>

                    <button
                      onClick={handlePrevious}
                      disabled={featuredItems.length <= 1}
                      className="p-3 md:p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all border border-white/20 hover:border-white/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={featuredItems.length <= 1}
                      className="p-3 md:p-4 bg-emerald-600 hover:bg-emerald-500 rounded-full transition-all shadow-lg hover:shadow-emerald-500/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                      aria-label="Next slide"
                    >
                      <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={current}
                    initial={{ opacity: 0, x: 100, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -100, scale: 0.95 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 lg:gap-16 relative z-10"
                  >
                    <div className="lg:w-1/2 w-full">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="relative w-full aspect-[4/3] md:aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl group"
                      >
                        {/* Animated border effect */}
                        <div className="absolute inset-0 rounded-2xl border-2 border-white/30 z-20">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5">
                            <div className="absolute top-0 left-0 w-full h-full bg-black/10 backdrop-filter backdrop-blur-[1px]"></div>
                          </div>
                        </div>

                        {/* Conditionally render image or placeholder */}
                        {featuredItems[current]?.foto ? (
                          <motion.div
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 1.2 }}
                            className="h-full w-full"
                          >
                            <Image
                              src={
                                featuredItems[current].foto.startsWith("http")
                                  ? featuredItems[current].foto
                                  : `/image/${featuredItems[
                                      current
                                    ].foto.replace("/image/", "")}`
                              }
                              alt={featuredItems[current].nama}
                              fill
                              className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                              sizes="(max-width: 768px) 100vw, 50vw"
                              priority
                              onError={(e) => {
                                // If image fails to load, replace with placeholder
                                const target = e.target as HTMLImageElement;
                                target.src = "/image/placeholder.webp";
                              }}
                            />
                          </motion.div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                            <div className="p-6 rounded-full bg-white/30 backdrop-blur-sm shadow-inner">
                              <ImageIcon
                                size={60}
                                className="text-emerald-600 opacity-70"
                              />
                              <p className="mt-2 text-emerald-700 text-sm font-medium">
                                Gambar Tidak Tersedia
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Enhanced gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

                        {/* Stats badge */}
                        {/* <div className="absolute top-6 left-6 z-20">
                          <span className="inline-flex items-center bg-emerald-600/90 backdrop-blur-sm text-white px-5 py-2 rounded-full text-sm font-medium border border-white/20 shadow-xl">
                            {featuredItems[current].jumlah}{" "}
                            {featuredItems[current].satuan}
                          </span>
                        </div> */}

                        {/* Featured badge */}
                        <div className="absolute top-6 right-6 z-20">
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="inline-flex items-center bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-medium border border-white/30 shadow-xl"
                          >
                            {featuredItems[current].jenis?.name ||
                              "Komoditas Premium"}
                          </motion.span>
                        </div>

                        {/* Title on mobile */}
                        <div className="absolute bottom-6 left-6 md:hidden z-20 max-w-[80%]">
                          <motion.h3
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="text-2xl font-bold text-white"
                          >
                            {featuredItems[current].nama}
                          </motion.h3>
                        </div>
                      </motion.div>
                    </div>

                    <div className="lg:w-1/2 w-full text-center lg:text-left mt-6 lg:mt-0">
                      <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="hidden md:block text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-5"
                      >
                        {featuredItems[current].nama}
                      </motion.h3>

                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "6rem" }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="w-24 h-1 bg-gradient-to-r from-green-400 to-green-300 rounded-full mb-6 hidden md:block lg:mx-0 mx-auto"
                      ></motion.div>

                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0"
                      >
                        {featuredItems[current].deskripsi ||
                          "Informasi detail tentang komoditas ini akan segera hadir."}
                      </motion.p>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="flex flex-col sm:flex-row gap-3"
                      >
                        <button
                          onClick={() =>
                            openKomoditasDetail(featuredItems[current])
                          }
                          className="inline-flex items-center px-7 py-4 bg-emerald-500 hover:bg-emerald-400 transition-all text-white rounded-full font-medium group shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/50"
                        >
                          Lihat Detail
                          <ArrowRight
                            className="ml-2 group-hover:translate-x-2 transition-transform"
                            size={20}
                          />
                        </button>

                        <Link
                          href="/komoditas"
                          className="inline-flex items-center px-7 py-4 bg-white/20 hover:bg-white/30 transition-all text-white backdrop-blur-sm rounded-full font-medium group border border-white/30"
                        >
                          Selengkapnya
                          <ArrowRight
                            className="ml-2 group-hover:translate-x-2 transition-transform"
                            size={20}
                          />
                        </Link>
                      </motion.div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Bottom decorative wave */}
          <div className="absolute bottom-0 left-0 right-0 h-20 w-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 320"
              className="w-full h-full"
            >
              <path
                fill="#f9fafb"
                fillOpacity="1"
                d="M0,96L60,128C120,160,240,224,360,245.3C480,267,600,245,720,224C840,203,960,181,1080,181.3C1200,181,1320,203,1380,213.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
              ></path>
            </svg>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedKomoditas && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-80 sm:h-96">
              <Image
                src={
                  selectedKomoditas.foto?.startsWith("http")
                    ? selectedKomoditas.foto
                    : `/image/${selectedKomoditas.foto.replace("/image/", "")}`
                }
                alt={selectedKomoditas.nama}
                fill
                className="object-cover"
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/image/placeholder.webp";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/10"></div>

              <div className="absolute top-4 right-4">
                <button
                  onClick={closeKomoditasDetail}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-full transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <span className="bg-emerald-500/90 text-white text-xs font-semibold px-3 py-1 rounded-full inline-block mb-3">
                  {selectedKomoditas.jenis?.name || "Komoditas TEFA"}
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-white">
                  {selectedKomoditas.nama}
                </h2>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-emerald-800 mb-3">
                  Deskripsi
                </h3>
                <p className="text-gray-700">
                  {selectedKomoditas.deskripsi ||
                    "Informasi detail tentang komoditas ini akan segera hadir."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-emerald-800 mb-3">
                      Informasi Komoditas
                    </h3>
                    <div className="bg-emerald-50 p-4 rounded-lg">
                      <div className="flex justify-between py-2 border-b border-emerald-100">
                        <span className="text-gray-600">Jenis</span>
                        <span className="font-medium text-emerald-800">
                          {selectedKomoditas.jenis?.name || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-emerald-100">
                        <span className="text-gray-600">Kuantitas</span>
                        <span className="font-medium text-emerald-800">
                          {selectedKomoditas.jumlah} {selectedKomoditas.satuan}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">
                          Terakhir Diperbarui
                        </span>
                        <span className="font-medium text-emerald-800">
                          {new Date(
                            selectedKomoditas.updated_at
                          ).toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Additional details if available */}
                  {selectedKomoditas.details?.brix && (
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-emerald-800 mb-3">
                        Brix (Tingkat Kemanisan)
                      </h3>
                      <div className="bg-emerald-50 p-4 rounded-lg">
                        <p className="text-gray-700 font-medium">
                          {selectedKomoditas.details.brix}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedKomoditas.details?.bentuk && (
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-emerald-800 mb-3">
                        Bentuk
                      </h3>
                      <div className="bg-emerald-50 p-4 rounded-lg">
                        <p className="text-gray-700 font-medium">
                          {selectedKomoditas.details.bentuk}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  {selectedKomoditas.details?.visual &&
                    selectedKomoditas.details.visual.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-xl font-semibold text-emerald-800 mb-3">
                          Karakteristik Visual
                        </h3>
                        <div className="bg-emerald-50 p-4 rounded-lg">
                          <ul className="space-y-2">
                            {selectedKomoditas.details.visual.map(
                              (item, idx) => (
                                <li key={idx} className="flex items-start">
                                  <div className="h-5 w-5 rounded-full bg-emerald-100 flex-shrink-0 flex items-center justify-center mt-1 mr-3">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                                  </div>
                                  <span className="text-gray-700">{item}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    )}

                  {selectedKomoditas.details?.keunggulan &&
                    selectedKomoditas.details.keunggulan.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-xl font-semibold text-emerald-800 mb-3">
                          Keunggulan
                        </h3>
                        <div className="bg-emerald-50 p-4 rounded-lg">
                          <ul className="space-y-2">
                            {selectedKomoditas.details.keunggulan.map(
                              (item, idx) => (
                                <li key={idx} className="flex items-start">
                                  <div className="h-5 w-5 rounded-full bg-emerald-100 flex-shrink-0 flex items-center justify-center mt-1 mr-3">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                                  </div>
                                  <span className="text-gray-700">{item}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <span className="text-sm text-gray-500">
                      Bagian dari program TEFA
                    </span>
                    <p className="text-emerald-800 font-medium">
                      SMK NEGERI 2 BATUSANGKAR
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={closeKomoditasDetail}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TefaHybrid;
