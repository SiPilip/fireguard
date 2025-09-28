'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Mendefinisikan tipe data untuk riwayat laporan pengguna
interface MyReport {
  id: number;
  status: string;
  created_at: string;
  media_url: string;
}

export default function HomePage() {
  const router = useRouter();
  const [myReports, setMyReports] = useState<MyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyReports = async () => {
      try {
        const response = await fetch('/api/reports/my-reports');
        if (!response.ok) {
          throw new Error('Gagal memuat riwayat laporan.');
        }
        const data = await response.json();
        setMyReports(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyReports();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Gagal untuk logout:', error);
      alert('Gagal untuk logout. Silakan coba lagi.');
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-500 text-white';
      case 'In Progress':
        return 'bg-blue-500 text-white';
      case 'Resolved':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <nav className="container mx-auto flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-red-600">FireGuard</h1>
          <button
            onClick={handleLogout}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Logout
          </button>
        </nav>
      </header>

      <main className="container mx-auto p-4 sm:p-6 md:p-8 space-y-8">
        {/* Bagian untuk membuat laporan baru */}
        <div className="rounded-lg bg-white p-6 shadow text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">Ada Keadaan Darurat?</h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Laporkan kejadian kebakaran di sekitar Anda dengan cepat dan akurat.
          </p>
          <button
            onClick={() => router.push('/report/new')}
            className="w-full sm:w-auto rounded-lg bg-red-600 px-8 py-3 text-center font-semibold text-white shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-transform transform hover:scale-105"
          >
            Buat Laporan Baru
          </button>
        </div>

        {/* Bagian untuk riwayat laporan */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">Riwayat Laporan Anda</h2>
          {isLoading ? (
            <p className="text-center text-gray-500 py-8">Memuat riwayat...</p>
          ) : error ? (
            <p className="text-center text-red-500 py-8">{error}</p>
          ) : (
            <div className="space-y-4">
              {myReports.length > 0 ? (
                myReports.map((report) => (
                  <div key={report.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-md border border-gray-200 p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                        <img src={report.media_url} alt={`Laporan ${report.id}`} className="h-16 w-16 rounded-md object-cover bg-gray-200" />
                        <div>
                            <p className="font-semibold text-gray-800">Laporan #{report.id}</p>
                            <p className="text-sm text-gray-500">
                                Dibuat pada: {new Date(report.created_at).toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>
                    <div className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusClass(report.status)}`}>
                      {report.status}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">Anda belum pernah membuat laporan.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
