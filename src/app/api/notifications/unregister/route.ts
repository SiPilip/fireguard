import { NextRequest } from "next/server";
import { execute } from "@/lib/db";
import { getAuthPayloadFromRequest, handleCorsOptions, jsonWithCors } from "@/lib/cors";
import { enforceRateLimit } from "@/lib/rate-limit";

// OPTIONS: CORS preflight
export async function OPTIONS() {
  return handleCorsOptions();
}

/**
 * DELETE /api/notifications/unregister
 * Unregister a device token for push notifications (e.g., on logout)
 * 
 * Request Body:
 * {
 *   deviceToken: string;
 * }
 * 
 * Requirements: 1.6
 */
export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const limit = enforceRateLimit(request, "notifications-unregister", 10, 60_000);
    if (!limit.allowed) {
      return jsonWithCors(
        { message: "Terlalu banyak permintaan. Coba lagi nanti." },
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfter) },
          request,
        }
      );
    }

    // Validate JWT authentication and extract user ID
    const user = await getAuthPayloadFromRequest(request);
    const userId = user.id;

    // Parse request body
    const body = await request.json();
    const { deviceToken } = body;

    // Validate device token format
    if (!deviceToken || typeof deviceToken !== 'string' || deviceToken.trim().length === 0) {
      return jsonWithCors(
        { message: "Device token tidak valid." },
        { status: 400, request }
      );
    }

    // Mark device token as inactive (soft delete)
    // We use soft delete to maintain notification logs history
    const affectedRows = await execute(
      `UPDATE device_tokens 
       SET is_active = FALSE, updated_at = NOW()
       WHERE user_id = ? AND device_token = ? AND is_active = TRUE`,
      [userId, deviceToken.trim()]
    );

    // If no rows affected, token doesn't exist or already inactive
    if (affectedRows === 0) {
      return jsonWithCors(
        {
          success: true,
          message: "Device token tidak ditemukan atau sudah tidak aktif."
        },
        { status: 200, request }
      );
    }

    return jsonWithCors(
      {
        success: true,
        message: "Device token berhasil dihapus."
      },
      { status: 200, request }
    );
  } catch (error: any) {
    console.error("Error in device token unregistration:", error);

    // Handle authentication errors
    if (error.message?.includes('autentikasi') || error.message?.includes('Token')) {
      return jsonWithCors(
        { success: false, message: "Autentikasi gagal. Silakan login ulang." },
        { status: 401, request }
      );
    }

    return jsonWithCors(
      {
        success: false,
        message: "Terjadi kesalahan pada server.",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500, request }
    );
  }
}
