import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { reportId: string } }
) {
  // Rute ini sudah dilindungi oleh middleware, hanya operator yang bisa akses.
  try {
    const reportId = params.reportId;
    if (!reportId) {
      return NextResponse.json({ message: 'ID Laporan diperlukan.' }, { status: 400 });
    }

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
      WHERE r.id = ?
    `);

    const report = stmt.get(reportId);

    if (!report) {
      return NextResponse.json({ message: 'Laporan tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json(report);

  } catch (error) {
    console.error(`[API Get Report #${params.reportId}] Error:`, error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { reportId: string } }
) {
  // Middleware melindungi rute ini
  try {
    const reportId = params.reportId;
    const { status } = await request.json();

    const allowedStatus = ['Pending', 'In Progress', 'Resolved'];
    if (!status || !allowedStatus.includes(status)) {
      return NextResponse.json({ message: 'Status tidak valid.' }, { status: 400 });
    }

    const stmt = db.prepare('UPDATE reports SET status = ? WHERE id = ?');
    const info = stmt.run(status, reportId);

    if (info.changes === 0) {
      return NextResponse.json({ message: 'Laporan tidak ditemukan atau tidak ada perubahan.' }, { status: 404 });
    }

    // Siarkan pembaruan status melalui WebSocket
    if (global.wss) {
      console.log(`Broadcasting status update for report #${reportId}`);
      global.wss.broadcast(JSON.stringify({ 
        type: 'STATUS_UPDATE', 
        payload: { reportId: parseInt(reportId), newStatus: status } 
      }));
    }

    return NextResponse.json({ message: `Status laporan #${reportId} berhasil diperbarui menjadi ${status}.` });

  } catch (error) {
    console.error(`[API Update Report #${params.reportId}] Error:`, error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
