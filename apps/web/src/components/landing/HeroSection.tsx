'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownCircle, Leaf, Sprout, Droplet } from 'lucide-react';

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video with Overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/80 via-emerald-900/60 to-emerald-800/70 z-10"></div>
        <video 
          autoPlay 
          muted 
          loop 
          className="object-cover w-full h-full"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-farm-field-close-up-shot-from-above-42668-large.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Animated Shapes */}
      <div className="absolute inset-0 z-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-20"
            initial={{
              x: Math.random() * 100 - 50,
              y: Math.random() * 100 - 50,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              x: Math.random() * 100 - 50,
              y: Math.random() * 100 - 50,
              scale: Math.random() * 0.5 + 0.5,
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            {i % 3 === 0 ? <Leaf size={40} className="text-green-400" /> : 
             i % 3 === 1 ? <Sprout size={40} className="text-green-300" /> : 
             <Droplet size={40} className="text-blue-300" />}
          </motion.div>
        ))}
      </div>

      {/* Hero Content */}
      <div className="container mx-auto px-4 relative z-20 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="text-left">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block mb-4 bg-emerald-600/70 rounded-full px-4 py-1 text-sm backdrop-blur-sm"
            >
              Pusat Keunggulan Pendidikan
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -30 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              SMK NEGERI 2 <span className="text-green-400">BATUSANGKAR</span>
            </motion.h1>
            
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-xl md:text-2xl font-medium mb-6 text-green-100"
            >
              Pusat Unggulan Teaching Factory (TEFA)
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -10 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="text-lg max-w-xl mb-8 text-gray-100"
            >
              Mengembangkan inovasi pembelajaran berbasis teaching factory dengan fokus
              pada budidaya melon hidroponik, peternakan ayam, dan tanaman sayuran hidroponik.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <a 
                href="#tefa" 
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 flex items-center space-x-2"
              >
                <Sprout size={18} />
                <span>Program TEFA</span>
              </a>
              <a 
                href="#about" 
                className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-medium py-3 px-8 rounded-full backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
              >
                Tentang Kami
              </a>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 50 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400/20 to-emerald-600/20 backdrop-blur-md"></div>
              <div className="absolute inset-4 rounded-full overflow-hidden border-4 border-white/10">
                <img 
                  src="/image/fotosama.webp" 
                  alt="SMK NEGERI 2 Batusangkar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-xl p-4 backdrop-blur-lg">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Leaf size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 font-medium">Program Unggulan</div>
                    <div className="text-sm font-bold text-emerald-700">Hidroponik Modern</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <a href="#info" aria-label="Scroll down">
          <ArrowDownCircle className="h-10 w-10" />
        </a>
      </div>
    </section>
  );
};

export default HeroSection;