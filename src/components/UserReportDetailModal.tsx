"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
    FaTimes,
    FaMapMarkerAlt,
    FaClock,
    FaPhone,
    FaFileAlt,
    FaImage,
} from "react-icons/fa";

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
    description?: string;
}

interface UserReportDetailModalProps {
    report: Report;
    onClose: () => void;
}

export default function UserReportDetailModal({
    report,
    onClose,
}: UserReportDetailModalProps) {
    // Handle ESC key to close modal
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    const getStatusDisplay = (status: string) => {
        const statusMap: { [key: string]: { text: string; color: string; bgColor: string } } = {
            submitted: { text: "Menunggu Verifikasi", color: "text-yellow-700", bgColor: "bg-yellow-50 border-yellow-200" },
            verified: { text: "Terverifikasi", color: "text-blue-700", bgColor: "bg-blue-50 border-blue-200" },
            dispatched: { text: "Unit Dalam Perjalanan", color: "text-purple-700", bgColor: "bg-purple-50 border-purple-200" },
            arrived: { text: "Unit Tiba di Lokasi", color: "text-indigo-700", bgColor: "bg-indigo-50 border-indigo-200" },
            completed: { text: "Selesai", color: "text-green-700", bgColor: "bg-green-50 border-green-200" },
            false: { text: "Laporan Ditolak/Palsu", color: "text-red-700", bgColor: "bg-red-50 border-red-200" },
        };
        return (
            statusMap[status] || { text: status, color: "text-gray-700", bgColor: "bg-gray-50 border-gray-200" }
        );
    };

    const statusDisplay = getStatusDisplay(report.status);

    // Generate Google Maps link
    const googleMapsUrl = `https://www.google.com/maps?q=${report.fire_latitude},${report.fire_longitude}`;

    return (
        <div
            className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200/60 px-6 py-5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl">
                            <FaFileAlt className="text-white text-base" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Detail Laporan Saya #{report.id}</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Pantau status laporan Anda</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all p-2 rounded-xl"
                        aria-label="Close modal"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50/30">
                    {/* Status */}
                    <div className={`rounded-xl p-5 border ${statusDisplay.bgColor}`}>
                        <div className="flex items-center gap-3">
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-1">Status Terkini</p>
                                <p className={`text-xl font-semibold ${statusDisplay.color}`}>
                                    {statusDisplay.text}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Waktu */}
                        <div className="bg-white rounded-xl p-5 border border-gray-200/60 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <FaClock className="text-yellow-600 text-sm" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 mb-1.5">Waktu Laporan</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {new Date(report.created_at).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                            timeZone: "Asia/Jakarta",
                                        })}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-0.5">
                                        {new Date(report.created_at).toLocaleTimeString("id-ID", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                            timeZone: "Asia/Jakarta",
                                        })} WIB
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Kontak */}
                        <div className="bg-white rounded-xl p-5 border border-gray-200/60 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <FaPhone className="text-green-600 text-sm" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 mb-1.5">Nomor Telepon Pelapor</p>
                                    <p className="text-sm font-semibold text-gray-900 font-mono">
                                        {report.phone_number || 'Tidak tersedia'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lokasi Kebakaran */}
                    <div className="bg-white rounded-xl p-5 border border-gray-200/60 shadow-sm">
                        <div className="flex items-start gap-3 mb-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <FaMapMarkerAlt className="text-orange-600 text-sm" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-1">Lokasi Kejadian</p>
                                <p className="text-sm font-semibold text-gray-900 mb-2">
                                    Koordinat: {report.fire_latitude.toFixed(6)}, {report.fire_longitude.toFixed(6)}
                                </p>
                                <a
                                    href={googleMapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    <FaMapMarkerAlt />
                                    Buka di Google Maps
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Deskripsi */}
                    {report.description && (
                        <div className="bg-white rounded-xl p-5 border border-gray-200/60 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FaFileAlt className="text-blue-600 text-sm" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 mb-2">Deskripsi Kejadian</p>
                                    <p className="text-sm text-gray-900 leading-relaxed">{report.description}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Media */}
                    {report.media_url && (
                        <div className="bg-white rounded-xl p-5 border border-gray-200/60 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <FaImage className="text-purple-600 text-sm" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 mb-3">Foto Kejadian</p>
                                    <div className="relative w-full h-64 rounded-xl overflow-hidden border border-gray-200">
                                        <Image
                                            src={report.media_url}
                                            alt="Bukti laporan"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <a
                                        href={report.media_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-700 text-xs font-medium mt-3 inline-flex items-center gap-1 hover:underline"
                                    >
                                        Lihat Ukuran Penuh →
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Catatan */}
                    {report.notes && (
                        <div className="bg-white rounded-xl p-5 border border-gray-200/60 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FaFileAlt className="text-blue-600 text-sm" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 mb-2">Catatan Tambahan</p>
                                    <p className="text-sm text-gray-900 leading-relaxed">{report.notes}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer - No Action Buttons for User */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200/60 px-6 py-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-sm"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
