import { NextRequest, NextResponse } from "next/server";
import { queryRow, execute } from "@/lib/db";
import { calculateETA, getAddressFromCoordinates } from "@/lib/geo";

// --- Konfigurasi Fonnte ---
const FONNTE_TOKEN = process.env.FONNTE_TOKEN || "YOUR_FONNTE_TOKEN";

/**
 * Fungsi untuk mengirim pesan WhatsApp melalui Fonnte
 * @param target Nomor telepon tujuan (format internasional, misal: 628xxxx)
 * @param message Isi pesan yang akan dikirim
 */
async function sendWhatsAppMessage(target: string, message: string) {
  const data = new FormData();
  data.append("target", target);
  data.append("message", message);
  data.append("countryCode", "62");

  try {
    console.log(`Sending WhatsApp to ${target}...`);
    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: FONNTE_TOKEN,
      },
      body: data,
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Fonnte API Error:", errorBody);
      return; // Jangan throw error agar tidak menghentikan alur utama
    }

    const result = await response.json();
    console.log("Fonnte API Success:", result);

  } catch (error) {
    console.error("Error calling Fonnte API:", error);
  }
}


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;
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
    console.error(`[API Get Report] Error:`, error);
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
    const { status: newStatus } = await request.json();

    if (!newStatus) {
      return NextResponse.json(
        { message: "Status baru tidak boleh kosong." },
        { status: 400 }
      );
    }

    const rowsAffected = await execute(
      "UPDATE reports SET status = ? WHERE id = ?",
      [newStatus, reportId]
    );

    if (rowsAffected === 0) {
      return NextResponse.json(
        { message: `Laporan dengan ID ${reportId} tidak ditemukan.` },
        { status: 404 }
      );
    }

    // Kirim notifikasi WhatsApp berdasarkan status
    if (newStatus === 'verified' || newStatus === 'dispatched' || newStatus === 'completed' || newStatus === 'false') {
      const report = await queryRow<{ user_id: number; fire_latitude: number; fire_longitude: number }>(
        'SELECT user_id, fire_latitude, fire_longitude FROM reports WHERE id = ?',
        [reportId]
      );

      if (report) {
        const user = await queryRow<{ phone_number: string }>(
          'SELECT phone_number FROM users WHERE id = ?',
          [report.user_id]
        );

        if (user && user.phone_number) {
          let message = '';

          if (newStatus === 'verified') {
            const address = await getAddressFromCoordinates(report.fire_latitude, report.fire_longitude);

            message =
              `*[FireGuard]*

✓ Laporan Anda *#${reportId}* sedang dalam *PROSES VERIFIKASI*.

*Alamat Terdeteksi:*
${address}

Tim operator sedang memverifikasi laporan Anda. Mohon tetap waspada dan amankan diri Anda.

Unit pemadam kebakaran akan segera dikirim jika laporan terverifikasi.

Pantau terus notifikasi untuk update selanjutnya.

> _Sent via fonnte.com_`;
          }
          else if (newStatus === 'dispatched') {
            // Dapatkan alamat dan ETA secara bersamaan
            const [address, etaResult] = await Promise.all([
              getAddressFromCoordinates(report.fire_latitude, report.fire_longitude),
              calculateETA(report.fire_latitude, report.fire_longitude)
            ]);

            message =
              `*[FireGuard]*

Laporan Anda *#${reportId}* telah diverifikasi.

Tim pemadam kebakaran dari *${etaResult.nearestStation.name}* telah dikirim ke lokasi Anda dan sedang dalam perjalanan.

*Alamat Terdeteksi:*
${address}

*Estimasi Waktu Tiba:*
*${etaResult.etaMinutes} menit* (jarak sekitar ${etaResult.distanceKm} km).

Harap tetap tenang dan amankan diri Anda.`;
          }
          else if (newStatus === 'completed') {
            const address = await getAddressFromCoordinates(report.fire_latitude, report.fire_longitude);

            message =
              `*[FireGuard]*

✅ Laporan Anda *#${reportId}* telah *SELESAI* ditangani.

*Alamat Lokasi:*
${address}

Terima kasih telah menggunakan layanan FireGuard. Kebakaran telah berhasil dipadamkan dan situasi sudah aman.

Jika ada kerusakan atau memerlukan bantuan lebih lanjut, silakan hubungi:
- Hotline Damkar: *113*
- Email: damkar@palembang.go.id

Harap tetap waspada dan pastikan tidak ada titik api yang tersisa.

> _Sent via fonnte.com_`;
          }
          else if (newStatus === 'false') {
            const address = await getAddressFromCoordinates(report.fire_latitude, report.fire_longitude);

            message =
              `*[FireGuard]*

❌ Laporan Anda *#${reportId}* telah diverifikasi sebagai *LAPORAN PALSU*.

*Alamat Terdeteksi:*
${address}

Setelah pengecekan tim, *tidak ditemukan indikasi kebakaran* di lokasi yang dilaporkan.

⚠️ *PERINGATAN PENTING*:
Laporan palsu dapat:
- Menghambat penanganan darurat yang sesungguhnya
- Membuang sumber daya pemadam kebakaran
- Merugikan masyarakat yang membutuhkan bantuan nyata

Mohon gunakan layanan darurat dengan bijak dan bertanggung jawab.

> _Sent via fonnte.com_`;
          }

          // Kirim di latar belakang jika ada pesan
          if (message) {
            sendWhatsAppMessage(user.phone_number, message);
          }
        }
      }
    }

    // Broadcast the status update to all connected clients
    if (global.wss) {
      global.wss.broadcast(
        JSON.stringify({
          type: "STATUS_UPDATE",
          payload: { reportId: parseInt(reportId), newStatus },
        })
      );
    } else {
      console.warn(
        "WebSocket server (global.wss) not available. Cannot broadcast status update."
      );
    }

    return NextResponse.json({
      message: `Status laporan #${reportId} berhasil diperbarui menjadi ${newStatus}.`,
    });
  } catch (error) {
    console.error(`[API Update Report] Error:`, error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
