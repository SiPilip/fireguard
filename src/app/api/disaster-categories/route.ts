import { NextRequest, NextResponse } from "next/server";
import { queryRows } from "@/lib/db";

// GET: Fetch all active disaster categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const sql = includeInactive
      ? 'SELECT * FROM disaster_categories ORDER BY name ASC'
      : 'SELECT * FROM disaster_categories WHERE is_active = 1 ORDER BY name ASC';

    const categories = await queryRows(sql);

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching disaster categories:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch disaster categories" },
      { status: 500 }
    );
  }
}
