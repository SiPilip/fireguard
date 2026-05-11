const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: '157.245.63.114',
    port: 3306,
    user: 'fireguard_user',
    password: 'RahasiaFireguard123!',
    database: 'fireguard_db',
  });

  try {
    console.log('🔧 Starting full migration...');

    // 1. Create kelurahan table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS kelurahan (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        kode_pos VARCHAR(10) NOT NULL,
        kecamatan VARCHAR(100) NOT NULL DEFAULT 'Plaju',
        kota VARCHAR(100) NOT NULL DEFAULT 'Plaju, Palembang',
        description TEXT,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table kelurahan ready');

    // 2. Create disaster_categories table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS disaster_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        icon VARCHAR(10) NOT NULL,
        color VARCHAR(20) NOT NULL,
        description TEXT,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table disaster_categories ready');

    // 3. Add columns to reports
    const [rows] = await connection.execute('DESCRIBE reports');
    const columns = rows.map(r => r.Field);

    if (!columns.includes('category_id')) {
      await connection.execute('ALTER TABLE reports ADD COLUMN category_id INT DEFAULT 1');
      console.log('✅ category_id added to reports');
    }
    if (!columns.includes('kelurahan_id')) {
      await connection.execute('ALTER TABLE reports ADD COLUMN kelurahan_id INT');
      console.log('✅ kelurahan_id added to reports');
    }
    if (!columns.includes('notes')) {
      await connection.execute('ALTER TABLE reports ADD COLUMN notes TEXT');
      console.log('✅ notes added to reports');
    }
    if (!columns.includes('contact')) {
      await connection.execute('ALTER TABLE reports ADD COLUMN contact VARCHAR(50)');
      console.log('✅ contact added to reports');
    }

    // 4. Seed data
    const [catCount] = await connection.execute('SELECT COUNT(*) as count FROM disaster_categories');
    if (catCount[0].count === 0) {
      const categories = [
        ['Kebakaran lingkungan & lahan kecil', '🔥', '#EF4444', 'Kebakaran di lingkungan perumahan atau lahan kecil'],
        ['Banjir & genangan wilayah rawa', '🌊', '#3B82F6', 'Banjir dan genangan air di wilayah rawa'],
        ['Angin kencang & cuaca ekstrem', '🌪️', '#6B7280', 'Angin kencang, hujan lebat, dan cuaca ekstrem lainnya'],
        ['Kerusakan infrastruktur lingkungan', '🏚️', '#78350F', 'Kerusakan jalan, jembatan, dan infrastruktur lingkungan'],
        ['Pencemaran & sampah berisiko', '☣️', '#10B981', 'Pencemaran lingkungan dan penumpukan sampah berbahaya'],
      ];
      for (const cat of categories) {
        await connection.execute('INSERT INTO disaster_categories (name, icon, color, description) VALUES (?, ?, ?, ?)', cat);
      }
      console.log('✅ Seeded disaster categories');
    }

    const [kelCount] = await connection.execute('SELECT COUNT(*) as count FROM kelurahan');
    if (kelCount[0].count === 0) {
      const kelDir = [
        ['Plaju Ulu', '30266', 'Plaju', 'Plaju, Palembang', 'Pasar dan pemukiman padat.'],
        ['Plaju Darat', '30267', 'Plaju', 'Plaju, Palembang', 'Area darat.'],
        ['Plaju Ilir', '30268', 'Plaju', 'Plaju, Palembang', 'Dekat kilang pertamina.'],
        ['Bagus Kuning', '30268', 'Plaju', 'Plaju, Palembang', 'Tepian Sungai Musi.'],
        ['Komperta', '30268', 'Plaju', 'Plaju, Palembang', 'Komplek Pertamina.'],
        ['Talang Bubuk', '30268', 'Plaju', 'Plaju, Palembang', 'Pemukiman luas.'],
        ['Talang Putri', '30268', 'Plaju', 'Plaju, Palembang', 'Sisi timur.'],
      ];
      for (const kel of kelDir) {
        await connection.execute('INSERT INTO kelurahan (name, kode_pos, kecamatan, kota, description) VALUES (?, ?, ?, ?, ?)', kel);
      }
      console.log('✅ Seeded kelurahan');
    }

    console.log('🚀 Migration successful!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await connection.end();
  }
}

migrate();
