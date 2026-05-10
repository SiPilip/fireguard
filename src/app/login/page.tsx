"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaFire, FaSpinner, FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { m, LazyMotion, domAnimation } from "framer-motion";

export default function LoginPage() {
  const { replace, push } = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = require("react").useTransition();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          replace(
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
  }, [replace]);

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          push("/dashboard");
          return;
        }

        throw new Error(data.message || "Login gagal.");
      } catch (err: any) {
        setError(err.message);
      }
    });
  };

  if (isVerifying) {
    return (
      <main className="fixed inset-0 flex items-center justify-center bg-white">
        <LazyMotion features={domAnimation}>
          <m.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.2, 1], opacity: 1 }}
            transition={{
              scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
              opacity: { duration: 0.3 }
            }}
            className="flex flex-col items-center gap-4"
          >
            <div className="p-4 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl shadow-xl shadow-red-500/20">
              <FaFire className="text-4xl text-white" />
            </div>
          </m.div>
        </LazyMotion>
      </main>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <main className="min-h-screen flex bg-white text-neutral-900 font-sans selection:bg-red-500/30 selection:text-white">
        {/* Left: Form Area */}
        <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col px-8 sm:px-16 md:px-20 py-12 relative z-10 justify-center">
          <Link href="/" className="absolute top-8 left-8 sm:left-16 md:left-20 flex items-center gap-3 text-neutral-400 hover:text-neutral-900 transition-colors">
            <FaArrowLeft className="text-sm" />
          </Link>

          <Link href="/" className="inline-flex items-center gap-3 mb-16 group w-fit mt-10 md:mt-0">
            <div className="p-2.5 bg-red-500 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.4)] group-hover:scale-105 transition-transform">
              <FaFire className="text-xl text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">FireGuard</span>
          </Link>

          <div className="mb-10">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tighter mb-4 text-neutral-900">
              Selamat Datang.
            </h1>
            <p className="text-neutral-500 text-lg leading-relaxed font-light">
              Masuk untuk mengakses portal darurat dan manajemen laporan kebakaran Anda.
            </p>
          </div>

          <form onSubmit={handlePasswordLogin} className="space-y-6">
            <div className="space-y-1 group">
              <label htmlFor="email" className="text-xs font-semibold text-neutral-400 uppercase tracking-widest pl-1 group-focus-within:text-red-500 transition-colors">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-50/50 border border-neutral-200 text-neutral-900 px-5 py-4 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium placeholder:text-neutral-300 placeholder:font-normal"
                placeholder="nama@email.com"
                required
              />
            </div>

            <div className="space-y-1 group">
              <div className="flex justify-between items-end pl-1 mb-2">
                <label htmlFor="password" className="text-xs font-semibold text-neutral-400 uppercase tracking-widest group-focus-within:text-red-500 transition-colors">Password</label>
                <button type="button" className="text-[11px] font-bold text-neutral-400 hover:text-neutral-900 transition-colors uppercase tracking-widest">Lupa?</button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-neutral-50/50 border border-neutral-200 text-neutral-900 pl-5 pr-12 py-4 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium placeholder:text-neutral-300 placeholder:font-normal ${!showPassword ? 'tracking-[0.2em]' : ''}`}
                  placeholder={showPassword ? "Masukkan password" : "••••••••"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 p-1"
                >
                  {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                </button>
              </div>
            </div>

            {error && (
              <m.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-red-600 px-5 py-4 rounded-2xl text-sm font-medium border border-red-100">
                {error}
              </m.div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#111] hover:bg-[#e63946] text-white py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg shadow-black/5 hover:shadow-red-500/25 active:scale-[0.98] disabled:opacity-50 mt-4"
            >
              {isPending ? (
                <span className="flex items-center gap-2"><FaSpinner className="animate-spin" /> Memproses...</span>
              ) : "Masuk ke Akun"}
            </button>
          </form>

          <p className="mt-12 text-neutral-500 font-medium">
            Belum bergabung? <Link href="/register" className="text-[#e63946] hover:underline decoration-2 underline-offset-4">Daftar sekarang</Link>
          </p>
        </div>

        {/* Right: Premium Minimalist Light Area */}
        <div className="hidden md:flex flex-1 bg-[#fafafa] relative overflow-hidden flex-col items-center justify-center p-20">
          {/* Subtle Ambient Shapes */}
          <div className="absolute top-[-10%] right-[-10%] size-[40rem] bg-red-100/40 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] size-[30rem] bg-orange-50/50 rounded-full blur-[80px] pointer-events-none" />

          {/* Minimalist Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

          <div className="relative z-10 w-full max-w-lg border border-neutral-200/60 bg-white/80 backdrop-blur-3xl p-12 rounded-[2.5rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)]">
            <div className="size-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-10 border border-red-100 shadow-sm">
              <FaFire className="text-2xl" />
            </div>
            <h2 className="text-4xl font-semibold text-neutral-900 mb-5 leading-[1.15] tracking-tight">Satu Laporan,<br />Menyelamatkan Semua.</h2>
            <p className="text-neutral-500 text-lg font-light leading-relaxed">
              Terintegrasi langsung dengan unit pemadam kebakaran di lapangan, memastikan lokasi terdeteksi tanpa delay respon.
            </p>

            <div className="mt-12 flex items-center gap-8 pt-8 border-t border-neutral-100">
              <div className="flex flex-col">
                <span className="text-4xl font-semibold tracking-tighter text-neutral-900">4m</span>
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.2em] mt-2">Estimasi Respon</span>
              </div>
              <div className="w-px h-12 bg-neutral-200"></div>
              <div className="flex flex-col">
                <span className="text-4xl font-semibold tracking-tighter text-neutral-900">24/7</span>
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.2em] mt-2">Siaga Total</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </LazyMotion>
  );
}
