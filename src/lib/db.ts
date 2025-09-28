
import Database from 'better-sqlite3';
import path from 'path';

// Menentukan path ke file database. 
// File ini akan dibuat di dalam folder 'fireguard-app'.
const dbPath = path.resolve(process.cwd(), 'fireguard.db');

// Inisialisasi koneksi database.
// Opsi `verbose` akan mencatat query yang dieksekusi ke konsol, berguna untuk debugging.
export const db = new Database(dbPath, { verbose: console.log });

console.log(`Database connected at ${dbPath}`);

// Memastikan koneksi database ditutup dengan benar saat aplikasi berhenti.
process.on('exit', () => {
  if (db && db.open) {
    db.close();
    console.log('Database connection closed.');
  }
});
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));
