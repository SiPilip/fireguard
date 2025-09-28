'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      // Arahkan pengguna kembali ke halaman login setelah logout
      router.push('/login');
    } catch (error) {
      console.error('Gagal untuk logout:', error);
      alert('Gagal untuk logout. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
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

      <main className="container mx-auto p-4">
        <div className="rounded-lg bg-white p-8 shadow">
          <h2 className="mb-4 text-2xl font-bold">Selamat Datang!</h2>
          <p className="text-gray-700">
            Ini adalah dasbor utama Anda. Dari sini, Anda dapat membuat laporan kebakaran baru atau melihat status laporan Anda sebelumnya.
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/report/new')}
              className="w-full rounded-lg bg-red-600 px-5 py-3 text-center font-semibold text-white shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Buat Laporan Baru
            </button>
          </div>
          {/* Di sini kita akan menambahkan fungsionalitas utama nanti */}
        </div>
      </main>
    </div>
  );
}