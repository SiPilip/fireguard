'use client';

import Navbar from './components/landing/Navbar';
import Hero from './components/landing/Hero';
import Features from './components/landing/Features';
import Contact from './components/landing/Contact';
import Footer from './components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="bg-white">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}