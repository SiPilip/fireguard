'use client';

import { FaMapMarkerAlt, FaRoute, FaClock, FaMobileAlt } from 'react-icons/fa';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const FeatureCard = ({ icon, title, description, index }: { icon: React.ReactNode; title: string; description: string; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <div className="text-red-600 mb-6 text-6xl">{icon}</div>
      <h3 className="text-2xl font-bold mb-4 text-gray-900">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  );
};

const Features = () => (
  <section id="features" className="py-24 bg-gray-50">
    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-bold text-gray-900">Fitur Unggulan</h2>
        <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">Teknologi canggih untuk keamanan maksimal Anda.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <FeatureCard icon={<FaMapMarkerAlt />} title="Lokasi Real-time" description="Deteksi lokasi otomatis menggunakan GPS untuk pelaporan yang akurat dan cepat." index={0} />
        <FeatureCard icon={<FaRoute />} title="Rute Tercepat" description="Algoritma cerdas untuk menentukan rute tercepat dari pos damkar terdekat ke lokasi Anda." index={1} />
        <FeatureCard icon={<FaClock />} title="Estimasi Waktu" description="Perhitungan ETA yang akurat untuk membantu koordinasi dan persiapan di lokasi." index={2} />
        <FeatureCard icon={<FaMobileAlt />} title="Akses Mudah" description="Dapat diakses dari berbagai perangkat, baik desktop maupun smartphone, tanpa perlu instalasi." index={3} />
      </div>
    </div>
  </section>
);

export default Features;