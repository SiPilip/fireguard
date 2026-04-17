'use client';

import Link from 'next/link';
import { FaFire, FaFacebookF, FaTwitter, FaInstagram, FaGithub, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Footer = () => (
  <footer className="bg-[#050505] text-gray-400 pt-20 pb-12 relative overflow-hidden border-t border-white/5">
    {/* Abstract Background Elements */}
    <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-red-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
    <div className="absolute bottom-0 left-0 w-[20rem] h-[20rem] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

    <div className="max-w-7xl mx-auto px-6 relative z-10">
      
      {/* Top CTA Banner */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8 mb-16 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div>
           <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">Siap melindungi wilayah Anda?</h3>
           <p className="text-gray-500 font-light">Bergabunglah dengan ekosistem pelaporan kebakaran paling terpadu di Palembang.</p>
        </div>
        <Link href="#how-it-works" className="shrink-0 bg-white text-black px-6 py-3.5 rounded-full font-bold hover:bg-gray-100 transition-colors flex items-center gap-2 group">
          Pelajari Sistem Kami <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
        
        {/* Brand Section */}
        <div className="md:col-span-5 lg:col-span-4">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="p-2.5 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.3)] group-hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-shadow">
              <FaFire className="text-xl text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">FireGuard</span>
          </Link>
          <p className="text-sm text-gray-500 leading-relaxed xl:pr-10 mb-8 font-light">
            Platform modern untuk peringatan dini, pelaporan, dan navigasi armada Pemadam Kebakaran yang berpusat di Plaju, Palembang. Misi kami: meminimalkan risiko kerugian jiwa dan materi.
          </p>
          <div className="flex gap-4">
            <a href="https://facebook.com/damkarpalembang" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300">
              <FaFacebookF className="text-sm" />
            </a>
            <a href="https://twitter.com/damkarpalembang" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300">
              <FaTwitter className="text-sm" />
            </a>
            <a href="https://instagram.com/pemadam_palembang" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300">
              <FaInstagram className="text-sm" />
            </a>
            <a href="https://github.com" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-100 transition-all duration-300">
              <FaGithub className="text-sm" />
            </a>
          </div>
        </div>

        {/* Links Navigation */}
        <div className="md:col-span-3 lg:col-span-2 lg:col-start-7">
          <h4 className="text-white font-semibold mb-6 tracking-wide">Navigasi</h4>
          <ul className="space-y-4">
            <li><Link href="#how-it-works" className="text-sm text-gray-500 hover:text-white transition-colors">Cara Kerja</Link></li>
            <li><Link href="#features" className="text-sm text-gray-500 hover:text-white transition-colors">Fitur Unggulan</Link></li>
            <li><Link href="#stations" className="text-sm text-gray-500 hover:text-white transition-colors">Peta Pos Damkar</Link></li>
            <li><Link href="#faq" className="text-sm text-gray-500 hover:text-white transition-colors">Tanya Jawab</Link></li>
          </ul>
        </div>
        
        {/* Support & Legal */}
        <div className="md:col-span-4 lg:col-span-3">
          <h4 className="text-white font-semibold mb-6 tracking-wide">Bantuan & Legal</h4>
          <ul className="space-y-4">
            <li><Link href="#contact" className="text-sm text-gray-500 hover:text-white transition-colors">Kontak Darurat</Link></li>
            <li><Link href="/operator/login" className="text-sm text-gray-500 hover:text-red-400 transition-colors flex items-center gap-2">Portal Operator Terpadu</Link></li>
            <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Syarat & Ketentuan</a></li>
            <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Kebijakan Privasi</a></li>
          </ul>
        </div>

      </div>

      <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-600 font-light">
          &copy; {new Date().getFullYear()} FireGuard. Mengabdi untuk publik. Hak Cipta Dilindungi.
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-600 font-light">
           <span>Dibuat dengan</span> <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-red-500">❤️</motion.span> <span>di Palembang.</span>
        </div>
      </div>

    </div>
  </footer>
);

export default Footer;