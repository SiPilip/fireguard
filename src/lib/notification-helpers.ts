import { executeAndGetLastInsertId, formatDateForMySQL } from '@/lib/db';

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
