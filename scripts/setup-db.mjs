import { createClient } from '@libsql/client';
import bcrypt from 'bcrypt';
import 'dotenv/config'; // Untuk memuat variabel dari .env saat menjalankan lokal

const SALT_ROUNDS = 10;

async function setup() {
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables must be set.');
  }

  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  console.log('Running database setup script on Turso...');

  const schema = [
    `DROP TABLE IF EXISTS reports;`,
    `DROP TABLE IF EXISTS operators;`,
    `DROP TABLE IF EXISTS users;`,
    `DROP TABLE IF EXISTS otp_attempts;`,
    `CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, phone_number TEXT NOT NULL UNIQUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE operators (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE reports (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, latitude REAL NOT NULL, longitude REAL NOT NULL, address TEXT, media_url TEXT, status TEXT NOT NULL DEFAULT 'Pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users (id));`,
    `CREATE TABLE otp_attempts (id INTEGER PRIMARY KEY AUTOINCREMENT, phone_number TEXT NOT NULL, otp_hash TEXT NOT NULL, expires_at TIMESTAMP NOT NULL);`
  ];

  try {
    await db.batch(schema, 'write');
    console.log('Tables created successfully.');

    // Buat operator default
    const defaultPassword = 'operator123';
    const hashedPassword = await bcrypt.hash(defaultPassword, SALT_ROUNDS);
    await db.execute({
      sql: 'INSERT INTO operators (username, password_hash) VALUES (?, ?)',
      args: ['operator', hashedPassword]
    });
    console.log('Default operator created (username: operator, password: operator123).');

    console.log('Database setup complete!');

  } catch (e) {
    console.error('Failed to setup database:', e);
  }
}

setup();
