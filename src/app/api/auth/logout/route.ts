import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

const COOKIE_NAME = 'auth_token';

export async function POST(request: Request) {
  // Buat cookie yang sudah kedaluwarsa untuk menghapusnya dari browser
  const serializedCookie = serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: -1, // Atur maxAge ke nilai negatif untuk menghapus cookie
  });

  return new NextResponse(JSON.stringify({ message: 'Logout berhasil.' }), {
    status: 200,
    headers: { 'Set-Cookie': serializedCookie },
  });
}
