/**
 * Script untuk melihat daftar operator di database MySQL
 * 
 * Cara pakai:
 * npx tsx scripts/list-operators.ts
 */

import mysql from 'mysql2/promise';
import 'dotenv/config';

async function listOperators() {
  // Setup database connection
  const db = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'fireguard',
  });

  try {
    const [rows] = await db.execute('SELECT id, username FROM operators');
    const operators = rows as any[];

    if (operators.length === 0) {
      console.log('❌ Tidak ada operator di database.');
      console.log('\n💡 Tambahkan operator dengan:');
      console.log('   npx tsx scripts/add-operator.ts <username> <password>');
      return;
    }

    console.log('📋 Daftar Operator:\n');
    operators.forEach((row: any) => {
      console.log(`   ID: ${row.id} | Username: ${row.username}`);
    });
    console.log(`\n✅ Total: ${operators.length} operator`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.end();
  }
}

listOperators();
