"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaArrowLeft,
  FaSpinner,
  FaSave,
  FaCheckCircle,
  FaExclamationCircle,
  FaCalendarAlt,
  FaShieldAlt,
} from "react-icons/fa";

interface User {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  is_verified: boolean;
  created_at: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/profile");
      if (!response.ok) {
        router.push("/login");
        return;
      }
      const userData = await response.json();
      setUser(userData);
      setName(userData.name || "");
      setPhoneNumber(userData.phone_number || "");
    } catch {
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone_number: phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menyimpan profil");
      }

      setSuccess("Profil berhasil diperbarui!");
      setUser(data.user);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4"></div>
        <p className="text-xs uppercase tracking-widest font-bold text-gray-500">Memuat Profil</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans selection:bg-red-500/30">
      <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40 px-6 md:px-8 flex items-center">
        <div className="max-w-3xl w-full mx-auto flex items-center justify-between">
            <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-wider rounded-xl hover:bg-gray-50"
            >
                <FaArrowLeft className="text-sm" /> <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 leading-none">Edit Profil.</h1>
            <div className="w-[88px] sm:w-[130px] invisible"></div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 md:py-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Identity Header */}
          <div className="bg-gray-900 p-8 md:p-10 relative overflow-hidden">
             <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-red-500/20 blur-[60px] rounded-full pointer-events-none"></div>
             <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
                <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-[2rem] flex items-center justify-center border border-white/10 shadow-xl shrink-0">
                    <FaUser className="text-white/80 text-4xl" />
                </div>
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-1">{user?.name}</h2>
                    <p className="text-white/60 text-sm font-medium tracking-wide mb-3">{user?.email}</p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-xl border border-white/5">
                        {user?.is_verified ? (
                            <><FaShieldAlt className="text-green-400 text-xs" /><span className="text-[10px] uppercase tracking-widest font-bold text-green-50">Terverifikasi</span></>
                        ) : (
                            <><FaExclamationCircle className="text-amber-400 text-xs" /><span className="text-[10px] uppercase tracking-widest font-bold text-amber-50">Belum Verifikasi</span></>
                        )}
                    </div>
                </div>
             </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6">
            
            {success && (
                <div className="flex items-center gap-3 px-5 py-4 bg-green-50 border border-green-100 rounded-2xl">
                    <FaCheckCircle className="text-green-500 shrink-0" />
                    <p className="text-sm font-bold text-green-700">{success}</p>
                </div>
            )}

            {error && (
                <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-100 rounded-2xl">
                    <FaExclamationCircle className="text-red-500 shrink-0" />
                    <p className="text-sm font-bold text-red-700">{error}</p>
                </div>
            )}

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-[11px] uppercase tracking-widest font-bold text-gray-400 mb-2">Nama Lengkap <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-2xl block p-4 pl-12 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:bg-white transition-all outline-none"
                            placeholder="Nama Sesuai Identitas"
                            required
                            minLength={2}
                            maxLength={100}
                        />
                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-[11px] uppercase tracking-widest font-bold text-gray-400 mb-2">Alamat Email (Permanen)</label>
                    <div className="relative opacity-60 grayscale cursor-not-allowed">
                        <input
                            type="email"
                            value={user?.email || ""}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-2xl block p-4 pl-12 pointer-events-none"
                            disabled
                            readOnly
                        />
                        <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-[11px] uppercase tracking-widest font-bold text-gray-400 mb-2">Nomor Telepon / WhatsApp</label>
                    <div className="relative">
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-2xl block p-4 pl-12 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:bg-white transition-all outline-none"
                            placeholder="08xxxxxxxxxx"
                        />
                        <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <p className="text-xs font-medium text-gray-500 mt-2 flex items-center gap-1.5"><FaShieldAlt className="text-gray-400" /> Informasi ini dijaga kerahasiaannya.</p>
                </div>
             </div>

            <div className="pt-6 mt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <FaCalendarAlt /> <span>Terdaftar {user?.created_at ? formatDate(user.created_at) : "-"}</span>
                </div>
                
                <button
                    type="submit"
                    disabled={isSaving}
                    className="flex shrink-0 items-center justify-center gap-2.5 bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all shadow-[0_8px_30px_rgba(0,0,0,0.1)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? <><FaSpinner className="animate-spin text-lg" /> Menyimpan</> : <><FaSave className="text-lg opacity-80" /> Simpan Profil</>}
                </button>
            </div>

          </form>
        </motion.div>
      </main>
    </div>
  );
}
