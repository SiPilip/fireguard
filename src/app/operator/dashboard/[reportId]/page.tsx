"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Report {
  id: number;
  phone_number: string;
  latitude: number;
  longitude: number;
  status: string;
  created_at: string;
  media_url: string;
  notes?: string;
  contact?: string;
}

export default function ReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.reportId as string;

  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (reportId) {
      const fetchReport = async () => {
        try {
          const response = await fetch(`/api/operator/reports/${reportId}`);
          if (!response.ok) {
            throw new Error('Gagal memuat detail laporan.');
          }
          const data = await response.json();
          setReport(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchReport();
    }
  }, [reportId]);

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/operator/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Gagal update status');
      setReport(prev => prev ? { ...prev, status: newStatus } : null);
      alert('Status laporan berhasil diperbarui.');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Gagal memperbarui status laporan.');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen text-white">Memuat laporan...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">Error: {error}</div>;
  }

  if (!report) {
    return <div className="flex items-center justify-center min-h-screen text-white">Laporan tidak ditemukan.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
            <button onClick={() => router.back()} className="mb-4 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg">Kembali ke Dashboard</button>
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
                <div className="p-6 border-b border-gray-700">
                    <h3 className="text-2xl font-bold">Detail Laporan #{report.id}</h3>
                </div>
                <div className="p-6 space-y-4">
                    <p><strong>Waktu:</strong> {new Date(report.created_at).toLocaleString('id-ID')}</p>
                    <p><strong>Status:</strong> <span className="font-bold uppercase">{report.status}</span></p>
                    <p><strong>Koordinat:</strong> {report.latitude}, {report.longitude}</p>
                    {report.notes && <p><strong>Catatan:</strong> {report.notes}</p>}
                    {report.contact && <p><strong>Kontak Pelapor:</strong> {report.contact}</p>}
                    {report.media_url && <a href={report.media_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Lihat Media</a>}
                </div>
                <div className="p-6 border-t border-gray-700 flex flex-wrap gap-4 justify-end">
                    <button onClick={() => handleUpdateStatus('verified')} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg">Verifikasi</button>
                    <button onClick={() => handleUpdateStatus('dispatched')} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">Kirim Unit</button>
                    <button onClick={() => handleUpdateStatus('completed')} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">Selesaikan</button>
                    <button onClick={() => handleUpdateStatus('false')} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">Laporan Palsu</button>
                </div>
            </div>
        </div>
    </div>
  );
}
