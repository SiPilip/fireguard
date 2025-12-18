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

    if (user.isOperator) {
      return NextResponse.json({ message: 'Endpoint ini hanya untuk pengguna biasa.' }, { status: 403 });
    }

    if (!user.id) {
      return NextResponse.json({ message: 'User ID tidak valid.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('id');

    // Jika ada reportId, ambil detail satu laporan
    if (reportId) {
      const report = await queryRow(
        `SELECT 
          r.id, 
          r.fire_latitude, 
          r.fire_longitude,
          r.reporter_latitude,
          r.reporter_longitude, 
          COALESCE(r.description, r.address, 'Tidak ada deskripsi') as description,
          r.address,
          r.status, 
          r.created_at, 
          COALESCE(r.updated_at, r.created_at) as updated_at, 
          r.admin_notes, 
          r.media_url as photo_url,
          r.notes,
          r.contact,
          u.phone_number as user_phone,
          c.id as category_id,
          c.name as category_name,
          c.icon as category_icon,
          k.id as kelurahan_id,
          k.name as kelurahan_name,
          k.kecamatan
        FROM reports r 
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN disaster_categories c ON r.category_id = c.id
        LEFT JOIN kelurahan k ON r.kelurahan_id = k.id
        WHERE r.id = ? AND r.user_id = ?`,
        [reportId, user.id]
      );

      if (!report) {
        return NextResponse.json({ message: 'Laporan tidak ditemukan.' }, { status: 404 });
      }

      return NextResponse.json({ report });
    }

    // Jika tidak ada reportId, ambil semua laporan user
    const reports = await queryRows(
      `SELECT 
        r.id, 
        r.fire_latitude, 
        r.fire_longitude,
        r.reporter_latitude,
        r.reporter_longitude, 
        COALESCE(r.description, r.address, 'Tidak ada deskripsi') as description,
        r.address,
        r.status, 
        r.created_at, 
        COALESCE(r.updated_at, r.created_at) as updated_at, 
        r.admin_notes, 
        r.media_url as photo_url,
        r.notes,
        r.contact,
        c.id as category_id,
        c.name as category_name,
        c.icon as category_icon,
        k.id as kelurahan_id,
        k.name as kelurahan_name,
        k.kecamatan
      FROM reports r
      LEFT JOIN disaster_categories c ON r.category_id = c.id
      LEFT JOIN kelurahan k ON r.kelurahan_id = k.id
      WHERE r.user_id = ? 
      ORDER BY r.created_at DESC`,
      [user.id]
    );

    return NextResponse.json({ reports });

  } catch (error: any) {
    if (error.message.includes('autentikasi') || error.message.includes('Token')) {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 401 });
    }

    return NextResponse.json({
      message: 'Terjadi kesalahan pada server.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}