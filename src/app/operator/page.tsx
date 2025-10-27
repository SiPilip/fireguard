'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OperatorPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect langsung ke login operator
    router.replace('/operator/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-red-500 border-r-transparent mb-4"></div>
        <p className="text-gray-700 font-medium">Mengarahkan ke login operator...</p>
      </div>
    </div>
  );
}
