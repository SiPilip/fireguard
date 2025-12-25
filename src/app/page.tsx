'use client';

import Navbar from './components/landing/Navbar';
import Hero from './components/landing/Hero';
import HowItWorks from './components/landing/HowItWorks';
import Features from './components/landing/Features';
import Stations from './components/landing/Stations';
import FAQ from './components/landing/FAQ';
import Contact from './components/landing/Contact';
import Footer from './components/landing/Footer';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

export default function LandingPage() {
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