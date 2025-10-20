"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaClock,
  FaEnvelope,
  FaFire,
  FaMapMarkerAlt,
  FaMobileAlt,
  FaPhone,
  FaRoute,
  FaUser,
  FaChevronDown,
  FaSignOutAlt,
} from "react-icons/fa";

// Komponen untuk Halaman Landing FireGuard

const Navbar = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ phone?: string; id?: number } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cek status login dengan memanggil API /auth/me
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const userData = await response.json();
          setIsLoggedIn(true);
          setUser(userData);
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch {
        setIsLoggedIn(false);
        setUser(null);
      }
    };
    checkAuth();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setIsLoggedIn(false);
    setUser(null);
    setDropdownOpen(false);
    router.push("/"); // Refresh halaman
  };

  return (
    <nav className="fixed top-0 w-full bg-white bg-opacity-90 backdrop-blur-md border-b border-gray-200 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-red-600"
        >
          <FaFire />
          <span>FireGuard</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-gray-600 hover:text-red-600">
            Fitur
          </Link>
          <Link href="#contact" className="text-gray-600 hover:text-red-600">
            Kontak
          </Link>
          <Link
            href="/operator/login"
            className="text-gray-600 hover:text-red-600"
          >
            Operator
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <>
              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-red-600 transition-colors"
                >
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white">
                    <FaUser size={14} />
                  </div>
                  <span>{user?.phone || "User"}</span>
                  <FaChevronDown
                    size={12}
                    className={`transition-transform ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        router.push("/dashboard");
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                    >
                      <FaUser size={14} />
                      <span>Dashboard</span>
                    </button>
                    <hr className="my-2 border-gray-200" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <FaSignOutAlt size={14} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="font-semibold text-gray-600 hover:text-red-600"
            >
              Login
            </button>
          )}
          <button
            onClick={() => router.push("/report/new")}
            className="bg-red-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-red-700 transition-colors"
          >
            Lapor Darurat
          </button>
        </div>
      </div>
    </nav>
  );
};

const HeroSection = () => {
  const router = useRouter();
  return (
    <section
      id="home"
      className="pt-24 pb-12 md:pt-32 md:pb-20 bg-gray-900 text-white"
    >
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
          Sistem Cepat Tanggap
          <span className="block bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-yellow-500">
            Kebakaran Palembang
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
          Teknologi LBS terdepan untuk respons darurat kebakaran yang cepat dan
          efisien di Kota Palembang.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.push("/report/new")}
            className="bg-red-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-red-700 transition-transform hover:scale-105"
          >
            Lapor Darurat
          </button>
          <Link
            href="#features"
            className="border-2 border-gray-500 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-700 transition-colors"
          >
            Pelajari Fitur
          </Link>
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="bg-white p-6 rounded-lg shadow-lg text-center transform hover:-translate-y-2 transition-transform">
    <div className="inline-block bg-red-100 text-red-600 p-4 rounded-full mb-4 text-3xl">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2 text-gray-800">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const FeaturesSection = () => (
  <section id="features" className="py-20 bg-gray-50">
    <div className="container mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
          Fitur Unggulan
        </h2>
        <p className="text-gray-600 mt-2">
          Teknologi canggih untuk keamanan maksimal Anda.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <FeatureCard
          icon={<FaMapMarkerAlt />}
          title="Lokasi Real-time"
          description="Deteksi lokasi otomatis menggunakan GPS untuk pelaporan yang akurat dan cepat."
        />
        <FeatureCard
          icon={<FaRoute />}
          title="Rute Tercepat"
          description="Algoritma cerdas untuk menentukan rute tercepat dari pos damkar terdekat ke lokasi Anda."
        />
        <FeatureCard
          icon={<FaClock />}
          title="Estimasi Waktu"
          description="Perhitungan ETA yang akurat untuk membantu koordinasi dan persiapan di lokasi."
        />
        <FeatureCard
          icon={<FaMobileAlt />}
          title="Akses Mudah"
          description="Dapat diakses dari berbagai perangkat, baik desktop maupun smartphone, tanpa perlu instalasi."
        />
      </div>
    </div>
  </section>
);

const ContactSection = () => (
  <section id="contact" className="py-20 bg-gray-800 text-white">
    <div className="container mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold">Kontak Darurat</h2>
        <p className="text-gray-400 mt-2">
          Simpan dan gunakan nomor ini hanya dalam keadaan darurat.
        </p>
      </div>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="bg-gray-700 p-6 rounded-lg">
          <FaPhone className="text-4xl text-red-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold">Hotline Damkar</h3>
          <p className="text-2xl font-mono text-yellow-400">113</p>
        </div>
        <div className="bg-gray-700 p-6 rounded-lg">
          <FaEnvelope className="text-4xl text-red-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold">Email</h3>
          <p className="text-lg text-yellow-400">damkar@palembang.go.id</p>
        </div>
        <div className="bg-gray-700 p-6 rounded-lg">
          <FaMapMarkerAlt className="text-4xl text-red-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold">Alamat Pusat</h3>
          <p className="text-lg text-gray-300">Jl. Merdeka No.1, Palembang</p>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-gray-900 text-gray-400 py-8">
    <div className="container mx-auto px-6 text-center">
      <p>
        &copy; {new Date().getFullYear()} FireGuard Palembang. Dikembangkan
        untuk keselamatan warga.
      </p>
    </div>
  </footer>
);

export default function LandingPage() {
  return (
    <div className="bg-white">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
