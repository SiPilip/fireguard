import { NextRequest, NextResponse } from 'next/server';
import { queryRow, execute } from '@/lib/db';
import { requireOperator } from '@/lib/api-security';

// PUT: Update kelurahan
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const auth = await requireOperator(request);
        if ("response" in auth) return auth.response;

        const { id: idStr } = await params;
        const id = parseInt(idStr);
        const { name, kecamatan, kota } = await request.json();

        if (!name) {
            return NextResponse.json({ message: 'Nama kelurahan diperlukan' }, { status: 400 });
        }

        await execute(
            'UPDATE kelurahan SET name = ?, kecamatan = ?, kota = ? WHERE id = ?',
            [name, kecamatan || 'Plaju', kota || 'Plaju, Palembang', id]
        );

        return NextResponse.json({
            success: true,
            message: 'Kelurahan berhasil diperbarui'
        });
    } catch (error) {
        console.error('Error updating kelurahan:', error);
        return NextResponse.json({ message: 'Gagal memperbarui kelurahan' }, { status: 500 });
    }
}

// DELETE: Hapus kelurahan
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const auth = await requireOperator(request);
        if ("response" in auth) return auth.response;

        const { id: idStr } = await params;
        const id = parseInt(idStr);

        // Cek apakah ada laporan yang menggunakan kelurahan ini
        const report = await queryRow<{ count: number }>(
            'SELECT COUNT(*) as count FROM reports WHERE kelurahan_id = ?',
            [id]
        );

        if (report && report.count > 0) {
            return NextResponse.json({
                message: `Tidak dapat menghapus. ${report.count} laporan menggunakan kelurahan ini.`
            }, { status: 400 });
        }

        await execute('DELETE FROM kelurahan WHERE id = ?', [id]);

        return NextResponse.json({
            success: true,
            message: 'Kelurahan berhasil dihapus'
        });
    } catch (error) {
        console.error('Error deleting kelurahan:', error);
        return NextResponse.json({ message: 'Gagal menghapus kelurahan' }, { status: 500 });
    }
}
