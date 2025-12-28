'use client';

import { FaMapMarkerAlt, FaRoute, FaClock, FaMobileAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <FaMapMarkerAlt className="w-6 h-6" />,
    title: "Lokasi Real-time",
    description: "Deteksi lokasi otomatis menggunakan GPS untuk pelaporan yang akurat dan cepat.",
    color: "text-red-500",
    bg: "bg-red-50"
  },
  {
    icon: <FaRoute className="w-6 h-6" />,
    title: "Rute Tercepat",
    description: "Algoritma cerdas untuk menentukan rute tercepat dari pos damkar terdekat ke lokasi Anda.",
    color: "text-orange-500",
    bg: "bg-orange-50"
  },
  {
    icon: <FaClock className="w-6 h-6" />,
    title: "Estimasi Waktu",
    description: "Perhitungan ETA yang akurat untuk membantu koordinasi dan persiapan di lokasi.",
    color: "text-blue-500",
    bg: "bg-blue-50"
  },
  {
    icon: <FaMobileAlt className="w-6 h-6" />,
    title: "Akses Mudah",
    description: "Dapat diakses dari berbagai perangkat, baik desktop maupun smartphone, tanpa perlu instalasi.",
    color: "text-green-500",
    bg: "bg-green-50"
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-50 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-16 md:mb-24">
          <div
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-[2px] bg-red-600"></span>
                <span className="text-sm font-bold text-red-600 uppercase tracking-widest">Fitur Unggulan</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Teknologi Canggih untuk <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">Keamanan Maksimal</span>
              </h2>
            </div>
            <p className="text-gray-600 max-w-md text-lg leading-relaxed mb-2">
              Sistem terintegrasi yang dirancang untuk memberikan respons tercepat dalam situasi darurat.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="group relative bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-14 h-14 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section >
  );
};

export default Features;