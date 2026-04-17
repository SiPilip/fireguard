"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaFire, FaSpinner, FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { isStandaloneApp } from "@/lib/app-mode";
import { hasCompletedOnboarding } from "@/lib/onboarding";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifySession = async () => {
      if (isStandaloneApp() && !hasCompletedOnboarding()) {
        router.replace("/onboarding");
        return;
      }

      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          router.replace(
            data.isOperator ? "/operator/dashboard" : "/dashboard",
          );
          return;
        }
      } catch {
      } finally {
        setIsVerifying(false);
      }
    };

    verifySession();
  }, [router]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/dashboard");
        return;
      }

      throw new Error(data.message || "Login gagal.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          <FaFire className="text-4xl text-red-500" />
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex bg-white text-gray-900 font-sans selection:bg-red-500/30">
      {/* Left: Form Area */}
      <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col px-8 sm:px-16 md:px-20 py-12 relative z-10 justify-center">
        <Link href="/" className="absolute top-8 left-8 sm:left-16 md:left-20 flex items-center gap-3 text-gray-400 hover:text-gray-900 transition-colors">
          <FaArrowLeft className="text-sm" /> 
        </Link>
        
        <Link href="/" className="inline-flex items-center gap-3 mb-16 group w-fit mt-10 md:mt-0">
          <div className="p-2.5 bg-red-500 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.4)] group-hover:scale-105 transition-transform">
            <FaFire className="text-xl text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">FireGuard</span>
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter mb-4 text-gray-900">
            Selamat Datang.
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed font-light">
            Masuk untuk mengakses portal darurat dan manajemen laporan kebakaran Anda.
          </p>
        </div>

        <form onSubmit={handlePasswordLogin} className="space-y-6">
          <div className="space-y-1 group">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest pl-1 group-focus-within:text-red-500 transition-colors">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 px-5 py-4 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium placeholder:text-gray-300 placeholder:font-normal"
              placeholder="nama@email.com"
              required
            />
          </div>

          <div className="space-y-1 group">
            <div className="flex justify-between items-end pl-1 mb-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest group-focus-within:text-red-500 transition-colors">Password</label>
              <a href="#" className="text-[11px] font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest">Lupa?</a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-gray-50/50 border border-gray-200 text-gray-900 pl-5 pr-12 py-4 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium placeholder:text-gray-300 placeholder:font-normal ${!showPassword ? 'tracking-[0.2em]' : ''}`}
                placeholder={showPassword ? "Masukkan password" : "••••••••"}
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 p-1"
              >
                {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-red-600 px-5 py-4 rounded-2xl text-sm font-medium border border-red-100">
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#111] hover:bg-[#e63946] text-white py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg shadow-black/5 hover:shadow-red-500/25 active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {isLoading ? (
              <span className="flex items-center gap-2"><FaSpinner className="animate-spin" /> Memproses...</span>
            ) : "Masuk ke Akun"}
          </button>
        </form>

        <p className="mt-12 text-gray-500 font-medium">
          Belum bergabung? <Link href="/register" className="text-[#e63946] hover:underline decoration-2 underline-offset-4">Daftar sekarang</Link>
        </p>
      </div>

      {/* Right: Dark Cinematic Area */}
      <div className="hidden md:flex flex-1 bg-[#050505] relative overflow-hidden flex-col items-center justify-center p-20">
        {/* Ambient Lights */}
        <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-red-600/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-orange-500/10 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />
        
        {/* Photographic / Abstract Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
        
        <div className="relative z-10 w-full max-w-lg border border-white/10 bg-white/5 backdrop-blur-3xl p-12 rounded-[2rem] shadow-2xl">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-8 border border-white/10">
             <FaFire className="text-white text-xl" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight tracking-tight">Satu Laporan, Menyelamatkan Semua.</h2>
          <p className="text-gray-400 text-lg font-light leading-relaxed">
            Terintegrasi langsung dengan unit pemadam kebakaran di lapangan, memastikan lokasi terdeteksi tanpa delay respon.
          </p>
          
          <div className="mt-10 flex gap-4">
             <div className="flex flex-col">
                <span className="text-4xl font-extrabold text-white">4m</span>
                <span className="text-xs text-gray-500 uppercase tracking-widest mt-1">Estimasi Respon</span>
             </div>
             <div className="w-px bg-white/10 mx-4"></div>
             <div className="flex flex-col">
                <span className="text-4xl font-extrabold text-white">24/7</span>
                <span className="text-xs text-gray-500 uppercase tracking-widest mt-1">Siaga Total</span>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}
