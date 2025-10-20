"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaTimesCircle,
  FaArrowLeft,
  FaImage,
  FaPhone,
  FaUser,
} from "react-icons/fa";

const SimpleMap = dynamic(() => import("@/components/SimpleMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
      <p className="text-gray-600">Loading map...</p>
    </div>
  ),
});

interface Report {
  id: number;
  latitude: number;
  longitude: number;
  description: string;
  status: "pending" | "verified" | "on_the_way" | "resolved" | "rejected";
  created_at: string;
  updated_at: string;
  admin_notes?: string;
  location_name?: string;
  photo_url?: string;
  user_phone?: string;
}

const statusConfig = {
  pending: {
    label: "Menunggu Verifikasi",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: FaClock,
    iconColor: "text-yellow-600",
  },
  verified: {
    label: "Terverifikasi",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: FaCheckCircle,
    iconColor: "text-blue-600",
  },
  on_the_way: {
    label: "Petugas Dalam Perjalanan",
    color: "bg-purple-100 text-purple-800 border-purple-300",
    icon: FaTruck,
    iconColor: "text-purple-600",
  },
  resolved: {
    label: "Selesai",
    color: "bg-green-100 text-green-800 border-green-300",
    icon: FaCheckCircle,
    iconColor: "text-green-600",
  },
  rejected: {
    label: "Ditolak",
    color: "bg-red-100 text-red-800 border-red-300",
    icon: FaTimesCircle,
    iconColor: "text-red-600",
  },
};

export default function ReportDetailPage() {
  const params = useParams();
  const reportId = params?.reportId as string;

  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (reportId) {
      fetchReportDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  const fetchReportDetail = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/reports/my-reports?id=${reportId}`);
      if (!response.ok) {
        throw new Error("Gagal mengambil detail laporan");
      }
      const data = await response.json();
      setReport(data.report);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimelineData = (status: Report["status"], createdAt: string, updatedAt: string) => {
    const timeline = [
      {
        status: "pending",
        label: "Laporan Diterima",
        description: "Laporan Anda telah diterima sistem",
        timestamp: createdAt,
      },
    ];

    if (status === "rejected") {
      timeline.push({
        status: "rejected",
        label: "Laporan Ditolak",
        description: "Laporan ditolak oleh admin",
        timestamp: updatedAt,
      });
      return timeline;
    }

    if (["verified", "on_the_way", "resolved"].includes(status)) {
      timeline.push({
        status: "verified",
        label: "Terverifikasi",
        description: "Laporan telah diverifikasi oleh operator",
        timestamp: updatedAt,
      });
    }

    if (["on_the_way", "resolved"].includes(status)) {
      timeline.push({
        status: "on_the_way",
        label: "Petugas Berangkat",
        description: "Petugas pemadam kebakaran dalam perjalanan",
        timestamp: updatedAt,
      });
    }

    if (status === "resolved") {
      timeline.push({
        status: "resolved",
        label: "Selesai Ditangani",
        description: "Kebakaran telah berhasil ditangani",
        timestamp: updatedAt,
      });
    }

    return timeline;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Memuat detail laporan...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaTimesCircle className="mx-auto text-red-600 mb-4" size={48} />
          <p className="text-red-600 font-semibold">{error || "Laporan tidak ditemukan"}</p>
          <Link
            href="/dashboard"
            className="inline-block mt-4 text-red-600 hover:text-red-700 font-semibold"
          >
            ← Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[report.status];
  const StatusIcon = statusInfo.icon;
  const timelineData = getTimelineData(report.status, report.created_at, report.updated_at);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-red-600 hover:text-red-700 transition-colors"
            >
              <FaArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Detail Laporan #{report.id}
              </h1>
              <p className="text-sm text-gray-600">
                {formatDate(report.created_at)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Status Badge */}
        <div className="mb-6">
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${statusInfo.color}`}
          >
            <StatusIcon size={16} />
            {statusInfo.label}
          </span>
        </div>

        {/* Map */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Lokasi Kebakaran</h2>
          <div className="rounded-lg overflow-hidden">
            <SimpleMap
              latitude={report.latitude}
              longitude={report.longitude}
              zoom={15}
            />
          </div>
          <div className="mt-4 flex items-start gap-2 text-gray-600">
            <FaMapMarkerAlt className="mt-1 flex-shrink-0" size={16} />
            <div>
              <p className="font-semibold text-gray-800">
                {report.location_name || "Lokasi"}
              </p>
              <p className="text-sm">
                Koordinat: {report.latitude}, {report.longitude}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Deskripsi Laporan</h2>
          <p className="text-gray-700">{report.description}</p>
        </div>

        {/* Photo */}
        {report.photo_url && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaImage />
              Foto Kejadian
            </h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={report.photo_url}
              alt="Foto kebakaran"
              className="w-full rounded-lg"
            />
          </div>
        )}

        {/* Admin Notes */}
        {report.admin_notes && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Update dari Admin</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">A</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-blue-900 mb-2">Operator FireGuard</p>
                  <p className="text-blue-800">{report.admin_notes}</p>
                  <p className="text-xs text-blue-600 mt-2">
                    {formatDate(report.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Timeline Proses</h2>
          <div className="space-y-6">
            {timelineData.map((item, index) => {
              const isLast = index === timelineData.length - 1;
              const itemStatusInfo = statusConfig[item.status as Report["status"]];
              const ItemIcon = itemStatusInfo.icon;

              return (
                <div key={index} className="flex gap-4 relative">
                  {/* Vertical Line */}
                  {!isLast && (
                    <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-200"></div>
                  )}

                  {/* Icon */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isLast ? "bg-red-600" : "bg-gray-300"
                    }`}
                  >
                    <ItemIcon className="text-white" size={14} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <p className="font-semibold text-gray-800">{item.label}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(item.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Informasi Pelapor</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-700">
              <FaPhone className="text-red-600" size={16} />
              <span>{report.user_phone || "Tidak tersedia"}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <FaUser className="text-red-600" size={16} />
              <span>Pengguna FireGuard</span>
            </div>
          </div>
        </div>

        {/* Emergency Button */}
        {report.status !== "resolved" && report.status !== "rejected" && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-semibold mb-3">
              Situasi semakin darurat?
            </p>
            <a
              href="tel:113"
              className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Hubungi Damkar 113
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
