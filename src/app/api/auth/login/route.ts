import { NextRequest, NextResponse } from "next/server";
import { execute, queryRow, formatDateForMySQL } from "@/lib/db";
import { hashOtp } from "@/lib/auth";
import { sendEmailOTP } from "@/lib/email";

function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST: Kirim OTP untuk login
export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        // Validasi input
        if (!email) {
            return NextResponse.json(
                { message: "Email wajib diisi." },
                { status: 400 }
            );
        }

        // Validasi format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { message: "Format email tidak valid." },
                { status: 400 }
            );
        }

        // Cek apakah email sudah terdaftar
        const user = await queryRow<{ id: number; name: string }>(
            "SELECT id, name FROM users WHERE email = ?",
            [email]
        );

        if (!user) {
            return NextResponse.json(
                { message: "Email belum terdaftar. Silakan daftar terlebih dahulu." },
                { status: 404 }
            );
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
            [email, hashedOtp, "login", formatDateForMySQL(expiresAt)]
        );

        // Kirim OTP via email
        const emailResult = await sendEmailOTP(email, otp, "login");

        if (!emailResult.success) {
            return NextResponse.json(
                { message: "Gagal mengirim OTP. Silakan coba lagi." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: `Kode OTP telah dikirim ke ${email}`,
            userName: user.name,
        });
    } catch (error: any) {
        console.error("Error in login:", error);
        return NextResponse.json(
            { message: "Terjadi kesalahan pada server." },
            { status: 500 }
        );
    }
}
