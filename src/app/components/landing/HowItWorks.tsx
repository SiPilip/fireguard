'use client';

import { FaMobileAlt, FaMapMarkedAlt, FaTruck } from 'react-icons/fa';
import { motion } from 'framer-motion';

const steps = [
    {
        icon: <FaMobileAlt className="w-8 h-8" />,
        title: "1. Buka & Lapor",
        description: "Buka aplikasi FireGuard dan tekan tombol darurat merah yang tersedia di halaman utama.",
        color: "bg-red-500",
        lineColor: "from-red-500"
    },
    {
        icon: <FaMapMarkedAlt className="w-8 h-8" />,
        title: "2. Deteksi Lokasi",
        description: "Sistem otomatis mendeteksi lokasi presisi Anda dan mengirimkan data tersebut ke pos terdekat.",
        color: "bg-orange-500",
        lineColor: "from-orange-500"
    },
    {
        icon: <FaTruck className="w-8 h-8" />,
        title: "3. Bantuan Tiba",
        description: "Tim pemadam kebakaran segera meluncur ke lokasi Anda berdasarkan rute tercepat.",
        color: "bg-green-600",
        lineColor: "from-green-600"
    }
];

const HowItWorks = () => {
    return (
        <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-sm font-bold text-red-600 uppercase tracking-widest mb-2 block">Alur Pelaporan</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">Lapor Cepat dalam <span className="text-red-600">3 Langkah</span></h2>
                        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                            Kami menyederhanakan proses pelaporan agar Anda bisa mendapatkan bantuan secepat mungkin disaat genting.
                        </p>
                    </motion.div>
                </div>

                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Connector Line (Desktop Only) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-r from-red-500 via-orange-500 to-green-500 opacity-20"></div>
                    </div>

                    {steps.map((step, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3 }}
                            className="relative flex flex-col items-center text-center"
                        >
                            <div className={`w-24 h-24 ${step.color} rounded-3xl rotate-3 flex items-center justify-center text-white shadow-xl mb-8 z-10 transition-transform hover:rotate-6 duration-300`}>
                                <div className="-rotate-3">
                                    {step.icon}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                            <p className="text-gray-600 leading-relaxed max-w-xs">{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
