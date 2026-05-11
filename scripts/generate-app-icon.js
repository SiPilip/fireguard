/**
 * Script untuk generate app icon Flutter dari iconfireguard.png
 * Menghasilkan ic_launcher.png di semua folder mipmap Android
 *
 * Cara pakai:
 *   node scripts/generate-app-icon.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SOURCE = path.join(__dirname, '..', 'public', 'iconfireguard.png');

const ANDROID_BASE = path.join(
  __dirname, '..', 'fireguard_flutter', 'android', 'app', 'src', 'main', 'res'
);

// Ukuran standar Android mipmap launcher icon
const SIZES = [
  { folder: 'mipmap-mdpi',    size: 48  },
  { folder: 'mipmap-hdpi',    size: 72  },
  { folder: 'mipmap-xhdpi',   size: 96  },
  { folder: 'mipmap-xxhdpi',  size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

async function generateIcons() {
  if (!fs.existsSync(SOURCE)) {
    console.error('❌ File sumber tidak ditemukan:', SOURCE);
    process.exit(1);
  }

  console.log('🎨 Sumber icon:', SOURCE);
  console.log('📁 Target     :', ANDROID_BASE);
  console.log('');

  for (const { folder, size } of SIZES) {
    const outputDir  = path.join(ANDROID_BASE, folder);
    const outputFile = path.join(outputDir, 'ic_launcher.png');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await sharp(SOURCE)
      .resize(size, size, { fit: 'cover', position: 'centre' })
      .png({ quality: 100 })
      .toFile(outputFile);

    console.log(`✅ ${folder.padEnd(22)} → ${size}x${size}px`);
  }

  // Bonus: juga buat ic_launcher_round.png jika sudah ada (beberapa HP Android pakai ini)
  const roundExists = fs.existsSync(
    path.join(ANDROID_BASE, 'mipmap-hdpi', 'ic_launcher_round.png')
  );
  if (roundExists) {
    console.log('');
    console.log('🔵 Ditemukan ic_launcher_round.png, generate juga...');
    for (const { folder, size } of SIZES) {
      const outputDir  = path.join(ANDROID_BASE, folder);
      const outputFile = path.join(outputDir, 'ic_launcher_round.png');
      await sharp(SOURCE)
        .resize(size, size, { fit: 'cover', position: 'centre' })
        .png({ quality: 100 })
        .toFile(outputFile);
      console.log(`✅ ${folder.padEnd(22)} → ic_launcher_round ${size}x${size}px`);
    }
  }

  console.log('');
  console.log('🎉 Semua icon berhasil digenerate!');
  console.log('   Rebuild Flutter app agar icon baru tampil: flutter run');
}

generateIcons().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
