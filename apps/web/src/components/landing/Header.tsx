'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 10);
  }, []);

  useEffect(() => {
    // Passive scroll listener for performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMenuOpen(false);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const navItems = [
    { name: 'Beranda', href: '#hero' },
    { 
      name: 'Tentang', 
      href: '#about',
      submenu: [
        { name: 'Profil Sekolah', href: '#about' },
        { name: 'Visi & Misi', href: '#info' },
      ]
    },
    { 
      name: 'TEFA', 
      href: '#tefa',
      submenu: [
        { name: 'Program TEFA', href: '#tefa' },
      ]
    },
    { name: 'Jurusan', href: '#jurusan' },
    { name: 'Mitra', href: '#mitra' },
    { name: 'Kontak', href: '#kontak' },
    { name: 'Pengembang', href: '/pengembang' },
  ];

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-400 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-black/5 py-2' 
          : 'bg-gradient-to-b from-black/20 to-transparent py-4'
      }`}
      role="banner"
    >
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group" aria-label="SMK Negeri 2 Batusangkar - Beranda">
            <div className="relative h-11 w-11 overflow-hidden">
              <div className={`rounded-xl h-11 w-11 flex items-center justify-center overflow-hidden transition-all duration-300 
                ${isScrolled ? 'bg-white shadow-sm' : 'bg-white/15 backdrop-blur-sm'}
                group-hover:shadow-lg group-hover:scale-105 group-hover:shadow-green-500/30`}>
                <Image src="/icon.webp" alt="SMK Negeri 2 Batusangkar" width={36} height={36} className="object-contain" />
              </div>
            </div>
            <div className={`font-bold text-base sm:text-lg transition-all duration-300 ${isScrolled ? 'text-school-primary' : 'text-white'}`}>
              <span className="hidden sm:inline">SMK Negeri 2 </span>
              <span className="sm:hidden">SMK 2 </span>
              <span className="text-school-accent">Batusangkar</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-0.5" aria-label="Navigasi utama">
            {navItems.map((item) => (
              <div 
                key={item.name} 
                className="relative group"
                onMouseEnter={() => item.submenu && setActiveMenu(item.name)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <Link 
                  href={item.href}
                  className={`px-3 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-1 text-sm ${
                    isScrolled 
                      ? 'text-gray-700 hover:text-school-primary hover:bg-school-primary/5' 
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => !item.submenu && setActiveMenu(null)}
                >
                  {item.name}
                  {item.submenu && (
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${activeMenu === item.name ? 'rotate-180' : ''}`} />
                  )}
                </Link>

                {/* Submenu */}
                {item.submenu && (
                  <AnimatePresence>
                    {activeMenu === item.name && (
                      <motion.div 
                        className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-xl shadow-black/10 overflow-hidden z-20 border border-gray-100"
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                      >
                        <div className="p-1.5">
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="block px-3.5 py-2.5 text-sm text-gray-600 hover:bg-school-primary/8 hover:text-school-primary rounded-lg transition-colors duration-150"
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                        <div className="h-0.5 bg-gradient-to-r from-school-primary to-school-accent" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}

            {/* Login Button */}
            <div className="ml-4">
              <Link 
                href="/login" 
                className="flex items-center gap-2 px-4 py-2 bg-school-accent hover:bg-school-accent/90 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-school-accent/20 text-sm font-medium"
                id="nav-login"
              >
                <User className="h-4 w-4" />
                <span>Masuk</span>
              </Link>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`lg:hidden p-2.5 rounded-lg transition-colors ${
              isScrolled ? 'text-gray-800 hover:bg-gray-100' : 'text-white hover:bg-white/10'
            }`}
            aria-label={isMenuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-white shadow-2xl z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-5">
                <div className="flex justify-between items-center mb-8">
                  <div className="font-bold text-school-primary">
                    SMK 2 <span className="text-school-accent">Batusangkar</span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Tutup menu"
                  >
                    <X className="h-5 w-5 text-gray-600" />
                  </button>
                </div>

                <nav className="flex flex-col space-y-1" aria-label="Navigasi mobile">
                  {navItems.map((item) => (
                    <div key={item.name}>
                      {item.submenu ? (
                        <>
                          <button
                            onClick={() => setActiveMenu(activeMenu === item.name ? null : item.name)}
                            className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                          >
                            <span>{item.name}</span>
                            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${activeMenu === item.name ? 'rotate-180' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {activeMenu === item.name && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="pl-4 mt-1 ml-3 border-l-2 border-school-primary/20"
                              >
                                {item.submenu.map((subItem) => (
                                  <Link
                                    key={subItem.name}
                                    href={subItem.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-3 py-2 text-sm text-gray-500 hover:text-school-primary transition-colors"
                                  >
                                    {subItem.name}
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-3 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                        >
                          {item.name}
                        </Link>
                      )}
                    </div>
                  ))}
                  
                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <Link 
                      href="/login" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-school-primary text-white rounded-lg hover:bg-school-primary/90 transition-colors text-sm font-medium"
                    >
                      <User className="h-4 w-4" />
                      <span>Masuk / Daftar</span>
                    </Link>
                  </div>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;