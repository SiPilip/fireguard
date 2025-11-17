"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  FaTimes,
  FaMapMarkerAlt,
  FaClock,
  FaPhone,
  FaFileAlt,
  FaImage,
  FaCheck,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

interface Report {
  id: number;
  phone_number: string;
  fire_latitude: number;
  fire_longitude: number;
  reporter_latitude?: number;
  reporter_longitude?: number;
  status: string;
  created_at: string;
  media_url: string;
  notes?: string;
  contact?: string;
}

interface ReportDetailModalProps {
  report: Report;
  onClose: () => void;
  onUpdateStatus: (reportId: number, newStatus: string) => Promise<void>;
}

const StatusButton = ({
  label,
  icon,
  color,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`${color} text-white px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all hover:shadow-lg shadow-md`}
  >
    {icon}
    {label}
  </button>
);

export default function ReportDetailModal({
  report,
  onClose,
  onUpdateStatus,
}: ReportDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(report.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const getStatusDisplay = (status: string) => {
    const statusMap: { [key: string]: { text: string; color: string; bgColor: string } } = {
      submitted: { text: "Baru", color: "text-red-600", bgColor: "bg-red-50 border-red-200" },
      verified: { text: "Diverifikasi", color: "text-yellow-600", bgColor: "bg-yellow-50 border-yellow-200" },
      dispatched: { text: "Dikirim", color: "text-blue-600", bgColor: "bg-blue-50 border-blue-200" },
      arrived: { text: "Tiba", color: "text-indigo-600", bgColor: "bg-indigo-50 border-indigo-200" },
      completed: { text: "Selesai", color: "text-green-600", bgColor: "bg-green-50 border-green-200" },
      false: { text: "Palsu", color: "text-gray-600", bgColor: "bg-gray-50 border-gray-200" },
    };
    return (
      statusMap[status] || { text: status, color: "text-gray-600", bgColor: "bg-gray-50 border-gray-200" }
    );
  };

  const statusDisplay = getStatusDisplay(report.status);

  return (
    <div 
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200/60 px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl">
              <FaFileAlt className="text-white text-base" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Detail Laporan #{report.id}</h2>
              <p className="text-xs text-gray-500 mt-0.5">Informasi lengkap laporan kebakaran</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all p-2 rounded-xl"
            aria-label="Close modal"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50/30">
          {/* Status */}
          <div className={`rounded-xl p-5 border ${statusDisplay.bgColor}`}>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Status Laporan</p>
                <p className={`text-xl font-semibold ${statusDisplay.color}`}>
                  {statusDisplay.text}
                </p>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Waktu */}
            <div className="bg-white rounded-xl p-5 border border-gray-200/60 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FaClock className="text-yellow-600 text-sm" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1.5">Waktu Laporan</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(report.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      timeZone: "Asia/Jakarta",
                    })}
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {new Date(report.created_at).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      timeZone: "Asia/Jakarta",
                    })} WIB
                  </p>
                </div>
              </div>
            </div>

            {/* Kontak */}
            <div className="bg-white rounded-xl p-5 border border-gray-200/60 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaPhone className="text-green-600 text-sm" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1.5">Nomor Telepon</p>
                  <p className="text-sm font-semibold text-gray-900 font-mono">
                    {report.phone_number}
                  </p>
                  {report.contact && (
                    <p className="text-xs text-gray-600 mt-1">{report.contact}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Lokasi Kebakaran */}
          <div className="bg-white rounded-xl p-5 border border-gray-200/60 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <FaMapMarkerAlt className="text-red-600 text-sm" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-2">🔥 Lokasi Kebakaran</p>
                <p className="text-sm text-gray-900 font-mono">
                  Lat: {report.fire_latitude.toFixed(6)}
                </p>
                <p className="text-sm text-gray-900 font-mono">
                  Lng: {report.fire_longitude.toFixed(6)}
                </p>
                <a
                  href={`https://www.google.com/maps?q=${report.fire_latitude},${report.fire_longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-xs font-medium mt-2 inline-flex items-center gap-1 hover:underline"
                >
                  Buka di Google Maps →
                </a>
              </div>
            </div>
          </div>

          {/* Lokasi Pelapor */}
          {report.reporter_latitude && report.reporter_longitude && (
            <div className="bg-white rounded-xl p-5 border border-gray-200/60 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaMapMarkerAlt className="text-blue-600 text-sm" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-2">📍 Lokasi Pelapor</p>
                  <p className="text-sm text-gray-900 font-mono">
                    Lat: {report.reporter_latitude.toFixed(6)}
                  </p>
                  <p className="text-sm text-gray-900 font-mono">
                    Lng: {report.reporter_longitude.toFixed(6)}
                  </p>
                  <a
                    href={`https://www.google.com/maps?q=${report.reporter_latitude},${report.reporter_longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-xs font-medium mt-2 inline-flex items-center gap-1 hover:underline"
                  >
                    Buka di Google Maps →
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Catatan */}
          {report.notes && (
            <div className="bg-white rounded-xl p-5 border border-gray-200/60 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaFileAlt className="text-blue-600 text-sm" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-2">Catatan</p>
                  <p className="text-sm text-gray-900 leading-relaxed">{report.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Media */}
          {report.media_url && (
            <div className="bg-white rounded-xl p-5 border border-gray-200/60 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FaImage className="text-purple-600 text-sm" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-3">Media Lampiran</p>
                  <div className="relative w-full h-64 rounded-xl overflow-hidden border border-gray-200">
                    <Image
                      src={report.media_url}
                      alt="Bukti laporan"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <a
                    href={report.media_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-xs font-medium mt-3 inline-flex items-center gap-1 hover:underline"
                  >
                    Lihat Ukuran Penuh →
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200/60 px-6 py-5">
          <p className="text-xs font-medium text-gray-600 mb-3">Ubah Status Laporan:</p>
          <div className="flex flex-wrap gap-2.5 justify-end">
            <StatusButton
              label="Verifikasi"
              icon={<FaCheck className="text-sm" />}
              color="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700"
              onClick={() => handleStatusUpdate("verified")}
            />
            <StatusButton
              label="Kirim Unit"
              icon={<FaTruck className="text-sm" />}
              color="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
              onClick={() => handleStatusUpdate("dispatched")}
            />
            <StatusButton
              label="Selesaikan"
              icon={<FaCheckCircle className="text-sm" />}
              color="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              onClick={() => handleStatusUpdate("completed")}
            />
            <StatusButton
              label="Laporan Palsu"
              icon={<FaTimesCircle className="text-sm" />}
              color="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
              onClick={() => handleStatusUpdate("false")}
            />
          </div>
        </div>

        {isUpdating && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
            <div className="bg-white rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-3 border-solid border-red-500 border-r-transparent"></div>
                <p className="text-sm font-medium text-gray-900">Memperbarui status...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
