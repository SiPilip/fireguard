"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaEnvelope, FaUser, FaPhone, FaArrowLeft, FaSpinner, FaFire } from "react-icons/fa";

type Step = "form" | "otp";

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("form");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
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
                body: JSON.stringify({ email, otp, name, phoneNumber }),
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl shadow-lg mb-4">
                        <FaFire className="text-white text-3xl" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Daftar FireGuard</h1>
                    <p className="text-gray-500 mt-1">Buat akun untuk melaporkan bencana</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {step === "form" ? (
                        <form onSubmit={handleSendOTP} className="p-6 space-y-4">
                            {/* Name Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nama Lengkap <span className="text-red-500">*</span>
                                </label>
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

                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email <span className="text-red-500">*</span>
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

                            {/* Phone Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nomor WhatsApp <span className="text-gray-400">(Opsional)</span>
                                </label>
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
                                <p className="text-xs text-gray-500 mt-1">Untuk notifikasi WhatsApp (opsional)</p>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

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
                                    "Kirim Kode OTP"
                                )}
                            </button>

                            <p className="text-center text-sm text-gray-500">
                                Sudah punya akun?{" "}
                                <Link href="/login" className="text-red-600 font-medium hover:underline">
                                    Login di sini
                                </Link>
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
                                <p className="text-sm text-gray-500 mt-1">
                                    Kode OTP telah dikirim ke<br />
                                    <strong className="text-gray-700">{email}</strong>
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

                <p className="text-center text-xs text-gray-400 mt-6">
                    © 2024 FireGuard - Kec. Plaju, Palembang
                </p>
            </div>
        </div>
    );
}
