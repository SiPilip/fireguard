import { NextRequest, NextResponse } from 'next/server';
import { queryRows, queryRow } from '@/lib/db';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-dev';
const COOKIE_NAME = 'auth_token';

async function getAuthPayload(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) throw new Error('Token autentikasi tidak ditemukan.');
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jose.jwtVerify(token, secret);
  return payload as { id: number; phone: string, isOperator?: boolean };
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthPayload(request);
    
    // Debug logging
    console.log('[API My Reports] User payload:', user);
    
    if (user.isOperator) {
        return NextResponse.json({ message: 'Endpoint ini hanya untuk pengguna biasa.' }, { status: 403 });
    }

    if (!user.id) {
        console.error('[API My Reports] User ID not found in token payload');
        return NextResponse.json({ message: 'User ID tidak valid.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('id');

    // Jika ada reportId, ambil detail satu laporan
    if (reportId) {
      const report = await queryRow(
        `SELECT 
          r.id, 
          r.latitude, 
          r.longitude, 
          COALESCE(r.description, r.address, 'Tidak ada deskripsi') as description,
          r.address as location_name,
          r.status, 
          r.created_at, 
          COALESCE(r.updated_at, r.created_at) as updated_at, 
          r.admin_notes, 
          r.media_url as photo_url,
          u.phone_number as user_phone 
        FROM reports r 
        LEFT JOIN users u ON r.user_id = u.id 
        WHERE r.id = ? AND r.user_id = ?`,
        [reportId, user.id]
      );

      if (!report) {
        return NextResponse.json({ message: 'Laporan tidak ditemukan.' }, { status: 404 });
      }

      return NextResponse.json({ report });
    }

    // Jika tidak ada reportId, ambil semua laporan user
    console.log('[API My Reports] Fetching reports for user_id:', user.id);
    
    const reports = await queryRows(
      `SELECT 
        id, 
        latitude, 
        longitude, 
        COALESCE(description, address, 'Tidak ada deskripsi') as description,
        address as location_name,
        status, 
        created_at, 
        COALESCE(updated_at, created_at) as updated_at, 
        admin_notes, 
        media_url as photo_url
      FROM reports 
      WHERE user_id = ? 
      ORDER BY created_at DESC`,
      [user.id]
    );

    console.log('[API My Reports] Found reports:', reports.length);
    return NextResponse.json({ reports });
    
  } catch (error: any) {
    console.error('[API Get My Reports] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    if (error.message.includes('autentikasi') || error.message.includes('Token')) {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 401 });
    }
    
    return NextResponse.json({ 
      message: 'Terjadi kesalahan pada server.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}