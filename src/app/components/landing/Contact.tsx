'use client';

import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-gray-50 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-bold text-red-600 uppercase tracking-widest mb-2 block">Kontak Darurat</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Butuh Bantuan Segera?</h2>
          <p className="text-gray-600 text-lg">Layanan tanggap darurat kami aktif 24/7 untuk warga Palembang.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Primary Emergency Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-3xl p-10 md:p-14 text-white shadow-2xl overflow-hidden relative"
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              <div>
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4 opacity-90">
                  <FaPhone className="w-5 h-5" />
                  <span className="font-semibold tracking-wide uppercase">Hotline Bebas Pulsa</span>
                </div>
                <h3 className="text-6xl md:text-8xl font-bold tracking-tighter mb-4 md:mb-2">113</h3>
                <p className="text-red-100 text-lg max-w-xl mx-auto md:mx-0">
                  Hubungi nomor ini segera jika Anda melihat kebakaran atau kejadian darurat lainnya. Tim kami siap meluncur.
                </p>
              </div>
              <a href="tel:113" className="bg-white text-red-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg flex items-center gap-2 group whitespace-nowrap">
                <FaPhone className="group-hover:rotate-12 transition-transform" />
                Panggil Sekarang
              </a>
            </div>

            {/* Decorative circle */}
            <div className="absolute -right-20 -bottom-40 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
          </motion.div>

          {/* Other Contacts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow flex flex-col md:flex-row items-center gap-6 text-center md:text-left"
          >
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
              <FaEnvelope className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">Email Resmi</h4>
              <p className="text-gray-600 font-medium">damkar@palembang.go.id</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow flex flex-col md:flex-row items-center gap-6 text-center md:text-left"
          >
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0">
              <FaMapMarkerAlt className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">Markas Pusat</h4>
              <p className="text-gray-600 font-medium">Jl. Merdeka No.1, Palembang, Sumatera Selatan</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;