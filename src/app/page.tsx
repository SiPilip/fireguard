'use client';

import Navbar from './components/landing/Navbar';
import Hero from './components/landing/Hero';
import Features from './components/landing/Features';
import Stations from './components/landing/Stations';
import Contact from './components/landing/Contact';
import Footer from './components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="bg-white">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Stations />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}