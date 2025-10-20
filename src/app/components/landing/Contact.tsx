'use client';

import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const ContactItem = ({ icon, title, text, index }: { icon: React.ReactNode; title: string; text: string; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      variants={itemVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      className="bg-white p-10 rounded-xl shadow-lg text-center"
    >
      <div className="text-6xl text-red-600 mx-auto mb-6">{icon}</div>
      <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
      <p className="text-xl text-gray-600 mt-2">{text}</p>
    </motion.div>
  );
};

const Contact = () => (
  <section id="contact" className="py-24 bg-white">
    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-bold text-gray-900">Kontak Darurat</h2>
        <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">Simpan dan gunakan nomor ini hanya dalam keadaan darurat.</p>
      </div>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <ContactItem icon={<FaPhone />} title="Hotline Damkar" text="113" index={0} />
        <ContactItem icon={<FaEnvelope />} title="Email" text="damkar@palembang.go.id" index={1} />
        <ContactItem icon={<FaMapMarkerAlt />} title="Alamat Pusat" text="Jl. Merdeka No.1, Palembang" index={2} />
      </div>
    </div>
  </section>
);

export default Contact;