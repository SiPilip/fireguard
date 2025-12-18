"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
    FaFire,
    FaSignOutAlt,
    FaChartBar,
    FaArrowLeft,
    FaCalendarAlt,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaMapMarkerAlt,
    FaMap,
} from "react-icons/fa";

// Dynamic import for map to avoid SSR issues
const HotspotMap = dynamic(() => import("@/components/HotspotMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
            <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-500 border-r-transparent mb-2"></div>
                <p className="text-sm text-gray-500">Memuat peta...</p>
            </div>
        </div>
    ),
});

interface CategoryStat {
    category_id: number;
    category_name: string;
    category_icon: string;
    total: number;
}

interface KelurahanStat {
    kelurahan_id: number;
    kelurahan_name: string;
    kecamatan: string;
    total: number;
}

interface StatusStat {
    status: string;
    total: number;
}

interface MonthlyStats {
    month: number;
    month_name: string;
    total: number;
}

interface YearlyStats {
    year: number;
    total: number;
}

interface Hotspot {
    fire_latitude: number;
    fire_longitude: number;
    kelurahan_name: string;
    category_name: string;
    category_icon: string;
    created_at: string;
}

interface Statistics {
    selectedYear: number;
    availableYears: number[];
    totalReports: number;
    yearlyStats: YearlyStats[];
    kelurahanStats: KelurahanStat[];
    categoryStats: CategoryStat[];
    monthlyStats: MonthlyStats[];
    statusStats: StatusStat[];
    hotspots: Hotspot[];
}

const MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

const STATUS_LABELS: { [key: string]: { label: string; color: string } } = {
    pending: { label: "Menunggu", color: "#EAB308" },
    submitted: { label: "Baru", color: "#EF4444" },
    verified: { label: "Diverifikasi", color: "#F59E0B" },
    diproses: { label: "Diproses", color: "#3B82F6" },
    dispatched: { label: "Dikirim", color: "#3B82F6" },
    dikirim: { label: "Tim Dikirim", color: "#8B5CF6" },
    arrived: { label: "Tiba", color: "#6366F1" },
    ditangani: { label: "Ditangani", color: "#06B6D4" },
    completed: { label: "Selesai", color: "#10B981" },
    selesai: { label: "Selesai", color: "#10B981" },
    false: { label: "Palsu", color: "#6B7280" },
    dibatalkan: { label: "Dibatalkan", color: "#DC2626" },
};

// Simple Bar Chart Component
const BarChart = ({
    data,
    labels,
    title,
    color = "#EF4444",
    maxHeight = 200,
}: {
    data: number[];
    labels: string[];
    title: string;
    color?: string;
    maxHeight?: number;
}) => {
    const maxValue = Math.max(...data, 1);

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">{title}</h3>
            <div className="flex items-end gap-2 justify-between" style={{ height: maxHeight }}>
                {data.map((value, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs font-medium text-gray-700">{value}</span>
                        <div
                            className="w-full rounded-t-md transition-all duration-500 hover:opacity-80"
                            style={{
                                height: `${(value / maxValue) * (maxHeight - 40)}px`,
                                backgroundColor: color,
                                minHeight: value > 0 ? "4px" : "0px",
                            }}
                        />
                        <span className="text-[10px] text-gray-500 mt-1">{labels[index]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Kelurahan Ranking Chart
const KelurahanRankingChart = ({
    data,
    title,
    year,
}: {
    data: KelurahanStat[];
    title: string;
    year: number;
}) => {
    const maxValue = Math.max(...data.map((d) => d.total), 1);
    const topData = data.slice(0, 10); // Top 10 only

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">{title}</h3>
            <p className="text-xs text-gray-500 mb-4">Lokasi dengan kejadian terbanyak tahun {year}</p>
            <div className="space-y-3">
                {topData.length > 0 ? topData.map((item, index) => (
                    <div key={item.kelurahan_id || index} className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-500 text-white' :
                                index === 1 ? 'bg-gray-400 text-white' :
                                    index === 2 ? 'bg-amber-700 text-white' :
                                        'bg-gray-100 text-gray-600'
                            }`}>
                            {index + 1}
                        </span>
                        <FaMapMarkerAlt className="text-red-500 text-sm" />
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-800">{item.kelurahan_name || 'Tidak Diketahui'}</span>
                                    {item.kecamatan && (
                                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">
                                            Kec. {item.kecamatan}
                                        </span>
                                    )}
                                </div>
                                <span className="text-sm font-bold text-red-600">{item.total} kejadian</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                    className="h-2 rounded-full transition-all duration-500 bg-gradient-to-r from-red-500 to-orange-500"
                                    style={{
                                        width: `${(item.total / maxValue) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )) : (
                    <p className="text-sm text-gray-500 text-center py-4">Belum ada data</p>
                )}
            </div>
        </div>
    );
};

// Category Statistics Chart
const CategoryChart = ({
    data,
    title,
}: {
    data: CategoryStat[];
    title: string;
}) => {
    const maxValue = Math.max(...data.map((d) => d.total), 1);

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">{title}</h3>
            <div className="space-y-3">
                {data.length > 0 ? data.map((item) => (
                    <div key={item.category_id} className="flex items-center gap-3">
                        <span className="text-2xl w-8">{item.category_icon || '🔥'}</span>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-700">
                                    {item.category_name || 'Kebakaran'}
                                </span>
                                <span className="text-sm font-semibold text-gray-800">{item.total}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                <div
                                    className="h-2.5 rounded-full transition-all duration-500 bg-gradient-to-r from-orange-500 to-red-500"
                                    style={{
                                        width: `${(item.total / maxValue) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )) : (
                    <p className="text-sm text-gray-500 text-center py-4">Belum ada data</p>
                )}
            </div>
        </div>
    );
};

// Yearly Comparison Chart
const YearlyComparisonChart = ({
    data,
    title,
    selectedYear,
}: {
    data: YearlyStats[];
    title: string;
    selectedYear: number;
}) => {
    const maxValue = Math.max(...data.map((d) => d.total), 1);

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">{title}</h3>
            <div className="space-y-3">
                {data.length > 0 ? data.map((item) => (
                    <div key={item.year} className={`flex items-center gap-3 p-2 rounded-lg ${item.year === selectedYear ? 'bg-red-50 border border-red-200' : ''
                        }`}>
                        <FaCalendarAlt className={`text-sm ${item.year === selectedYear ? 'text-red-500' : 'text-gray-400'}`} />
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <span className={`text-sm font-semibold ${item.year === selectedYear ? 'text-red-600' : 'text-gray-700'}`}>
                                    Tahun {item.year}
                                </span>
                                <span className={`text-sm font-bold ${item.year === selectedYear ? 'text-red-600' : 'text-gray-800'}`}>
                                    {item.total} laporan
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-500 ${item.year === selectedYear
                                            ? 'bg-gradient-to-r from-red-500 to-orange-500'
                                            : 'bg-gray-400'
                                        }`}
                                    style={{
                                        width: `${(item.total / maxValue) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )) : (
                    <p className="text-sm text-gray-500 text-center py-4">Belum ada data</p>
                )}
            </div>
        </div>
    );
};

// Status Distribution Chart
const StatusChart = ({
    data,
    title,
}: {
    data: StatusStat[];
    title: string;
}) => {
    const total = data.reduce((acc, curr) => acc + curr.total, 0);

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">{title}</h3>
            <div className="grid grid-cols-2 gap-3">
                {data.map((item) => {
                    const config = STATUS_LABELS[item.status] || { label: item.status, color: "#6B7280" };
                    const percentage = total > 0 ? ((item.total / total) * 100).toFixed(1) : "0";
                    return (
                        <div
                            key={item.status}
                            className="flex items-center gap-2 p-2 rounded-lg bg-gray-50"
                        >
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: config.color }}
                            />
                            <div className="flex-1">
                                <span className="text-xs font-medium text-gray-700">{config.label}</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-sm font-semibold text-gray-800">{item.total}</span>
                                    <span className="text-[10px] text-gray-500">({percentage}%)</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Summary Card Component
const SummaryCard = ({
    icon,
    title,
    value,
    color,
    bgColor,
    subtitle,
}: {
    icon: React.ReactNode;
    title: string;
    value: number;
    color: string;
    bgColor: string;
    subtitle?: string;
}) => (
    <div className={`${bgColor} rounded-xl p-4 border border-gray-200/60 shadow-sm`}>
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color} text-white`}>
                {icon}
            </div>
            <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-600">{title}</p>
                {subtitle && <p className="text-[10px] text-gray-400">{subtitle}</p>}
            </div>
        </div>
    </div>
);

export default function StatisticsPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [showMap, setShowMap] = useState(true);

    const fetchStatistics = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                year: selectedYear.toString(),
            });
            const response = await fetch(`/api/operator/statistics?${params}`);
            if (!response.ok) throw new Error("Failed to fetch statistics");
            const result = await response.json();
            if (result.success) {
                setStatistics(result.data);
            }
        } catch (error) {
            console.error("Error fetching statistics:", error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedYear]);

    useEffect(() => {
        fetchStatistics();
    }, [fetchStatistics]);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.replace("/operator/login");
    };

    // Prepare monthly chart data
    const monthlyData = Array(12).fill(0);
    if (statistics?.monthlyStats) {
        statistics.monthlyStats.forEach((stat) => {
            monthlyData[stat.month - 1] = stat.total;
        });
    }

    // Calculate summary stats
    const completedCount = statistics?.statusStats?.find(s => s.status === 'completed' || s.status === 'selesai')?.total || 0;
    const pendingCount = statistics?.statusStats?.filter(s =>
        ['pending', 'submitted', 'verified', 'diproses', 'dispatched', 'dikirim', 'arrived', 'ditangani'].includes(s.status)
    ).reduce((acc, curr) => acc + curr.total, 0) || 0;
    const falseCount = statistics?.statusStats?.find(s => s.status === 'false' || s.status === 'dibatalkan')?.total || 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 font-sans">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm sticky top-0 z-40">
                <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push("/operator/dashboard")}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <FaArrowLeft className="text-gray-600" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-sm">
                                <FaChartBar className="text-white text-lg" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">Statistik Laporan</h1>
                                <p className="text-xs text-gray-500">Analisis data kejadian per tahun dan lokasi</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push("/operator/dashboard")}
                            className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <FaFire className="text-red-500 text-sm" />
                            <span className="text-xs font-medium text-gray-700 hidden md:inline">Dashboard</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            title="Logout"
                            className="bg-red-500 hover:bg-red-600 p-2.5 rounded-xl transition-colors shadow-sm"
                        >
                            <FaSignOutAlt className="text-white text-sm" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto p-4 md:p-6">
                {/* Year Filter */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <FaCalendarAlt className="text-red-500" />
                                <label className="text-sm font-medium text-gray-700">Pilih Tahun:</label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                >
                                    {statistics?.availableYears && statistics.availableYears.length > 0 ? (
                                        statistics.availableYears.map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))
                                    ) : (
                                        <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                                    )}
                                </select>
                            </div>
                            <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm font-semibold text-red-700">
                                    📊 Total {statistics?.totalReports || 0} kejadian di tahun {selectedYear}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowMap(!showMap)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showMap ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'
                                }`}
                        >
                            <FaMap />
                            <span className="text-sm font-medium">{showMap ? 'Sembunyikan' : 'Tampilkan'} Peta</span>
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-red-500 border-r-transparent mb-4"></div>
                            <p className="text-gray-500">Memuat statistik...</p>
                        </div>
                    </div>
                ) : statistics ? (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <SummaryCard
                                icon={<FaChartBar />}
                                title="Total Kejadian"
                                value={statistics.totalReports}
                                color="bg-gradient-to-br from-blue-500 to-indigo-600"
                                bgColor="bg-white"
                                subtitle={`Tahun ${selectedYear}`}
                            />
                            <SummaryCard
                                icon={<FaCheckCircle />}
                                title="Selesai Ditangani"
                                value={completedCount}
                                color="bg-gradient-to-br from-green-500 to-emerald-600"
                                bgColor="bg-white"
                            />
                            <SummaryCard
                                icon={<FaClock />}
                                title="Dalam Proses"
                                value={pendingCount}
                                color="bg-gradient-to-br from-yellow-500 to-amber-600"
                                bgColor="bg-white"
                            />
                            <SummaryCard
                                icon={<FaTimesCircle />}
                                title="Laporan Palsu"
                                value={falseCount}
                                color="bg-gradient-to-br from-gray-500 to-gray-600"
                                bgColor="bg-white"
                            />
                        </div>

                        {/* Hotspot Map */}
                        {showMap && (
                            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <FaMap className="text-red-500" />
                                    <h3 className="text-sm font-semibold text-gray-800">
                                        🗺️ Peta Titik Kejadian Tahun {selectedYear}
                                    </h3>
                                    <span className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-full">
                                        {statistics.hotspots?.length || 0} titik
                                    </span>
                                </div>
                                <div className="h-[400px] rounded-xl overflow-hidden border border-gray-200">
                                    <HotspotMap
                                        hotspots={statistics.hotspots || []}
                                        year={selectedYear}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Top Location - Most Incidents */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <KelurahanRankingChart
                                data={statistics.kelurahanStats || []}
                                title="🏆 Ranking Lokasi Kejadian Terbanyak"
                                year={selectedYear}
                            />
                            <YearlyComparisonChart
                                data={statistics.yearlyStats || []}
                                title="📅 Perbandingan Antar Tahun"
                                selectedYear={selectedYear}
                            />
                        </div>

                        {/* Monthly Reports */}
                        <div className="mb-6">
                            <BarChart
                                data={monthlyData}
                                labels={MONTH_NAMES}
                                title={`📊 Laporan Bulanan Tahun ${selectedYear}`}
                                color="#EF4444"
                                maxHeight={220}
                            />
                        </div>

                        {/* Category and Status */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <CategoryChart
                                data={statistics.categoryStats || []}
                                title="📋 Statistik per Kategori Bencana"
                            />
                            <StatusChart
                                data={statistics.statusStats || []}
                                title="📈 Distribusi Status Laporan"
                            />
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-500">Tidak ada data statistik tersedia</p>
                    </div>
                )}
            </main>
        </div>
    );
}
