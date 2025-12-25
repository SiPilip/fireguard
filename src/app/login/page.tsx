"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaEnvelope, FaArrowLeft, FaSpinner, FaFire, FaShieldAlt, FaWhatsapp, FaPhone } from "react-icons/fa";

type LoginMethod = "email" | "whatsapp";
type Step = "input" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("email");
  const [step, setStep] = useState<Step>("input");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userName, setUserName] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          if (!data.isOperator) {
            router.replace("/");
          } else {
            setIsVerifying(false);
          }
        } else {
          setIsVerifying(false);
        }
      } catch {
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
      if (loginMethod === "email") {
        // Login via Email
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Gagal mengirim OTP");
        }

        setUserName(data.userName || "");
      } else {
        // Login via WhatsApp
        const response = await fetch("/api/auth/login/whatsapp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Gagal mengirim OTP");
        }

        setUserName(data.userName || "");
      }

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
      const endpoint = loginMethod === "email"
        ? "/api/auth/login/verify"
        : "/api/auth/login/whatsapp/verify";

      const body = loginMethod === "email"
        ? { email, otp }
        : { phoneNumber, otp };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Verifikasi gagal");
      }

      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep("input");
    setOtp("");
    setError("");
  };

  const switchMethod = (method: LoginMethod) => {
    setLoginMethod(method);
    setStep("input");
    setEmail("");
    setPhoneNumber("");
    setOtp("");
    setError("");
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
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl shadow-lg mb-4">
            <FaFire className="text-white text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Login FireGuard</h1>
          <p className="text-gray-500 mt-1">Masuk ke akun Anda</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {step === "input" ? (
            <>
              {/* Method Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => switchMethod("email")}
                  className={`flex-1 py-4 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-all ${loginMethod === "email"
                      ? "text-red-600 border-b-2 border-red-500 bg-red-50/50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <FaEnvelope />
                  <span>Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchMethod("whatsapp")}
                  className={`flex-1 py-4 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-all ${loginMethod === "whatsapp"
                      ? "text-green-600 border-b-2 border-green-500 bg-green-50/50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <FaWhatsapp />
                  <span>WhatsApp</span>
                </button>
              </div>

              <form onSubmit={handleSendOTP} className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`p-2 rounded-lg ${loginMethod === "email" ? "bg-red-100" : "bg-green-100"}`}>
                    {loginMethod === "email" ? (
                      <FaShieldAlt className="text-red-600" />
                    ) : (
                      <FaWhatsapp className="text-green-600" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {loginMethod === "email" ? "Login dengan Email" : "Login dengan WhatsApp"}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {loginMethod === "email"
                        ? "OTP akan dikirim ke email Anda"
                        : "OTP akan dikirim ke WhatsApp Anda"}
                    </p>
                  </div>
                </div>

                {loginMethod === "email" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
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
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor WhatsApp
                    </label>
                    <div className="relative">
                      <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white text-gray-900 placeholder:text-gray-400"
                        placeholder="08123456789"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Gunakan nomor yang terdaftar saat pendaftaran</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${loginMethod === "email"
                      ? "bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700"
                      : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    }`}
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Mengirim OTP...
                    </>
                  ) : (
                    <>
                      {loginMethod === "email" ? <FaEnvelope /> : <FaWhatsapp />}
                      Kirim Kode OTP
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-gray-500">
                  Belum punya akun?{" "}
                  <Link href="/register" className="text-red-600 font-medium hover:underline">
                    Daftar di sini
                  </Link>
                </p>
              </form>
            </>
          ) : (
            <form onSubmit={handleVerifyOTP} className="p-6 space-y-4">
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FaArrowLeft className="text-sm" />
                <span className="text-sm">Kembali</span>
              </button>

              <div className="text-center py-4">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-3 ${loginMethod === "email" ? "bg-green-100" : "bg-green-100"
                  }`}>
                  {loginMethod === "email" ? (
                    <FaEnvelope className="text-2xl text-green-600" />
                  ) : (
                    <FaWhatsapp className="text-2xl text-green-600" />
                  )}
                </div>
                <h3 className="font-semibold text-gray-900">
                  Halo, {userName || "Pengguna"}!
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Kode OTP telah dikirim ke<br />
                  <strong className="text-gray-700">
                    {loginMethod === "email" ? email : phoneNumber}
                  </strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kode OTP
                </label>
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

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className={`w-full py-3 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${loginMethod === "email"
                    ? "bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  }`}
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  "Login"
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

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2024 FireGuard - Kec. Plaju, Palembang
        </p>
      </div>
    </div>
  );
}
