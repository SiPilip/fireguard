import { NextRequest, NextResponse } from 'next/server';
import { queryRows, execute, executeAndGetLastInsertId, formatDateForMySQL } from '@/lib/db';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-dev';
const COOKIE_NAME = 'auth_token';

async function getAuthPayload(request: NextRequest) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) throw new Error('Token autentikasi tidak ditemukan.');
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload as { id: number; email: string; name: string };
}

interface Notification {
    id: number;
    user_id: number;
    title: string;
    message: string;
    type: string;
    report_id?: number;
    is_read: boolean;
    created_at: string;
}

// GET: Ambil notifikasi user
export async function GET(request: NextRequest) {
    try {
        const user = await getAuthPayload(request);

        // Coba ambil notifikasi, jika tabel tidak ada, buat dulu
        let notifications: Notification[] = [];
        try {
            notifications = await queryRows<Notification>(
                `SELECT id, user_id, title, message, type, report_id, is_read, created_at 
         FROM notifications 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT 50`,
                [user.id]
            );
        } catch (error: any) {
            // Tabel belum ada, buat dulu
            if (error.message?.includes('doesn\'t exist') || error.code === 'ER_NO_SUCH_TABLE') {
                await execute(`
          CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            type VARCHAR(50) DEFAULT 'info',
            report_id INT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user_id (user_id),
            INDEX idx_is_read (is_read),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `);
                notifications = [];
            } else {
                throw error;
            }
        }

        // Hitung jumlah belum dibaca
        const unreadCount = notifications.filter(n => !n.is_read).length;

        return NextResponse.json({
            success: true,
            data: notifications,
            unreadCount
        });
    } catch (error: any) {
        console.error('Error fetching notifications:', error);
        if (error.message?.includes('autentikasi')) {
            return NextResponse.json({ message: 'Akses ditolak.' }, { status: 401 });
        }
        return NextResponse.json({ message: 'Gagal mengambil notifikasi' }, { status: 500 });
    }
}

// POST: Tandai notifikasi sudah dibaca
export async function POST(request: NextRequest) {
    try {
        const user = await getAuthPayload(request);
        const { action, notificationId } = await request.json();

        if (action === 'mark_read' && notificationId) {
            // Tandai satu notifikasi sudah dibaca
            await execute(
                'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
                [notificationId, user.id]
            );
        } else if (action === 'mark_all_read') {
            // Tandai semua notifikasi sudah dibaca
            await execute(
                'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
                [user.id]
            );
        }

        return NextResponse.json({ success: true, message: 'Notifikasi diperbarui' });
    } catch (error: any) {
        console.error('Error updating notification:', error);
        return NextResponse.json({ message: 'Gagal memperbarui notifikasi' }, { status: 500 });
    }
}

// Fungsi helper untuk membuat notifikasi (dipanggil dari API lain)
export async function createNotification(
    userId: number,
    title: string,
    message: string,
    type: string = 'info',
    reportId?: number
) {
    try {
        const currentTimestamp = formatDateForMySQL(new Date());
        await executeAndGetLastInsertId(
            `INSERT INTO notifications (user_id, title, message, type, report_id, is_read, created_at) 
       VALUES (?, ?, ?, ?, ?, FALSE, ?)`,
            [userId, title, message, type, reportId || null, currentTimestamp]
        );
        return true;
    } catch (error) {
        console.error('Error creating notification:', error);
        return false;
    }
}
