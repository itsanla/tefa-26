'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sprout, Leaf, ArrowDown } from 'lucide-react';
import Image from 'next/image';

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Preload video only after component mounts
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden" id="hero">
      {/* Background - Progressive loading: solid color → image → video */}
      <div className="absolute inset-0 bg-emerald-950">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/85 via-emerald-900/65 to-emerald-800/75 z-10" />

        {/* Static fallback image (loads fast, shown first) */}
        <Image
          src="/image/fotosama.webp"
          alt=""
          fill
          priority
          className={`object-cover transition-opacity duration-700 ${videoLoaded ? 'opacity-0' : 'opacity-60'}`}
          sizes="100vw"
          aria-hidden="true"
        />

        {/* Video Background (loads after) */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          onLoadedData={() => setVideoLoaded(true)}
          className={`object-cover w-full h-full transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Subtle animated grain overlay for depth */}
      <div
        className="absolute inset-0 z-10 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Hero Content */}
      <div className="container mx-auto relative z-20 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="text-left">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 mb-5 bg-emerald-600/50 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm border border-emerald-500/30"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-emerald-100 font-medium">Pusat Keunggulan Pendidikan</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -30 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-5 leading-[1.1] tracking-tight"
            >
              SMK Negeri 2{' '}
              <span className="bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent">
                Batusangkar
              </span>
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg sm:text-xl md:text-2xl font-medium mb-5 text-emerald-200/90"
            >
              Pusat Unggulan Teaching Factory (TEFA)
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -10 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-base sm:text-lg max-w-xl mb-8 text-gray-200/90 leading-relaxed"
            >
              Mengembangkan inovasi pembelajaran berbasis teaching factory dengan fokus
              pada budidaya melon hidroponik, peternakan ayam, dan tanaman sayuran hidroponik.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap gap-3 sm:gap-4"
            >
              <a
                href="#tefa"
                className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-medium py-3 px-7 rounded-full transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 hover:shadow-xl flex items-center gap-2 text-sm sm:text-base"
                id="cta-tefa"
              >
                <Sprout size={18} className="group-hover:rotate-12 transition-transform duration-300" />
                <span>Program TEFA</span>
              </a>
              <a
                href="#about"
                className="group bg-white/10 hover:bg-white/20 text-white border border-white/25 font-medium py-3 px-7 rounded-full backdrop-blur-sm transition-all duration-300 hover:shadow-lg text-sm sm:text-base"
                id="cta-about"
              >
                Tentang Kami
              </a>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-10 flex flex-wrap gap-6 sm:gap-8"
            >
              {[
                { value: '467', label: 'Siswa Aktif' },
                { value: '5', label: 'Program Keahlian' },
                { value: '11+', label: 'Mitra Industri' },
              ].map((stat, i) => (
                <div key={i} className="text-left">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-emerald-200/70 font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square max-w-md mx-auto">
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400/15 to-emerald-600/15 blur-xl scale-110" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400/20 to-emerald-600/20 backdrop-blur-md" />
              <div className="absolute inset-4 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl">
                <Image
                  src="/image/fotosama.webp"
                  alt="SMK Negeri 2 Batusangkar - Foto bersama siswa dan guru"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 0px, 400px"
                  priority
                />
              </div>

              {/* Floating badge */}
              <motion.div
                className="absolute -bottom-3 -right-3 bg-white rounded-2xl shadow-xl p-4 backdrop-blur-lg"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                    <Leaf size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Program Unggulan</div>
                    <div className="text-sm font-bold text-emerald-700">Hidroponik Modern</div>
                  </div>
                </div>
              </motion.div>

              {/* Top-left floating badge */}
              <motion.div
                className="absolute -top-2 -left-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg px-3 py-2"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 bg-school-accent/10 rounded-lg flex items-center justify-center">
                    <span className="text-school-accent text-xs font-bold">B</span>
                  </div>
                  <div className="text-xs font-semibold text-gray-700">Akreditasi B</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Down Indicator - using CSS animation for performance */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/70 flex flex-col items-center gap-2 cursor-pointer hover:text-white transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
        <a href="#tefa" aria-label="Scroll ke konten utama">
          <ArrowDown className="h-5 w-5 animate-bounce" />
        </a>
      </motion.div>
    </section>
  );
};

export default HeroSection;