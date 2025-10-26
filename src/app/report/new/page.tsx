"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { NearestStationInfo } from "@/components/ReportMap";
import { useModal } from "@/hooks/useModal";
import { useToast } from "@/hooks/useToast";
import Modal from "@/components/Modal";
import Toast from "@/components/Toast";
import {
  FaMapMarkerAlt,
  FaArrowLeft,
  FaFireExtinguisher,
  FaClock,
  FaRoad,
  FaExclamationTriangle,
} from "react-icons/fa";

const MapWithNoSSR = dynamic(() => import("@/components/ReportMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse bg-gray-200 flex items-center justify-center rounded-lg">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
        <p className="text-gray-600 mt-4 font-medium">Memuat Peta...</p>
      </div>
    </div>
  ),
});

function NearestStationInfoBox({ info }: { info: NearestStationInfo }) {
  const distanceInKm = (info.distance / 1000).toFixed(2);
  const timeInMinutes = Math.round(info.time / 60);

  return (
    <div className="mt-5 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200/60 p-5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2 bg-orange-100 rounded-lg">
          <FaFireExtinguisher className="text-orange-600 text-base" />
        </div>
        <h3 className="text-sm font-semibold text-gray-800">Pos Damkar Terdekat</h3>
      </div>
      <div className="space-y-3">
        <div className="flex items-start gap-3 pb-3 border-b border-orange-200/50">
          <FaMapMarkerAlt className="text-orange-500 mt-0.5 flex-shrink-0 text-sm" />
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-0.5">Nama Pos</p>
            <p className="text-sm font-medium text-gray-900">{info.name}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 bg-orange-100 rounded-md">
              <FaRoad className="text-orange-600 text-xs" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Jarak</p>
              <p className="text-base font-semibold text-gray-900">{distanceInKm} km</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 bg-orange-100 rounded-md">
              <FaClock className="text-orange-600 text-xs" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Estimasi</p>
              <p className="text-base font-semibold text-gray-900">~{timeInMinutes} min</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewReportPage() {
  const router = useRouter();
  const { modal, success, error: showError } = useModal();
  const { toast, error: errorToast, hideToast } = useToast();

  const [position, setPosition] = useState<[number, number] | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [contact, setContact] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [nearestStation, setNearestStation] =
    useState<NearestStationInfo | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          router.replace("/login?redirect=/report/new");
        }
      } catch (error) {
        console.error("Authentication check failed", error);
        router.replace("/login?redirect=/report/new");
      } finally {
        setIsAuthenticating(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!position) {
      setError("Lokasi belum ditentukan. Mohon tandai lokasi di peta.");
      return;
    }
    if (!file) {
      setError("Bukti foto/video belum diunggah.");
      return;
    }

    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("latitude", position[0].toString());
    formData.append("longitude", position[1].toString());
    formData.append("description", description);
    formData.append("address", address);
    formData.append("media", file);
    formData.append("notes", notes);
    formData.append("contact", contact);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401) {
          showError(
            "Sesi Berakhir",
            "Sesi Anda telah berakhir. Silakan login kembali.",
            () => router.push("/login")
          );
          return;
        }
        throw new Error(data.message || "Gagal mengirim laporan.");
      }

      success(
        "Laporan Terkirim!",
        "Laporan Anda akan segera ditindaklanjuti oleh petugas.",
        () => router.push("/")
      );
    } catch (err: any) {
      errorToast(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent mb-4"></div>
          <p className="text-gray-700 font-medium text-lg">Memverifikasi sesi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center gap-4 px-6 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-all rounded-xl hover:bg-gray-100"
          >
            <FaArrowLeft className="text-xs" />
            <span>Kembali</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-red-500 to-orange-600 p-2.5 rounded-xl shadow-sm">
              <FaFireExtinguisher className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Laporan Baru</h1>
              <p className="text-xs text-gray-500">Laporkan kejadian kebakaran</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column: Map */}
          <div className="lg:col-span-3 space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-5 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Lokasi Kejadian</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Klik peta untuk menandai lokasi</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="h-[420px] w-full rounded-xl overflow-hidden border border-gray-200 relative z-0">
                  <MapWithNoSSR
                    position={position}
                    setPosition={setPosition}
                    onNearestStationFound={setNearestStation}
                  />
                </div>
                {nearestStation && <NearestStationInfoBox info={nearestStation} />}
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-2 space-y-5">
            {/* Incident Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-5 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
                  <h2 className="text-base font-semibold text-gray-900">Detail Kejadian</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="description" className="block mb-2 text-xs font-medium text-gray-700">
                    Deskripsi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-gray-400"
                    placeholder="Kebakaran rumah, api sudah membesar..."
                    required
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block mb-2 text-xs font-medium text-gray-700">
                    Alamat/Patokan
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-gray-400"
                    placeholder="Jl. Merdeka No. 10, dekat Masjid Agung"
                  />
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-5 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
                  <h2 className="text-base font-semibold text-gray-900">Bukti Kejadian</h2>
                </div>
              </div>
              <div className="p-6">
                <label htmlFor="media" className="block mb-2 text-xs font-medium text-gray-700">
                  Upload Foto/Video <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="media"
                    onChange={handleFileChange}
                    accept="image/*,video/*"
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-gradient-to-r file:from-red-500 file:to-orange-500 file:text-white hover:file:from-red-600 hover:file:to-orange-600 file:transition-all file:cursor-pointer cursor-pointer border border-gray-200 rounded-xl p-2"
                    required
                  />
                </div>
                {file && (
                  <div className="mt-3 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-700 font-medium">✓ {file.name}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Additional Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-5 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
                  <h2 className="text-base font-semibold text-gray-900">Info Tambahan</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="notes" className="block mb-2 text-xs font-medium text-gray-700">
                    Catatan Penting
                  </label>
                  <textarea
                    id="notes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-gray-400"
                    placeholder="Ada korban terjebak, ada tabung gas..."
                  />
                </div>
                <div>
                  <label htmlFor="contact" className="block mb-2 text-xs font-medium text-gray-700">
                    Nomor Kontak (Opsional)
                  </label>
                  <input
                    type="tel"
                    id="contact"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-gray-400"
                    placeholder="0812-3456-7890"
                  />
                </div>
              </div>
            </div>

            {/* Error and Submit */}
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <FaExclamationTriangle className="text-red-500 text-base mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !position || !file}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 hover:from-red-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Mengirim Laporan...</span>
                  </>
                ) : (
                  <>
                    <FaFireExtinguisher className="text-base" />
                    <span>Kirim Laporan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>

      {modal.show && (
        <Modal
          type={modal.type}
          title={modal.title}
          message={modal.message}
          onConfirm={modal.onConfirm}
          onCancel={modal.onCancel}
          confirmText={modal.confirmText}
          cancelText={modal.cancelText}
        />
      )}

      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={hideToast}
        />
      )}
    </div>
  );
}