import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { hashOtp } from '@/lib/auth';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();
    if (!phoneNumber || !/^\d{10,15}$/.test(phoneNumber)) {
      return NextResponse.json({ message: 'Nomor telepon tidak valid.' }, { status: 400 });
    }

    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Berlaku 5 menit

    console.log(`[KHUSUS DEMO] Kode verifikasi Anda adalah: ${otp}`);

    await execute('DELETE FROM otp_attempts WHERE phone_number = ?', [phoneNumber]);
    await execute(
      'INSERT INTO otp_attempts (phone_number, otp_hash, expires_at) VALUES (?, ?, ?)',
      [phoneNumber, hashedOtp, expiresAt.toISOString()]
    );

    return NextResponse.json({ message: 'OTP berhasil dikirim (simulasi).', otp: otp });
  } catch (error) {
    console.error('[API Send OTP] Error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
