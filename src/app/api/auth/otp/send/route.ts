import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashOtp } from '@/lib/auth';

// Ini adalah simulasi dari layanan pembuatan dan pengiriman OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber || !/^\d{10,15}$/.test(phoneNumber)) {
      return NextResponse.json({ message: 'Nomor telepon tidak valid.' }, { status: 400 });
    }

    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Berlaku 5 menit

    // PENTING: Untuk tujuan simulasi, kita tampilkan OTP di konsol server.
    // Di aplikasi nyata, baris ini akan diganti dengan panggilan ke API WhatsApp (misal: Twilio).
    console.log(`\n\n====================================`);
    console.log(`   SIMULASI OTP untuk ${phoneNumber}   `);
    console.log(`   KODE OTP ANDA: ${otp}            `);
    console.log(`====================================\n\n`);

    // Hapus OTP lama untuk nomor yang sama sebelum memasukkan yang baru
    db.prepare('DELETE FROM otp_attempts WHERE phone_number = ?').run(phoneNumber);

    // Simpan hash OTP yang baru ke database
    const stmt = db.prepare(
      'INSERT INTO otp_attempts (phone_number, otp_hash, expires_at) VALUES (?, ?, ?)'
    );
    stmt.run(phoneNumber, hashedOtp, expiresAt.toISOString());

    return NextResponse.json({ message: 'OTP berhasil dikirim (simulasi).' });

  } catch (error) {
    console.error('[API Send OTP] Error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
