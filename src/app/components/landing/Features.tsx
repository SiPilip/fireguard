'use client';

import { FaMapMarkerAlt, FaRoute, FaClock, FaMobileAlt } from 'react-icons/fa';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { MouseEvent } from 'react';

const features = [
  {
    icon: <FaMapMarkerAlt className="w-6 h-6 text-red-500" />,
    title: "Lokasi Real-time",
    description: "Deteksi lokasi otomatis menggunakan GPS presisi tinggi untuk pelaporan yang akurat, langsung dari titik kejadian tanpa perlu mengetik alamat manual.",
    glowColor: "rgba(239, 68, 68, 0.15)",
    iconBg: "bg-red-500/10",
    iconBorder: "border-red-500/20",
    colSpan: "md:col-span-2 lg:col-span-2"
  },
  {
    icon: <FaRoute className="w-6 h-6 text-orange-500" />,
    title: "Rute Cerdas",
    description: "Algoritma routing dinamis yang menghindari kemacetan, menuntun armada langsung ke lokasi Anda melalui akses tercepat.",
    glowColor: "rgba(249, 115, 22, 0.15)",
    iconBg: "bg-orange-500/10",
    iconBorder: "border-orange-500/20",
    colSpan: "md:col-span-1 lg:col-span-2"
  },
  {
    icon: <FaClock className="w-6 h-6 text-blue-500" />,
    title: "Estimasi Presisi",
    description: "Kalkulasi Waktu Tiba (ETA) real-time berdasar lalu lintas, memberikan ketenangan sementara Anda menunggu bantuan datang.",
    glowColor: "rgba(59, 130, 246, 0.15)",
    iconBg: "bg-blue-500/10",
    iconBorder: "border-blue-500/20",
    colSpan: "md:col-span-1 lg:col-span-2"
  },
  {
    icon: <FaMobileAlt className="w-6 h-6 text-emerald-500" />,
    title: "Aplikasi Mobile",
    description: "Nikmati pengalaman penuh dengan aplikasi native di Play Store & App Store. Lebih stabil, lebih cepat, dan dilengkapi push notification untuk info darurat.",
    glowColor: "rgba(16, 185, 129, 0.15)",
    iconBg: "bg-emerald-500/10",
    iconBorder: "border-emerald-500/20",
    colSpan: "md:col-span-2 lg:col-span-2"
  }
];

const FeatureCard = ({ feature, idx }: { feature: typeof features[0], idx: number }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px" }}
      transition={{ 
        duration: 0.5 
      }}
      onMouseMove={handleMouseMove}
      className={`${feature.colSpan} group relative rounded-[2.5rem] bg-[#0A0A0A] border border-white/5 p-8 lg:p-12 overflow-hidden transition-all duration-500`}
    >
      {/* Spotlight Effect Overlay */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition duration-300 z-10"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              ${feature.glowColor},
              transparent 80%
            )
          `,
        }}
      />

      {/* Subtle Grain/Noise Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      {/* Inner Glow/Glass reflection accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      
      <div className="relative z-20 flex flex-col h-full">
        <div className={`w-16 h-16 rounded-2xl ${feature.iconBg} border ${feature.iconBorder} flex items-center justify-center mb-8 transition-all duration-700 group-hover:scale-110 group-hover:rotate-3 shadow-[0_0_20px_rgba(0,0,0,0.5)]`}>
          {feature.icon}
        </div>
        
        <h3 className="text-3xl font-bold text-white mb-5 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-white/60 transition-all duration-500">
          {feature.title}
        </h3>
        
        <p className="text-gray-400 text-lg leading-relaxed font-normal mt-auto opacity-70 group-hover:opacity-100 transition-opacity duration-500">
          {feature.description}
        </p>
      </div>

      {/* Premium Border Aura */}
      <div className="absolute inset-0 border border-white/5 rounded-[2.5rem] group-hover:border-white/20 transition-colors duration-500 pointer-events-none" />
    </motion.div>
  );
};

const Features = () => {
  return (
    <section id="features" className="py-24 lg:py-40 bg-[#050505] relative overflow-hidden">
      {/* Dynamic Background elements */}
      <div className="absolute top-0 left-1/4 w-[50rem] h-[50rem] bg-red-600/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[40rem] h-[40rem] bg-orange-600/5 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Fine grid pattern for premium feel */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none" />

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
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 max-w-md text-lg md:text-xl leading-relaxed font-light"
          >
            Sistem terintegrasi kami dirancang untuk memotong birokrasi, memberikan respons ultra-cepat langsung dari sentuhan jari Anda.
          </motion.p>
        </div>

        {/* Bento Grid Layout with refined spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} feature={feature} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;