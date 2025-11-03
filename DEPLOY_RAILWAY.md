# 🚂 Deploy FireGuard ke Railway

Railway adalah platform yang mendukung custom Node.js server dan WebSocket, cocok untuk aplikasi real-time seperti FireGuard.

## 📋 Persiapan Sebelum Deploy

### 1. File yang Sudah Disiapkan ✅
- `railway.json` - Konfigurasi Railway
- `nixpacks.toml` - Build configuration
- `package.json` - Sudah ada engines dan scripts yang benar
- `.gitignore` - Sudah exclude `.env` files

### 2. Pastikan Git Repository Bersih
```bash
# Cek status
git status

# Pastikan .env tidak ter-commit
git rm --cached .env .env.local
git add .
git commit -m "Prepare for Railway deployment"
```

## 🚀 Langkah Deploy ke Railway

### Opsi 1: Deploy via GitHub (Recommended)

#### Step 1: Push ke GitHub
```bash
# Jika belum ada remote
git remote add origin https://github.com/username/fireguard.git

# Push code
git push -u origin main
```

#### Step 2: Deploy di Railway
1. Buka [railway.app](https://railway.app)
2. Login dengan GitHub
3. Klik **"New Project"**
4. Pilih **"Deploy from GitHub repo"**
5. Pilih repository `fireguard`
6. Railway akan otomatis detect Next.js dan mulai build

#### Step 3: Set Environment Variables
Di Railway Dashboard → Variables, tambahkan:
```
TURSO_DATABASE_URL=libsql://pilipfireguard-philifs.aws-ap-northeast-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
FONNTE_TOKEN=HV2NYWTpKWSbwd25KQU8
NODE_ENV=production
```

⚠️ **PENTING**: Jangan copy-paste token di sini, ambil dari file `.env` lokal Anda!

#### Step 4: Configure Domain (Opsional)
1. Di Railway Dashboard → Settings
2. Klik **"Generate Domain"** untuk mendapat domain gratis `*.up.railway.app`
3. Atau connect custom domain jika punya

### Opsi 2: Deploy via Railway CLI

#### Step 1: Install Railway CLI
```bash
npm i -g @railway/cli
```

#### Step 2: Login
```bash
railway login
```

#### Step 3: Initialize & Deploy
```bash
# Di folder project
railway init

# Link ke project (jika sudah ada) atau buat baru
railway link

# Deploy
railway up
```

#### Step 4: Set Environment Variables
```bash
railway variables set TURSO_DATABASE_URL="your_database_url"
railway variables set TURSO_AUTH_TOKEN="your_auth_token"
railway variables set FONNTE_TOKEN="your_fonnte_token"
railway variables set NODE_ENV="production"
```

## 🔧 Konfigurasi Railway

### Build Settings (Otomatis dari `railway.json`)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Builder**: Nixpacks

### Port Configuration
Railway otomatis detect port dari aplikasi Anda. Server.js sudah menggunakan `process.env.PORT || 3000`, jadi tidak perlu konfigurasi tambahan.

## ✅ Verifikasi Deployment

### 1. Cek Build Logs
Di Railway Dashboard → Deployments → Klik deployment terakhir → View logs

### 2. Test WebSocket
Buka browser console di dashboard operator:
```javascript
// Seharusnya muncul log:
// "WebSocket connection established"
// "Connected"
```

### 3. Test Fitur Real-time
1. Buat laporan baru dari user app
2. Cek apakah muncul real-time di operator dashboard (tanpa refresh)

## 🐛 Troubleshooting

### Build Failed
```bash
# Cek logs di Railway Dashboard
# Biasanya karena missing dependencies atau build error
```

**Solusi**:
- Pastikan `package.json` sudah benar
- Cek apakah semua dependencies terinstall
- Test build di local: `npm run build`

### WebSocket Connection Failed
**Gejala**: Dashboard menunjukkan "Closed" atau "Error"

**Solusi**:
1. Pastikan Railway menggunakan HTTPS (otomatis)
2. Cek browser console untuk error detail
3. Pastikan `server.js` berjalan dengan benar
4. Verifikasi environment variables sudah di-set

### Database Connection Error
**Gejala**: Error "Failed to connect to Turso"

**Solusi**:
1. Cek environment variables di Railway
2. Pastikan `TURSO_DATABASE_URL` dan `TURSO_AUTH_TOKEN` benar
3. Test koneksi database dari local

### 502 Bad Gateway
**Gejala**: Website tidak bisa diakses

**Solusi**:
1. Cek logs di Railway Dashboard
2. Pastikan `npm start` berjalan dengan benar
3. Verifikasi port configuration

## 💰 Pricing

Railway menyediakan:
- **Free Tier**: $5 credit/bulan (cukup untuk testing)
- **Pro Plan**: $20/bulan (untuk production)

Estimasi usage untuk FireGuard:
- Small app: ~$5-10/bulan
- Medium traffic: ~$10-20/bulan

## 🔄 Update Aplikasi

### Auto Deploy (GitHub)
Setiap push ke branch `main` akan otomatis trigger deployment baru.

```bash
git add .
git commit -m "Update feature"
git push origin main
```

### Manual Deploy (CLI)
```bash
railway up
```

## 📱 Monitoring

### Railway Dashboard
- **Metrics**: CPU, Memory, Network usage
- **Logs**: Real-time application logs
- **Deployments**: History dan rollback

### Recommended Monitoring
1. Setup alerts di Railway untuk downtime
2. Monitor WebSocket connections
3. Track database usage di Turso dashboard

## 🎉 Selesai!

Setelah deploy berhasil, aplikasi Anda akan:
- ✅ Berjalan 24/7 dengan custom server
- ✅ WebSocket real-time berfungsi
- ✅ Auto-restart jika crash
- ✅ HTTPS otomatis
- ✅ Auto-deploy dari GitHub

Domain Railway: `https://your-app-name.up.railway.app`

---

**Need Help?**
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
