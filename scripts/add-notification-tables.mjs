import mysql from 'mysql2/promise';
import 'dotenv/config';

async function addNotificationTables() {
  console.log('🔧 Adding notification tables to database...');
  
  const db = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'fireguard',
  });

  try {
    // Check and create device_tokens table
    const [deviceTokensTables] = await db.execute(`SHOW TABLES LIKE 'device_tokens'`);
    
    if (deviceTokensTables.length > 0) {
      console.log('✅ Table device_tokens already exists');
    } else {
      await db.execute(`
        CREATE TABLE device_tokens (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          device_token VARCHAR(255) NOT NULL UNIQUE,
          platform ENUM('android', 'ios') NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at DATETIME NOT NULL,
          updated_at DATETIME NOT NULL,
          last_used_at DATETIME,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_id (user_id),
          INDEX idx_device_token (device_token),
          INDEX idx_active (is_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Table device_tokens created successfully');
    }

    // Check and create notification_preferences table
    const [notificationPreferencesTables] = await db.execute(`SHOW TABLES LIKE 'notification_preferences'`);
    
    if (notificationPreferencesTables.length > 0) {
      console.log('✅ Table notification_preferences already exists');
    } else {
      await db.execute(`
        CREATE TABLE notification_preferences (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL UNIQUE,
          approved BOOLEAN DEFAULT TRUE,
          in_progress BOOLEAN DEFAULT TRUE,
          completed BOOLEAN DEFAULT TRUE,
          verified BOOLEAN DEFAULT TRUE,
          false_report BOOLEAN DEFAULT TRUE,
          created_at DATETIME NOT NULL,
          updated_at DATETIME NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_id (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Table notification_preferences created successfully');
    }

    // Check and create notification_logs table
    const [notificationLogsTables] = await db.execute(`SHOW TABLES LIKE 'notification_logs'`);
    
    if (notificationLogsTables.length > 0) {
      console.log('✅ Table notification_logs already exists');
    } else {
      await db.execute(`
        CREATE TABLE notification_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          report_id INT NOT NULL,
          user_id INT NOT NULL,
          device_token VARCHAR(255) NOT NULL,
          status_change VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          body TEXT NOT NULL,
          delivery_status ENUM('sent', 'failed', 'retry') NOT NULL,
          error_message TEXT,
          retry_count INT DEFAULT 0,
          sent_at DATETIME NOT NULL,
          FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_report_id (report_id),
          INDEX idx_user_id (user_id),
          INDEX idx_sent_at (sent_at),
          INDEX idx_delivery_status (delivery_status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Table notification_logs created successfully');
    }

    await db.end();
    console.log('✅ Done! All notification tables are ready.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    await db.end();
    process.exit(1);
  }
}

addNotificationTables();
