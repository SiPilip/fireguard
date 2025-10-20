import { NextRequest, NextResponse } from 'next/server';
import { queryRow, execute, executeAndGetLastInsertId } from '@/lib/db';
import { verifyOtp } from '@/lib/auth';
import * as jose from 'jose';
import { serialize } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-dev';
const COOKIE_NAME = 'auth_token';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp } = await request.json();
    if (!phoneNumber || !otp) {
      return NextResponse.json({ message: 'Nomor telepon dan OTP diperlukan.' }, { status: 400 });
    }

    const attempt = await queryRow<{ otp_hash: string; expires_at: string }>(
      'SELECT otp_hash, expires_at FROM otp_attempts WHERE phone_number = ? ORDER BY id DESC LIMIT 1',
      [phoneNumber]
    );

    if (!attempt) {
      return NextResponse.json({ message: 'OTP tidak ditemukan atau sudah kedaluwarsa.' }, { status: 400 });
    }

    if (new Date() > new Date(attempt.expires_at)) {
      return NextResponse.json({ message: 'OTP sudah kedaluwarsa.' }, { status: 400 });
    }

    if (!verifyOtp(otp, attempt.otp_hash)) {
      return NextResponse.json({ message: 'Kode OTP salah.' }, { status: 400 });
    }

    await execute('DELETE FROM otp_attempts WHERE phone_number = ?', [phoneNumber]);

    let user = await queryRow<{ id: number; phone_number: string }>(
        'SELECT id, phone_number FROM users WHERE phone_number = ?', [phoneNumber]
    );

    if (!user) {
      const newUserId = await executeAndGetLastInsertId('INSERT INTO users (phone_number) VALUES (?)', [phoneNumber]);
      console.log('New User ID:', newUserId);
      user = { id: newUserId, phone_number: phoneNumber };
    }

    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new jose.SignJWT({ id: user.id, phone: user.phone_number })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    const serializedCookie = serialize(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return new NextResponse(JSON.stringify({ message: 'Login berhasil!' }), {
      status: 200,
      headers: { 'Set-Cookie': serializedCookie },
    });

  } catch (error) {
    console.error('[API Verify OTP] Error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}