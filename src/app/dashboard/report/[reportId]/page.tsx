'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaTimesCircle,
  FaImage,
  FaStickyNote,
  FaPhone,
  FaUser,
  FaSpinner,
  FaExclamationTriangle,
} from 'react-icons/fa';

const SimpleMap = dynamic(() => import('@/components/SimpleMap'), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse bg-gray-200 rounded-lg"></div>,
});

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
  address?: string;
  notes?: string;
  contact?: string;
  media_url?: string;
  user: {
    name?: string;
    email?: string;
    phone?: string;
  };
  admin_notes?: string;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  pending: {
    label: 'Menunggu Verifikasi',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    icon: FaClock,
  },
  submitted: {
    label: 'Menunggu Verifikasi',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    icon: FaClock,
  },
  verified: {
    label: 'Terverifikasi',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: FaCheckCircle,
  },
  diproses: {
    label: 'Sedang Diproses',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: FaCheckCircle,
  },
  dispatched: {
    label: 'Unit Dalam Perjalanan',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: FaTruck,
  },
  dikirim: {
    label: 'Tim Dikirim',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: FaTruck,
  },
  arrived: {
    label: 'Unit Telah Tiba',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    icon: FaCheckCircle,
  },
  ditangani: {
    label: 'Sedang Ditangani',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    icon: FaCheckCircle,
  },
  completed: {
    label: 'Selesai',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: FaCheckCircle,
  },
  selesai: {
    label: 'Selesai',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: FaCheckCircle,
  },
  dibatalkan: {
    label: 'Dibatalkan',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: FaTimesCircle,
  },
  false: {
    label: 'Laporan Palsu',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: FaTimesCircle,
  },
};

const TimelineItem = ({ icon: Icon, color, title, time, isLast = false }: {
  icon: React.ComponentType<any>;
  color: string;
  title: string;
  time: string;
  isLast?: boolean;
}) => (
  <div className="flex">
    <div className="flex flex-col items-center mr-4">
      <div>
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      {!isLast && <div className="w-px h-full bg-gray-300"></div>}
    </div>
    <div className="pb-8">
      <p className="mb-1 text-sm font-semibold text-gray-800">{title}</p>
      <p className="text-xs text-gray-500">{time}</p>
    </div>
  </div>
);

export default function ReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params?.reportId as string;

  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReportDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/operator/reports/${reportId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengambil detail laporan');
      }
      const data = await response.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    if (reportId) {
      fetchReportDetail();
    }
  }, [reportId, fetchReportDetail]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <FaSpinner className="animate-spin text-red-600 h-8 w-8" />
          <p className="text-gray-700 text-lg">Memuat Laporan...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <FaExclamationTriangle className="mx-auto text-red-500 h-12 w-12 mb-4" />
          <p className="text-red-600 font-semibold text-lg">{error || 'Laporan tidak ditemukan'}</p>
          <button onClick={() => router.back()} className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
            <FaArrowLeft />
            <span>Kembali</span>
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[report.status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="container mx-auto flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-gray-600 hover:text-red-600">
              <FaArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Detail Laporan #{report.id}</h1>
              <p className="text-sm text-gray-500">Dilaporkan pada {formatDate(report.created_at)}</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-semibold ${statusInfo.bgColor} ${statusInfo.color} flex items-center gap-2`}>
            <StatusIcon />
            <span>{statusInfo.label}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Main Details) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Map */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Lokasi Kejadian</h2>
            <div className="h-80 w-full rounded-lg overflow-hidden border-2 border-gray-200">
              <SimpleMap latitude={report.fire_latitude} longitude={report.fire_longitude} zoom={16} />
            </div>
            <div className="mt-4 flex items-start gap-3 text-gray-700">
              <FaMapMarkerAlt className="mt-1 text-red-600" />
              <div>
                <p className="font-semibold">{report.address || 'Alamat tidak tersedia'}</p>
                <p className="text-xs text-gray-500">🔥 {report.fire_latitude}, {report.fire_longitude}</p>
                {report.reporter_latitude && report.reporter_longitude && (
                  <p className="text-xs text-gray-500 mt-1">📍 {report.reporter_latitude}, {report.reporter_longitude}</p>
                )}
              </div>
            </div>
          </div>

          {/* Description & Media */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Detail Laporan</h2>
            <p className="text-gray-600 mb-6">{report.description}</p>
            {report.media_url && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><FaImage /> Bukti Foto/Video</h3>
                <div className="relative w-full max-w-md h-64">
                  <Image src={report.media_url} alt="Bukti Laporan" fill className="object-cover rounded-lg border" />
                </div>
              </div>
            )}
          </div>

          {/* Admin Notes */}
          {report.admin_notes && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Catatan dari Operator</h2>
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <p className="text-blue-800">{report.admin_notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Timeline & Info) */}
        <div className="space-y-8">
          {/* Timeline */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Riwayat Status</h2>
            <div className="-ml-1">
              <TimelineItem icon={FaClock} color="bg-yellow-500" title="Laporan Dibuat" time={formatDate(report.created_at)} />
              {['verified', 'dispatched', 'arrived', 'completed', 'false'].includes(report.status) && (
                <TimelineItem icon={FaCheckCircle} color="bg-blue-500" title="Laporan Diverifikasi" time={formatDate(report.updated_at)} />
              )}
              {['dispatched', 'arrived', 'completed'].includes(report.status) && (
                <TimelineItem icon={FaTruck} color="bg-purple-500" title="Unit Dikirim" time={formatDate(report.updated_at)} />
              )}
              {['arrived', 'completed'].includes(report.status) && (
                <TimelineItem icon={FaCheckCircle} color="bg-indigo-500" title="Unit Tiba" time={formatDate(report.updated_at)} />
              )}
              {report.status === 'completed' && (
                <TimelineItem icon={FaCheckCircle} color="bg-green-500" title="Selesai" time={formatDate(report.updated_at)} isLast />
              )}
              {report.status === 'false' && (
                <TimelineItem icon={FaTimesCircle} color="bg-red-500" title="Laporan Palsu" time={formatDate(report.updated_at)} isLast />
              )}
            </div>
          </div>

          {/* Reporter Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Informasi Pelapor</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <FaUser className="text-red-600" />
                <span>{report.user?.name || report.user?.email || 'N/A'}</span>
              </div>
              {report.contact && (
                <div className="flex items-center gap-3 text-gray-700">
                  <FaPhone className="text-red-600" />
                  <span>{report.contact}</span>
                </div>
              )}
              {report.notes && (
                <div className="flex items-start gap-3 text-gray-700 pt-2 border-t">
                  <FaStickyNote className="mt-1 text-red-600" />
                  <span>{report.notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}