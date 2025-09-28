import { createHmac } from 'crypto';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// Di aplikasi nyata, SANGAT PENTING untuk menggunakan secret dari environment variable
const HASH_SECRET = process.env.OTP_HASH_SECRET || 'secret-development-key';

/**
 * Membuat hash dari string OTP.
 * @param otp Kode OTP (string).
 * @returns Hash dari OTP.
 */
export function hashOtp(otp: string): string {
  return createHmac('sha256', HASH_SECRET).update(otp).digest('hex');
}

/**
 * Memverifikasi apakah OTP mentah cocok dengan hash yang tersimpan.
 * @param otp Kode OTP mentah yang dimasukkan pengguna.
 * @param hashedOtp Hash yang tersimpan di database.
 * @returns `true` jika cocok, `false` jika tidak.
 */
export function verifyOtp(otp: string, hashedOtp: string): boolean {
  const newHash = hashOtp(otp);
  return newHash === hashedOtp;
}

/**
 * Membuat hash dari password.
 * @param password Password mentah.
 * @returns Hash dari password.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Memverifikasi apakah password mentah cocok dengan hash.
 * @param password Password mentah.
 * @param hash Hash yang tersimpan.
 * @returns `true` jika cocok, `false` jika tidak.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
