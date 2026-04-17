'use client';

import { FaMapMarkerAlt, FaRoute, FaClock, FaMobileAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <FaMapMarkerAlt className="w-6 h-6 text-red-500" />,
    title: "Lokasi Real-time",
    description: "Deteksi lokasi otomatis menggunakan GPS presisi tinggi untuk pelaporan yang akurat, langsung dari titik kejadian tanpa perlu mengetik alamat manual.",
    glowColor: "group-hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]",
    iconBg: "bg-red-500/10",
    iconBorder: "border-red-500/20",
    colSpan: "md:col-span-2 lg:col-span-2"
  },
  {
    icon: <FaRoute className="w-6 h-6 text-orange-500" />,
    title: "Rute Cerdas",
    description: "Algoritma routing dinamis yang menghindari kemacetan, menuntun armada langsung ke lokasi Anda melalui akses tercepat.",
    glowColor: "group-hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]",
    iconBg: "bg-orange-500/10",
    iconBorder: "border-orange-500/20",
    colSpan: "md:col-span-1 lg:col-span-2"
  },
  {
    icon: <FaClock className="w-6 h-6 text-blue-500" />,
    title: "Estimasi Presisi",
    description: "Kalkulasi Waktu Tiba (ETA) real-time berdasar lalu lintas, memberikan ketenangan sementara Anda menunggu bantuan datang.",
    glowColor: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]",
    iconBg: "bg-blue-500/10",
    iconBorder: "border-blue-500/20",
    colSpan: "md:col-span-1 lg:col-span-2"
  },
  {
    icon: <FaMobileAlt className="w-6 h-6 text-emerald-500" />,
    title: "Akses Universal",
    description: "Sistem PWA (Progressive Web App) yang ringan dan instan, dapat diakses dari perangkat apapun tanpa perlu mengunduh aplikasi besar.",
    glowColor: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]",
    iconBg: "bg-emerald-500/10",
    iconBorder: "border-emerald-500/20",
    colSpan: "md:col-span-2 lg:col-span-2"
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 lg:py-32 bg-[#050505] relative overflow-hidden border-y border-white/5">
      {/* Dark Mode Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-red-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-orange-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
              <span className="text-xs font-bold text-gray-300 tracking-widest uppercase">Fitur Unggulan</span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-extrabold text-white leading-[1.1] tracking-tight"
            >
              Teknologi Canggih <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
                Keamanan Maksimal.
              </span>
            </motion.h2>
          </div>
          
          <motion.p 
            initial={{ opacity: 0, opacity: 0 }}
            whileInView={{ opacity: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 max-w-md text-lg md:text-xl leading-relaxed font-light"
          >
            Sistem terintegrasi kami dirancang untuk memotong birokrasi, memberikan respons ultra-cepat langsung dari sentuhan jari Anda.
          </motion.p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(0,1fr)]">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`${feature.colSpan} group relative rounded-[2rem] bg-[#0A0A0A] border border-white/5 p-8 lg:p-10 overflow-hidden transition-all duration-500 hover:bg-[#111111] hover:border-white/10 ${feature.glowColor}`}
            >
              {/* Subtle glass reflection effect inside card */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-[linear-gradient(110deg,rgba(255,255,255,0.03)_0%,transparent_50%_,rgba(255,255,255,0)_100%)]" />

              <div className="relative z-10 flex flex-col h-full">
                <div className={`w-16 h-16 rounded-2xl ${feature.iconBg} border ${feature.iconBorder} flex items-center justify-center mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4 tracking-wide group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-gray-400 leading-relaxed font-light mt-auto">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;