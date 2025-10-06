"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  FaFire,
  FaTruck,
  FaClock,
  FaBuilding,
  FaList,
  FaMap,
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
} from "react-icons/fa";

// Tipe data untuk laporan
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
  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center gap-4 transition-transform hover:scale-105">
    <div
      className={`w-12 h-12 rounded-md flex items-center justify-center text-white text-2xl ${color}`}
    >
      {icon}
    </div>
    <div>
      <h3 className="text-2xl font-bold">{value}</h3>
      <p className="text-gray-400">{title}</p>
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
      className: "bg-red-500/20 text-red-400 border-red-500/50",
    },
    verified: {
      icon: <FaCheck />,
      text: "Diverifikasi",
      className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    },
    dispatched: {
      icon: <FaTruck />,
      text: "Dikirim",
      className: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    },
    arrived: {
      icon: <FaBuilding />,
      text: "Tiba",
      className: "bg-indigo-500/20 text-indigo-400 border-indigo-500/50",
    },
    completed: {
      icon: <FaCheckCircle />,
      text: "Selesai",
      className: "bg-green-500/20 text-green-400 border-green-500/50",
    },
    false: {
      icon: <FaTimesCircle />,
      text: "Palsu",
      className: "bg-gray-500/20 text-gray-400 border-gray-500/50",
    },
  };

  const config = statusConfig[status] || {
    icon: <FaQuestionCircle />,
    text: status,
    className: "bg-gray-600/20 text-gray-300 border-gray-600/50",
  };

  return (
    <div
      className={`flex items-center gap-2 text-xs font-bold uppercase px-2 py-1 rounded-full border ${config.className}`}
    >
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
};

const getStatusColor = (status: string) => {
  const colors: { [key: string]: string } = {
    submitted: "border-red-500",
    verified: "border-yellow-500",
    dispatched: "border-blue-500",
    arrived: "border-indigo-500",
    completed: "border-green-500",
    false: "border-gray-500",
  };
  return colors[status] || "border-gray-400";
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
    className={`bg-gray-700/50 hover:bg-gray-700 p-4 rounded-lg cursor-pointer transition-all duration-200 border-l-4 ${
      !report.acknowledged
        ? "border-yellow-400 animate-pulse-new"
        : getStatusColor(report.status)
    }`}
  >
    <div className="flex justify-between items-start">
      <div>
        <span className="font-mono text-base font-bold text-white">
          Laporan #{report.id}
        </span>
        <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
          <FaPhone /> {report.phone_number}
        </p>
      </div>
      <StatusBadge status={report.status} />
    </div>
    <p className="text-xs text-gray-500 mt-2">
      {new Date(report.created_at).toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      })}
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
  const alarmIntervalRef = useRef<NodeJS.Timeout | null>(null);
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

  const acknowledgeReport = (reportId: number) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, acknowledged: true } : r))
    );
  };

  const handleSelectReport = (report: Report) => {
    router.push(`/operator/dashboard/${report.id}`);
  };

  const handleUpdateStatus = async (reportId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/operator/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Gagal update status");
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Gagal memperbarui status laporan.");
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
    let reconnectionTimer: NodeJS.Timeout;

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
        alert("Semua laporan berhasil dihapus.");
      } catch (error) {
        console.error("Error deleting all reports:", error);
        alert("Gagal menghapus semua laporan.");
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
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FaFire className="text-red-500 text-2xl" />
            <h1 className="text-xl font-bold">FireGuard Admin</h1>
            <div className="flex items-center gap-2 ml-4">
              <span
                className={`w-3 h-3 rounded-full ${
                  wsStatus === "Connected"
                    ? "bg-green-500"
                    : wsStatus === "Connecting"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              ></span>
              <span className="text-sm text-gray-400">{wsStatus}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Mode Pantau</span>
              <button
                onClick={() => setIsMonitorMode(!isMonitorMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isMonitorMode ? "bg-green-500" : "bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isMonitorMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <FaUserShield />
            <span>Operator Damkar</span>
            <button
              onClick={handleLogout}
              title="Logout"
              className="bg-red-600 hover:bg-red-700 p-2 rounded-full"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 flex-grow">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            icon={<FaFire />}
            title="Laporan Aktif"
            value={activeReportsCount.toString()}
            color="bg-red-500"
          />
          <StatCard
            icon={<FaTruck />}
            title="Unit Dikirim"
            value={dispatchedCount.toString()}
            color="bg-blue-500"
          />
          <StatCard
            icon={<FaClock />}
            title="Rata-rata Respons"
            value="- min"
            color="bg-yellow-500"
          />
          <StatCard
            icon={<FaBuilding />}
            title="Total Pos Damkar"
            value="12"
            color="bg-green-500"
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full min-h-[70vh]">
          <section className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-lg flex flex-col">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FaList /> Daftar Laporan
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchReports}
                  className="text-gray-400 hover:text-white"
                  title="Muat Ulang Laporan"
                >
                  <FaSyncAlt />
                </button>
                <button
                  onClick={handleDeleteAllReports}
                  className="text-gray-400 hover:text-red-500"
                  title="Hapus Semua Laporan"
                >
                  <FaTrash />
                </button>
                <select
                  onChange={(e) => setStatusFilter(e.target.value)}
                  value={statusFilter}
                  className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-sm"
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
            <div className="overflow-y-auto p-4 space-y-3 flex-grow">
              {isLoading ? (
                <p>Memuat laporan...</p>
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

          <section className="lg:col-span-3 bg-gray-800 border border-gray-700 rounded-lg flex flex-col">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FaMap /> Peta Monitoring
              </h2>
            </div>
            <div className="flex-grow h-full w-full">
              <AdminMap reports={reports} onReportClick={handleSelectReport} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
