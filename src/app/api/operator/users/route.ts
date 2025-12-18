import { NextRequest, NextResponse } from "next/server";
import { queryRows, queryRow } from "@/lib/db";
import * as jose from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key-for-dev";
const COOKIE_NAME = "auth_token";

// Middleware untuk check operator authentication
async function checkOperatorAuth(request: NextRequest) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return null;

    try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jose.jwtVerify(token, secret);

        // Cek apakah ini operator
        if (payload.isOperator) {
            return payload;
        }
        return null;
    } catch {
        return null;
    }
}

// GET: Ambil semua user (untuk admin)
export async function GET(request: NextRequest) {
    try {
        const operator = await checkOperatorAuth(request);

        if (!operator) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";

        let sql = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.phone_number, 
        u.is_verified,
        u.created_at,
        (SELECT COUNT(*) FROM reports WHERE user_id = u.id) as total_reports
      FROM users u
    `;

        const args: any[] = [];

        if (search) {
            sql += ` WHERE u.name LIKE ? OR u.email LIKE ? OR u.phone_number LIKE ?`;
            const searchPattern = `%${search}%`;
            args.push(searchPattern, searchPattern, searchPattern);
        }

        sql += ` ORDER BY u.created_at DESC`;

        const users = await queryRows(sql, args);

        // Hitung statistik
        const totalUsers = await queryRow<{ count: number }>(
            "SELECT COUNT(*) as count FROM users"
        );
        const verifiedUsers = await queryRow<{ count: number }>(
            "SELECT COUNT(*) as count FROM users WHERE is_verified = 1"
        );

        return NextResponse.json({
            success: true,
            data: users,
            stats: {
                total: totalUsers?.count || 0,
                verified: verifiedUsers?.count || 0,
            },
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch users" },
            { status: 500 }
        );
    }
}
