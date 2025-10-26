'use client';

import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const ContactItem = ({ icon, title, text, index }: { icon: React.ReactNode; title: string; text: string; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      variants={itemVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      className="bg-white p-8 rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all text-center group"
    >
      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center text-white mx-auto mb-5 group-hover:scale-110 transition-transform">
        <div className="text-2xl">{icon}</div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-base text-gray-600 font-medium">{text}</p>
    </motion.div>
  );
};

const Contact = () => (
  <section id="contact" className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full mb-4">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">Kontak Darurat</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Hubungi Kami</h2>
        <p className="text-base text-gray-600 max-w-2xl mx-auto">Simpan dan gunakan nomor ini hanya dalam keadaan darurat</p>
      </div>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <ContactItem icon={<FaPhone />} title="Hotline Damkar" text="113" index={0} />
        <ContactItem icon={<FaEnvelope />} title="Email" text="damkar@palembang.go.id" index={1} />
        <ContactItem icon={<FaMapMarkerAlt />} title="Alamat Pusat" text="Jl. Merdeka No.1, Palembang" index={2} />
      </div>
    </div>
  </section>
);

export default Contact;