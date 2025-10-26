"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaFire, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';

function VerifyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneNumber = searchParams.get("phone");

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!phoneNumber) {
      // Jika tidak ada nomor telepon di URL, kembali ke halaman login
      router.replace("/login");
    }
  }, [phoneNumber, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!/\d{6}/.test(otp)) {
      setError("Kode OTP harus 6 digit angka.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal memverifikasi OTP.");
      }

      // Redirect ke home page dan refresh untuk update navbar
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!phoneNumber) {
    return null; // atau tampilkan loading spinner
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl shadow-lg mb-4">
            <FaFire className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            FireGuard
          </h1>
          <p className="text-sm text-gray-500">Sistem Pelaporan Kebakaran</p>
        </div>

        {/* OTP Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/60 p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaShieldAlt className="text-green-600 text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Verifikasi OTP</h2>
              <p className="text-xs text-gray-500">Masukkan kode verifikasi</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-xs text-blue-700 text-center">
              Kode telah dikirim ke nomor<br />
              <span className="font-semibold text-blue-900">{phoneNumber}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="otp" className="block text-xs font-medium text-gray-700 mb-2">
                Kode OTP (6 Digit)
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-4 text-center text-2xl tracking-[0.5em] font-semibold border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white text-gray-900"
                maxLength={6}
                placeholder="000000"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-2 text-center">Cek console browser untuk melihat kode OTP</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-xs text-red-700 text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3.5 rounded-xl font-semibold text-sm shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  <span>Verifikasi & Masuk</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            &copy; 2025 FireGuard. Sistem Pelaporan Kebakaran
          </p>
        </div>
      </div>
    </main>
  );
}

// Bungkus dengan Suspense karena menggunakan useSearchParams
export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyPageContent />
    </Suspense>
  );
}
