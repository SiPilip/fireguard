import mysql from 'mysql2/promise';

async function check() {
    const pool = mysql.createPool({
        host: '157.245.63.114',
        port: 3306,
        user: 'fireguard_user',
        password: 'RahasiaFireguard123!',
        database: 'fireguard_db',
    });

    try {
        const [rows]: any = await pool.execute('DESCRIBE reports');
        console.log('Columns in reports table:');
        rows.forEach((row: any) => console.log(row.Field));

        const [tables]: any = await pool.execute('SHOW TABLES');
        console.log('\nTables in database:');
        tables.forEach((table: any) => console.log(Object.values(table)[0]));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

check();
