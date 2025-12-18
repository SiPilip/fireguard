import mysql from 'mysql2/promise';
import 'dotenv/config';

async function addNotificationsTable() {
  console.log('🔧 Adding notifications table to database...');
  
  const db = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'fireguard',
  });

  try {
    // Check if table exists
    const [tables] = await db.execute(`SHOW TABLES LIKE 'notifications'`);
    
    if (tables.length > 0) {
      console.log('✅ Table notifications already exists');
    } else {
      // Create notifications table
      await db.execute(`
        CREATE TABLE notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR(50) DEFAULT 'info',
          report_id INT NULL,
          is_read TINYINT(1) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_user_id (user_id),
          INDEX idx_is_read (is_read),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Table notifications created successfully');
    }

    await db.end();
    console.log('✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    await db.end();
    process.exit(1);
  }
}

addNotificationsTable();
