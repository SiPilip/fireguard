import { NextRequest, NextResponse } from "next/server";
import { queryRow } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";
import * as jose from "jose";
import { serialize } from "cookie";
import {
  COOKIE_NAME,
  USER_JWT_EXPIRATION,
  USER_SESSION_MAX_AGE,
} from "@/lib/session";
import { getJwtSecretKey } from "@/lib/secrets";
import { corsHeaders, handleCorsOptions, jsonWithCors } from "@/lib/cors";

// OPTIONS: CORS preflight
export async function OPTIONS() {
  return handleCorsOptions();
}

// POST: Login dengan password
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validasi input
    if (!email) {
      return jsonWithCors({ message: "Email wajib diisi." }, { status: 400 });
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return jsonWithCors(
        { message: "Format email tidak valid." },
        { status: 400 },
      );
    }

    // Cek apakah email sudah terdaftar
    const user = await queryRow<{
      id: number;
      name: string;
      email: string;
      phone_number: string | null;
      password_hash: string | null;
    }>(
      "SELECT id, name, email, phone_number, password_hash FROM users WHERE email = ?",
      [email],
    );

    if (!user) {
      return jsonWithCors(
        { message: "Email belum terdaftar. Silakan daftar terlebih dahulu." },
        { status: 404 },
      );
    }

    // Mode utama: login dengan password
    if (typeof password === "string" && password.length > 0) {
      if (!user.password_hash) {
        return jsonWithCors(
          {
            message:
              "Akun Anda belum memiliki password. Silakan reset password atau hubungi admin.",
          },
          { status: 409 },
        );
      }

      const isValidPassword = await verifyPassword(
        password,
        user.password_hash,
      );
      if (!isValidPassword) {
        return jsonWithCors(
          { message: "Email atau password salah." },
          { status: 401 },
        );
      }

      const secret = getJwtSecretKey();
      const token = await new jose.SignJWT({
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone_number,
        isOperator: false,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(USER_JWT_EXPIRATION)
        .sign(secret);

      const serializedCookie = serialize(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: USER_SESSION_MAX_AGE,
      });

      // Return token in body (for Flutter Bearer auth) + cookie (for web)
      return new NextResponse(
        JSON.stringify({
          message: "Login berhasil!",
          token: token,
          user: { id: user.id, name: user.name, email: user.email },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": serializedCookie,
            ...corsHeaders(),
          },
        },
      );
    }

    return jsonWithCors(
      { message: "Email dan password wajib diisi." },
      { status: 400 },
    );
  } catch (error: any) {
    console.error("Error in login:", error);
    return jsonWithCors(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 },
    );
  }
}
