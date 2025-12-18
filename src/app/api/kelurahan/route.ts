import { NextRequest, NextResponse } from "next/server";
import { queryRows } from "@/lib/db";

// GET: Fetch all active kelurahan
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const includeInactive = searchParams.get('includeInactive') === 'true';

        const sql = includeInactive
            ? 'SELECT * FROM kelurahan ORDER BY name ASC'
            : 'SELECT * FROM kelurahan WHERE is_active = 1 ORDER BY name ASC';

        const kelurahan = await queryRows(sql);

        return NextResponse.json({
            success: true,
            data: kelurahan,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Failed to fetch kelurahan" },
            { status: 500 }
        );
    }
}
