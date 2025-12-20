import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';
import { pool } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-dev';
const COOKIE_NAME = 'auth_token';

// GET - Get current user profile from database
export async function GET(request: NextRequest) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
        return NextResponse.json({ message: 'Token tidak ditemukan.' }, { status: 401 });
    }

    try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jose.jwtVerify(token, secret);

        if (!payload.id) {
            return NextResponse.json({ message: 'User ID tidak ditemukan.' }, { status: 401 });
        }

        // Get fresh data from database
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT id, name, email, phone_number, is_verified, created_at FROM users WHERE id = ?',
            [payload.id]
        );

        if (rows.length === 0) {
            return NextResponse.json({ message: 'User tidak ditemukan.' }, { status: 404 });
        }

        return NextResponse.json(rows[0]);
    } catch (error) {
        console.error('Error getting profile:', error);
        return NextResponse.json({ message: 'Token tidak valid atau kedaluwarsa.' }, { status: 401 });
    }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
        return NextResponse.json({ message: 'Token tidak ditemukan.' }, { status: 401 });
    }

    try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jose.jwtVerify(token, secret);

        if (!payload.id) {
            return NextResponse.json({ message: 'User ID tidak ditemukan.' }, { status: 401 });
        }

        const body = await request.json();
        const { name, phone_number } = body;

        // Validate input
        if (!name || name.trim().length < 2) {
            return NextResponse.json({ message: 'Nama harus minimal 2 karakter.' }, { status: 400 });
        }

        if (name.trim().length > 100) {
            return NextResponse.json({ message: 'Nama maksimal 100 karakter.' }, { status: 400 });
        }

        // Validate phone number format (optional, but if provided must be valid)
        if (phone_number && phone_number.trim().length > 0) {
            const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
            const cleanPhone = phone_number.replace(/[\s-]/g, '');
            if (!phoneRegex.test(cleanPhone)) {
                return NextResponse.json({ message: 'Format nomor telepon tidak valid.' }, { status: 400 });
            }
        }

        // Update database
        await pool.execute(
            'UPDATE users SET name = ?, phone_number = ?, updated_at = NOW() WHERE id = ?',
            [name.trim(), phone_number?.trim() || null, payload.id]
        );

        // Get updated data
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT id, name, email, phone_number, is_verified, created_at FROM users WHERE id = ?',
            [payload.id]
        );

        if (rows.length === 0) {
            return NextResponse.json({ message: 'User tidak ditemukan.' }, { status: 404 });
        }

        // Create new JWT token with updated data
        const newToken = await new jose.SignJWT({
            id: rows[0].id,
            name: rows[0].name,
            email: rows[0].email,
            phone: rows[0].phone_number,
            isOperator: false,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d')
            .sign(secret);

        // Create response with updated cookie
        const response = NextResponse.json({
            message: 'Profil berhasil diperbarui.',
            user: rows[0],
        });

        response.cookies.set(COOKIE_NAME, newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ message: 'Gagal memperbarui profil.' }, { status: 500 });
    }
}
