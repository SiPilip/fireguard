"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft, FaEnvelope, FaFire, FaLock, FaPhone, FaSpinner, FaUser } from "react-icons/fa";

type Step = "form" | "otp";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          router.replace(data.isOperator ? "/operator/dashboard" : "/dashboard");
          return;
        }
      } catch {
      } finally {
        setIsVerifying(false);
      }
    };

    verifySession();
  }, [router]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (password.length < 8) {
        throw new Error("Password minimal 8 karakter.");
      }
      if (password !== confirmPassword) {
        throw new Error("Konfirmasi password tidak cocok.");
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phoneNumber }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Gagal mengirim OTP");
      }

      setMessage(data.message);
      setStep("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, name, phoneNumber, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Verifikasi gagal");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-red-500 border-r-transparent mb-4"></div>
          <p className="text-gray-700 font-medium">Memverifikasi sesi...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl shadow-lg mb-4">
            <FaFire className="text-white text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar FireGuard</h1>
          <p className="text-gray-500 mt-1">Buat akun untuk pelaporan bencana</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {step === "form" ? (
            <form onSubmit={handleSendOTP} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap <span className="text-red-500">*</span></label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-white text-gray-900 placeholder:text-gray-400"
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-white text-gray-900 placeholder:text-gray-400"
                    placeholder="contoh@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nomor WhatsApp <span className="text-gray-400">(Opsional)</span></label>
                <div className="relative">
                  <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-white text-gray-900 placeholder:text-gray-400"
                    placeholder="08123456789"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-white text-gray-900 placeholder:text-gray-400"
                    placeholder="Minimal 8 karakter"
                    minLength={8}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-white text-gray-900 placeholder:text-gray-400"
                    placeholder="Ulangi password"
                    minLength={8}
                    required
                  />
                </div>
              </div>

              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-orange-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Mengirim OTP...
                  </>
                ) : (
                  "Lanjut Verifikasi OTP"
                )}
              </button>

              <p className="text-center text-sm text-gray-500">
                Sudah punya akun? <Link href="/login" className="text-red-600 font-medium hover:underline">Login di sini</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="p-6 space-y-4">
              <button
                type="button"
                onClick={() => setStep("form")}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FaArrowLeft className="text-sm" />
                <span className="text-sm">Kembali</span>
              </button>

              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-3">
                  <FaEnvelope className="text-2xl text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Cek Email Anda</h3>
                <p className="text-sm text-gray-500 mt-1">Kode OTP telah dikirim ke <strong className="text-gray-700">{email}</strong></p>
              </div>

              {message && <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm">{message}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kode OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-white text-gray-900 placeholder:text-gray-400"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-orange-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  "Verifikasi & Daftar"
                )}
              </button>

              <button
                type="button"
                onClick={handleSendOTP}
                disabled={isLoading}
                className="w-full py-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                Kirim ulang OTP
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">(c) 2026 FireGuard - Kec. Plaju, Palembang</p>
      </div>
    </div>
  );
}
