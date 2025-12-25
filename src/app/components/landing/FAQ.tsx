'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaMinus } from 'react-icons/fa';

const faqs = [
    {
        question: "Apakah layanan FireGuard ini gratis?",
        answer: "Ya, layanan FireGuard sepenuhnya GRATIS 100% untuk seluruh masyarakat Palembang. Pelayanan pemadam kebakaran adalah hak publik yang ditanggung oleh pemerintah kota."
    },
    {
        question: "Apakah bisa melapor tanpa koneksi internet?",
        answer: "Aplikasi FireGuard membutuhkan koneksi internet untuk mengirimkan titik lokasi GPS yang akurat dan foto kejadian. Namun jika Anda sedang offline, tekan tombol 'Hubungi 113' di aplikasi untuk panggilan seluler biasa."
    },
    {
        question: "Wilayah mana saja yang dicakup layanan ini?",
        answer: "Saat ini FireGuard berfokus melayani seluruh wilayah administratif Kota Palembang. Laporan di luar wilayah ini akan diarahkan ke unit pemadam kebakaran kabupaten/kota tetangga yang relevan."
    },
    {
        question: "Apakah identitas pelapor dirahasiakan?",
        answer: "Identitas Anda aman bersama kami. Kami hanya menggunakan data Anda untuk verifikasi keaslian laporan guna menghindari laporan palsu (prank) yang dapat merugikan."
    }
];

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <section id="faq" className="py-24 bg-gray-50">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="text-sm font-bold text-red-600 uppercase tracking-widest mb-2 block">Pertanyaan Umum</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Sering Ditanyakan</h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300"
                        >
                            <button
                                onClick={() => toggleAccordion(idx)}
                                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`text-lg font-semibold ${activeIndex === idx ? 'text-red-600' : 'text-gray-900'} transition-colors`}>
                                        {faq.question}
                                    </span>
                                </div>
                                <div className={`p-2 rounded-full ${activeIndex === idx ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}`}>
                                    {activeIndex === idx ? <FaMinus size={14} /> : <FaPlus size={14} />}
                                </div>
                            </button>

                            <AnimatePresence>
                                {activeIndex === idx && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="px-6 pb-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-50 mt-2">
                                            <div className="pt-4">{faq.answer}</div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
