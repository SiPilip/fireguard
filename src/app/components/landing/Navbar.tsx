'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaFire, FaUser, FaChevronDown, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ phone?: string; id?: number } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-sm shadow-md' : 'bg-transparent'}`}>
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className={`flex items-center gap-2 text-2xl font-bold ${scrolled ? 'text-red-600' : 'text-white'}`}>
          <FaFire />
          <span>FireGuard</span>
        </Link>
        <div className="hidden md:flex items-center gap-10 text-lg">
          <Link href="#features" className={`${scrolled ? 'text-gray-700' : 'text-white'} hover:text-red-600 font-medium`}>Fitur</Link>
          <Link href="#contact" className={`${scrolled ? 'text-gray-700' : 'text-white'} hover:text-red-600 font-medium`}>Kontak</Link>
          <Link href="/operator/login" className={`${scrolled ? 'text-gray-700' : 'text-white'} hover:text-red-600 font-medium`}>Operator</Link>
        </div>
        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className={`flex items-center gap-2 font-semibold transition-colors ${scrolled ? 'text-gray-800' : 'text-white'} hover:text-red-600`}>
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white">
                  <FaUser size={18} />
                </div>
                <FaChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-gray-800">{user?.phone || 'User'}</p>
                  </div>
                  <button onClick={() => { setDropdownOpen(false); router.push('/dashboard'); }} className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors">
                    <FaUser size={16} />
                    <span>Dashboard</span>
                  </button>
                  <hr className="my-1 border-gray-100" />
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors">
                    <FaSignOutAlt size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => router.push('/login')} className={`font-semibold text-lg hover:text-red-600 ${scrolled ? 'text-gray-700' : 'text-white'}`}>
              Login
            </button>
          )}
          <button onClick={() => router.push('/report/new')} className="bg-red-600 text-white px-6 py-3 rounded-full font-semibold text-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
            Lapor Darurat
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;