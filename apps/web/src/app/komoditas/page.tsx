"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Loader2, ImageIcon, ArrowLeft, Search, X } from "lucide-react";
import { apiRequest } from "@/services/api.service";

// Define TypeScript interfaces for data structure
interface KomoditasDetails {
  brix?: string;
  visual?: string[];
  bentuk?: string;
  tekstur?: string[];
  keunggulan?: string[];
}

interface Komoditas {
  id: string;
  nama: string;
  deskripsi: string;
  foto: string;
  features?: string[];
  jumlah: number;
  satuan: string;
  jenis?: { name: string };
  updated_at: string;
  details?: KomoditasDetails;
  isNew?: boolean;
}

const KomoditasPage = () => {
  // State for API data
  const [komoditas, setKomoditas] = useState<Komoditas[]>([]);
  const [filteredKomoditas, setFilteredKomoditas] = useState<Komoditas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // State for modal
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
            const processedData = Array.isArray(response)
              ? response.map((item) => ({
                  id: String(item.id), // Convert number to string
                  nama: item.nama,
                  deskripsi: item.deskripsi,
                  foto: item.foto?.startsWith("http")
                    ? item.foto
                    : `/image/${item.foto}`, // Handle both Cloudinary and local paths
                  jumlah: item.jumlah,
                  satuan: item.satuan,
                  jenis: { name: item.jenis?.name || "Komoditas Premium" }, // Ensure consistent jenis structure
                  updated_at: item.updatedAt || new Date().toISOString(), // Map updatedAt to updated_at
                  features: [
                    item.jenis?.name || "Komoditas Premium",
                    `Stok: ${item.jumlah} ${item.satuan}`,
                  ],
                }))
              : [];

            console.log("Fetched komoditas data:", processedData);
            setKomoditas(processedData);
            setFilteredKomoditas(processedData);
          }
        } catch (apiError) {
          console.warn("API fetch failed", apiError);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch komoditas"
        );
        console.error("Error in komoditas component:", err);

        // Fallback to empty arrays if everything fails
        setKomoditas([]);
        setFilteredKomoditas([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKomoditas();
  }, []);

  // Filter komoditas based on search query
  useEffect(() => {
    if (komoditas) {
      let filtered = [...komoditas];

      // Apply search filter
      if (searchQuery.trim() !== "") {
        filtered = filtered.filter(
          (item) =>
            item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.deskripsi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.jenis?.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setFilteredKomoditas(filtered);
    }
  }, [searchQuery, komoditas]);

  // Modal functions
  const openKomoditasDetail = (item: Komoditas) => {
    setSelectedKomoditas(item);
    document.body.classList.add("overflow-hidden");
  };

  const closeKomoditasDetail = () => {
    setSelectedKomoditas(null);
    document.body.classList.remove("overflow-hidden");
  };

  // Clear search function
  const clearSearch = () => {
    setSearchQuery("");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header section */}
      <div className="bg-emerald-800 py-16 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-80 h-80 bg-emerald-700/50 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-10 w-60 h-60 bg-emerald-600/40 rounded-full blur-[80px]"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center mb-6">
            <Link
              href="/"
              className="flex items-center text-emerald-100 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Katalog Komoditas <span className="text-emerald-300">TEFA</span>
            </h1>
            <p className="text-emerald-100 text-lg md:text-xl max-w-3xl mb-10">
              Jelajahi berbagai komoditas hasil produksi Teaching Factory SMK
              Negeri 2 Batusangkar dengan kualitas premium dan teknologi modern.
            </p>

            {/* Search bar */}
            <div className="flex justify-start">
              <div className="relative w-full max-w-xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-emerald-300" />
                </div>
                <input
                  type="text"
                  placeholder="Cari komoditas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 py-4 w-full bg-white/10 border border-emerald-600 rounded-lg text-white placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent shadow-md"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    aria-label="Clear search"
                  >
                    <X className="h-5 w-5 text-emerald-300 hover:text-white transition-colors" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Catalog grid section */}
      <div className="py-16" ref={ref}>
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
              <p className="ml-3 text-emerald-800 text-lg">
                Memuat data komoditas...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-emerald-800 text-lg">{error}</p>
              <button
                className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-500 transition-colors"
                onClick={() => window.location.reload()}
              >
                Coba lagi
              </button>
            </div>
          ) : filteredKomoditas.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-emerald-800 text-lg">
                Tidak ada komoditas yang sesuai dengan pencarian Anda
              </p>
              <button
                className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-500 transition-colors"
                onClick={() => {
                  setSearchQuery("");
                }}
              >
                Reset Pencarian
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-emerald-800">
                  {filteredKomoditas.length} Komoditas
                  {searchQuery ? ` untuk pencarian "${searchQuery}"` : ""}
                </h2>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              >
                {filteredKomoditas.map((item, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
                  >
                    <div className="h-64 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {item.foto ? (
                        <Image
                          src={
                            item.foto.startsWith("http") ? item.foto : item.foto
                          }
                          alt={item.nama}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/image/placeholder.webp";
                          }}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
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

                      <div className="absolute top-4 left-4 z-10">
                        <span className="bg-white/80 backdrop-blur-sm text-emerald-800 text-xs font-semibold py-1 px-3 rounded-full">
                          {item.jenis?.name || "Komoditas TEFA"}
                        </span>
                      </div>

                      {/* Quantity badge */}
                      <div className="absolute bottom-4 right-4 z-10">
                        <span className="bg-emerald-600/90 backdrop-blur-sm text-white text-xs font-semibold py-1 px-3 rounded-full">
                          {item.jumlah} {item.satuan}
                        </span>
                      </div>

                      {/* View details button on hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                        <button
                          onClick={() => openKomoditasDetail(item)}
                          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg transition-all transform hover:scale-105"
                        >
                          Lihat Detail
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-emerald-800 mb-2 group-hover:text-emerald-600 transition-colors">
                        {item.nama}
                      </h3>
                      <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-3">
                        {item.deskripsi ||
                          "Informasi detail tentang komoditas ini akan segera hadir."}
                      </p>

                      <button
                        onClick={() => openKomoditasDetail(item)}
                        className="text-emerald-600 font-medium text-sm hover:text-emerald-800 transition-colors flex items-center"
                      >
                        Pelajari Lebih Lanjut
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 ml-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </div>

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
                  selectedKomoditas.foto
                    ? selectedKomoditas.foto.startsWith("http")
                      ? selectedKomoditas.foto
                      : selectedKomoditas.foto
                    : "/image/placeholder.webp"
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
                      SMK 2 NEGERI BATUSANGKAR
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
    </main>
  );
};

export default KomoditasPage;
