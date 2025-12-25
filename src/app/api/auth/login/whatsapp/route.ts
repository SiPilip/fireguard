import { NextRequest, NextResponse } from "next/server";
import { execute, queryRow, formatDateForMySQL } from "@/lib/db";
import { hashOtp } from "@/lib/auth";

// --- Konfigurasi Fonnte ---
const FONNTE_TOKEN = process.env.FONNTE_TOKEN || "HV2NYWTpKWSbwd25KQU8";

function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Fungsi untuk mengirim pesan OTP melalui Fonnte
 */
async function sendWhatsAppOtp(target: string, otp: string): Promise<{ status: boolean; message?: string }> {
    const data = new FormData();
    data.append("target", target);
    data.append(
        "message",
        `[FireGuard] Jangan berikan kode ini kepada siapa pun! Kode login Anda adalah: *${otp}*\n\nKode ini berlaku selama 5 menit.`
    );
    data.append("countryCode", "62");

    try {
        console.log(`📱 Sending Login OTP via WhatsApp to: ${target}`);

        const response = await fetch("https://api.fonnte.com/send", {
            method: "POST",
            headers: {
                Authorization: FONNTE_TOKEN,
            },
            body: data,
        });

        if (!response.ok) {
            console.error(`❌ WhatsApp API error, status: ${response.status}`);
            return { status: false, message: `API error: ${response.status}` };
        }

        const result = await response.json();
        console.log(`✅ WhatsApp Login OTP sent successfully:`, result);
        return { status: true, ...result };
    } catch (error: any) {
        console.error("❌ Error sending WhatsApp OTP:", error);
        return { status: false, message: error.message || "Unknown error" };
    }
}

// POST: Kirim OTP untuk login via WhatsApp
export async function POST(request: NextRequest) {
    try {
        const { phoneNumber } = await request.json();

        // Validasi input
        if (!phoneNumber) {
            return NextResponse.json(
                { message: "Nomor WhatsApp wajib diisi." },
                { status: 400 }
            );
        }

        // Validasi format nomor telepon
        const cleanPhone = phoneNumber.replace(/\D/g, "");
        if (cleanPhone.length < 10 || cleanPhone.length > 15) {
            return NextResponse.json(
                { message: "Format nomor WhatsApp tidak valid." },
                { status: 400 }
            );
        }

        // Cek apakah nomor terdaftar
        const user = await queryRow<{ id: number; name: string; email: string; phone_number: string }>(
            "SELECT id, name, email, phone_number FROM users WHERE phone_number = ?",
            [cleanPhone]
        );

        if (!user) {
            return NextResponse.json(
                { message: "Nomor WhatsApp belum terdaftar. Silakan daftar terlebih dahulu." },
                { status: 404 }
            );
        }

        // Generate OTP
        const otp = generateOtp();
        const hashedOtp = hashOtp(otp);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

        // Hapus OTP lama untuk nomor ini
        await execute("DELETE FROM otp_attempts WHERE phone_number = ? OR email = ?", [cleanPhone, user.email]);

        // Simpan OTP baru (termasuk email untuk konsistensi)
        await execute(
            "INSERT INTO otp_attempts (email, phone_number, otp_hash, type, expires_at) VALUES (?, ?, ?, ?, ?)",
            [user.email, cleanPhone, hashedOtp, "login", formatDateForMySQL(expiresAt)]
        );

        // Kirim OTP via WhatsApp - REALTIME dengan await
        const whatsappResult = await sendWhatsAppOtp(cleanPhone, otp);

        // Cek apakah pengiriman berhasil
        if (!whatsappResult.status) {
            console.error("❌ Gagal mengirim OTP via WhatsApp:", whatsappResult);
            return NextResponse.json(
                { message: "Gagal mengirim OTP ke WhatsApp. Silakan coba lagi." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: `Kode OTP telah dikirim ke ${phoneNumber}`,
            userName: user.name,
        });
    } catch (error: any) {
        console.error("❌ Error in WhatsApp login:", error);
        return NextResponse.json(
            { message: "Terjadi kesalahan pada server." },
            { status: 500 }
        );
    }
}
