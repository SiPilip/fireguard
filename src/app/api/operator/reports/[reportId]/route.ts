import { NextRequest, NextResponse } from "next/server";
import { queryRow, execute } from "@/lib/db";
import { calculateETA, getAddressFromCoordinates } from "@/lib/geo";
import { sendStatusUpdateEmail } from "@/lib/email";

// --- Konfigurasi Fonnte (Opsional) ---
const FONNTE_TOKEN = process.env.FONNTE_TOKEN || "";
const ENABLE_WHATSAPP = process.env.ENABLE_WHATSAPP === "true";

/**
 * Fungsi untuk mengirim pesan WhatsApp melalui Fonnte (Opsional)
 */
async function sendWhatsAppMessage(target: string, message: string) {
  if (!ENABLE_WHATSAPP || !FONNTE_TOKEN) return;

  const data = new FormData();
  data.append("target", target);
  data.append("message", message);
  data.append("countryCode", "62");

  try {
    await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: { Authorization: FONNTE_TOKEN },
      body: data,
    });
  } catch (error) {
    // Ignore WhatsApp errors
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;
    const report = await queryRow(
      `SELECT r.id, r.fire_latitude, r.fire_longitude, r.status, r.created_at, r.media_url, 
              r.description, r.admin_notes,
              u.name as user_name, u.email as user_email, u.phone_number
       FROM reports r 
       JOIN users u ON r.user_id = u.id
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
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;
    const { status: newStatus, adminNotes, kelurahanId, categoryId } = await request.json();

    // Build dynamic SQL update
    const updates: string[] = [];
    const args: any[] = [];

    if (newStatus) {
      updates.push('status = ?');
      args.push(newStatus);
    }

    if (adminNotes !== undefined) {
      updates.push('admin_notes = ?');
      args.push(adminNotes);
    }

    if (kelurahanId !== undefined) {
      updates.push('kelurahan_id = ?');
      args.push(kelurahanId);
    }

    if (categoryId !== undefined) {
      updates.push('category_id = ?');
      args.push(categoryId);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { message: "Tidak ada data yang diubah." },
        { status: 400 }
      );
    }

    const sql = `UPDATE reports SET ${updates.join(', ')} WHERE id = ?`;
    args.push(reportId);

    const rowsAffected = await execute(sql, args);

    if (rowsAffected === 0) {
      return NextResponse.json(
        { message: `Laporan dengan ID ${reportId} tidak ditemukan.` },
        { status: 404 }
      );
    }

    // Ambil data report dan user untuk notifikasi
    const report = await queryRow<{
      user_id: number;
      fire_latitude: number;
      fire_longitude: number;
    }>(
      'SELECT user_id, fire_latitude, fire_longitude FROM reports WHERE id = ?',
      [reportId]
    );

    if (report && newStatus) {
      const user = await queryRow<{ name: string; email: string; phone_number: string }>(
        'SELECT name, email, phone_number FROM users WHERE id = ?',
        [report.user_id]
      );

      // Status labels untuk notifikasi
      const statusLabels: Record<string, string> = {
        pending: '⏳ Menunggu Verifikasi',
        submitted: '📝 Baru Dikirim',
        verified: '✅ Terverifikasi',
        diproses: '🔄 Sedang Diproses',
        dispatched: '🚒 Unit Dikirim',
        dikirim: '🚒 Tim Dikirim',
        arrived: '📍 Unit Tiba',
        ditangani: '👨‍🚒 Sedang Ditangani',
        completed: '✅ Selesai',
        selesai: '✅ Selesai',
        dibatalkan: '❌ Dibatalkan',
        false: '⚠️ Laporan Palsu',
      };

      const statusLabel = statusLabels[newStatus] || newStatus;

      // BARU: Simpan notifikasi ke database untuk web
      try {
        const { executeAndGetLastInsertId, formatDateForMySQL } = await import('@/lib/db');
        const currentTimestamp = formatDateForMySQL(new Date());

        const notifTitle = `Status Laporan #${reportId} Diperbarui`;
        let notifMessage = `Status laporan Anda telah diperbarui menjadi: ${statusLabel}`;
        if (adminNotes) {
          notifMessage += `\n\nCatatan petugas: ${adminNotes}`;
        }

        await executeAndGetLastInsertId(
          `INSERT INTO notifications (user_id, title, message, type, report_id, is_read, created_at) 
           VALUES (?, ?, ?, ?, ?, FALSE, ?)`,
          [report.user_id, notifTitle, notifMessage, 'status_update', parseInt(reportId), currentTimestamp]
        );
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
        // Lanjutkan meskipun gagal buat notifikasi
      }

      if (user && user.email) {
        // UTAMA: Kirim notifikasi via Email
        sendStatusUpdateEmail(
          user.email,
          user.name,
          parseInt(reportId),
          newStatus,
          adminNotes
        );

        // OPSIONAL: Kirim juga via WhatsApp jika diaktifkan
        if (ENABLE_WHATSAPP && user.phone_number) {
          const address = await getAddressFromCoordinates(report.fire_latitude, report.fire_longitude);

          let message = `*[FireGuard]*\n\nHalo ${user.name},\n\nLaporan Anda *#${reportId}* telah diperbarui:\n\n*Status:* ${statusLabel}\n*Alamat:* ${address}`;

          if (adminNotes) {
            message += `\n\n*Catatan Petugas:*\n${adminNotes}`;
          }

          message += `\n\n> _Sent via FireGuard_`;

          sendWhatsAppMessage(user.phone_number, message);
        }
      }
    }

    // Broadcast status update via WebSocket
    if (global.wss) {
      global.wss.broadcast(
        JSON.stringify({
          type: "STATUS_UPDATE",
          payload: { reportId: parseInt(reportId), newStatus },
        })
      );
    }

    return NextResponse.json({
      message: `Status laporan #${reportId} berhasil diperbarui menjadi ${newStatus}.`,
    });
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
