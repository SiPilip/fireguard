'use client';

import { FaMapMarkerAlt, FaRoute, FaClock, FaMobileAlt } from 'react-icons/fa';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const FeatureCard = ({ icon, title, description, index }: { icon: React.ReactNode; title: string; description: string; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      className="bg-white p-6 rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300 group"
    >
      <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform">
        <div className="text-2xl">{icon}</div>
      </div>
      <h3 className="text-lg font-semibold mb-3 text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  );
};

const Features = () => (
  <section id="features" className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full mb-4">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">Fitur Unggulan</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Teknologi Canggih</h2>
        <p className="text-base text-gray-600 max-w-2xl mx-auto">Sistem terintegrasi untuk keamanan dan respons cepat maksimal</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FeatureCard icon={<FaMapMarkerAlt />} title="Lokasi Real-time" description="Deteksi lokasi otomatis menggunakan GPS untuk pelaporan yang akurat dan cepat." index={0} />
        <FeatureCard icon={<FaRoute />} title="Rute Tercepat" description="Algoritma cerdas untuk menentukan rute tercepat dari pos damkar terdekat ke lokasi Anda." index={1} />
        <FeatureCard icon={<FaClock />} title="Estimasi Waktu" description="Perhitungan ETA yang akurat untuk membantu koordinasi dan persiapan di lokasi." index={2} />
        <FeatureCard icon={<FaMobileAlt />} title="Akses Mudah" description="Dapat diakses dari berbagai perangkat, baik desktop maupun smartphone, tanpa perlu instalasi." index={3} />
      </div>
    </div>
  </section>
);

export default Features;