/**
 * Script untuk melihat daftar operator di database
 * 
 * Cara pakai:
 * npx tsx scripts/list-operators.ts
 */

import { createClient } from '@libsql/client';

async function listOperators() {
  // Setup database connection
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL || 'file:local.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  try {
    const result = await db.execute('SELECT id, username FROM operators');
    
    if (result.rows.length === 0) {
      console.log('❌ Tidak ada operator di database.');
      console.log('\n💡 Tambahkan operator dengan:');
      console.log('   npx tsx scripts/add-operator.ts <username> <password>');
      return;
    }

    console.log('📋 Daftar Operator:\n');
    result.rows.forEach((row: any) => {
      console.log(`   ID: ${row.id} | Username: ${row.username}`);
    });
    console.log(`\n✅ Total: ${result.rows.length} operator`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

listOperators();
