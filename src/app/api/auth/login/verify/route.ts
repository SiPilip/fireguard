import { NextRequest, NextResponse } from "next/server";
import { queryRow, execute } from "@/lib/db";
import { verifyOtp } from "@/lib/auth";
import * as jose from "jose";
import { serialize } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key-for-dev";
const COOKIE_NAME = "auth_token";

// POST: Verifikasi OTP login
export async function POST(request: NextRequest) {
    try {
        const { email, otp } = await request.json();

        if (!email || !otp) {
            return NextResponse.json(
                { message: "Email dan OTP diperlukan." },
                { status: 400 }
            );
        }

        // Cek OTP
        const attempt = await queryRow<{ otp_hash: string; expires_at: string }>(
            "SELECT otp_hash, expires_at FROM otp_attempts WHERE email = ? AND type = 'login' ORDER BY id DESC LIMIT 1",
            [email]
        );

        if (!attempt) {
            return NextResponse.json(
                { message: "OTP tidak ditemukan. Silakan request OTP baru." },
                { status: 400 }
            );
        }

        // Cek expired - gunakan waktu lokal untuk perbandingan
        const expiresAt = new Date(attempt.expires_at);
        const now = new Date();

        console.log(`OTP Check - Expires At: ${expiresAt.toISOString()}, Now: ${now.toISOString()}`);

        if (expiresAt < now) {
            return NextResponse.json(
                { message: "OTP sudah kedaluwarsa. Silakan request OTP baru." },
                { status: 400 }
            );
        }

        // Verifikasi OTP
        if (!verifyOtp(otp, attempt.otp_hash)) {
            return NextResponse.json(
                { message: "Kode OTP salah." },
                { status: 400 }
            );
        }

        // Hapus OTP yang sudah digunakan
        await execute("DELETE FROM otp_attempts WHERE email = ?", [email]);

        // Ambil data user
        const user = await queryRow<{ id: number; name: string; email: string; phone_number: string }>(
            "SELECT id, name, email, phone_number FROM users WHERE email = ?",
            [email]
        );

        if (!user) {
            return NextResponse.json(
                { message: "User tidak ditemukan." },
                { status: 404 }
            );
        }

        // Generate JWT token
        const secret = new TextEncoder().encode(JWT_SECRET);
        const token = await new jose.SignJWT({
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone_number
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("7d")
            .sign(secret);

        const serializedCookie = serialize(COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return new NextResponse(
            JSON.stringify({
                message: "Login berhasil!",
                user: { id: user.id, name: user.name, email: user.email }
            }),
            {
                status: 200,
                headers: { "Set-Cookie": serializedCookie },
            }
        );
    } catch (error: any) {
        console.error("Error verifying login OTP:", error);
        return NextResponse.json(
            { message: "Terjadi kesalahan pada server." },
            { status: 500 }
        );
    }
}
