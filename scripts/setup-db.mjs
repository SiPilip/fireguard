import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

async function setup() {
  // Skrip ini harus dijalankan dari root folder proyek Next.js (`fireguard-app`)
  const dbPath = path.resolve('fireguard.db');
  const db = new Database(dbPath);

  console.log('Menjalankan skrip setup database...');

  // Hapus tabel yang ada untuk memastikan setup yang bersih (baik untuk pengembangan)
  db.exec(`DROP TABLE IF EXISTS reports;`);
  db.exec(`DROP TABLE IF EXISTS operators;`);
  db.exec(`DROP TABLE IF EXISTS users;`);
  db.exec(`DROP TABLE IF EXISTS otp_attempts;`);
  console.log('Tabel yang ada telah dihapus.');

  // Buat tabel users
  // Menyimpan informasi pengguna biasa yang membuat laporan
  const createUsersTable = db.prepare(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone_number TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  createUsersTable.run();
  console.log('Tabel "users" berhasil dibuat.');

  // Buat tabel operators
  // Menyimpan informasi operator yang mengelola laporan
  const createOperatorsTable = db.prepare(`
    CREATE TABLE operators (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  createOperatorsTable.run();
  console.log('Tabel "operators" berhasil dibuat.');

  // Buat tabel reports
  // Menyimpan semua laporan yang dikirim oleh pengguna
  const createReportsTable = db.prepare(`
    CREATE TABLE reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      address TEXT,
      media_url TEXT,
      status TEXT NOT NULL DEFAULT 'Pending', -- Contoh status: Pending, In Progress, Resolved
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
  createReportsTable.run();
  console.log('Tabel "reports" berhasil dibuat.');

  // Buat tabel otp_attempts
  // Menyimpan percobaan OTP yang dikirimkan
  const createOtpAttemptsTable = db.prepare(`
    CREATE TABLE otp_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone_number TEXT NOT NULL,
      otp_hash TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL
    )
  `);
  createOtpAttemptsTable.run();
  console.log('Tabel "otp_attempts" berhasil dibuat.');

  // Buat operator default
  const defaultPassword = 'operator123';
  const hashedPassword = await bcrypt.hash(defaultPassword, SALT_ROUNDS);
  const insertOperator = db.prepare('INSERT INTO operators (username, password_hash) VALUES (?, ?)');
  insertOperator.run('operator', hashedPassword);
  console.log('Operator default (username: operator, password: operator123) berhasil dibuat.');

  console.log('Setup database selesai!');
  db.close();
}

setup().catch(err => {
  console.error('Gagal menjalankan setup database:', err);
  process.exit(1);
});
