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

const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
  <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between transform hover:-translate-y-1 transition-transform duration-300">
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
    <div className={`p-4 rounded-full ${bgColor}`}>
      <Icon className={`w-6 h-6`} style={{ color }} />
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
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="flex items-center justify-center h-20 border-b">
          <FaFire className="text-red-600 text-3xl" />
          <span className="ml-2 text-2xl font-bold text-gray-800">FireGuard</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-200 rounded-lg">
            <FaHome className="text-gray-600" />
            <span className="ml-3">Landing Page</span>
          </Link>
          <Link href="/dashboard" className="flex items-center px-4 py-3 text-gray-700 bg-red-100 rounded-lg font-semibold">
            <FaChartBar className="text-red-600" />
            <span className="ml-3">Dashboard</span>
          </Link>
          <Link href="/report/new" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-200 rounded-lg">
            <FaPlus className="text-gray-600" />
            <span className="ml-3">Lapor Baru</span>
          </Link>
        </nav>
        <div className="px-4 py-6 border-t">
          <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-200 rounded-lg">
            <FaSignOutAlt />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm h-20 flex items-center justify-between px-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Saya</h1>
            <p className="text-sm text-gray-500">Selamat datang, {user?.phone || 'Pengguna'}</p>
          </div>
          <div className="flex items-center space-x-6">
            <FaBell className="text-gray-500 h-6 w-6 cursor-pointer hover:text-red-600" />
            <FaCog className="text-gray-500 h-6 w-6 cursor-pointer hover:text-red-600" />
            <FaUserCircle className="text-gray-500 h-8 w-8 cursor-pointer hover:text-red-600" />
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Laporan" value={reports.length} icon={FaFileAlt} color="#3B82F6" bgColor="bg-blue-100" />
            <StatCard title="Menunggu" value={reports.filter((r) => r.status === 'submitted').length} icon={FaClock} color="#F59E0B" bgColor="bg-yellow-100" />
            <StatCard title="Dalam Proses" value={reports.filter((r) => ['verified', 'dispatched', 'arrived'].includes(r.status)).length} icon={FaTruck} color="#8B5CF6" bgColor="bg-purple-100" />
            <StatCard title="Selesai" value={reports.filter((r) => r.status === 'completed').length} icon={FaCheckCircle} color="#10B981" bgColor="bg-green-100" />
          </div>

          {/* Reports List */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Riwayat Laporan Anda</h2>
            {isLoading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                <p className="mt-4 text-gray-600">Memuat laporan...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <FaExclamationCircle className="mx-auto text-red-500 mb-4 h-12 w-12" />
                <p className="text-red-600 font-semibold">{error}</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-16">
                <FaFire className="mx-auto text-gray-400 mb-4 h-12 w-12" />
                <p className="text-gray-600 font-semibold text-lg">Anda belum memiliki laporan.</p>
                <p className="text-gray-500 text-sm mt-2">Laporan yang Anda buat akan muncul di sini.</p>
                <Link href="/report/new" className="inline-block mt-6 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md hover:shadow-lg">
                  Buat Laporan Pertama
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => {
                  const statusInfo = statusConfig[report.status];
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div
                      key={report.id}
                      className="bg-gray-50 rounded-xl p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
                      onClick={() => router.push(`/dashboard/report/${report.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${statusInfo.color}`}>
                          <StatusIcon className="text-white h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">Laporan #{report.id}</p>
                          <p className="text-sm text-gray-600 truncate max-w-xs">{report.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${statusInfo.color.replace('bg-', 'text-')}`}>{statusInfo.label}</p>
                        <p className="text-xs text-gray-500">{formatDate(report.updated_at)}</p>
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