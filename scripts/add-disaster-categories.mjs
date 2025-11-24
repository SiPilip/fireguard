import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config();

const db = process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN
  ? createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  : createClient({
      url: 'file:local.db'
    });

async function setupDisasterCategories() {
  try {
    console.log('🔧 Setting up disaster categories...');

    // 1. Create disaster_categories table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS disaster_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        description TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table disaster_categories created');

    // 2. Check if categories already exist
    const existingCategories = await db.execute('SELECT COUNT(*) as count FROM disaster_categories');
    const count = existingCategories.rows[0].count;

    if (count === 0) {
      // 3. Insert default categories
      const defaultCategories = [
        { name: 'Kebakaran', icon: '🔥', color: '#EF4444', description: 'Kejadian kebakaran rumah, gedung, atau lahan' },
        { name: 'Banjir', icon: '🌊', color: '#3B82F6', description: 'Bencana banjir dan genangan air' },
        { name: 'Gempa Bumi', icon: '🏚️', color: '#78350F', description: 'Gempa bumi dan dampaknya' },
        { name: 'Tanah Longsor', icon: '⛰️', color: '#92400E', description: 'Longsor dan pergerakan tanah' },
        { name: 'Angin Puting Beliung', icon: '🌪️', color: '#6B7280', description: 'Angin kencang dan puting beliung' },
      ];

      for (const category of defaultCategories) {
        await db.execute(
          'INSERT INTO disaster_categories (name, icon, color, description) VALUES (?, ?, ?, ?)',
          [category.name, category.icon, category.color, category.description]
        );
        console.log(`  ✓ Added category: ${category.icon} ${category.name}`);
      }
    } else {
      console.log('ℹ️  Categories already exist, skipping insert');
    }

    // 4. Add category_id column to reports table
    try {
      await db.execute(`
        ALTER TABLE reports ADD COLUMN category_id INTEGER DEFAULT 1
      `);
      console.log('✅ Added category_id column to reports table');
    } catch (error) {
      if (error.message && error.message.includes('duplicate column name')) {
        console.log('ℹ️  category_id column already exists');
      } else {
        throw error;
      }
    }

    // 5. Verify setup
    const categories = await db.execute('SELECT * FROM disaster_categories WHERE is_active = 1');
    console.log('\n📋 Available disaster categories:');
    categories.rows.forEach(cat => {
      console.log(`  ${cat.icon} ${cat.name} (ID: ${cat.id})`);
    });

    console.log('\n✅ Disaster categories setup completed successfully!');
  } catch (error) {
    console.error('❌ Error setting up disaster categories:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

setupDisasterCategories();
