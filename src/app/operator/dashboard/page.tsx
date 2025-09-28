"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import ReportDetailView from "@/components/ReportDetailView";

// Tipe data untuk laporan, dengan tambahan properti UI
interface Report {
  id: number;
  phone_number: string;
  latitude: number;
  longitude: number;
  status: string;
  created_at: string;
  media_url: string;
  acknowledged?: boolean;
}

// Suara notifikasi akan dibuat menggunakan Web Audio API
let audioContext: AudioContext | null = null;
function playWarningSound() {
  if (typeof window === "undefined") return;
  if (!audioContext)
    audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
  if (audioContext.state === "suspended") audioContext.resume();

  const now = audioContext.currentTime;
  const duration = 0.8; // Durasi total satu siklus sirine
  const highPitch = 1000; // Frekuensi tinggi
  const lowPitch = 400; // Frekuensi rendah

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = "sawtooth"; // Gelombang 'sine' menghasilkan suara yang lebih halus
  gainNode.gain.setValueAtTime(0.8, now); // Atur volume

  // Jadwalkan perubahan frekuensi untuk menciptakan efek sirine
  oscillator.frequency.setValueAtTime(lowPitch, now); // Mulai dari nada rendah
  oscillator.frequency.linearRampToValueAtTime(highPitch, now + duration / 2); // Naik ke nada tinggi di tengah durasi
  oscillator.frequency.linearRampToValueAtTime(lowPitch, now + duration); // Kembali ke nada rendah di akhir

  // Mulai dan hentikan osilator sesuai durasi
  oscillator.start(now);
  oscillator.stop(now + duration);
}

export default function OperatorDashboard() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMonitorMode, setIsMonitorMode] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const alarmIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Cek status alarm setiap kali daftar laporan berubah
  useEffect(() => {
    const hasUnacknowledged = reports.some((r) => !r.acknowledged);
    if (isMonitorMode && hasUnacknowledged) {
      startAlarm();
    } else {
      stopAlarm();
    }
    return stopAlarm; // Membersihkan alarm saat unmount
  }, [reports, isMonitorMode, startAlarm, stopAlarm]);

  // Fetch data awal
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch("/api/operator/reports");
        if (!response.ok) throw new Error("Gagal memuat laporan.");
        const data = await response.json();
        setReports(data.map((r: Report) => ({ ...r, acknowledged: true })));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Koneksi WebSocket
  useEffect(() => {
    const ws = new WebSocket(
      `${window.location.protocol === "https" ? "wss" : "ws"}://${
        window.location.host
      }`
    );
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "NEW_REPORT") {
        const newReport: Report = { ...message.payload, acknowledged: false };
        setReports((prev) => [newReport, ...prev]);
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
    return () => ws.close(1000, "Component unmounting");
  }, []);

  const acknowledgeReport = (reportId: number) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, acknowledged: true } : r))
    );
  };

  const handleSelectReport = (reportId: number) => {
    setSelectedReportId(reportId);
    acknowledgeReport(reportId);
  };

  const handleLogout = async () => {
    stopAlarm();
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/operator/login");
  };

  return (
    <div className="h-screen max-h-screen flex flex-col bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-md z-10 flex-shrink-0">
        <nav className="container mx-auto flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-red-500">FireGuard Operator</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-sm">Mode Pantau</span>
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
            <button
              onClick={handleLogout}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </nav>
      </header>

      <main className="container mx-auto flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 overflow-hidden">
        <div className="lg:col-span-1 bg-gray-800 rounded-lg shadow-lg flex flex-col overflow-hidden">
          <h2 className="text-lg font-bold p-4 border-b border-gray-700 flex-shrink-0">
            Laporan Masuk
          </h2>
          <div className="overflow-y-auto p-2 space-y-2 flex-grow">
            {isLoading ? (
              <p className="text-center p-4">Memuat...</p>
            ) : error ? (
              <p className="text-center p-4 text-red-400">{error}</p>
            ) : reports.length > 0 ? (
              reports.map((report) => (
                <div
                  key={report.id}
                  className={`rounded-lg p-3 ${
                    !report.acknowledged ? "animate-pulse-new" : "bg-gray-700"
                  }`}
                >
                  <div
                    onClick={() => handleSelectReport(report.id)}
                    className="cursor-pointer"
                  >
                    <p className="font-semibold">
                      Pelapor: {report.phone_number}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(report.created_at).toLocaleString("id-ID")}
                    </p>
                    <p
                      className={`text-xs font-bold ${
                        report.status === "Pending"
                          ? "text-yellow-400"
                          : "text-green-400"
                      }`}
                    >
                      {report.status}
                    </p>
                  </div>
                  {!report.acknowledged && (
                    <button
                      onClick={() => acknowledgeReport(report.id)}
                      className="mt-2 w-full text-xs bg-gray-600 hover:bg-gray-500 rounded p-1"
                    >
                      Abaikan Notifikasi
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center p-4 text-gray-400">
                Tidak ada laporan.
              </p>
            )}
          </div>
        </div>
        <div className="lg:col-span-2 bg-gray-800 rounded-lg shadow-lg overflow-y-auto">
          {selectedReportId ? (
            <ReportDetailView reportId={selectedReportId} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">
                Pilih laporan dari daftar untuk melihat detail.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
