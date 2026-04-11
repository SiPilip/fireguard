'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-red-500 border-r-transparent mb-4"></div>
          <p className="text-gray-700 font-medium">Memuat aplikasi...</p>
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