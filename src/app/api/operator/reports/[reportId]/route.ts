import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Handler untuk method GET
export async function GET(
  request: NextRequest, // Menggunakan tipe NextRequest yang benar
  context: { params: { reportId: string } }
) {
  try {
    const reportId = context.params.reportId;
    if (!reportId) {
      return NextResponse.json({ message: 'ID Laporan diperlukan.' }, { status: 400 });
    }

    const stmt = db.prepare(`
      SELECT
        r.id, r.latitude, r.longitude, r.status, r.created_at, r.media_url, u.phone_number
      FROM reports r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `);
    const report = stmt.get(reportId);

    if (!report) {
      return NextResponse.json({ message: 'Laporan tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json(report);

  } catch (error) {
    console.error(`[API Get Report] Error:`, error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}

// Handler untuk method PATCH
export async function PATCH(
  request: NextRequest, // Menggunakan tipe NextRequest yang benar
  context: { params: { reportId: string } }
) {
  try {
    const reportId = context.params.reportId;
    const { status } = await request.json();

    const allowedStatus = ['Pending', 'In Progress', 'Resolved'];
    if (!status || !allowedStatus.includes(status)) {
      return NextResponse.json({ message: 'Status tidak valid.' }, { status: 400 });
    }

    const stmt = db.prepare('UPDATE reports SET status = ? WHERE id = ?');
    const info = stmt.run(status, reportId);

    if (info.changes === 0) {
      return NextResponse.json({ message: 'Laporan tidak ditemukan.' }, { status: 404 });
    }

    // Siarkan pembaruan status melalui WebSocket
    if (global.wss) {
      global.wss.broadcast(JSON.stringify({ 
        type: 'STATUS_UPDATE', 
        payload: { reportId: parseInt(reportId), newStatus: status } 
      }));
    }

    return NextResponse.json({ message: `Status laporan #${reportId} berhasil diperbarui.` });

  } catch (error) {
    console.error(`[API Update Report] Error:`, error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}