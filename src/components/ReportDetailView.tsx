'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Tipe data untuk laporan
interface Report {
  id: number;
  phone_number: string;
  latitude: number;
  longitude: number;
  status: string;
  created_at: string;
  media_url: string;
}

// Import peta secara dinamis
const MapWithNoSSR = dynamic(() => import('@/components/ReportMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-gray-700">Memuat Peta...</div>,
});

interface ReportDetailViewProps {
  reportId: number;
}

export default function ReportDetailView({ reportId }: ReportDetailViewProps) {
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    if (reportId) {
      const fetchReport = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/operator/reports/${reportId}`);
          if (!response.ok) throw new Error('Gagal memuat detail laporan.');
          const data = await response.json();
          setReport(data);
        } catch (err: any) { setError(err.message); }
        finally { setIsLoading(false); }
      };
      fetchReport();
    }
  }, [reportId]);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    setUpdateError('');
    try {
      const response = await fetch(`/api/operator/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Gagal memperbarui status.');
      setReport(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err: any) { setUpdateError(err.message); }
    finally { setIsUpdating(false); }
  };

  if (isLoading) return <div className="p-6 text-center">Memuat detail laporan...</div>;
  if (error) return <div className="p-6 text-center text-red-400">{error}</div>;
  if (!report) return <div className="p-6 text-center">Laporan tidak ditemukan.</div>;

  const isVideo = report.media_url.endsWith('.mp4') || report.media_url.endsWith('.webm') || report.media_url.endsWith('.mov');

  return (
    <div className="h-full flex flex-col space-y-4 p-1">
      <div className="rounded-lg bg-gray-800 p-4 shadow-lg">
        <h2 className="text-xl font-bold mb-3">Informasi Laporan #{report.id}</h2>
        <div className="space-y-1">
          <p><strong>Pelapor:</strong> {report.phone_number}</p>
          <p><strong>Waktu:</strong> {new Date(report.created_at).toLocaleString('id-ID')}</p>
          <p><strong>Status:</strong> 
            <span className={`font-bold ${report.status === 'Pending' ? 'text-yellow-400' : report.status === 'In Progress' ? 'text-blue-400' : 'text-green-400'}`}>
              {report.status}
            </span>
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-gray-800 p-4 shadow-lg flex-grow">
        <h2 className="text-xl font-bold mb-3">Bukti & Lokasi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            <div className="w-full h-64 md:h-full rounded-md overflow-hidden">
                {isVideo ? (
                    <video src={report.media_url} controls className="w-full h-full object-contain bg-black" />
                ) : (
                    <img src={report.media_url} alt={`Bukti laporan ${report.id}`} className="w-full h-full object-contain bg-black" />
                )}
            </div>
            <div className="w-full h-64 md:h-full rounded-md overflow-hidden border border-gray-700">
                <MapWithNoSSR position={[report.latitude, report.longitude]} setPosition={() => {}} />
            </div>
        </div>
      </div>

      <div className="rounded-lg bg-gray-800 p-4 shadow-lg">
        <h2 className="text-xl font-bold mb-3">Ubah Status</h2>
        <div className="flex flex-col space-y-2">
          <button onClick={() => handleStatusChange('In Progress')} disabled={report.status === 'In Progress' || isUpdating} className="rounded-md bg-blue-600 px-3 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-500">Tandai "Dalam Penanganan"</button>
          <button onClick={() => handleStatusChange('Resolved')} disabled={report.status === 'Resolved' || isUpdating} className="rounded-md bg-green-600 px-3 py-2 font-medium text-white hover:bg-green-700 disabled:bg-gray-500">Tandai "Selesai"</button>
          {updateError && <p className="text-red-400 text-sm mt-2">{updateError}</p>}
        </div>
      </div>
    </div>
  );
}
