import { NextRequest } from "next/server";
import { queryRows } from "@/lib/db";
import { handleCorsOptions, jsonWithCors } from "@/lib/cors";

// OPTIONS: CORS preflight
export async function OPTIONS() {
  return handleCorsOptions();
}

// GET: Fetch all active disaster categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const sql = includeInactive
      ? 'SELECT * FROM disaster_categories ORDER BY name ASC'
      : 'SELECT * FROM disaster_categories WHERE is_active = 1 ORDER BY name ASC';

    const categories = await queryRows(sql);

    return jsonWithCors({
      success: true,
      data: categories,
    });
  } catch (error) {
    return jsonWithCors(
      { success: false, message: "Failed to fetch disaster categories" },
      { status: 500 }
    );
  }
}
