import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

(async () => {
  const db = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'fireguard',
  });

  try {
    // Cek apakah kolom sudah ada
    const [cols] = await db.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'users' 
       AND COLUMN_NAME = 'password_hash'`
    );

    if (cols.length > 0) {
      console.log('ℹ️  Kolom password_hash sudah ada!');
    } else {
      await db.execute(
        'ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL AFTER phone_number'
      );
      console.log('✅ Kolom password_hash berhasil ditambahkan!');
    }

    // Tampilkan struktur tabel
    const [rows] = await db.execute('DESCRIBE users');
    console.log('\nStruktur tabel users:');
    rows.forEach(r => console.log(`  - ${r.Field} (${r.Type})`));

  } catch (e) {
    console.error('❌ Error:', e.message);
  }

  await db.end();
})();
