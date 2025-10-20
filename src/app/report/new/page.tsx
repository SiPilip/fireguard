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
    <div className="mt-4 rounded-lg bg-amber-50 border border-amber-300 p-4">
      <div className="flex items-center gap-3 mb-3">
        <FaFireExtinguisher className="text-amber-600 text-lg" />
        <h3 className="text-md font-bold text-amber-900">Pos Damkar Terdekat</h3>
      </div>
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <FaMapMarkerAlt className="text-amber-600 mt-1 flex-shrink-0" />
          <div>
            <p className="text-xs text-amber-700">Nama Pos</p>
            <p className="text-sm font-semibold text-gray-800">{info.name}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-start gap-2">
            <FaRoad className="text-amber-600 mt-1 flex-shrink-0 text-sm" />
            <div>
              <p className="text-xs text-amber-700">Jarak</p>
              <p className="text-sm font-bold text-gray-800">{distanceInKm} km</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <FaClock className="text-amber-600 mt-1 flex-shrink-0 text-sm" />
            <div>
              <p className="text-xs text-amber-700">Estimasi</p>
              <p className="text-sm font-bold text-gray-800">~{timeInMinutes} menit</p>
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-md">
              <FaFireExtinguisher className="text-white text-xl" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">Buat Laporan Kebakaran</h1>
          </div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
          >
            <FaArrowLeft />
            <span>Kembali</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Map */}
          <div className="space-y-6">
            <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-800">1. Tandai Lokasi Kejadian</h2>
                <p className="text-sm text-gray-500">Klik pada peta untuk menandai lokasi akurat.</p>
              </div>
              <div className="h-[450px] w-full rounded-lg overflow-hidden border-2 border-gray-200">
                <MapWithNoSSR
                  position={position}
                  setPosition={setPosition}
                  onNearestStationFound={setNearestStation}
                />
              </div>
              {nearestStation && <NearestStationInfoBox info={nearestStation} />}
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="space-y-6">
            {/* Incident Details */}
            <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-800">2. Detail Kejadian</h2>
                <p className="text-sm text-gray-500">Berikan informasi yang jelas dan lengkap.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-700">
                    Deskripsi Kejadian <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder:text-gray-600"
                    placeholder="Contoh: Kebakaran rumah, api sudah membesar..."
                    required
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block mb-1 text-sm font-medium text-gray-700">
                    Alamat/Patokan
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder:text-gray-600"
                    placeholder="Contoh: Jl. Merdeka No. 10, dekat Masjid Agung"
                  />
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-800">3. Upload Bukti</h2>
                <p className="text-sm text-gray-500">Unggah foto atau video kejadian.</p>
              </div>
              <div>
                <label htmlFor="media" className="block mb-2 text-sm font-medium text-gray-700">
                  Pilih File <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  id="media"
                  onChange={handleFileChange}
                  accept="image/*,video/*"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-100 file:text-red-700 hover:file:bg-red-200"
                  required
                />
                {file && (
                  <div className="mt-3 text-sm text-green-700">
                    ✓ File terpilih: {file.name}
                  </div>
                )}
              </div>
            </div>
            
            {/* Additional Info */}
            <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-800">4. Info Tambahan</h2>
                <p className="text-sm text-gray-500">Informasi ini sangat membantu petugas.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="notes" className="block mb-1 text-sm font-medium text-gray-700">
                    Catatan Penting
                  </label>
                  <textarea
                    id="notes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder:text-gray-600"
                    placeholder="Contoh: Ada korban terjebak, ada tabung gas..."
                  />
                </div>
                <div>
                  <label htmlFor="contact" className="block mb-1 text-sm font-medium text-gray-700">
                    Nomor Kontak (Opsional)
                  </label>
                  <input
                    type="tel"
                    id="contact"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder:text-gray-600"
                    placeholder="0812-3456-7890"
                  />
                </div>
              </div>
            </div>

            {/* Error and Submit */}
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <div className="flex items-center gap-3">
                    <FaExclamationTriangle className="text-red-500 text-xl" />
                    <p className="text-sm text-red-800 font-medium">{error}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !position || !file}
                className="w-full flex items-center justify-center gap-3 rounded-lg bg-red-600 px-8 py-4 text-lg font-bold text-white shadow-md hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <FaFireExtinguisher />
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