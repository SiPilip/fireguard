import { NextRequest, NextResponse } from "next/server";
import { execute, queryRow, formatDateForMySQL } from "@/lib/db";
import { hashOtp } from "@/lib/auth";
import { sendEmailOTP } from "@/lib/email";
import { handleCorsOptions, jsonWithCors } from "@/lib/cors";

function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function OPTIONS() {
    return handleCorsOptions();
}

// POST: Kirim OTP untuk registrasi
export async function POST(request: NextRequest) {
    try {
        const { name, email, phoneNumber, password } = await request.json();

        // Validasi input
        if (!name || !email) {
            return jsonWithCors({ message: "Nama dan email wajib diisi." }, { status: 400 });
        }

        if (!password || password.length < 6) {
            return jsonWithCors({ message: "Password minimal 6 karakter." }, { status: 400 });
        }

        // Validasi format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return jsonWithCors({ message: "Format email tidak valid." }, { status: 400 });
        }

        // Cek apakah email sudah terdaftar
        const existingUser = await queryRow<{ id: number }>(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUser) {
            return jsonWithCors({ message: "Email sudah terdaftar. Silakan login." }, { status: 400 });
        }

        // Generate OTP
        const otp = generateOtp();
        const hashedOtp = hashOtp(otp);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

        // Hapus OTP lama untuk email ini
        await execute("DELETE FROM otp_attempts WHERE email = ?", [email]);

        // Simpan OTP baru
        await execute(
            "INSERT INTO otp_attempts (email, otp_hash, type, expires_at) VALUES (?, ?, ?, ?)",
            [email, hashedOtp, "register", formatDateForMySQL(expiresAt)]
        );

        // Kirim OTP via email
        const emailResult = await sendEmailOTP(email, otp, "register");

        if (!emailResult.success) {
            return jsonWithCors({ message: "Gagal mengirim OTP. Silakan coba lagi." }, { status: 500 });
        }

        return jsonWithCors({
            message: `Kode OTP telah dikirim ke ${email}`,
            tempData: { name, email, phoneNumber: phoneNumber || null },
        });
    } catch (error: any) {
        console.error("Error in register:", error);
        return jsonWithCors({ message: "Terjadi kesalahan pada server." }, { status: 500 });
    }
}
