import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as jose from 'jose';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-dev';
const COOKIE_NAME = 'auth_token';

// Fungsi helper untuk memverifikasi JWT dan mendapatkan data pengguna
async function getAuthPayload(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    throw new Error('Token autentikasi tidak ditemukan.');
  }
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jose.jwtVerify(token, secret);
  return payload as { id: number; phone: string };
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verifikasi autentikasi pengguna
    const user = await getAuthPayload(request);

    // 2. Parse FormData dari request
    const formData = await request.formData();
    const latitude = formData.get('latitude') as string;
    const longitude = formData.get('longitude') as string;
    const mediaFile = formData.get('media') as File | null;

    if (!latitude || !longitude || !mediaFile) {
      return NextResponse.json({ message: 'Data laporan tidak lengkap.' }, { status: 400 });
    }

    // 3. Proses upload file
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    // Pastikan direktori ada, buat jika belum ada
    await mkdir(uploadsDir, { recursive: true });

    const buffer = Buffer.from(await mediaFile.arrayBuffer());
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const filename = `${uniqueSuffix}-${mediaFile.name.replace(/\s/g, '_')}`;
    const filePath = path.join(uploadsDir, filename);

    await writeFile(filePath, buffer);

    const mediaUrl = `/uploads/${filename}`;

    // 4. Simpan data laporan ke database
    const stmt = db.prepare(
      'INSERT INTO reports (user_id, latitude, longitude, media_url) VALUES (?, ?, ?, ?)'
    );
    const info = stmt.run(user.id, parseFloat(latitude), parseFloat(longitude), mediaUrl);

    // 5. Kirim notifikasi real-time melalui WebSocket
    const newReport = {
        id: info.lastInsertRowid,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        media_url: mediaUrl,
        status: 'Pending',
        created_at: new Date().toISOString(),
        phone_number: user.phone, // Ambil dari token
    };

    // Akses instance WSS dari global dan broadcast
    if (global.wss) {
        console.log('Broadcasting new report to all clients...');
        global.wss.broadcast(JSON.stringify({ type: 'NEW_REPORT', payload: newReport }));
    }


    return NextResponse.json({ message: 'Laporan berhasil dikirim!', reportId: info.lastInsertRowid }, { status: 201 });

  } catch (error: any) {
    if (error.message.includes('autentikasi')) {
      return NextResponse.json({ message: 'Akses ditolak. Sesi tidak valid.' }, { status: 401 });
    }
    console.error('[API Create Report] Error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server saat membuat laporan.' }, { status: 500 });
  }
}
