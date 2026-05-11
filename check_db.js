const mysql = require('mysql2/promise');

async function check() {
  const pool = mysql.createPool({
    host: '157.245.63.114',
    port: 3306,
    user: 'fireguard_user',
    password: 'RahasiaFireguard123!',
    database: 'fireguard_db',
  });

  try {
    const [rows] = await pool.execute('DESCRIBE reports');
    console.log('Columns in reports table:');
    rows.forEach((row) => console.log(row.Field));
    
    const [tables] = await pool.execute('SHOW TABLES');
    console.log('\nTables in database:');
    tables.forEach((table) => console.log(Object.values(table)[0]));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

check();
