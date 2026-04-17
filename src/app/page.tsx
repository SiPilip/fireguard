'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaFire } from 'react-icons/fa';
import Navbar from './components/landing/Navbar';
import Hero from './components/landing/Hero';
import HowItWorks from './components/landing/HowItWorks';
import Features from './components/landing/Features';
import Stations from './components/landing/Stations';
import FAQ from './components/landing/FAQ';
import Contact from './components/landing/Contact';
import Footer from './components/landing/Footer';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { isStandaloneApp } from '@/lib/app-mode';
import { hasCompletedOnboarding } from '@/lib/onboarding';

export default function LandingPage() {
  const router = useRouter();
  const [appModeReady, setAppModeReady] = useState(false);
  const [standaloneMode, setStandaloneMode] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const resolveAppModeAndSession = async () => {
      const standalone = isStandaloneApp();
      if (!isMounted) {
        return;
      }

      setStandaloneMode(standalone);

      if (!standalone) {
        setAppModeReady(true);
        return;
      }

      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        if (!isMounted) {
          return;
        }

        if (response.ok) {
          const auth = await response.json();
          router.replace(auth?.isOperator ? '/operator/dashboard' : '/dashboard');
          return;
        }

        router.replace(hasCompletedOnboarding() ? '/login' : '/onboarding');
      } catch {
        router.replace(hasCompletedOnboarding() ? '/login' : '/onboarding');
      } finally {
        if (isMounted) {
          setAppModeReady(true);
        }
      }
    };

    resolveAppModeAndSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (!appModeReady) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAFA] relative overflow-hidden">
        {/* Cinematic ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[30rem] h-[30rem] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center scale-90 sm:scale-100">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} /* Custom spring ease */
            className="relative mb-12 flex items-center justify-center w-32 h-32"
          >
            {/* Outer animated strokes */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-gray-200/50 border-t-red-500/80" 
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 rounded-full border border-gray-100 border-b-orange-500/60 opacity-60" 
            />
            
            {/* Center Core */}
            <div className="w-16 h-16 bg-white rounded-[1.25rem] shadow-[0_8px_30px_rgb(239,68,68,0.12)] border border-red-50/50 flex flex-col items-center justify-center relative overflow-hidden z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-red-50/80 to-transparent" />
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <FaFire className="text-3xl text-red-600 relative z-10 drop-shadow-sm" />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 mb-3">
              FireGuard
            </h1>
            <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white border border-gray-100 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <p className="text-[11px] sm:text-xs font-bold text-gray-600 tracking-[0.2em] uppercase">
                Menyinkronkan Sistem
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  if (standaloneMode) {
    return null;
  }

  return (
    <div className="bg-white">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Stations />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <PWAInstallPrompt />
    </div>
  );
}