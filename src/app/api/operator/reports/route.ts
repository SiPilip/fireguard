import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { unlink } from 'fs/promises';
import path from 'path';

export async function GET(request: Request) {
  // Middleware kita sudah memastikan bahwa hanya operator yang bisa mengakses endpoint ini.
  // Jadi, kita tidak perlu menambahkan verifikasi token lagi di sini.
  try {
    const stmt = db.prepare(`
      SELECT
        r.id,
        r.latitude,
        r.longitude,
        r.status,
        r.created_at,
        r.media_url,
        u.phone_number
      FROM reports r
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `);

    const reports = stmt.all();

    return NextResponse.json(reports);

  } catch (error) {
    console.error('[API Get Reports] Error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server saat mengambil laporan.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  // Middleware melindungi endpoint ini untuk operator
  try {
    // 1. Ambil semua URL media sebelum menghapus record database
    const mediaUrls = db.prepare('SELECT media_url FROM reports').all() as { media_url: string }[];

    // 2. Hapus semua file dari direktori public/uploads
    for (const item of mediaUrls) {
      if (item.media_url) {
        const filePath = path.join(process.cwd(), 'public', item.media_url);
        try {
          await unlink(filePath);
        } catch (fileError: any) {
          // Abaikan error jika file tidak ditemukan, tapi log untuk kasus lain
          if (fileError.code !== 'ENOENT') {
            console.warn(`Gagal menghapus file: ${filePath}`, fileError);
          }
        }
      }
    }

    // 3. Hapus semua record dari tabel reports dan reset auto-increment
    db.exec('DELETE FROM reports');
    db.exec("DELETE FROM sqlite_sequence WHERE name='reports'");

    return NextResponse.json({ message: 'Semua laporan berhasil dihapus.' });

  } catch (error) {
    console.error('[API Delete All Reports] Error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
