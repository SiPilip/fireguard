'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validasi dasar nomor telepon
    if (!/^\d{10,15}$/.test(phoneNumber)) {
      setError('Nomor telepon tidak valid. Harap masukkan 10-15 digit angka.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mengirim OTP.');
      }

      // Arahkan ke halaman verifikasi OTP
      router.push(`/login/verify?phone=${encodeURIComponent(phoneNumber)}`);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-8">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">
          Login FireGuard
        </h1>
        <p className="mb-6 text-center text-gray-600">
          Masukkan nomor telepon Anda untuk menerima kode verifikasi (Simulasi).
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700">
              Nomor Telepon
            </label>
            <input
              type="tel"
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-3 text-gray-900 shadow-sm focus:border-red-500 focus:ring-red-500"
              placeholder="Contoh: 081234567890"
              required
              disabled={isLoading}
            />
          </div>
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-red-600 px-4 py-3 font-semibold text-white shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isLoading ? 'Mengirim...' : 'Kirim Kode Verifikasi'}
          </button>
        </form>
      </div>
    </main>
  );
}
