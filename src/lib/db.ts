import { createClient } from '@libsql/client';

// Pastikan environment variables sudah di-set di Vercel atau di file .env.local
if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set');
}

// Konfigurasi klien database Turso.
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Fungsi untuk mengeksekusi query SELECT yang mengembalikan banyak baris
export async function queryRows<T>(sql: string, args?: any[]): Promise<T[]> {
    const rs = await db.execute({ sql, args });
    return rs.rows as T[];
}

// Fungsi untuk mengeksekusi query SELECT yang mengembalikan satu baris
export async function queryRow<T>(sql: string, args?: any[]): Promise<T | null> {
    const rs = await db.execute({ sql, args });
    return (rs.rows[0] as T) || null;
}

// Fungsi untuk mengeksekusi query INSERT, UPDATE, DELETE
export async function execute(sql: string, args?: any[]): Promise<number> {
    const rs = await db.execute({ sql, args });
    return rs.rowsAffected;
}

// Fungsi untuk mengeksekusi query INSERT dan mendapatkan ID baris terakhir
export async function executeAndGetLastInsertId(sql: string, args?: any[]): Promise<number> {
    const rs = await db.execute({ sql, args });
    return Number(rs.lastInsertRowid);
}
