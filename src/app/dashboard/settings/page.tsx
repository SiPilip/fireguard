'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    FaArrowLeft,
    FaBell,
    FaMoon,
    FaSun,
    FaShieldAlt,
    FaInfoCircle,
    FaChevronRight,
    FaToggleOn,
    FaToggleOff,
    FaMobileAlt,
    FaTrash,
    FaExclamationTriangle,
} from 'react-icons/fa';

interface User {
    id: number;
    name: string;
    email: string;
}

export default function SettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Settings state
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const fetchProfile = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (!response.ok) {
                router.push('/login');
                return;
            }
            const userData = await response.json();
            setUser(userData);

            // Load settings from localStorage
            const savedNotifications = localStorage.getItem('settings_notifications');
            const savedEmailNotifications = localStorage.getItem('settings_email_notifications');
            const savedDarkMode = localStorage.getItem('settings_dark_mode');

            if (savedNotifications !== null) setNotificationsEnabled(savedNotifications === 'true');
            if (savedEmailNotifications !== null) setEmailNotifications(savedEmailNotifications === 'true');
            if (savedDarkMode !== null) setDarkMode(savedDarkMode === 'true');
        } catch {
            router.push('/login');
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const toggleSetting = (setting: string, value: boolean) => {
        switch (setting) {
            case 'notifications':
                setNotificationsEnabled(value);
                localStorage.setItem('settings_notifications', String(value));
                break;
            case 'email_notifications':
                setEmailNotifications(value);
                localStorage.setItem('settings_email_notifications', String(value));
                break;
            case 'dark_mode':
                setDarkMode(value);
                localStorage.setItem('settings_dark_mode', String(value));
                // Apply dark mode to document
                if (value) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
                break;
        }
    };

    const handleDeleteAccount = async () => {
        // TODO: Implement account deletion
        alert('Fitur hapus akun akan segera tersedia. Silakan hubungi admin untuk menghapus akun.');
        setShowDeleteConfirm(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-red-500 border-r-transparent mb-4"></div>
                    <p className="text-gray-600 font-medium">Memuat pengaturan...</p>
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
                    <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
                    <p className="text-gray-500 text-sm mt-1">Kelola preferensi akun Anda</p>
                </div>

                {/* Settings Sections */}
                <div className="space-y-4">
                    {/* Notifications Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FaBell className="text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-gray-900">Notifikasi</h2>
                                    <p className="text-xs text-gray-500">Pengaturan notifikasi aplikasi</p>
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {/* Push Notifications */}
                            <div className="px-5 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FaMobileAlt className="text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Notifikasi Push</p>
                                        <p className="text-xs text-gray-500">Terima notifikasi di perangkat Anda</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleSetting('notifications', !notificationsEnabled)}
                                    className="text-2xl transition-colors"
                                >
                                    {notificationsEnabled ? (
                                        <FaToggleOn className="text-green-500" />
                                    ) : (
                                        <FaToggleOff className="text-gray-300" />
                                    )}
                                </button>
                            </div>

                            {/* Email Notifications */}
                            <div className="px-5 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FaBell className="text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Notifikasi Email</p>
                                        <p className="text-xs text-gray-500">Terima update status laporan via email</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleSetting('email_notifications', !emailNotifications)}
                                    className="text-2xl transition-colors"
                                >
                                    {emailNotifications ? (
                                        <FaToggleOn className="text-green-500" />
                                    ) : (
                                        <FaToggleOff className="text-gray-300" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Appearance Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    {darkMode ? <FaMoon className="text-purple-600" /> : <FaSun className="text-purple-600" />}
                                </div>
                                <div>
                                    <h2 className="font-semibold text-gray-900">Tampilan</h2>
                                    <p className="text-xs text-gray-500">Sesuaikan tampilan aplikasi</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-5 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FaMoon className="text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Mode Gelap</p>
                                    <p className="text-xs text-gray-500">Tampilan yang lebih nyaman di malam hari</p>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleSetting('dark_mode', !darkMode)}
                                className="text-2xl transition-colors"
                            >
                                {darkMode ? (
                                    <FaToggleOn className="text-green-500" />
                                ) : (
                                    <FaToggleOff className="text-gray-300" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <FaShieldAlt className="text-green-600" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-gray-900">Keamanan</h2>
                                    <p className="text-xs text-gray-500">Kelola keamanan akun</p>
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            <Link href="/dashboard/profile" className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <FaShieldAlt className="text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Ubah Profil</p>
                                        <p className="text-xs text-gray-500">Edit nama dan nomor telepon</p>
                                    </div>
                                </div>
                                <FaChevronRight className="text-gray-400 text-sm" />
                            </Link>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <FaInfoCircle className="text-orange-600" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-gray-900">Tentang</h2>
                                    <p className="text-xs text-gray-500">Informasi aplikasi</p>
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            <div className="px-5 py-4 flex items-center justify-between">
                                <p className="text-sm text-gray-700">Versi Aplikasi</p>
                                <p className="text-sm text-gray-500">1.0.0</p>
                            </div>
                            <div className="px-5 py-4 flex items-center justify-between">
                                <p className="text-sm text-gray-700">Developer</p>
                                <p className="text-sm text-gray-500">Tim FireGuard</p>
                            </div>
                            <div className="px-5 py-4 flex items-center justify-between">
                                <p className="text-sm text-gray-700">Lokasi</p>
                                <p className="text-sm text-gray-500">Kec. Plaju, Palembang</p>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-red-100 bg-red-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <FaExclamationTriangle className="text-red-600" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-red-900">Zona Berbahaya</h2>
                                    <p className="text-xs text-red-600">Tindakan yang tidak dapat dibatalkan</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-5 py-4">
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-medium"
                            >
                                <FaTrash />
                                <span>Hapus Akun</span>
                            </button>
                            <p className="text-xs text-gray-500 text-center mt-2">
                                Semua data Anda akan dihapus secara permanen
                            </p>
                        </div>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaExclamationTriangle className="text-red-600 text-2xl" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Akun?</h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    Tindakan ini tidak dapat dibatalkan. Semua data Anda termasuk laporan akan dihapus secara permanen.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleDeleteAccount}
                                        className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    © 2026 FireGuard - Kec. Plaju, Palembang
                </p>
            </div>
        </div>
    );
}
