import { NextRequest, NextResponse } from "next/server";
import { queryRow, execute, executeAndGetLastInsertId } from "@/lib/db";
import { verifyOtp } from "@/lib/auth";
import * as jose from "jose";
import { serialize } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key-for-dev";
const COOKIE_NAME = "auth_token";

// POST: Verifikasi OTP registrasi dan buat user baru
export async function POST(request: NextRequest) {
    try {
        const { email, otp, name, phoneNumber } = await request.json();

        if (!email || !otp || !name) {
            return NextResponse.json(
                { message: "Email, OTP, dan nama diperlukan." },
                { status: 400 }
            );
        }

        // Cek OTP
        const attempt = await queryRow<{ otp_hash: string; expires_at: string }>(
            "SELECT otp_hash, expires_at FROM otp_attempts WHERE email = ? AND type = 'register' ORDER BY id DESC LIMIT 1",
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

        // Cek apakah email sudah terdaftar (double check)
        const existingUser = await queryRow<{ id: number }>(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUser) {
            return NextResponse.json(
                { message: "Email sudah terdaftar." },
                { status: 400 }
            );
        }

        // Buat user baru
        const userId = await executeAndGetLastInsertId(
            "INSERT INTO users (name, email, phone_number, is_verified) VALUES (?, ?, ?, 1)",
            [name, email, phoneNumber || null]
        );

        // Generate JWT token
        const secret = new TextEncoder().encode(JWT_SECRET);
        const token = await new jose.SignJWT({
            id: userId,
            email,
            name,
            phone: phoneNumber || null
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
                message: "Registrasi berhasil!",
                user: { id: userId, name, email }
            }),
            {
                status: 201,
                headers: { "Set-Cookie": serializedCookie },
            }
        );
    } catch (error: any) {
        console.error("Error verifying register OTP:", error);
        return NextResponse.json(
            { message: "Terjadi kesalahan pada server." },
            { status: 500 }
        );
    }
}
