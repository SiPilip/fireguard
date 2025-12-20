'use client';

import { useEffect, useState } from 'react';
import { FiX, FiDownload } from 'react-icons/fi';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Cek apakah sudah dalam mode standalone (sudah diinstall)
        const isInStandaloneMode = () => {
            return (
                window.matchMedia('(display-mode: standalone)').matches ||
                (window.navigator as any).standalone ||
                document.referrer.includes('android-app://')
            );
        };

        setIsStandalone(isInStandaloneMode());

        // Cek apakah iOS
        const checkIsIOS = () => {
            const userAgent = window.navigator.userAgent.toLowerCase();
            return /iphone|ipad|ipod/.test(userAgent);
        };

        setIsIOS(checkIsIOS());

        // Handler untuk event beforeinstallprompt (Android/Desktop)
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Cek apakah user sudah pernah dismiss prompt
            const hasSeenPrompt = localStorage.getItem('pwa-install-dismissed');
            const dismissedDate = hasSeenPrompt ? new Date(hasSeenPrompt) : null;
            const daysSinceDismissed = dismissedDate
                ? (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
                : null;

            // Tampilkan prompt jika belum pernah di-dismiss atau sudah lebih dari 7 hari
            if (!hasSeenPrompt || (daysSinceDismissed && daysSinceDismissed > 7)) {
                setTimeout(() => setShowPrompt(true), 3000); // Delay 3 detik
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Untuk iOS, tampilkan manual prompt jika belum installed dan belum pernah dismiss
        if (checkIsIOS() && !isInStandaloneMode()) {
            const hasSeenIOSPrompt = localStorage.getItem('pwa-ios-install-dismissed');
            if (!hasSeenIOSPrompt) {
                setTimeout(() => setShowPrompt(true), 5000); // Delay 5 detik untuk iOS
            }
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt && !isIOS) return;

        if (isIOS) {
            // Untuk iOS, hanya show instruksi karena tidak bisa trigger install programmatically
            return;
        }

        if (deferredPrompt) {
            // Tampilkan native install prompt
            deferredPrompt.prompt();

            // Wait for user response
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('User accepted PWA installation');
            } else {
                console.log('User dismissed PWA installation');
                localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
            }

            setDeferredPrompt(null);
            setShowPrompt(false);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        if (isIOS) {
            localStorage.setItem('pwa-ios-install-dismissed', 'true');
        } else {
            localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
        }
    };

    // Jangan tampilkan jika sudah installed atau prompt tidak aktif
    if (isStandalone || !showPrompt) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
            <div className="max-w-md mx-auto bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Close Button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 p-2 hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Tutup"
                >
                    <FiX className="w-5 h-5" />
                </button>

                <div className="p-6">
                    {/* Icon & Title */}
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-lg flex-shrink-0">
                            🔥
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1">
                                Install FireGuard
                            </h3>
                            <p className="text-sm text-white/90">
                                Akses lebih cepat & notifikasi real-time
                            </p>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2 mb-4 bg-white/10 rounded-xl p-3">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-lg">⚡</span>
                            <span>Akses instan dari home screen</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-lg">📱</span>
                            <span>Bekerja offline</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-lg">🔔</span>
                            <span>Notifikasi darurat kebakaran</span>
                        </div>
                    </div>

                    {/* iOS Instructions */}
                    {isIOS ? (
                        <div className="bg-white/10 rounded-xl p-4 text-sm">
                            <p className="font-semibold mb-2">Cara Install di iOS:</p>
                            <ol className="space-y-1 list-decimal list-inside">
                                <li>Tap tombol Share
                                    <span className="inline-block mx-1 px-2 py-0.5 bg-white/20 rounded text-xs">
                                        ⬆️
                                    </span>
                                </li>
                                <li>Scroll dan pilih "Add to Home Screen"</li>
                                <li>Tap "Add" di pojok kanan atas</li>
                            </ol>
                        </div>
                    ) : (
                        /* Install Button for Android/Desktop */
                        <button
                            onClick={handleInstallClick}
                            className="w-full bg-white text-red-500 font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg"
                        >
                            <FiDownload className="w-5 h-5" />
                            Install Sekarang
                        </button>
                    )}

                    {/* Dismiss Link */}
                    <button
                        onClick={handleDismiss}
                        className="w-full text-center text-sm text-white/80 hover:text-white mt-3 underline"
                    >
                        Lain kali
                    </button>
                </div>
            </div>
        </div>
    );
}
