import { NextRequest, NextResponse } from "next/server";
import { execute, queryRow } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { requireAuth } from "@/lib/api-security";

export async function POST(request: NextRequest) {
    try {
        const auth = await requireAuth(request);
        if ("response" in auth) return auth.response;
        const payload = auth.payload;

        if (!payload.id || payload.isOperator === true) {
            return NextResponse.json(
                { message: "Akses tidak valid." },
                { status: 403 }
            );
        }

        const { password, confirmPassword } = await request.json();
        if (!password || !confirmPassword) {
            return NextResponse.json(
                { message: "Password dan konfirmasi password wajib diisi." },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { message: "Password minimal 8 karakter." },
                { status: 400 }
            );
        }

        if (password !== confirmPassword) {
            return NextResponse.json(
                { message: "Konfirmasi password tidak cocok." },
                { status: 400 }
            );
        }

        const user = await queryRow<{ id: number }>(
            "SELECT id FROM users WHERE id = ?",
            [payload.id]
        );

        if (!user) {
            return NextResponse.json(
                { message: "User tidak ditemukan." },
                { status: 404 }
            );
        }

        const passwordHash = await hashPassword(password);
        await execute(
            "UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?",
            [passwordHash, payload.id]
        );

        return NextResponse.json({ message: "Password berhasil disimpan." });
    } catch (error: any) {
        console.error("Error setting up password:", error);
        return NextResponse.json(
            { message: "Terjadi kesalahan pada server." },
            { status: 500 }
        );
    }
}
