"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  FaFire,
  FaTruck,
  FaClock,
  FaBuilding,
  FaSyncAlt,
  FaSignOutAlt,
  FaUserShield,
  FaTrash,
  FaFileAlt,
  FaCheck,
  FaCheckCircle,
  FaTimesCircle,
  FaQuestionCircle,
  FaPhone,
  FaTags,
} from "react-icons/fa";
import ReportDetailModal from "@/components/ReportDetailModal";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/Toast";

// Tipe data untuk laporan
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
  acknowledged?: boolean; // Properti UI-only
}

// Dynamic import untuk AdminMap agar tidak ada masalah SSR dengan Leaflet
const AdminMap = dynamic(() => import("@/components/AdminMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-700 flex items-center -z-10 justify-center">
      <p>Memuat Peta...</p>
    </div>
  ),
});

const StatCard = ({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
}) => (
  <div className="bg-white rounded-xl p-3 md:p-5 flex flex-col md:flex-row items-center md:gap-4 gap-2 border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-200">
    <div
      className={`w-10 h-10 md:w-11 md:h-11 rounded-lg flex items-center justify-center text-white text-base md:text-lg ${color} shadow-sm`}
    >
      {icon}
    </div>
    <div className="text-center md:text-left">
      <h3 className="text-xl md:text-2xl font-semibold text-gray-900">{value}</h3>
      <p className="text-xs text-gray-500 mt-0.5">{title}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: {
    [key: string]: { icon: React.ReactNode; text: string; className: string };
  } = {
    submitted: {
      icon: <FaFileAlt />,
      text: "Baru",
      className: "bg-red-50 text-red-600 border-red-200",
    },
    verified: {
      icon: <FaCheck />,
      text: "Diverifikasi",
      className: "bg-yellow-50 text-yellow-600 border-yellow-200",
    },
    dispatched: {
      icon: <FaTruck />,
      text: "Dikirim",
      className: "bg-blue-50 text-blue-600 border-blue-200",
    },
    arrived: {
      icon: <FaBuilding />,
      text: "Tiba",
      className: "bg-indigo-50 text-indigo-600 border-indigo-200",
    },
    completed: {
      icon: <FaCheckCircle />,
      text: "Selesai",
      className: "bg-green-50 text-green-600 border-green-200",
    },
    false: {
      icon: <FaTimesCircle />,
      text: "Palsu",
      className: "bg-gray-50 text-gray-600 border-gray-200",
    },
  };

  const config = statusConfig[status] || {
    icon: <FaQuestionCircle />,
    text: status,
    className: "bg-gray-50 text-gray-600 border-gray-200",
  };

  return (
    <div
      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border ${config.className}`}
    >
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
};

const ReportListItem = ({
  report,
  onSelect,
}: {
  report: Report;
  onSelect: (report: Report) => void;
}) => (
  <div
    onClick={() => onSelect(report)}
    className={`bg-white hover:bg-gray-50 p-4 rounded-xl cursor-pointer transition-all duration-200 border border-gray-200/60 hover:border-gray-300 hover:shadow-sm ${
      !report.acknowledged
        ? "ring-2 ring-yellow-400 ring-offset-2 animate-pulse-new"
        : ""
    }`}
  >
    <div className="flex justify-between items-start gap-3">
      <div className="flex-1">
        <span className="font-semibold text-sm text-gray-900">
          Laporan #{report.id}
        </span>
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
          <FaPhone className="text-[10px]" /> {report.phone_number}
        </p>
      </div>
      <StatusBadge status={report.status} />
    </div>
    <p className="text-xs text-gray-400 mt-2.5">
      {new Date(report.created_at).toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Jakarta",
      })} WIB
    </p>
  </div>
);

// Fungsi suara notifikasi
let audioContext: AudioContext | null = null;
function playWarningSound() {
  if (typeof window === "undefined") return;
  if (!audioContext)
    audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
  if (audioContext.state === "suspended") audioContext.resume();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.type = "sawtooth";
  gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
  oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
  oscillator.frequency.linearRampToValueAtTime(
    1000,
    audioContext.currentTime + 0.25
  );
  oscillator.frequency.linearRampToValueAtTime(
    400,
    audioContext.currentTime + 0.5
  );
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}

export default function OperatorDashboard() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("all");
  const [isMonitorMode, setIsMonitorMode] = useState(false);
  const [wsStatus, setWsStatus] = useState("Connecting");
  const alarmIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ws = useRef<WebSocket | null>(null);

  const stopAlarm = useCallback(() => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  }, []);

  const startAlarm = useCallback(() => {
    stopAlarm();
    playWarningSound();
    alarmIntervalRef.current = setInterval(playWarningSound, 500);
  }, [stopAlarm]);

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const { toast, success, error, hideToast } = useToast();

  const handleSelectReport = (report: Report) => {
    setSelectedReport(report);
  };

  const handleCloseModal = () => {
    setSelectedReport(null);
  };

  const handleUpdateStatus = async (reportId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/operator/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) throw new Error("Gagal update status");
      
      // Update report di state
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId ? { ...r, status: newStatus } : r
        )
      );

      // Update selected report jika masih dibuka
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport({ ...selectedReport, status: newStatus });
      }

      success("Status laporan berhasil diperbarui!");
    } catch (err) {
      console.error("Error updating status:", err);
      error("Gagal memperbarui status laporan.");
    }
  };

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/operator/reports");
      if (!response.ok) throw new Error("Gagal memuat laporan");
      const data = await response.json();
      setReports(data.map((r: Report) => ({ ...r, acknowledged: true })));
    } catch (error) {
      console.error("Gagal memuat laporan", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    const hasUnacknowledged = reports.some((r) => !r.acknowledged);
    if (isMonitorMode && hasUnacknowledged) {
      startAlarm();
    } else {
      stopAlarm();
    }
    return stopAlarm;
  }, [reports, isMonitorMode, startAlarm, stopAlarm]);

  useEffect(() => {
    let reconnectionTimer: ReturnType<typeof setTimeout>;

    const connect = () => {
      const wsProtocol = window.location.protocol === "https" ? "wss" : "ws";
      const wsUrl = `${wsProtocol}://${window.location.host}/ws`;
      const socket = new WebSocket(wsUrl);
      ws.current = socket;

      socket.onopen = () => {
        console.log("WebSocket connection established");
        setWsStatus("Connected");
      };

      socket.onmessage = (event) => {
        console.log("WebSocket message received:", event.data);
        const message = JSON.parse(event.data);
        if (message.type === "NEW_REPORT") {
          setReports((prev) => [
            { ...message.payload, acknowledged: false },
            ...prev,
          ]);
        } else if (message.type === "STATUS_UPDATE") {
          setReports((prev) =>
            prev.map((r) =>
              r.id === message.payload.reportId
                ? { ...r, status: message.payload.newStatus }
                : r
            )
          );
        }
      };

      socket.onclose = (event) => {
        console.log("WebSocket connection closed", event.code, event.reason);
        setWsStatus(`Closed (${event.code})`);
        // Implement reconnection logic
        reconnectionTimer = setTimeout(() => {
          console.log("Attempting to reconnect WebSocket...");
          connect();
        }, 5000); // Try to reconnect every 5 seconds
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setWsStatus("Error");
        socket.close(); // This will trigger the onclose event and reconnection logic
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectionTimer);
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const handleLogout = async () => {
    stopAlarm();
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/operator/login");
  };

  const handleDeleteAllReports = async () => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin menghapus SEMUA laporan? Tindakan ini tidak dapat diurungkan."
      )
    ) {
      try {
        const response = await fetch("/api/operator/reports", {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Gagal menghapus laporan.");
        setReports([]);
        success("Semua laporan berhasil dihapus.");
      } catch (err) {
        console.error("Error deleting all reports:", err);
        error("Gagal menghapus semua laporan.");
      }
    }
  };

  const filteredReports = reports.filter(
    (report) => statusFilter === "all" || report.status === statusFilter
  );
  const activeReportsCount = reports.filter(
    (r) => r.status !== "completed"
  ).length;
  const dispatchedCount = reports.filter(
    (r) => r.status === "dispatched" || r.status === "arrived"
  ).length;

  return (
    <>
      {toast.show && <Toast {...toast} onClose={hideToast} />}
      
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={handleCloseModal}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 font-sans flex flex-col">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="bg-gradient-to-br from-red-500 to-orange-600 p-2 md:p-2.5 rounded-xl shadow-sm">
                <FaFire className="text-white text-base md:text-lg" />
              </div>
              <div>
                <h1 className="text-sm md:text-lg font-semibold text-gray-900">FireGuard Admin</h1>
                <p className="text-xs text-gray-500 hidden md:block">Dashboard Operator</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-2 md:px-3 py-1.5 bg-gray-100 rounded-lg">
              <span
                className={`w-2 h-2 rounded-full ${
                  wsStatus === "Connected"
                    ? "bg-green-500 animate-pulse"
                    : wsStatus === "Connecting"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              ></span>
              <span className="text-xs font-medium text-gray-600">{wsStatus}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => router.push('/operator/categories')}
              title="Kelola Kategori Bencana"
              className="bg-blue-500 hover:bg-blue-600 p-2 md:p-2.5 rounded-xl transition-colors shadow-sm flex items-center gap-2"
            >
              <FaTags className="text-white text-sm" />
              <span className="hidden md:inline text-xs font-medium text-white">Kategori</span>
            </button>
            <div className="hidden md:flex items-center gap-2.5 px-3 py-2 bg-gray-100 rounded-xl">
              <span className="text-xs font-medium text-gray-700">Mode Pantau</span>
              <button
                onClick={() => setIsMonitorMode(!isMonitorMode)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  isMonitorMode ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${
                    isMonitorMode ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-xl">
              <FaUserShield className="text-gray-600 text-sm" />
              <span className="text-xs font-medium text-gray-700">Operator Damkar</span>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="bg-red-500 hover:bg-red-600 p-2 md:p-2.5 rounded-xl transition-colors shadow-sm"
            >
              <FaSignOutAlt className="text-white text-sm" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 md:p-6 flex-grow">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-4 md:mb-6">
          <StatCard
            icon={<FaFire />}
            title="Laporan Aktif"
            value={activeReportsCount.toString()}
            color="bg-gradient-to-br from-red-500 to-orange-600"
          />
          <StatCard
            icon={<FaTruck />}
            title="Unit Dikirim"
            value={dispatchedCount.toString()}
            color="bg-gradient-to-br from-blue-500 to-cyan-600"
          />
          <StatCard
            icon={<FaClock />}
            title="Rata-rata Respons"
            value="- min"
            color="bg-gradient-to-br from-yellow-500 to-amber-600"
          />
          <StatCard
            icon={<FaBuilding />}
            title="Total Pos Damkar"
            value="8"
            color="bg-gradient-to-br from-green-500 to-emerald-600"
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-5 h-full min-h-[70vh]">
          <section className="lg:col-span-2 bg-white border border-gray-200/60 rounded-xl md:rounded-2xl shadow-sm flex flex-col overflow-hidden order-2 lg:order-1">
            <div className="px-5 py-4 border-b border-gray-200/60 flex justify-between items-center flex-shrink-0 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
                <h2 className="text-base font-semibold text-gray-900">Daftar Laporan</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchReports}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Muat Ulang Laporan"
                >
                  <FaSyncAlt className="text-sm" />
                </button>
                <button
                  onClick={handleDeleteAllReports}
                  className="text-gray-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Hapus Semua Laporan"
                >
                  <FaTrash className="text-sm" />
                </button>
                <select
                  onChange={(e) => setStatusFilter(e.target.value)}
                  value={statusFilter}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                >
                  <option value="all">Semua Status</option>
                  <option value="submitted">Baru</option>
                  <option value="verified">Diverifikasi</option>
                  <option value="dispatched">Dikirim</option>
                  <option value="arrived">Tiba</option>
                  <option value="completed">Selesai</option>
                  <option value="false">Palsu</option>
                </select>
              </div>
            </div>
            <div className="overflow-y-auto p-4 space-y-2.5 flex-grow bg-gray-50/30">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-solid border-red-500 border-r-transparent mb-3"></div>
                    <p className="text-sm text-gray-500">Memuat laporan...</p>
                  </div>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-sm text-gray-500">Tidak ada laporan</p>
                </div>
              ) : (
                filteredReports.map((report) => (
                  <ReportListItem
                    key={report.id}
                    report={report}
                    onSelect={handleSelectReport}
                  />
                ))
              )}
            </div>
          </section>

          <section className="lg:col-span-3 bg-white border border-gray-200/60 rounded-xl md:rounded-2xl shadow-sm overflow-hidden flex flex-col order-1 lg:order-2 min-h-[400px] md:min-h-[500px]">
            <div className="px-5 py-4 border-b border-gray-200/60 flex justify-between items-center flex-shrink-0 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
                <h2 className="text-base font-semibold text-gray-900">Peta Monitoring</h2>
              </div>
            </div>
            <div className="flex-grow h-full w-full">
              <AdminMap reports={reports} onReportClick={handleSelectReport} selectedReport={selectedReport} />
            </div>
          </section>
        </div>
      </main>
      </div>
    </>
  );
}
