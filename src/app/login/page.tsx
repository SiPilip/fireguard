"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft, FaEnvelope, FaFire, FaKey, FaLock, FaShieldAlt, FaSpinner } from "react-icons/fa";
import { isStandaloneApp } from "@/lib/app-mode";
import { hasCompletedOnboarding } from "@/lib/onboarding";

type Step = "password" | "otp" | "setup-password";

export default function LoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    const verifySession = async () => {
      if (isStandaloneApp() && !hasCompletedOnboarding()) {
        router.replace("/onboarding");
        return;
      }

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

  const requestOtpFallback = async () => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, requestOtpFallback: true }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Gagal mengirim OTP fallback.");
    }

    setUserName(data.userName || "");
    setStep("otp");
    setInfo("Kode OTP fallback sudah dikirim ke email Anda.");
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setInfo("");

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

      if (response.status === 409 && data.requiresOtpFallback) {
        setInfo(data.message || "Akun lama terdeteksi. Mengirim OTP fallback...");
        await requestOtpFallback();
        return;
      }

      throw new Error(data.message || "Login gagal.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setInfo("");

    try {
      const response = await fetch("/api/auth/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Verifikasi OTP gagal.");
      }

      if (data.requiresPasswordSetup) {
        setStep("setup-password");
        setInfo("Login berhasil. Silakan buat password agar login berikutnya lebih cepat.");
        return;
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setInfo("");

    try {
      if (newPassword.length < 8) {
        throw new Error("Password minimal 8 karakter.");
      }
      if (newPassword !== confirmPassword) {
        throw new Error("Konfirmasi password tidak cocok.");
      }

      const response = await fetch("/api/auth/password/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword, confirmPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Gagal menyimpan password.");
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
          <h1 className="text-2xl font-bold text-gray-900">Login FireGuard</h1>
          <p className="text-gray-500 mt-1">Masuk cepat dengan email dan password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {step === "password" && (
            <form onSubmit={handlePasswordLogin} className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-red-100">
                  <FaShieldAlt className="text-red-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Login dengan Password</h2>
                  <p className="text-xs text-gray-500">Untuk akun lama, OTP fallback tetap tersedia sementara.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-white text-gray-900 placeholder:text-gray-400"
                    placeholder="Masukkan password"
                    required
                  />
                </div>
              </div>

              {info && <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm">{info}</div>}
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <FaLock />
                    Login
                  </>
                )}
              </button>

              <p className="text-center text-sm text-gray-500">
                Belum punya akun? <Link href="/register" className="text-red-600 font-medium hover:underline">Daftar di sini</Link>
              </p>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="p-6 space-y-4">
              <button
                type="button"
                onClick={() => {
                  setStep("password");
                  setOtp("");
                  setError("");
                  setInfo("");
                }}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FaArrowLeft className="text-sm" />
                <span className="text-sm">Kembali</span>
              </button>

              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-3">
                  <FaEnvelope className="text-2xl text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Halo, {userName || "Pengguna"}!</h3>
                <p className="text-sm text-gray-500 mt-1">OTP fallback dikirim ke <strong className="text-gray-700">{email}</strong></p>
              </div>

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

              {info && <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm">{info}</div>}
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full py-3 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  "Login dengan OTP Sekali"
                )}
              </button>

              <button
                type="button"
                onClick={requestOtpFallback}
                disabled={isLoading}
                className="w-full py-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                Kirim ulang OTP
              </button>
            </form>
          )}

          {step === "setup-password" && (
            <form onSubmit={handleSetupPassword} className="p-6 space-y-4">
              <div className="text-center py-2">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-full mb-3">
                  <FaKey className="text-2xl text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Aktivasi Password</h3>
                <p className="text-sm text-gray-500 mt-1">Buat password agar login berikutnya tidak perlu OTP lagi.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-white text-gray-900 placeholder:text-gray-400"
                    placeholder="Minimal 8 karakter"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-white text-gray-900 placeholder:text-gray-400"
                    placeholder="Ulangi password"
                    required
                  />
                </div>
              </div>

              {info && <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm">{info}</div>}
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Password & Lanjutkan"
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">(c) 2026 FireGuard - Kec. Plaju, Palembang</p>
      </div>
    </div>
  );
}
