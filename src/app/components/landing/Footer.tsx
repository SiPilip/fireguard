'use client';

import Link from 'next/link';
import { FaFire, FaFacebook, FaTwitter, FaInstagram, FaGithub } from 'react-icons/fa';

const Footer = () => (
  <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-1">
          <Link href="/" className="flex items-center gap-2.5 mb-4">
            <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl">
              <FaFire className="text-white text-lg" />
            </div>
            <span className="text-xl font-semibold">FireGuard</span>
          </Link>
          <p className="text-sm text-gray-400 leading-relaxed">Sistem Cepat Tanggap Kebakaran Palembang untuk keamanan maksimal.</p>
        </div>
        <div>
          <h3 className="text-base font-semibold mb-4">Tautan Cepat</h3>
          <ul className="space-y-2.5">
            <li><Link href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Fitur</Link></li>
            <li><Link href="#contact" className="text-sm text-gray-400 hover:text-white transition-colors">Kontak</Link></li>
            <li><Link href="/operator/login" className="text-sm text-gray-400 hover:text-white transition-colors">Portal Operator</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-base font-semibold mb-4">Hubungi Kami</h3>
          <ul className="space-y-2.5 text-sm text-gray-400">
            <li>Jl. Merdeka No.1, Palembang</li>
            <li>damkar@palembang.go.id</li>
            <li>Hotline: 113</li>
          </ul>
        </div>
        <div>
          <h3 className="text-base font-semibold mb-4">Media Sosial</h3>
          <div className="flex gap-3">
            <a href="https://www.facebook.com/damkarpalembang" className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-br hover:from-red-500 hover:to-orange-600 rounded-xl flex items-center justify-center transition-all"><FaFacebook className="text-lg" /></a>
            <a href="https://twitter.com/damkarpalembang" className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-br hover:from-red-500 hover:to-orange-600 rounded-xl flex items-center justify-center transition-all"><FaGithub className="text-lg" /></a>
            <a href="https://www.instagram.com/pemadam_palembang" className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-br hover:from-red-500 hover:to-orange-600 rounded-xl flex items-center justify-center transition-all"><FaInstagram className="text-lg" /></a>
          </div>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-gray-800 text-center">
        <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} FireGuard Palembang. Hak Cipta Dilindungi.</p>
      </div>
    </div>
  </footer>
);

export default Footer;