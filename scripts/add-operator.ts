/**
 * Script untuk menambahkan operator baru ke database MySQL
 * 
 * Cara pakai:
 * npx tsx scripts/add-operator.ts <username> <password>
 * 
 * Contoh:
 * npx tsx scripts/add-operator.ts admin admin123
 */

import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('❌ Usage: npx tsx scripts/add-operator.ts <username> <password>');
  process.exit(1);
}

const [username, password] = args;

async function addOperator() {
  // Setup database connection
  const db = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'fireguard',
  });

  try {
    // Hash password (using bcrypt with 10 salt rounds)
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert operator
    await db.execute(
      'INSERT INTO operators (username, password_hash) VALUES (?, ?)',
      [username, passwordHash]
    );

    console.log('✅ Operator berhasil ditambahkan!');
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log('\n⚠️  Simpan kredensial ini dengan aman!');
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.error('❌ Username sudah ada! Gunakan username lain.');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await db.end();
  }
}

addOperator();
