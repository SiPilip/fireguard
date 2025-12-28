import { NextRequest, NextResponse } from 'next/server';
import { queryRows, execute, executeAndGetLastInsertId } from '@/lib/db';

interface Kelurahan {
    id: number;
    name: string;
    kecamatan: string;
    kota: string;
}

// GET: Ambil semua kelurahan
export async function GET() {
    try {
        const kelurahan = await queryRows<Kelurahan>(
            'SELECT id, name, kecamatan, kota FROM kelurahan ORDER BY name ASC'
        );
        return NextResponse.json({ success: true, data: kelurahan });
    } catch (error) {
        console.error('Error fetching kelurahan:', error);
        return NextResponse.json({ message: 'Gagal mengambil data kelurahan' }, { status: 500 });
    }
}

// POST: Tambah kelurahan baru
export async function POST(request: NextRequest) {
    try {
        const { name, kecamatan, kota } = await request.json();

        if (!name) {
            return NextResponse.json({ message: 'Nama kelurahan diperlukan' }, { status: 400 });
        }

        const id = await executeAndGetLastInsertId(
            'INSERT INTO kelurahan (name, kecamatan, kota) VALUES (?, ?, ?)',
            [name, kecamatan || 'Plaju', kota || 'Plaju, Palembang']
        );

        return NextResponse.json({
            success: true,
            message: 'Kelurahan berhasil ditambahkan',
            data: { id, name, kecamatan, kota }
        });
    } catch (error) {
        console.error('Error adding kelurahan:', error);
        return NextResponse.json({ message: 'Gagal menambah kelurahan' }, { status: 500 });
    }
}
