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
    console.log('Checking columns in reports table...');
    const [rows] = await connection.execute('DESCRIBE reports');
    const columns = rows.map(r => r.Field);
    console.log('Existing columns:', columns);

    if (!columns.includes('category_id')) {
      console.log('Adding category_id column...');
      await connection.execute('ALTER TABLE reports ADD COLUMN category_id INT DEFAULT 1');
      console.log('✅ category_id added');
    }

    if (!columns.includes('kelurahan_id')) {
      console.log('Adding kelurahan_id column...');
      await connection.execute('ALTER TABLE reports ADD COLUMN kelurahan_id INT');
      console.log('✅ kelurahan_id added');
    }

    if (!columns.includes('notes')) {
      console.log('Adding notes column...');
      await connection.execute('ALTER TABLE reports ADD COLUMN notes TEXT');
      console.log('✅ notes added');
    }

    if (!columns.includes('contact')) {
      console.log('Adding contact column...');
      await connection.execute('ALTER TABLE reports ADD COLUMN contact VARCHAR(50)');
      console.log('✅ contact added');
    }

    console.log('Final check of tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    console.log('Tables:', tableNames);

    if (!tableNames.includes('disaster_categories')) {
      console.log('Table disaster_categories missing. Please run add-disaster-categories.mjs after this.');
    }
    
    if (!tableNames.includes('kelurahan')) {
      console.log('Table kelurahan missing.');
    }

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await connection.end();
  }
}

migrate();
