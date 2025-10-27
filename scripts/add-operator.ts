/**
 * Script untuk menambahkan operator baru ke database
 * 
 * Cara pakai:
 * npx tsx scripts/add-operator.ts <username> <password>
 * 
 * Contoh:
 * npx tsx scripts/add-operator.ts admin admin123
 */

import { createClient } from '@libsql/client';
import bcrypt from 'bcrypt';

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('❌ Usage: npx tsx scripts/add-operator.ts <username> <password>');
  process.exit(1);
}

const [username, password] = args;

async function addOperator() {
  // Setup database connection
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL || 'file:local.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  try {
    // Hash password (using bcrypt with 10 salt rounds)
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert operator
    await db.execute({
      sql: 'INSERT INTO operators (username, password_hash) VALUES (?, ?)',
      args: [username, passwordHash],
    });

    console.log('✅ Operator berhasil ditambahkan!');
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log('\n⚠️  Simpan kredensial ini dengan aman!');
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint')) {
      console.error('❌ Username sudah ada! Gunakan username lain.');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

addOperator();
