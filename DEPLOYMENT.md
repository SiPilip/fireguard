# Panduan Deploy FireGuard ke Vercel

## Persiapan Sebelum Deploy

### 1. Pastikan Database Sudah Siap
- Gunakan Supabase atau PostgreSQL hosting lainnya
- Catat connection string database Anda

### 2. Generate Secret Key
Jalankan di terminal untuk generate secret key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Langkah Deploy ke Vercel

### Opsi 1: Deploy via Vercel Dashboard (Recommended)

1. **Buka Vercel**
   - Kunjungi [https://vercel.com](https://vercel.com)
   - Login dengan akun GitHub Anda

2. **Import Project**
   - Klik tombol "Add New..." → "Project"
   - Pilih repository: `fahrezi93/fireguard-LBS`
   - Klik "Import"

3. **Configure Project**
   - Framework Preset: **Next.js** (otomatis terdeteksi)
   - Root Directory: `./` (biarkan default)
   - Build Command: `npm run build` (otomatis)
   - Output Directory: `.next` (otomatis)

4. **Environment Variables**
   Tambahkan variabel berikut di bagian "Environment Variables":
   
   ```
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   NEXTAUTH_SECRET=your-generated-secret-key-here
   NEXTAUTH_URL=https://your-app-name.vercel.app
   ```

   **Catatan**: 
   - `DATABASE_URL`: Connection string dari Supabase/PostgreSQL
   - `NEXTAUTH_SECRET`: Secret key yang di-generate tadi
   - `NEXTAUTH_URL`: Akan otomatis menjadi URL Vercel Anda (bisa diupdate nanti)

5. **Deploy**
   - Klik "Deploy"
   - Tunggu proses build selesai (±2-3 menit)

6. **Update NEXTAUTH_URL**
   - Setelah deploy selesai, copy URL production Anda
   - Kembali ke Settings → Environment Variables
   - Update `NEXTAUTH_URL` dengan URL production
   - Redeploy dengan klik "Deployments" → "..." → "Redeploy"

### Opsi 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login ke Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd "d:\Semester 7\Pemrograman Berbasis Lokasi\fireguard"
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXTAUTH_URL
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Setelah Deploy

### 1. Test Aplikasi
- Buka URL production Anda
- Test fitur login
- Test buat laporan
- Test dashboard admin

### 2. Setup Domain Custom (Opsional)
- Di Vercel Dashboard → Settings → Domains
- Tambahkan domain custom Anda
- Update DNS records sesuai instruksi

### 3. Monitor Logs
- Vercel Dashboard → Deployments → [Your Deployment] → Logs
- Pantau error jika ada

## Troubleshooting

### Error: Database Connection Failed
- Pastikan `DATABASE_URL` benar
- Cek apakah database accessible dari internet
- Verifikasi IP whitelist di Supabase (allow all: `0.0.0.0/0`)

### Error: Build Failed
- Cek logs di Vercel
- Pastikan semua dependencies ada di `package.json`
- Jalankan `npm run build` lokal untuk test

### Error: 500 Internal Server Error
- Cek Vercel logs untuk detail error
- Pastikan semua environment variables sudah diset
- Verifikasi API routes tidak ada error

### Upload File Tidak Berfungsi
- Vercel tidak support file upload ke filesystem
- Solusi: Gunakan cloud storage (Cloudinary, AWS S3, Supabase Storage)
- Update kode upload untuk menggunakan cloud storage

## Rekomendasi untuk Production

1. **Gunakan Supabase Storage untuk Upload**
   - Gratis untuk file kecil
   - Terintegrasi dengan database
   
2. **Setup Monitoring**
   - Gunakan Vercel Analytics
   - Setup error tracking (Sentry)

3. **Optimize Performance**
   - Enable Image Optimization
   - Use CDN untuk static assets

4. **Security**
   - Jangan commit `.env` files
   - Rotate secret keys secara berkala
   - Setup CORS dengan benar

## Update Aplikasi

Setiap kali ada perubahan:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

Vercel akan otomatis deploy ulang!

## Kontak Support

Jika ada masalah:
- GitHub Issues: https://github.com/fahrezi93/fireguard-LBS/issues
- Vercel Support: https://vercel.com/support
