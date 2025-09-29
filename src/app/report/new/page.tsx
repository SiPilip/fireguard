"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Komponen peta di-import secara dinamis untuk menghindari masalah SSR dengan Leaflet
const MapWithNoSSR = dynamic(() => import("@/components/ReportMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse bg-gray-200">
      Memuat Peta...
    </div>
  ),
});

export default function NewReportPage() {
  const router = useRouter();
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!position) {
      setError(
        "Lokasi belum ditentukan. Klik tombol untuk mendapatkan lokasi Anda."
      );
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
    formData.append("media", file);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal mengirim laporan.");
      }

      alert("Laporan berhasil dikirim!");
      router.push("/"); // Kembali ke dashboard setelah berhasil
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-red-600">Laporan Baru</h1>
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
          className="rounded-lg bg-white p-8 shadow"
        >
          <div className="mb-6">
            <label className="mb-2 block text-lg font-medium text-gray-800">
              Lokasi Kejadian
            </label>
            <div className="h-[30rem] w-full rounded-md border border-gray-300 overflow-hidden">
              <MapWithNoSSR position={position} setPosition={setPosition} />
            </div>
          </div>

          <div className="mb-6">
            <label
              htmlFor="media"
              className="mb-2 block text-lg font-medium text-gray-800"
            >
              Bukti Foto/Video
            </label>
            <input
              type="file"
              id="media"
              onChange={handleFileChange}
              accept="image/*,video/*"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
              required
            />
          </div>

          {error && (
            <p className="mb-4 text-center text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading || !position || !file}
            className="w-full rounded-lg bg-red-600 px-5 py-3 text-center font-semibold text-white shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isLoading ? "Mengirim Laporan..." : "Kirim Laporan"}
          </button>
        </form>
      </main>
    </div>
  );
}
