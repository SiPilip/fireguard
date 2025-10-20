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
  latitude: number;
  longitude: number;
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
    className={`${color} text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all hover:scale-105`}
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
    const statusMap: { [key: string]: { text: string; color: string } } = {
      submitted: { text: "Baru", color: "text-red-400" },
      verified: { text: "Diverifikasi", color: "text-yellow-400" },
      dispatched: { text: "Dikirim", color: "text-blue-400" },
      arrived: { text: "Tiba", color: "text-indigo-400" },
      completed: { text: "Selesai", color: "text-green-400" },
      false: { text: "Palsu", color: "text-gray-400" },
    };
    return (
      statusMap[status] || { text: status, color: "text-gray-300" }
    );
  };

  const statusDisplay = getStatusDisplay(report.status);

  return (
    <div 
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black bg-opacity-70 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 border-2 border-gray-700 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FaFileAlt className="text-red-500" />
            Detail Laporan #{report.id}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-red-600 transition-all p-3 rounded-full"
            aria-label="Close modal"
          >
            <FaTimes size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-400 mb-1">Status Laporan</p>
                <p className={`text-2xl font-bold ${statusDisplay.color}`}>
                  {statusDisplay.text.toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Waktu */}
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start gap-3">
                <FaClock className="text-yellow-400 text-xl mt-1" />
                <div>
                  <p className="text-sm text-gray-400 mb-1">Waktu Laporan</p>
                  <p className="text-white font-semibold">
                    {new Date(report.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-gray-300">
                    {new Date(report.created_at).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Kontak */}
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start gap-3">
                <FaPhone className="text-green-400 text-xl mt-1" />
                <div>
                  <p className="text-sm text-gray-400 mb-1">Nomor Telepon</p>
                  <p className="text-white font-semibold font-mono">
                    {report.phone_number}
                  </p>
                  {report.contact && (
                    <p className="text-gray-300 text-sm mt-1">{report.contact}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Lokasi */}
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="flex items-start gap-3">
              <FaMapMarkerAlt className="text-red-400 text-xl mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-2">Koordinat Lokasi</p>
                <p className="text-white font-mono text-sm">
                  Lat: {report.latitude.toFixed(6)}
                </p>
                <p className="text-white font-mono text-sm">
                  Lng: {report.longitude.toFixed(6)}
                </p>
                <a
                  href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block"
                >
                  Buka di Google Maps →
                </a>
              </div>
            </div>
          </div>

          {/* Catatan */}
          {report.notes && (
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start gap-3">
                <FaFileAlt className="text-blue-400 text-xl mt-1" />
                <div>
                  <p className="text-sm text-gray-400 mb-2">Catatan</p>
                  <p className="text-white">{report.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Media */}
          {report.media_url && (
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start gap-3">
                <FaImage className="text-purple-400 text-xl mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-3">Media Lampiran</p>
                  <div className="relative w-full h-64">
                    <Image
                      src={report.media_url}
                      alt="Bukti laporan"
                      fill
                      className="rounded-lg object-cover border border-gray-700"
                    />
                  </div>
                  <a
                    href={report.media_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block"
                  >
                    Lihat Ukuran Penuh →
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-6">
          <p className="text-sm text-gray-400 mb-4">Ubah Status Laporan:</p>
          <div className="flex flex-wrap gap-3 justify-end">
            <StatusButton
              label="Verifikasi"
              icon={<FaCheck />}
              color="bg-yellow-500 hover:bg-yellow-600"
              onClick={() => handleStatusUpdate("verified")}
            />
            <StatusButton
              label="Kirim Unit"
              icon={<FaTruck />}
              color="bg-blue-500 hover:bg-blue-600"
              onClick={() => handleStatusUpdate("dispatched")}
            />
            <StatusButton
              label="Selesaikan"
              icon={<FaCheckCircle />}
              color="bg-green-500 hover:bg-green-600"
              onClick={() => handleStatusUpdate("completed")}
            />
            <StatusButton
              label="Laporan Palsu"
              icon={<FaTimesCircle />}
              color="bg-gray-500 hover:bg-gray-600"
              onClick={() => handleStatusUpdate("false")}
            />
          </div>
        </div>

        {isUpdating && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-white">Memperbarui status...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
