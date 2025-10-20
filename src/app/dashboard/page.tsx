"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaFire,
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaTimesCircle,
  FaExclamationCircle,
  FaArrowLeft,
  FaEye,
} from "react-icons/fa";

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
}

interface User {
  id: number;
  phone: string;
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

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkAuth();
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (!response.ok) {
        router.push("/login");
        return;
      }
      const userData = await response.json();
      setUser(userData);
    } catch {
      router.push("/login");
    }
  };

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/reports/my-reports");
      if (!response.ok) {
        throw new Error("Gagal mengambil data laporan");
      }
      const data = await response.json();
      setReports(data.reports || []);
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

  const getTimelineSteps = (currentStatus: Report["status"]) => {
    const steps = [
      { status: "pending", label: "Dilaporkan" },
      { status: "verified", label: "Diverifikasi" },
      { status: "on_the_way", label: "Dalam Perjalanan" },
      { status: "resolved", label: "Selesai" },
    ];

    const statusOrder = ["pending", "verified", "on_the_way", "resolved"];
    const currentIndex = statusOrder.indexOf(currentStatus);

    if (currentStatus === "rejected") {
      return [
        { status: "pending", label: "Dilaporkan", active: true, completed: true },
        { status: "rejected", label: "Ditolak", active: true, completed: true },
      ];
    }

    return steps.map((step, index) => ({
      ...step,
      active: index === currentIndex,
      completed: index < currentIndex,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-xl font-bold text-red-600 hover:text-red-700"
              >
                <FaArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FaFire className="text-red-600" />
                  Dashboard Saya
                </h1>
                <p className="text-sm text-gray-600">
                  {user?.phone || "Loading..."}
                </p>
              </div>
            </div>
            <Link
              href="/report/new"
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              + Lapor Baru
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Laporan</p>
                <p className="text-2xl font-bold text-gray-800">{reports.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaFire className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Menunggu</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {reports.filter((r) => r.status === "pending").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FaClock className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dalam Proses</p>
                <p className="text-2xl font-bold text-purple-600">
                  {reports.filter((r) => r.status === "verified" || r.status === "on_the_way").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaTruck className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Selesai</p>
                <p className="text-2xl font-bold text-green-600">
                  {reports.filter((r) => r.status === "resolved").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaCheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Riwayat Laporan</h2>
            <p className="text-sm text-gray-600 mt-1">
              Semua laporan kebakaran yang Anda laporkan
            </p>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                <p className="mt-4 text-gray-600">Memuat laporan...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <FaExclamationCircle className="mx-auto text-red-600 mb-4" size={48} />
                <p className="text-red-600 font-semibold">{error}</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12">
                <FaFire className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 font-semibold">Belum ada laporan</p>
                <p className="text-gray-500 text-sm mt-2">
                  Laporan yang Anda buat akan muncul di sini
                </p>
                <Link
                  href="/report/new"
                  className="inline-block mt-4 bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Buat Laporan Pertama
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {reports.map((report) => {
                  const statusInfo = statusConfig[report.status];
                  const StatusIcon = statusInfo.icon;
                  const timelineSteps = getTimelineSteps(report.status);

                  return (
                    <div
                      key={report.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      {/* Report Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}
                            >
                              <StatusIcon className="inline mr-1" size={12} />
                              {statusInfo.label}
                            </span>
                            <span className="text-sm text-gray-500">
                              Laporan #{report.id}
                            </span>
                          </div>
                          <div className="flex items-start gap-2 text-gray-600 mb-2">
                            <FaMapMarkerAlt className="mt-1 flex-shrink-0" size={14} />
                            <span className="text-sm">
                              {report.location_name || `${report.latitude}, ${report.longitude}`}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">{report.description}</p>
                        </div>
                        <button
                          onClick={() => router.push(`/dashboard/report/${report.id}`)}
                          className="ml-4 text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-1"
                        >
                          <FaEye size={14} />
                          Detail
                        </button>
                      </div>

                      {/* Timeline Progress */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between relative">
                          {/* Progress Line */}
                          <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 -z-10">
                            <div
                              className="h-full bg-red-600 transition-all duration-500"
                              style={{
                                width: `${
                                  (timelineSteps.filter((s) => s.completed).length /
                                    (timelineSteps.length - 1)) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>

                          {/* Timeline Steps */}
                          {timelineSteps.map((step, index) => (
                            <div
                              key={index}
                              className="flex flex-col items-center flex-1 relative"
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                  step.completed || step.active
                                    ? "bg-red-600 border-red-600"
                                    : "bg-white border-gray-300"
                                }`}
                              >
                                {step.completed || step.active ? (
                                  <FaCheckCircle className="text-white" size={16} />
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                )}
                              </div>
                              <span
                                className={`text-xs mt-2 text-center ${
                                  step.completed || step.active
                                    ? "text-gray-800 font-semibold"
                                    : "text-gray-500"
                                }`}
                              >
                                {step.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Admin Notes */}
                      {report.admin_notes && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <div className="flex items-start gap-2">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs font-bold">A</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-blue-900 mb-1">
                                Update dari Admin
                              </p>
                              <p className="text-sm text-blue-800">{report.admin_notes}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Timestamps */}
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-200">
                        <span>Dilaporkan: {formatDate(report.created_at)}</span>
                        <span>Update Terakhir: {formatDate(report.updated_at)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
