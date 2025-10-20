'use client';

import Link from 'next/link';
import { FaFire, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => (
  <footer className="bg-gray-900 text-white pt-16 pb-8">
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-1">
          <Link href="/" className="flex items-center gap-3 text-2xl font-bold">
            <FaFire />
            <span>FireGuard</span>
          </Link>
          <p className="mt-4 text-gray-400 text-lg">Sistem Cepat Tanggap Kebakaran Palembang.</p>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-6">Tautan Cepat</h3>
          <ul className="space-y-3">
            <li><Link href="#features" className="text-gray-400 hover:text-white transition-colors">Fitur</Link></li>
            <li><Link href="#contact" className="text-gray-400 hover:text-white transition-colors">Kontak</Link></li>
            <li><Link href="/operator/login" className="text-gray-400 hover:text-white transition-colors">Portal Operator</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-6">Hubungi Kami</h3>
          <ul className="space-y-3 text-gray-400">
            <li>Jl. Merdeka No.1, Palembang</li>
            <li>damkar@palembang.go.id</li>
            <li>Hotline: 113</li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-6">Media Sosial</h3>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-3xl"><FaFacebook /></a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-3xl"><FaTwitter /></a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-3xl"><FaInstagram /></a>
          </div>
        </div>
      </div>
      <div className="mt-16 border-t border-gray-800 pt-8 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} FireGuard Palembang. Hak Cipta Dilindungi.</p>
      </div>
    </div>
  </footer>
);

export default Footer;