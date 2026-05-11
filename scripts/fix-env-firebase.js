/**
 * Script untuk memperbaiki format FIREBASE_SERVICE_ACCOUNT_KEY di .env
 *
 * Masalah: dotenv hanya membaca env value sampai newline pertama.
 * Jika FIREBASE_SERVICE_ACCOUNT_KEY ditulis multi-baris (JSON diformat),
 * yang terbaca hanya "{" → JSON.parse() gagal → Firebase tidak terinisialisasi.
 *
 * Solusi: kompres JSON ke satu baris tanpa spasi yang tidak perlu.
 *
 * Cara pakai:
 *   node scripts/fix-env-firebase.js
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ File .env tidak ditemukan di root project.');
  process.exit(1);
}

const raw = fs.readFileSync(envPath, 'utf8');
const lines = raw.split('\n');

let result = [];
let insideFirebaseKey = false;
let jsonBuffer = '';
let prefixLine = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Deteksi awal FIREBASE_SERVICE_ACCOUNT_KEY
  if (!insideFirebaseKey && line.startsWith('FIREBASE_SERVICE_ACCOUNT_KEY=')) {
    const valueStart = line.substring('FIREBASE_SERVICE_ACCOUNT_KEY='.length).trim();

    // Cek apakah sudah satu baris (JSON langsung selesai di baris ini)
    if (valueStart.startsWith('{') && valueStart.endsWith('}')) {
      try {
        // Sudah satu baris — validasi JSON saja
        const parsed = JSON.parse(valueStart);
        result.push(`FIREBASE_SERVICE_ACCOUNT_KEY=${JSON.stringify(parsed)}`);
        console.log('✅ FIREBASE_SERVICE_ACCOUNT_KEY sudah satu baris dan valid.');
      } catch {
        result.push(line);
        console.warn('⚠️  FIREBASE_SERVICE_ACCOUNT_KEY sudah satu baris tapi JSON tidak valid. Dibiarkan.');
      }
      continue;
    }

    // Multi-baris: mulai kumpulkan
    insideFirebaseKey = true;
    prefixLine = 'FIREBASE_SERVICE_ACCOUNT_KEY=';
    jsonBuffer = valueStart;
    continue;
  }

  // Sedang mengumpulkan JSON multi-baris
  if (insideFirebaseKey) {
    jsonBuffer += ' ' + line.trim();

    // Deteksi akhir JSON (baris yang hanya berisi "}")
    if (line.trim() === '}' || jsonBuffer.trimEnd().endsWith('}')) {
      try {
        const parsed = JSON.parse(jsonBuffer);
        const compact = JSON.stringify(parsed);
        result.push(`${prefixLine}${compact}`);
        console.log('✅ FIREBASE_SERVICE_ACCOUNT_KEY berhasil dikonversi ke satu baris.');
      } catch (e) {
        console.error('❌ Gagal parse JSON FIREBASE_SERVICE_ACCOUNT_KEY:', e.message);
        console.error('   Buffer JSON yang dikumpulkan:\n', jsonBuffer.substring(0, 200) + '...');
        // Kembalikan baris asli
        result.push(prefixLine + jsonBuffer);
      }
      insideFirebaseKey = false;
      jsonBuffer = '';
      prefixLine = '';
    }
    continue;
  }

  // Baris biasa
  result.push(line);
}

// Tulis kembali .env
const newContent = result.join('\n');
fs.writeFileSync(envPath, newContent, 'utf8');
console.log('\n✅ File .env berhasil diperbarui.');
console.log('   Restart server Next.js agar perubahan env dimuat ulang.\n');
