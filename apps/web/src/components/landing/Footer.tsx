"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Instagram,
  Facebook,
  Twitter,
  MessageCircle,
  Send,
  ArrowUp,
} from "lucide-react";

const Footer = () => {
  const [feedback, setFeedback] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Track scroll position to show/hide the button
  useEffect(() => {
    const handleScroll = () => {
      // Get footer element's position
      const footer = document.getElementById('kontak');
      if (footer) {
        const footerPosition = footer.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        // Show button when footer is in view
        if (footerPosition < windowHeight) {
          setShowScrollTop(true);
        } else {
          setShowScrollTop(false);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFeedback(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFeedback({ name: "", email: "", message: "" });
      
      // Reset submission message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    }, 1000);
  };
  
  // Function to scroll back to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
  
  return (
    <footer
      id="kontak"
      className="relative bg-gradient-to-b from-emerald-900 to-emerald-950 text-white overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSI1MHB4IiB2aWV3Qm94PSIwIDAgMTI4MCAxNDAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iI2ZmZmZmZiI+PHBhdGggZD0iTTAgNTEuNzZjMzYuMjEtMi4yNSA3Ny41Ny0zLjU4IDEyNi40Mi0zLjU4IDMyMCAwIDMyMCA1NyA2NDAgNTcgMjcxLjE1IDAgMzEyLjU4LTQwLjkxIDUxMy41OC01My40VjBIMFoiIGZpbGwtb3BhY2l0eT0iLjMiLz48cGF0aCBkPSJNMCAyNC4zMWM0My40Ni01LjY5IDk0LjU2LTkuMjUgMTU4LjQyLTkuMjUgMzIwIDAgMzIwIDg5LjI0IDY0MCA4OS4yNCAyNTYuMTMgMCAzMDcuMjgtNTcuMTYgNDgxLjU4LTgwVjBIMFoiIGZpbGwtb3BhY2l0eT0iLjUiLz48cGF0aCBkPSJNMCAwdjMuNEMyOC4yIDEuNiA1OS40LjU5IDk0LjQyLjU5YzMyMCAwIDMyMCA4NC4zIDY0MCA4NC4zIDI4NSAwIDMxNi4xNy02Ni44NSA1NDUuNTgtODEuNDlWMFoiLz48L2c+PC9zdmc+')]"></div>

      <div className="container mx-auto py-20 relative">
        {/* Scroll to top button */}
        <button
          onClick={scrollToTop}
          className={`fixed right-6 bottom-6 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-full p-3 shadow-lg z-50 transition-all duration-300 transform group ${
            showScrollTop 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10 pointer-events-none'
          }`}
          aria-label="Scroll ke atas"
        >
          <ArrowUp className="h-5 w-5 group-hover:-translate-y-1 transition-transform duration-300" />
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* School Info */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                SMK 2 NEGERI <span className="text-green-300">BATUSANGKAR</span>
              </h2>
              <p className="text-emerald-100/80 text-sm">
                Pusat Unggulan Teaching Factory
              </p>
            </div>

            <p className="text-emerald-100/70 mb-6 leading-relaxed">
              Mengembangkan keterampilan dan karakter siswa melalui pembelajaran
              inovatif dan praktik kerja industri dalam bidang perkebunan dan
              pertanian modern.
            </p>

            <div className="flex space-x-4">
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

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white border-b border-emerald-700 pb-2">
              Hubungi Kami Disini
            </h3>
            <ul className="space-y-4">
              <li className="flex">
                <MapPin className="h-5 w-5 mr-3 text-emerald-300 flex-shrink-0 mt-1" />
                <span className="text-emerald-100/80 text-sm">
                  JL. Raya Bukit Gombak - Batusangkar, Bukit Gombak, Lima Kaum, Baringin, Kec. Lima Kaum, Kabupaten Tanah Datar, Sumatera Barat 27211
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-emerald-300 flex-shrink-0" />
                <span className="text-emerald-100/80 text-sm">
                  +6282269696489
                </span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-emerald-300 flex-shrink-0" />
                <span className="text-emerald-100/80 text-sm">
                  smkpkbatusangkar@gmail.com
                </span>
              </li>
              {/* <li className="flex items-center">
                <Clock className="h-5 w-5 mr-3 text-emerald-300 flex-shrink-0" />
                <span className="text-emerald-100/80 text-sm">
                  Senin - Jumat: 07.00 - 16.00 WIB
                </span>
              </li> */}
            </ul>
          </div>

          {/* Contact Form */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white border-b border-emerald-700 pb-2 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-emerald-300" />
              Hubungi Kami
            </h3>
            
            {isSubmitted ? (
              <div className="bg-emerald-800/50 rounded-lg p-4 border border-emerald-600/30">
                <p className="text-emerald-100 text-sm mb-2 font-medium">Terima kasih! Pesan Anda telah terkirim.</p>
                <p className="text-emerald-100/70 text-xs">Tim kami akan menghubungi Anda segera.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label htmlFor="name" className="sr-only">Nama</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={feedback.name}
                    onChange={handleChange}
                    placeholder="Nama Anda"
                    required
                    className="w-full bg-emerald-800/40 border border-emerald-700/50 rounded-md py-2 px-3 text-sm text-emerald-100 placeholder:text-emerald-100/50 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/60 focus:outline-none transition-colors"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="sr-only">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={feedback.email}
                    onChange={handleChange}
                    placeholder="Email Anda"
                    required
                    className="w-full bg-emerald-800/40 border border-emerald-700/50 rounded-md py-2 px-3 text-sm text-emerald-100 placeholder:text-emerald-100/50 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/60 focus:outline-none transition-colors"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="sr-only">Pesan</label>
                  <textarea
                    id="message"
                    name="message"
                    value={feedback.message}
                    onChange={handleChange}
                    placeholder="Pesan atau pertanyaan Anda"
                    required
                    rows={4}
                    className="w-full bg-emerald-800/40 border border-emerald-700/50 rounded-md py-2 px-3 text-sm text-emerald-100 placeholder:text-emerald-100/50 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/60 focus:outline-none transition-colors resize-none"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-md py-2 px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-1 focus:ring-offset-emerald-900 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Kirim Pesan</span>
                    </>
                  )}
                </button>
                
                <p className="text-emerald-100/50 text-xs mt-2">
                  Kami akan merespons pesan Anda secepatnya.
                </p>
              </form>
            )}
          </div>

          {/* SEO & Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white border-b border-emerald-700 pb-2">
              Informasi Publik
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className="text-emerald-100/80 hover:text-emerald-200 hover:underline transition-colors">
                  Tentang Sekolah
                </Link>
              </li>
              <li>
                <Link href="/pengembang" className="text-emerald-100/80 hover:text-emerald-200 hover:underline transition-colors">
                  Tim Pengembang
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-emerald-100/80 hover:text-emerald-200 hover:underline transition-colors">
                  Kebijakan Privasi (Privacy Policy)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-emerald-100/80 hover:text-emerald-200 hover:underline transition-colors">
                  Syarat & Ketentuan (Terms of Service)
                </Link>
              </li>
              <li>
                <Link href="/komoditas" className="text-emerald-100/80 hover:text-emerald-200 hover:underline transition-colors">
                  Halaman Komoditas
                </Link>
              </li>
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-emerald-100/60">
              Halaman-halaman ini membantu mesin pencari memahami struktur situs dan meningkatkan kepercayaan pengguna.
            </p>
          </div>

        </div>
        
        {/* Map - Full Width Section */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold mb-6 text-white border-b border-emerald-700 pb-2">
            Lokasi Kami
          </h3>
          <div className="rounded-xl overflow-hidden shadow-lg border-4 border-emerald-800">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.676497440849!2d100.61441197546286!3d-0.4830983352767305!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2fd52d6b77228df5%3A0x6263278a4a3e3948!2sSMK%20Negeri%202%20Batusangkar!5e0!3m2!1sid!2sid!4v1753455068924!5m2!1sid!2sid"
              width="100%"
              height="300"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="SMK NEGERI 2 Batusangkar Location - Bukit Gombak"
            />
          </div>
          <p className="mt-3 text-emerald-100/60 text-sm">
            Kunjungi sekolah kami untuk informasi lebih lanjut dan pendaftaran.
          </p>
        </div>

        <div className="border-t border-emerald-800/80 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-emerald-100/70 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} Developed by{" "}
            <span className="group relative cursor-pointer text-emerald-300 font-medium hover:underline">
              Team Pengabdian PNP
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gradient-to-br from-emerald-700 to-emerald-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 shadow-lg transition-all duration-300 scale-95 group-hover:scale-100 pointer-events-none z-10 border border-emerald-600/50">
                <span className="block text-center font-bold text-emerald-300 mb-2 border-b border-emerald-600/30 pb-1">
                  Tim Pengembang
                </span>
                Defni, S.Si., M.Kom.
                <br />
                Ainil Mardiah, S.Kom., M.Cs
                <br />
                Anla Harpanda
                <br />
                Furqon august seventeen
                <br />
                Firman Ardiyansyah
                <br />
                Redho Septa Yudien
                <br />
                Baghaztra Van Ril
                <br />
                Pito Desri Pauzi
                <br />
                Azmi Ali
                <span className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-emerald-800"></span>
              </span>
            </span>
          </p>
          <div className="flex items-center gap-4 text-xs text-emerald-100/70">
            <Link href="/privacy" className="hover:text-emerald-200 hover:underline transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-emerald-200 hover:underline transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
