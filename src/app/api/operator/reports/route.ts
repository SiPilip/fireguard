import { NextRequest, NextResponse } from 'next/server';
import { queryRows, execute } from '@/lib/db';
import { unlink } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const reports = await queryRows(
      `SELECT r.id, r.fire_latitude, r.fire_longitude, r.reporter_latitude, r.reporter_longitude, 
              r.status, r.created_at, r.media_url, r.notes, r.contact, r.description,
              u.phone_number, 
              c.id as category_id, c.name as category_name, c.icon as category_icon, c.color as category_color,
              k.id as kelurahan_id, k.name as kelurahan_name, k.kecamatan, k.kota
       FROM reports r 
       JOIN users u ON r.user_id = u.id
       LEFT JOIN disaster_categories c ON r.category_id = c.id
       LEFT JOIN kelurahan k ON r.kelurahan_id = k.id
       ORDER BY r.created_at DESC`
    );
    return NextResponse.json(reports);
  } catch (error) {
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
          // Ignore file not found errors
        }
      }
    }
    await execute('DELETE FROM reports');
    await execute('ALTER TABLE reports AUTO_INCREMENT = 1');
    return NextResponse.json({ message: 'Semua laporan berhasil dihapus.' });
  } catch (error) {
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}