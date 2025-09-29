import { NextRequest, NextResponse } from "next/server";
import { queryRow, execute } from "@/lib/db";

export async function GET(request: NextRequest, context: { params: any }) {
  try {
    const reportId = context.params.reportId;
    const report = await queryRow(
      `SELECT r.id, r.latitude, r.longitude, r.status, r.created_at, r.media_url, u.phone_number
       FROM reports r JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [reportId]
    );
    if (!report) {
      return NextResponse.json(
        { message: "Laporan tidak ditemukan." },
        { status: 404 }
      );
    }
    return NextResponse.json(report);
  } catch (error) {
    console.error(`[API Get Report #${context.params.reportId}] Error:`, error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: { params: any }) {
  try {
    const reportId = context.params.reportId;
    const { status } = await request.json();
    const allowedStatus = ["Pending", "In Progress", "Resolved"];
    if (!status || !allowedStatus.includes(status)) {
      return NextResponse.json(
        { message: "Status tidak valid." },
        { status: 400 }
      );
    }
    const info = await execute("UPDATE reports SET status = ? WHERE id = ?", [
      status,
      reportId,
    ]);
    if (info === 0) {
      return NextResponse.json(
        { message: "Laporan tidak ditemukan atau tidak ada perubahan." },
        { status: 404 }
      );
    }
    if (global.wss) {
      global.wss.broadcast(
        JSON.stringify({
          type: "STATUS_UPDATE",
          payload: { reportId: parseInt(reportId), newStatus: status },
        })
      );
    }
    return NextResponse.json({
      message: `Status laporan #${reportId} berhasil diperbarui.`,
    });
  } catch (error) {
    console.error(
      `[API Update Report #${context.params.reportId}] Error:`,
      error
    );
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
