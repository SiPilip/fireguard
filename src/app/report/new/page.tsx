"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { NearestStationInfo } from "@/components/ReportMap";
import { useModal } from "@/hooks/useModal";
import { useToast } from "@/hooks/useToast";
import Modal from "@/components/Modal";
import Toast from "@/components/Toast";

const MapWithNoSSR = dynamic(() => import("@/components/ReportMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse bg-gray-200 flex items-center justify-center">
      <p className="text-gray-500">Memuat Peta...</p>
    </div>
  ),
});

function NearestStationInfoBox({ info }: { info: NearestStationInfo }) {
    const distanceInKm = (info.distance / 1000).toFixed(2);
    const timeInMinutes = Math.round(info.time / 60);

    return (
        <div className="mt-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4">
            <h3 className="text-lg font-bold text-yellow-800">Informasi Pos Damkar Terdekat</h3>
            <div className="mt-2 text-sm text-gray-700 grid grid-cols-2 gap-x-4 gap-y-1">
                <p><strong>Nama:</strong></p><p>{info.name}</p>
                <p><strong>Jarak:</strong></p><p>{distanceInKm} km</p>
                <p><strong>Waktu Tempuh:</strong></p><p>~{timeInMinutes} menit</p>
            </div>
        </div>
    )
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
  const [nearestStation, setNearestStation] = useState<NearestStationInfo | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.replace('/login?redirect=/report/new');
        }
      } catch (error) {
        console.error('Authentication check failed', error);
        router.replace('/login?redirect=/report/new');
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
            () => router.push('/login')
          );
          return;
        }
        throw new Error(data.message || "Gagal mengirim laporan.");
      }

      success(
        "Laporan Berhasil Dikirim!",
        "Terima kasih atas partisipasi Anda. Laporan Anda telah diterima dan akan segera ditindaklanjuti oleh petugas.",
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
      <div className="flex items-center justify-center min-h-screen">
        <p>Memverifikasi sesi...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-red-600">Laporan Darurat Kebakaran</h1>
          <button
            onClick={() => router.back()}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Kembali
          </button>
        </nav>
      </header>

      <main className="container mx-auto p-4">
        <form
          onSubmit={handleSubmit}
          className="rounded-lg bg-white p-6 sm:p-8 shadow-lg"
        >
          {/* Bagian Peta */}
          <div className="mb-8">
            <label className="mb-3 block text-xl font-semibold text-gray-800">
              1. Tandai Lokasi Kejadian
            </label>
            <div className="h-[30rem] w-full rounded-md border-2 border-gray-300 overflow-hidden">
              <MapWithNoSSR 
                position={position} 
                setPosition={setPosition} 
                onNearestStationFound={setNearestStation}
              />
            </div>
            {nearestStation && <NearestStationInfoBox info={nearestStation} />}
          </div>

          {/* Bagian Detail Laporan */}
          <div className="space-y-6 mb-8">
            <div>
              <label htmlFor="description" className="mb-3 block text-xl font-semibold text-gray-800">
                2. Deskripsi Kejadian
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border-2 border-gray-400 rounded-md shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-500 text-base"
                placeholder="Jelaskan kondisi kebakaran (tingkat keparahan, jenis bangunan, dll)"
                required
              />
            </div>

            <div>
              <label htmlFor="address" className="mb-3 block text-xl font-semibold text-gray-800">
                3. Alamat/Patokan Lokasi
              </label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 border-2 border-gray-400 rounded-md shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-500 text-base"
                placeholder="Contoh: Jl. Merdeka No. 123, dekat Alfamart"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="media" className="mb-3 block text-xl font-semibold text-gray-800">
                  4. Unggah Bukti
                </label>
                <input
                  type="file"
                  id="media"
                  onChange={handleFileChange}
                  accept="image/*,video/*"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                  required
                />
                 <p className="text-xs text-gray-500 mt-2">Unggah foto atau video singkat dari lokasi kejadian.</p>
              </div>
            </div>

            <div className="space-y-6">
                <label className="mb-3 block text-xl font-semibold text-gray-800">
                  5. Info Tambahan
                </label>
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Catatan Penting</label>
                    <textarea
                        id="notes"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-3 border-2 border-gray-400 rounded-md shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-500 text-base"
                        placeholder="Contoh: Ada orang terjebak, api dekat tabung gas, akses jalan sempit"
                    />
                </div>
                <div>
                    <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">Nomor Kontak (Opsional)</label>
                    <input
                        type="tel"
                        id="contact"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        className="w-full p-3 border-2 border-gray-400 rounded-md shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-500 text-base"
                        placeholder="Nomor yang bisa dihubungi oleh petugas"
                    />
                </div>
            </div>
          </div>

          {error && (
            <p className="mt-6 text-center text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>
          )}

          <div className="mt-8 border-t pt-6">
            <button
              type="submit"
              disabled={isLoading || !position || !file}
              className="w-full rounded-lg bg-red-600 px-5 py-4 text-center text-lg font-semibold text-white shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400 transition-all duration-300"
            >
              {isLoading ? "Mengirim Laporan..." : "KIRIM LAPORAN SEKARANG"}
            </button>
          </div>
        </form>
      </main>

      {/* Modal */}
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

      {/* Toast */}
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
