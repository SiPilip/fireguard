# FireGuard - Sistem Pelaporan Kebakaran

Aplikasi web untuk pelaporan dan monitoring kebakaran real-time dengan fitur peta interaktif dan routing cerdas.

## Fitur Utama

- 🔥 Pelaporan kebakaran real-time dengan foto
- 🗺️ Peta interaktif dengan routing OSRM
- 🚒 Deteksi pos pemadam terdekat otomatis
- 📊 Dashboard admin untuk monitoring
- 📱 Responsive design (Mobile & Desktop)
- ✅ Tracking status laporan

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **Maps**: Leaflet, React-Leaflet, OSRM
- **Authentication**: Custom JWT-based auth

## Environment Variables

Buat file `.env.local` dengan variabel berikut:

```env
DATABASE_URL=your_postgresql_connection_string
NEXTAUTH_SECRET=your_secret_key_here
NEXTAUTH_URL=http://localhost:3000
```

## Instalasi

1. Clone repository:
```bash
git clone https://github.com/fahrezi93/fireguard-LBS.git
cd fireguard-LBS
```

2. Install dependencies:
```bash
npm install
```

3. Setup database:
```bash
# Jalankan migrasi database (jika ada)
npm run db:migrate
```

4. Jalankan development server:
```bash
npm run dev
```

5. Buka [http://localhost:3000](http://localhost:3000)

## Deploy ke Vercel

### Langkah 1: Push ke GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Langkah 2: Deploy di Vercel

1. Buka [vercel.com](https://vercel.com)
2. Login dengan GitHub
3. Klik "New Project"
4. Import repository `fahrezi93/fireguard-LBS`
5. Tambahkan Environment Variables:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (gunakan domain Vercel Anda)
6. Klik "Deploy"

### Environment Variables untuk Production

```
DATABASE_URL=postgresql://user:password@host:5432/database
NEXTAUTH_SECRET=generate-random-secret-key
NEXTAUTH_URL=https://your-app.vercel.app
```

## Struktur Project

```
fireguard/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API Routes
│   │   ├── dashboard/    # User Dashboard
│   │   ├── operator/     # Admin Dashboard
│   │   └── report/       # Report Pages
│   ├── components/       # React Components
│   ├── lib/              # Utilities & Helpers
│   └── hooks/            # Custom React Hooks
├── public/               # Static Assets
└── prisma/              # Database Schema (if using Prisma)
```

## Scripts

- `npm run dev` - Jalankan development server
- `npm run build` - Build untuk production
- `npm run start` - Jalankan production server
- `npm run lint` - Jalankan ESLint

## Fitur Detail

### Untuk User (Pelapor)
- Buat laporan kebakaran dengan foto
- Tandai lokasi di peta
- Lihat estimasi waktu bantuan
- Track status laporan

### Untuk Admin (Operator)
- Dashboard monitoring real-time
- Lihat semua laporan di peta
- Update status laporan
- Lihat rute dari pos damkar ke lokasi

## Kontribusi

Pull requests are welcome! Untuk perubahan besar, silakan buka issue terlebih dahulu.

## License

MIT

## Author

Fahrezi - [GitHub](https://github.com/fahrezi93)
