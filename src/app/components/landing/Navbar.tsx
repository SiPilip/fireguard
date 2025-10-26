'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaFire, FaUser, FaChevronDown, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ phone?: string; id?: number } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setIsLoggedIn(true);
          setUser(userData);
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch {
        setIsLoggedIn(false);
        setUser(null);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsLoggedIn(false);
    setUser(null);
    setDropdownOpen(false);
    router.push('/');
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-black/10 backdrop-blur-sm'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className={`p-2 rounded-xl transition-all ${scrolled ? 'bg-gradient-to-br from-red-500 to-orange-600' : 'bg-white/20'}`}>
            <FaFire className={`text-lg ${scrolled ? 'text-white' : 'text-white'}`} />
          </div>
          <span className={`text-xl font-semibold ${scrolled ? 'text-gray-900' : 'text-white'}`}>FireGuard</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm">
          <Link href="#features" className={`${scrolled ? 'text-gray-700 hover:text-gray-900' : 'text-white/90 hover:text-white'} font-medium transition-colors`}>Fitur</Link>
          <Link href="#stations" className={`${scrolled ? 'text-gray-700 hover:text-gray-900' : 'text-white/90 hover:text-white'} font-medium transition-colors`}>Lokasi Pos</Link>
          <Link href="#contact" className={`${scrolled ? 'text-gray-700 hover:text-gray-900' : 'text-white/90 hover:text-white'} font-medium transition-colors`}>Kontak</Link>
          <Link href="/operator/login" className={`${scrolled ? 'text-gray-700 hover:text-gray-900' : 'text-white/90 hover:text-white'} font-medium transition-colors`}>Operator</Link>
        </div>
        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl transition-colors hover:bg-white/10"
        >
          {mobileMenuOpen ? (
            <FaTimes className={`text-xl ${scrolled ? 'text-gray-900' : 'text-white'}`} />
          ) : (
            <FaBars className={`text-xl ${scrolled ? 'text-gray-900' : 'text-white'}`} />
          )}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 transition-colors">
                <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                  <FaUser size={16} />
                </div>
                <FaChevronDown size={12} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''} ${scrolled ? 'text-gray-600' : 'text-white'}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-xl border border-gray-200/60 py-2 z-50">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user?.phone || 'User'}</p>
                  </div>
                  <button onClick={() => { setDropdownOpen(false); router.push('/dashboard'); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors">
                    <FaUser size={14} />
                    <span>Dashboard</span>
                  </button>
                  <hr className="my-1 border-gray-100" />
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors">
                    <FaSignOutAlt size={14} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => router.push('/login')} className={`text-sm font-medium px-4 py-2 rounded-xl transition-all ${scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}>
              Login
            </button>
          )}
          <button onClick={() => router.push('/report/new')} className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30">
            Lapor Darurat
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200/60 shadow-lg">
          <div className="px-6 py-4 space-y-3">
            <Link 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Fitur
            </Link>
            <Link 
              href="#stations" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Lokasi Pos
            </Link>
            <Link 
              href="#contact" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Kontak
            </Link>
            <Link 
              href="/operator/login" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Operator
            </Link>
            <hr className="border-gray-200" />
            {isLoggedIn ? (
              <>
                <button 
                  onClick={() => { setMobileMenuOpen(false); router.push('/dashboard'); }}
                  className="w-full text-left py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2"
                >
                  <FaUser size={14} />
                  <span>Dashboard ({user?.phone})</span>
                </button>
                <button 
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="w-full text-left py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors flex items-center gap-2"
                >
                  <FaSignOutAlt size={14} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button 
                onClick={() => { setMobileMenuOpen(false); router.push('/login'); }}
                className="w-full text-left py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Login
              </button>
            )}
            <button 
              onClick={() => { setMobileMenuOpen(false); router.push('/report/new'); }}
              className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-red-500/25"
            >
              Lapor Darurat
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;