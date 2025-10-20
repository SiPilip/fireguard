'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

const Hero = () => {
  const router = useRouter();

  return (
    <section id="home" className="relative h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('/hero-background.jpg')" }}>
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-4">
          FireGuard Palembang
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8">
          Solusi cepat tanggap untuk setiap laporan kebakaran di kota Palembang. Keselamatan Anda adalah prioritas kami.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => router.push('/report/new')}
            className="bg-red-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-red-700 transition-transform hover:scale-105 shadow-lg"
          >
            Lapor Darurat
          </button>
          <Link
            href="#features"
            className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-white hover:text-gray-900 transition-colors"
          >
            Pelajari Fitur
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;