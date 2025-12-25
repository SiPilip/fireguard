'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  FaChartBar,
  FaFileAlt,
  FaPlus,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaHome,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaTimesCircle,
  FaExclamationCircle,
  FaBars,
  FaTimes,
  FaUser,
  FaEdit,
  FaChevronDown,
} from 'react-icons/fa';

// Import UserReportDetailModal dynamically to avoid SSR issues if it uses map
const UserReportDetailModal = dynamic(() => import('@/components/UserReportDetailModal'), {
  ssr: false,
});

// Import NotificationBell
import NotificationBell from '@/components/NotificationBell';

interface Report {
  id: number;
  fire_latitude: number;
  fire_longitude: number;
  reporter_latitude?: number;
  reporter_longitude?: number;
  description: string;
  status: 'submitted' | 'verified' | 'dispatched' | 'arrived' | 'completed' | 'false';
  created_at: string;
  updated_at: string;
  admin_notes?: string;
  location_name?: string;
  phone_number: string; // Added to match ReportDetailModal requirements
  media_url: string;   // Added to match ReportDetailModal requirements
  notes?: string;      // Added to match ReportDetailModal requirements
  contact?: string;    // Added to match ReportDetailModal requirements
}

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

type StatusType = 'pending' | 'submitted' | 'verified' | 'dispatched' | 'arrived' | 'completed' | 'diproses' | 'dikirim' | 'ditangani' | 'selesai' | 'dibatalkan' | 'false';

const statusConfig: Record<StatusType, { label: string; color: string; textColor: string; icon: any }> = {
  pending: {
    label: 'Menunggu Verifikasi',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    icon: FaClock,
  },
  submitted: {
    label: 'Menunggu Verifikasi',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    icon: FaClock,
  },
  verified: {
    label: 'Terverifikasi',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    icon: FaCheckCircle,
  },
  diproses: {
    label: 'Sedang Diproses',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    icon: FaCheckCircle,
  },
  dispatched: {
    label: 'Unit Dalam Perjalanan',
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    icon: FaTruck,
  },
  dikirim: {
    label: 'Tim Dikirim',
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    icon: FaTruck,
  },
  arrived: {
    label: 'Unit Telah Tiba',
    color: 'bg-indigo-500',
    textColor: 'text-indigo-700',
    icon: FaCheckCircle,
  },
  ditangani: {
    label: 'Sedang Ditangani',
    color: 'bg-cyan-500',
    textColor: 'text-cyan-700',
    icon: FaCheckCircle,
  },
  completed: {
    label: 'Selesai',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    icon: FaCheckCircle,
  },
  selesai: {
    label: 'Selesai',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    icon: FaCheckCircle,
  },
  dibatalkan: {
    label: 'Dibatalkan',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    icon: FaTimesCircle,
  },
  false: {
    label: 'Laporan Palsu',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    icon: FaTimesCircle,
  },
};

// Default status config for unknown statuses
const defaultStatusConfig = {
  label: 'Status Tidak Diketahui',
  color: 'bg-gray-500',
  textColor: 'text-gray-700',
  icon: FaExclamationCircle,
};

const StatCard = ({ title, value, icon: Icon, gradient }: { title: string; value: number; icon: any; gradient: string }) => (
  <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col md:flex-row items-center md:gap-4 gap-2">
    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${gradient} shadow-sm`}>
      <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
    </div>
    <div className="text-center md:text-left">
      <p className="text-xs text-gray-500 font-medium mb-0.5">{title}</p>
      <p className="text-xl md:text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/login');
        return;
      }
      const userData = await response.json();
      setUser(userData);
    } catch {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
    fetchReports();
  }, [checkAuth]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/reports/my-reports');
      if (!response.ok) {
        throw new Error('Gagal mengambil data laporan');
      }
      const data = await response.json();
      setReports(data.reports || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout');
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Detail Modal */}
      {selectedReport && (
        <UserReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200/60 flex flex-col transform transition-transform duration-300 lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
        <div className="flex items-center justify-between gap-2.5 px-6 h-16 md:h-20 border-b border-gray-200/60">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white rounded-xl shadow-sm overflow-hidden">
              <img src="/logofireguard.png" alt="FireGuard" className="w-6 h-6 md:w-7 md:h-7 object-contain" />
            </div>
            <span className="text-lg md:text-xl font-semibold text-gray-900">FireGuard</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes className="text-gray-600 text-lg" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <Link href="/" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <FaHome className="text-base" />
            <span>Beranda</span>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-900 bg-red-50 rounded-xl font-medium">
            <FaChartBar className="text-base text-red-600" />
            <span>Dashboard</span>
          </Link>
          <Link href="/report/new" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <FaPlus className="text-base" />
            <span>Lapor Baru</span>
          </Link>
          <hr className="my-3 border-gray-200/60" />
          <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <FaUser className="text-base" />
            <span>Edit Profil</span>
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <FaCog className="text-base" />
            <span>Pengaturan</span>
          </Link>
        </nav>
        <div className="px-4 py-6 border-t border-gray-200/60">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors">
            <FaSignOutAlt className="text-base" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 h-16 md:h-20 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <FaBars className="text-gray-600 text-lg" />
            </button>
            <div>
              <h1 className="text-base md:text-xl font-semibold text-gray-900">Dashboard Saya</h1>
              <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">Selamat datang, {user?.name || user?.email || 'Pengguna'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {/* Notification Bell */}
            <NotificationBell
              onViewReport={(reportId) => {
                const report = reports.find(r => r.id === reportId);
                if (report) setSelectedReport(report);
              }}
            />

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <FaUserCircle className="text-white text-base md:text-lg" />
                </div>
                <FaChevronDown className={`hidden sm:block text-gray-400 text-xs transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <>
                  {/* Desktop Dropdown */}
                  <div className="hidden sm:block absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200/60 z-50 overflow-hidden">
                    {/* Profile Info */}
                    <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-br from-red-50 to-orange-50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-sm">
                          <FaUser className="text-white text-lg" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{user?.name || 'Pengguna'}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email || '-'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          router.push('/dashboard/profile');
                        }}
                        className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FaEdit className="text-gray-400" />
                        <span>Edit Profil</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          router.push('/dashboard/settings');
                        }}
                        className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FaCog className="text-gray-400" />
                        <span>Pengaturan</span>
                      </button>

                      <hr className="my-2 border-gray-100" />

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FaSignOutAlt className="text-red-500" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>

                  {/* Mobile Dropdown */}
                  <div className="sm:hidden absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200/60 z-50 overflow-hidden">
                    {/* Profile Info */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-br from-red-50 to-orange-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-sm">
                          <FaUser className="text-white text-base" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{user?.name || 'Pengguna'}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email || '-'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          router.push('/dashboard/profile');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                      >
                        <FaEdit className="text-gray-400" />
                        <span>Edit Profil</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          router.push('/dashboard/settings');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                      >
                        <FaCog className="text-gray-400" />
                        <span>Pengaturan</span>
                      </button>

                      <hr className="my-2 border-gray-100" />

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors"
                      >
                        <FaSignOutAlt className="text-red-500" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-4 md:mb-6">
            <StatCard title="Total Laporan" value={reports.length} icon={FaFileAlt} gradient="bg-gradient-to-br from-blue-500 to-cyan-600" />
            <StatCard title="Menunggu" value={reports.filter((r) => ['submitted', 'pending'].includes(r.status)).length} icon={FaClock} gradient="bg-gradient-to-br from-yellow-500 to-amber-600" />
            <StatCard title="Dalam Proses" value={reports.filter((r) => ['verified', 'dispatched', 'arrived', 'diproses', 'dikirim', 'ditangani'].includes(r.status)).length} icon={FaTruck} gradient="bg-gradient-to-br from-purple-500 to-indigo-600" />
            <StatCard title="Selesai" value={reports.filter((r) => ['completed', 'selesai'].includes(r.status)).length} icon={FaCheckCircle} gradient="bg-gradient-to-br from-green-500 to-emerald-600" />
          </div>

          {/* Reports List */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200/60 shadow-sm p-4 md:p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
              <h2 className="text-base font-semibold text-gray-900">Riwayat Laporan Anda</h2>
            </div>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-red-500 border-r-transparent mb-3"></div>
                <p className="text-sm text-gray-600">Memuat laporan...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <FaExclamationCircle className="mx-auto text-red-500 mb-3 h-10 w-10" />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12">
                <img src="/logofireguard.png" alt="FireGuard" className="mx-auto mb-3 h-16 w-16 opacity-50" />
                <p className="text-base text-gray-900 font-semibold">Belum Ada Laporan</p>
                <p className="text-xs text-gray-500 mt-1">Laporan yang Anda buat akan muncul di sini</p>
                <Link href="/report/new" className="inline-flex items-center gap-2 mt-6 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30">
                  <FaPlus />
                  <span>Buat Laporan Pertama</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => {
                  const statusInfo = statusConfig[report.status as StatusType] || defaultStatusConfig;
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div
                      key={report.id}
                      className="bg-white hover:bg-gray-50 rounded-xl p-3 md:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:shadow-sm transition-all cursor-pointer border border-gray-200/60"
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusInfo.color} flex-shrink-0`}>
                          <StatusIcon className="text-white text-sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900">Laporan #{report.id}</p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{report.description}</p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right pl-13 sm:pl-0">
                        <p className={`text-xs font-medium ${statusInfo.textColor}`}>{statusInfo.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(report.updated_at)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}