"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaTags, FaArrowLeft, FaLayerGroup, FaMapMarkerAlt, FaFireExtinguisher, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/Toast";

// --- Kategori Laporan ---
interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  description: string | null;
}

// --- Kelurahan ---
interface Kelurahan {
  id: number;
  name: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  latitude: number | null;
  longitude: number | null;
}

// --- Pos Pemadam ---
interface PosPemadam {
  id: number;
  name: string;
  kelurahan_id: number | null;
  address: string | null;
  latitude: number;
  longitude: number;
  contact_phone: string | null;
  status: "aktif" | "nonaktif";
  equipment_details: any;
}


export default function ManagementPage() {
  const router = useRouter();
  const { toast, success, error, hideToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<"kategori" | "kelurahan" | "pos">("kategori");
  const [isLoading, setIsLoading] = useState(true);

  // Data States
  const [categories, setCategories] = useState<Category[]>([]);
  const [kelurahans, setKelurahans] = useState<Kelurahan[]>([]);
  const [posPemadam, setPosPemadam] = useState<PosPemadam[]>([]);

  // Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "kategori") {
        const res = await fetch("/api/categories");
        if (res.ok) setCategories(await res.json());
      } else if (activeTab === "kelurahan") {
        const res = await fetch("/api/kelurahan");
        if (res.ok) setKelurahans(await res.json());
      } else if (activeTab === "pos") {
        const res = await fetch("/api/fire-stations");
        if (res.ok) setPosPemadam(await res.json());
      }
    } catch (err) {
      error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);


  return (
    <>
      {toast.show && <Toast {...toast} onClose={hideToast} />}
      
      <div className="min-h-screen bg-[#FAFAFA] text-gray-900 font-sans selection:bg-red-500/30 font-medium">
        
        <header className="bg-white border-b border-gray-200/70 sticky top-0 z-40">
          <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
             <div className="flex items-center gap-6">
                <button 
                  onClick={() => router.push('/operator/dashboard')}
                  className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors group"
                >
                  <FaArrowLeft className="text-gray-400 group-hover:text-gray-900 transition-colors text-sm" />
                </button>
                <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shadow-inner border border-gray-200/50">
                    <FaTags className="text-gray-500 text-lg" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold tracking-tight text-gray-900">Manajemen <span className="text-red-500">Data</span></h1>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Master Data Sistem</p>
                  </div>
                </div>
             </div>
             
             <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200/60">
                <button 
                  onClick={() => setActiveTab("kategori")}
                  className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'kategori' ? 'bg-white text-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.05)]' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
                >
                  <FaLayerGroup /> Kategori
                </button>
                <button 
                  onClick={() => setActiveTab("kelurahan")}
                  className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'kelurahan' ? 'bg-white text-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.05)]' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
                >
                  <FaMapMarkerAlt /> Kelurahan
                </button>
                <button 
                  onClick={() => setActiveTab("pos")}
                  className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'pos' ? 'bg-white text-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.05)]' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
                >
                  <FaFireExtinguisher /> Pos Pemadam
                </button>
             </div>
          </div>
        </header>

        <main className="max-w-[1600px] mx-auto p-8">
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
                {activeTab === "kategori" && "Kategori Darurat"}
                {activeTab === "kelurahan" && "Area Kelurahan"}
                {activeTab === "pos" && "Pos Pemadam"}
              </h2>
              <p className="text-gray-500 font-normal mt-1">
                Kelola master data untuk referensi operasional sistem.
              </p>
            </div>
            
            <button className="bg-gray-900 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm transition-colors shadow-lg shadow-black/5 hover:shadow-red-500/20 group">
              <FaPlus className="text-xs group-hover:scale-110 transition-transform" /> Tambah Baru
            </button>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="h-64 flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-4 border-gray-100 border-t-red-500 rounded-full animate-spin"></div>
                <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Memuat Data...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200">
                      {activeTab === "kategori" && (
                        <>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-16">ID</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-20">Ikon</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Kategori</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                        </>
                      )}
                      {activeTab === "kelurahan" && (
                        <>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-16">ID</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Kelurahan</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Kecamatan</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                        </>
                      )}
                      {activeTab === "pos" && (
                        <>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-16">ID</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Pos</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Kontak</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {activeTab === "kategori" && categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4 text-sm text-gray-400 font-bold">{cat.id}</td>
                        <td className="px-6 py-4 text-2xl" style={{color: cat.color}}>{cat.icon}</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{cat.name}</td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><FaEdit /></button>
                             <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><FaTrash /></button>
                           </div>
                        </td>
                      </tr>
                    ))}
                    
                    {activeTab === "kelurahan" && kelurahans.map((kel) => (
                      <tr key={kel.id} className="hover:bg-gray-50/50 transition-colors group">
                         <td className="px-6 py-4 text-sm text-gray-400 font-bold">{kel.id}</td>
                         <td className="px-6 py-4 text-sm font-bold text-gray-900">{kel.name}</td>
                         <td className="px-6 py-4 text-sm text-gray-500">{kel.kecamatan}</td>
                         <td className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><FaEdit /></button>
                             <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><FaTrash /></button>
                           </div>
                        </td>
                      </tr>
                    ))}

                    {activeTab === "pos" && posPemadam.map((pos) => (
                      <tr key={pos.id} className="hover:bg-gray-50/50 transition-colors group">
                         <td className="px-6 py-4 text-sm text-gray-400 font-bold">{pos.id}</td>
                         <td className="px-6 py-4 text-sm font-bold text-gray-900">{pos.name}</td>
                         <td className="px-6 py-4">
                           <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${pos.status === 'aktif' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                             <span className={`w-1.5 h-1.5 rounded-full ${pos.status === 'aktif' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                             {pos.status.toUpperCase()}
                           </span>
                         </td>
                         <td className="px-6 py-4 text-sm text-gray-500 font-mono">{pos.contact_phone || '-'}</td>
                         <td className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><FaEdit /></button>
                             <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><FaTrash /></button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Empty states */}
                {activeTab === "kategori" && categories.length === 0 && !isLoading && (
                  <div className="p-8 text-center text-gray-400 text-sm font-medium">Belum ada data kategori</div>
                )}
                {activeTab === "kelurahan" && kelurahans.length === 0 && !isLoading && (
                  <div className="p-8 text-center text-gray-400 text-sm font-medium">Belum ada data kelurahan</div>
                )}
                {activeTab === "pos" && posPemadam.length === 0 && !isLoading && (
                  <div className="p-8 text-center text-gray-400 text-sm font-medium">Belum ada data pos pemadam</div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

