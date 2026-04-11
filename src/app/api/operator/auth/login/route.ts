import { NextRequest, NextResponse } from 'next/server';
import { queryRow } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';
import * as jose from 'jose';
import { serialize } from 'cookie';
import { COOKIE_NAME, OPERATOR_JWT_EXPIRATION, OPERATOR_SESSION_MAX_AGE } from '@/lib/session';
import { getJwtSecretKey } from '@/lib/secrets';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ message: 'Username dan password diperlukan.' }, { status: 400 });
    }

    const operator = await queryRow<{ id: number; username: string; password_hash: string }>(
      'SELECT id, username, password_hash FROM operators WHERE username = ?', [username]
    );

    if (!operator || !(await verifyPassword(password, operator.password_hash))) {
      return NextResponse.json({ message: 'Username atau password salah.' }, { status: 401 });
    }

    const secret = getJwtSecretKey();
    const token = await new jose.SignJWT({ id: operator.id, username: operator.username, isOperator: true })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(OPERATOR_JWT_EXPIRATION)
      .sign(secret);

    const serializedCookie = serialize(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: OPERATOR_SESSION_MAX_AGE,
    });

    return new NextResponse(JSON.stringify({ message: 'Login berhasil!' }), {
      status: 200,
      headers: { 'Set-Cookie': serializedCookie },
    });

  } catch (error) {
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}