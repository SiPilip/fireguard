"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-8">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">
          Verifikasi OTP
        </h1>
        <p className="mb-6 text-center text-gray-600">
          Kode telah dikirim (secara simulasi) ke nomor <br />
          <span className="font-semibold text-gray-800">{phoneNumber}</span>.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="otp"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Kode OTP (6 Digit)
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-3 text-center text-2xl tracking-[1em] text-gray-900 shadow-sm focus:border-red-500 focus:ring-red-500"
              maxLength={6}
              required
              disabled={isLoading}
            />
          </div>
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-red-600 px-4 py-3 font-semibold text-white shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isLoading ? "Memverifikasi..." : "Verifikasi & Masuk"}
          </button>
        </form>
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
