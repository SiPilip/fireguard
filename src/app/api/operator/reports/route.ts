import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
