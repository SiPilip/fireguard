import { NextRequest, NextResponse } from 'next/server';
import { queryRows, execute } from '@/lib/db';
import { unlink } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const reports = await queryRows(
      `SELECT r.id, r.latitude, r.longitude, r.status, r.created_at, r.media_url, u.phone_number
       FROM reports r JOIN users u ON r.user_id = u.id
       ORDER BY r.created_at DESC`
    );
    return NextResponse.json(reports);
  } catch (error) {
    console.error('[API Get Reports] Error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const mediaUrls = await queryRows<{ media_url: string }>('SELECT media_url FROM reports');
    for (const item of mediaUrls) {
      if (item.media_url) {
        const filePath = path.join(process.cwd(), 'public', item.media_url);
        try {
          await unlink(filePath);
        } catch (fileError: any) {
          if (fileError.code !== 'ENOENT') console.warn(`Gagal menghapus file: ${filePath}`, fileError);
        }
      }
    }
    await execute('DELETE FROM reports');
    await execute("DELETE FROM sqlite_sequence WHERE name='reports'");
    return NextResponse.json({ message: 'Semua laporan berhasil dihapus.' });
  } catch (error) {
    console.error('[API Delete All Reports] Error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}