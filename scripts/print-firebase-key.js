/**
 * Script untuk mencetak nilai FIREBASE_SERVICE_ACCOUNT_KEY yang benar
 * untuk di-copy-paste ke Vercel Environment Variables.
 *
 * Cara pakai:
 *   node scripts/print-firebase-key.js
 *
 * Salin output yang tercetak → paste ke kolom VALUE di Vercel
 * (Settings → Environment Variables → FIREBASE_SERVICE_ACCOUNT_KEY)
 */

require('dotenv').config();

const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!raw) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY tidak ditemukan di .env');
  process.exit(1);
}

let value = raw.trim();

// Strip KEY= prefix jika ada
if (!value.startsWith('{') && value.includes('=')) {
  value = value.substring(value.indexOf('=') + 1).trim();
}

// Validasi JSON
let parsed;
try {
  parsed = JSON.parse(value);
} catch (e) {
  console.error('❌ Nilai tidak valid JSON:', e.message);
  console.error('   Raw value (pertama 100 karakter):', raw.substring(0, 100));
  process.exit(1);
}

// Pastikan compact (1 baris)
const compact = JSON.stringify(parsed);

console.log('\n' + '='.repeat(60));
console.log('✅ SALIN nilai di bawah ini ke Vercel (hanya 1 baris):');
console.log('='.repeat(60));
console.log();
console.log(compact);
console.log();
console.log('='.repeat(60));
console.log('📋 Cara paste ke Vercel:');
console.log('   1. Buka vercel.com → Project → Settings → Environment Variables');
console.log('   2. Klik "Add New" atau edit FIREBASE_SERVICE_ACCOUNT_KEY');
console.log('   3. Key   : FIREBASE_SERVICE_ACCOUNT_KEY');
console.log('   4. Value : (paste baris JSON di atas)');
console.log('   5. Klik Save → lalu Redeploy project');
console.log('='.repeat(60));
console.log();
console.log('ℹ️  Info project:', parsed.project_id);
console.log('ℹ️  Client email :', parsed.client_email);
console.log('ℹ️  Panjang JSON  :', compact.length, 'karakter');
