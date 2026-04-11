import mysql from 'mysql2/promise';

// Konfigurasi connection pool untuk MySQL
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'fireguard',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',     // ← Paksa mysql2 baca/tulis DATETIME sebagai UTC
  dateStrings: false,     // ← Kembalikan Date object (bukan string)
});

// Fungsi untuk mengeksekusi query SELECT yang mengembalikan banyak baris
export async function queryRows<T>(sql: string, args?: any[]): Promise<T[]> {
  const [rows] = await pool.execute(sql, args || []);
  return rows as T[];
}

// Fungsi untuk mengeksekusi query SELECT yang mengembalikan satu baris
export async function queryRow<T>(sql: string, args?: any[]): Promise<T | null> {
  const [rows] = await pool.execute(sql, args || []);
  const result = rows as T[];
  return result[0] || null;
}

// Fungsi untuk mengeksekusi query INSERT, UPDATE, DELETE
export async function execute(sql: string, args?: any[]): Promise<number> {
  const [result] = await pool.execute(sql, args || []);
  return (result as mysql.ResultSetHeader).affectedRows;
}

// Fungsi untuk mengeksekusi query INSERT dan mendapatkan ID baris terakhir
export async function executeAndGetLastInsertId(sql: string, args?: any[]): Promise<number> {
  const [result] = await pool.execute(sql, args || []);
  return (result as mysql.ResultSetHeader).insertId;
}

// Export pool untuk akses langsung jika diperlukan
export { pool };

// Helper function untuk format Date ke format MySQL datetime (UTC)
// Selalu gunakan UTC agar konsisten dengan JavaScript Date comparison
export function formatDateForMySQL(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
