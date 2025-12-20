'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
} from 'react-icons/fa';

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
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchProfile = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/profile');
            if (!response.ok) {
                router.push('/login');
                return;
            }
            const userData = await response.json();
            setUser(userData);
            setName(userData.name || '');
            setPhoneNumber(userData.phone_number || '');
        } catch {
            router.push('/login');
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
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone_number: phoneNumber }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal menyimpan profil');
            }

            setSuccess('Profil berhasil diperbarui!');
            setUser(data.user);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-red-500 border-r-transparent mb-4"></div>
                    <p className="text-gray-600 font-medium">Memuat profil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 md:p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
                    >
                        <FaArrowLeft className="text-sm" />
                        <span className="text-sm font-medium">Kembali ke Dashboard</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Profil</h1>
                    <p className="text-gray-500 text-sm mt-1">Perbarui informasi akun Anda</p>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-br from-red-500 to-orange-600 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                                <FaUser className="text-white text-3xl" />
                            </div>
                            <div className="text-white">
                                <h2 className="text-xl font-bold">{user?.name}</h2>
                                <p className="text-white/80 text-sm">{user?.email}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    {user?.is_verified ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs">
                                            <FaShieldAlt className="text-green-300" />
                                            Terverifikasi
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs">
                                            <FaExclamationCircle className="text-yellow-300" />
                                            Belum Terverifikasi
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Success Message */}
                        {success && (
                            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                                <FaCheckCircle className="text-green-500 text-lg flex-shrink-0" />
                                <p className="text-sm text-green-700">{success}</p>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                                <FaExclamationCircle className="text-red-500 text-lg flex-shrink-0" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

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
                                    minLength={2}
                                    maxLength={100}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Minimal 2 karakter, maksimal 100 karakter</p>
                        </div>

                        {/* Email (Read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                                    disabled
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
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
                            <p className="text-xs text-gray-500 mt-1">Untuk menerima notifikasi WhatsApp</p>
                        </div>

                        {/* Member Since */}
                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <FaCalendarAlt className="text-gray-400" />
                                <span>Bergabung sejak {user?.created_at ? formatDate(user.created_at) : '-'}</span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-orange-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30"
                            >
                                {isSaving ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <FaSave />
                                        Simpan Perubahan
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    © 2024 FireGuard - Kec. Plaju, Palembang
                </p>
            </div>
        </div>
    );
}
