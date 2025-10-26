'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaFire,
  FaChartBar,
  FaFileAlt,
  FaPlus,
  FaUserCircle,
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaHome,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaTimesCircle,
  FaExclamationCircle,
} from 'react-icons/fa';

interface Report {
  id: number;
  latitude: number;
  longitude: number;
  description: string;
  status: 'submitted' | 'verified' | 'dispatched' | 'arrived' | 'completed' | 'false';
  created_at: string;
  updated_at: string;
  admin_notes?: string;
  location_name?: string;
}

interface User {
  id: number;
  phone: string;
}

const statusConfig = {
  submitted: {
    label: 'Menunggu Verifikasi',
    color: 'bg-yellow-500',
    icon: FaClock,
  },
  verified: {
    label: 'Terverifikasi',
    color: 'bg-blue-500',
    icon: FaCheckCircle,
  },
  dispatched: {
    label: 'Unit Dalam Perjalanan',
    color: 'bg-purple-500',
    icon: FaTruck,
  },
  arrived: {
    label: 'Unit Telah Tiba',
    color: 'bg-indigo-500',
    icon: FaCheckCircle,
  },
  completed: {
    label: 'Selesai',
    color: 'bg-green-500',
    icon: FaCheckCircle,
  },
  false: {
    label: 'Laporan Palsu',
    color: 'bg-red-500',
    icon: FaTimesCircle,
  },
};

const StatCard = ({ title, value, icon: Icon, gradient }: { title: string; value: number; icon: any; gradient: string }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${gradient} shadow-sm`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium mb-0.5">{title}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
    fetchReports();
  }, []);

  const checkAuth = async () => {
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
  };

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
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200/60 flex flex-col">
        <div className="flex items-center gap-2.5 px-6 h-20 border-b border-gray-200/60">
          <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl">
            <FaFire className="text-white text-lg" />
          </div>
          <span className="text-xl font-semibold text-gray-900">FireGuard</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <Link href="/" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <FaHome className="text-base" />
            <span>Landing Page</span>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-900 bg-red-50 rounded-xl font-medium">
            <FaChartBar className="text-base text-red-600" />
            <span>Dashboard</span>
          </Link>
          <Link href="/report/new" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <FaPlus className="text-base" />
            <span>Lapor Baru</span>
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
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 h-20 flex items-center justify-between px-8">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Dashboard Saya</h1>
            <p className="text-xs text-gray-500 mt-0.5">Selamat datang, {user?.phone || 'Pengguna'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <FaBell className="text-gray-500 text-lg" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <FaCog className="text-gray-500 text-lg" />
            </button>
            <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
              <FaUserCircle className="text-white text-lg" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <StatCard title="Total Laporan" value={reports.length} icon={FaFileAlt} gradient="bg-gradient-to-br from-blue-500 to-cyan-600" />
            <StatCard title="Menunggu" value={reports.filter((r) => r.status === 'submitted').length} icon={FaClock} gradient="bg-gradient-to-br from-yellow-500 to-amber-600" />
            <StatCard title="Dalam Proses" value={reports.filter((r) => ['verified', 'dispatched', 'arrived'].includes(r.status)).length} icon={FaTruck} gradient="bg-gradient-to-br from-purple-500 to-indigo-600" />
            <StatCard title="Selesai" value={reports.filter((r) => r.status === 'completed').length} icon={FaCheckCircle} gradient="bg-gradient-to-br from-green-500 to-emerald-600" />
          </div>

          {/* Reports List */}
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
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
                <FaFire className="mx-auto text-gray-400 mb-3 h-10 w-10" />
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
                  const statusInfo = statusConfig[report.status];
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div
                      key={report.id}
                      className="bg-white hover:bg-gray-50 rounded-xl p-4 flex items-center justify-between hover:shadow-sm transition-all cursor-pointer border border-gray-200/60"
                      onClick={() => router.push(`/dashboard/report/${report.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusInfo.color}`}>
                          <StatusIcon className="text-white text-base" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">Laporan #{report.id}</p>
                          <p className="text-xs text-gray-500 truncate max-w-xs mt-0.5">{report.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-medium ${statusInfo.color.replace('bg-', 'text-')}`}>{statusInfo.label}</p>
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