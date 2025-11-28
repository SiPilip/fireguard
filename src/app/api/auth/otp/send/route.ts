import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db";
import { hashOtp } from "@/lib/auth";

// --- Konfigurasi Fonnte ---
// Ganti dengan Token API Fonnte Anda. Simpan di .env.local untuk keamanan.
const FONNTE_TOKEN = process.env.FONNTE_TOKEN || "HV2NYWTpKWSbwd25KQU8";

/**
 * Fungsi untuk mengirim pesan OTP melalui Fonnte
 * @param target Nomor telepon tujuan (format internasional, misal: 628xxxx)
 * @param otp Kode OTP yang akan dikirim
 */
async function sendWhatsAppOtp(target: string, otp: string) {
  const data = new FormData();
  data.append("target", target);
  data.append(
    "message",
    `[FireGuard] Jangan berikan kode ini kepada siapa pun! Kode verifikasi Anda adalah: *${otp}*`
  );
  data.append("countryCode", "62"); // Sesuaikan jika perlu

  try {
    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: FONNTE_TOKEN,
      },
      body: data,
    });

    if (!response.ok) {
      throw new Error(
        `Gagal mengirim OTP via WhatsApp, status: ${response.status}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    // Jangan throw error di sini agar proses utama tetap berjalan,
    // namun OTP tidak akan terkirim. Cukup log errornya.
  }
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();
    if (!phoneNumber || !/^\d{10,15}$/.test(phoneNumber)) {
      return NextResponse.json(
        { message: "Nomor telepon tidak valid." },
        { status: 400 }
      );
    }

    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Berlaku 5 menit

    // Simpan OTP ke database terlebih dahulu
    await execute("DELETE FROM otp_attempts WHERE phone_number = ?", [
      phoneNumber,
    ]);
    await execute(
      "INSERT INTO otp_attempts (phone_number, otp_hash, expires_at) VALUES (?, ?, ?)",
      [phoneNumber, hashedOtp, expiresAt.toISOString()]
    );

    // Kirim OTP via WhatsApp menggunakan Fonnte
    // Proses ini berjalan di latar belakang dan tidak memblokir respons API
    sendWhatsAppOtp(phoneNumber, otp);

    // Beri tahu pengguna bahwa OTP telah dikirim tanpa menyertakan OTP dalam respons
    return NextResponse.json({
      message: `Kode OTP telah dikirim ke ${phoneNumber}.`,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
