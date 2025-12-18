'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    FaArrowLeft,
    FaPlus,
    FaEdit,
    FaTrash,
    FaFire,
    FaMapMarkerAlt,
    FaSave,
    FaTimes,
    FaBuilding,
} from 'react-icons/fa';

interface Category {
    id: number;
    name: string;
    icon: string;
    color: string;
    description?: string;
}

interface Kelurahan {
    id: number;
    name: string;
    kecamatan: string;
    kota: string;
}

export default function ManagementPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'categories' | 'kelurahan'>('categories');
    const [categories, setCategories] = useState<Category[]>([]);
    const [kelurahanList, setKelurahanList] = useState<Kelurahan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form states
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [showKelurahanForm, setShowKelurahanForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editingKelurahan, setEditingKelurahan] = useState<Kelurahan | null>(null);

    // Category form
    const [categoryName, setCategoryName] = useState('');
    const [categoryIcon, setCategoryIcon] = useState('🔥');
    const [categoryColor, setCategoryColor] = useState('#ef4444');
    const [categoryDescription, setCategoryDescription] = useState('');

    // Kelurahan form
    const [kelurahanName, setKelurahanName] = useState('');
    const [kecamatan, setKecamatan] = useState('Plaju');
    const [kota, setKota] = useState('Palembang');

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch('/api/operator/disaster-categories');
            const data = await res.json();
            if (data.success) setCategories(data.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    }, []);

    const fetchKelurahan = useCallback(async () => {
        try {
            const res = await fetch('/api/operator/kelurahan');
            const data = await res.json();
            if (data.success) setKelurahanList(data.data);
        } catch (err) {
            console.error('Error fetching kelurahan:', err);
        }
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await Promise.all([fetchCategories(), fetchKelurahan()]);
            setIsLoading(false);
        };
        loadData();
    }, [fetchCategories, fetchKelurahan]);

    // Category CRUD
    const handleSaveCategory = async () => {
        if (!categoryName || !categoryIcon) {
            setError('Nama dan icon diperlukan');
            return;
        }

        try {
            const url = editingCategory
                ? `/api/operator/disaster-categories/${editingCategory.id}`
                : '/api/operator/disaster-categories';
            const method = editingCategory ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: categoryName,
                    icon: categoryIcon,
                    color: categoryColor,
                    description: categoryDescription,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setSuccess(data.message);
                fetchCategories();
                resetCategoryForm();
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Terjadi kesalahan');
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return;

        try {
            const res = await fetch(`/api/operator/disaster-categories/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(data.message);
                fetchCategories();
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Terjadi kesalahan');
        }
    };

    const resetCategoryForm = () => {
        setCategoryName('');
        setCategoryIcon('🔥');
        setCategoryColor('#ef4444');
        setCategoryDescription('');
        setEditingCategory(null);
        setShowCategoryForm(false);
    };

    const editCategory = (category: Category) => {
        setEditingCategory(category);
        setCategoryName(category.name);
        setCategoryIcon(category.icon);
        setCategoryColor(category.color);
        setCategoryDescription(category.description || '');
        setShowCategoryForm(true);
    };

    // Kelurahan CRUD
    const handleSaveKelurahan = async () => {
        if (!kelurahanName) {
            setError('Nama kelurahan diperlukan');
            return;
        }

        try {
            const url = editingKelurahan
                ? `/api/operator/kelurahan/${editingKelurahan.id}`
                : '/api/operator/kelurahan';
            const method = editingKelurahan ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: kelurahanName,
                    kecamatan,
                    kota,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setSuccess(data.message);
                fetchKelurahan();
                resetKelurahanForm();
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Terjadi kesalahan');
        }
    };

    const handleDeleteKelurahan = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus kelurahan ini?')) return;

        try {
            const res = await fetch(`/api/operator/kelurahan/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(data.message);
                fetchKelurahan();
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Terjadi kesalahan');
        }
    };

    const resetKelurahanForm = () => {
        setKelurahanName('');
        setKecamatan('Plaju');
        setKota('Palembang');
        setEditingKelurahan(null);
        setShowKelurahanForm(false);
    };

    const editKelurahan = (kel: Kelurahan) => {
        setEditingKelurahan(kel);
        setKelurahanName(kel.name);
        setKecamatan(kel.kecamatan);
        setKota(kel.kota);
        setShowKelurahanForm(true);
    };

    // Clear messages
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError('');
                setSuccess('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);

    const emojiOptions = ['🔥', '🌊', '🏗️', '🌪️', '⛰️', '⚠️', '🚨', '🚗', '💥', '☢️', '🦟', '🌍'];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Link
                        href="/operator/dashboard"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <FaArrowLeft />
                        <span className="text-sm font-medium">Kembali</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl">
                            <FaBuilding className="text-white text-lg" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900">Manajemen Data</h1>
                            <p className="text-xs text-gray-500">Kelola kategori bencana dan kelurahan</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Messages */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
                        {success}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${activeTab === 'categories'
                                ? 'bg-red-500 text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        <FaFire className="inline mr-2" />
                        Kategori Bencana
                    </button>
                    <button
                        onClick={() => setActiveTab('kelurahan')}
                        className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${activeTab === 'kelurahan'
                                ? 'bg-teal-500 text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        <FaMapMarkerAlt className="inline mr-2" />
                        Kelurahan
                    </button>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-red-500 border-r-transparent"></div>
                        <p className="text-gray-600 mt-4">Memuat data...</p>
                    </div>
                ) : (
                    <>
                        {/* Categories Tab */}
                        {activeTab === 'categories' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                    <h2 className="text-base font-semibold text-gray-900">Daftar Kategori Bencana</h2>
                                    <button
                                        onClick={() => setShowCategoryForm(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
                                    >
                                        <FaPlus />
                                        Tambah Kategori
                                    </button>
                                </div>

                                {/* Category Form */}
                                {showCategoryForm && (
                                    <div className="p-6 bg-gray-50 border-b border-gray-100">
                                        <h3 className="font-semibold text-gray-900 mb-4">
                                            {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                    Nama Kategori *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={categoryName}
                                                    onChange={(e) => setCategoryName(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                                                    placeholder="Contoh: Kebakaran"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                    Icon (Emoji) *
                                                </label>
                                                <div className="flex gap-2 flex-wrap">
                                                    {emojiOptions.map((emoji) => (
                                                        <button
                                                            key={emoji}
                                                            type="button"
                                                            onClick={() => setCategoryIcon(emoji)}
                                                            className={`text-2xl p-2 rounded-lg border-2 transition-all ${categoryIcon === emoji
                                                                    ? 'border-red-500 bg-red-50'
                                                                    : 'border-gray-200 hover:border-gray-300'
                                                                }`}
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                    Warna
                                                </label>
                                                <input
                                                    type="color"
                                                    value={categoryColor}
                                                    onChange={(e) => setCategoryColor(e.target.value)}
                                                    className="w-full h-10 rounded-xl cursor-pointer"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                    Deskripsi
                                                </label>
                                                <input
                                                    type="text"
                                                    value={categoryDescription}
                                                    onChange={(e) => setCategoryDescription(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                                                    placeholder="Deskripsi singkat"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-3 mt-4">
                                            <button
                                                onClick={handleSaveCategory}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600"
                                            >
                                                <FaSave />
                                                Simpan
                                            </button>
                                            <button
                                                onClick={resetCategoryForm}
                                                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-300"
                                            >
                                                <FaTimes />
                                                Batal
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Category List */}
                                <div className="divide-y divide-gray-100">
                                    {categories.map((category) => (
                                        <div key={category.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                                            <div className="flex items-center gap-4">
                                                <span className="text-3xl">{category.icon}</span>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{category.name}</p>
                                                    {category.description && (
                                                        <p className="text-xs text-gray-500">{category.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => editCategory(category)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(category.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {categories.length === 0 && (
                                        <div className="px-6 py-12 text-center text-gray-500">
                                            Belum ada kategori. Klik "Tambah Kategori" untuk menambahkan.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Kelurahan Tab */}
                        {activeTab === 'kelurahan' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                    <h2 className="text-base font-semibold text-gray-900">Daftar Kelurahan</h2>
                                    <button
                                        onClick={() => setShowKelurahanForm(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl text-sm font-medium hover:bg-teal-600 transition-colors"
                                    >
                                        <FaPlus />
                                        Tambah Kelurahan
                                    </button>
                                </div>

                                {/* Kelurahan Form */}
                                {showKelurahanForm && (
                                    <div className="p-6 bg-gray-50 border-b border-gray-100">
                                        <h3 className="font-semibold text-gray-900 mb-4">
                                            {editingKelurahan ? 'Edit Kelurahan' : 'Tambah Kelurahan Baru'}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                    Nama Kelurahan *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={kelurahanName}
                                                    onChange={(e) => setKelurahanName(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                                                    placeholder="Contoh: Plaju Darat"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                    Kecamatan
                                                </label>
                                                <input
                                                    type="text"
                                                    value={kecamatan}
                                                    onChange={(e) => setKecamatan(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                                                    placeholder="Contoh: Plaju"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                    Kota
                                                </label>
                                                <input
                                                    type="text"
                                                    value={kota}
                                                    onChange={(e) => setKota(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                                                    placeholder="Contoh: Palembang"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-3 mt-4">
                                            <button
                                                onClick={handleSaveKelurahan}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600"
                                            >
                                                <FaSave />
                                                Simpan
                                            </button>
                                            <button
                                                onClick={resetKelurahanForm}
                                                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-300"
                                            >
                                                <FaTimes />
                                                Batal
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Kelurahan List */}
                                <div className="divide-y divide-gray-100">
                                    {kelurahanList.map((kel) => (
                                        <div key={kel.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-teal-100 rounded-lg">
                                                    <FaMapMarkerAlt className="text-teal-600" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{kel.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        Kec. {kel.kecamatan}, {kel.kota}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => editKelurahan(kel)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteKelurahan(kel.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {kelurahanList.length === 0 && (
                                        <div className="px-6 py-12 text-center text-gray-500">
                                            Belum ada kelurahan. Klik "Tambah Kelurahan" untuk menambahkan.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
