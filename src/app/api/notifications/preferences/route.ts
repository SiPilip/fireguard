import { NextRequest } from "next/server";
import { execute, queryRow, formatDateForMySQL } from "@/lib/db";
import { getAuthPayloadFromRequest, handleCorsOptions, jsonWithCors } from "@/lib/cors";
import { enforceRateLimit } from "@/lib/rate-limit";

// OPTIONS: CORS preflight
export async function OPTIONS() {
  return handleCorsOptions();
}

interface NotificationPreferences {
  id: number;
  user_id: number;
  approved: boolean | number;
  in_progress: boolean | number;
  completed: boolean | number;
  verified: boolean | number;
  false_report: boolean | number;
  created_at: Date;
  updated_at: Date;
}

function toBoolean(value: boolean | number | null | undefined): boolean {
  return value === true || value === 1;
}

function serializePreferences(preferences: NotificationPreferences) {
  return {
    approved: toBoolean(preferences.approved),
    inProgress: toBoolean(preferences.in_progress),
    completed: toBoolean(preferences.completed),
    verified: toBoolean(preferences.verified),
    falseReport: toBoolean(preferences.false_report),
  };
}

/**
 * GET /api/notifications/preferences
 * Retrieve user's notification preferences
 * 
 * Requirements: 6.2, 6.4
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const limit = enforceRateLimit(request, "notifications-preferences-get", 20, 60_000);
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

    // Retrieve user's notification preferences
    let preferences = await queryRow<NotificationPreferences>(
      `SELECT * FROM notification_preferences WHERE user_id = ?`,
      [userId]
    );

    // If no preferences exist, create default preferences (all enabled)
    if (!preferences) {
      const currentTimestamp = formatDateForMySQL(new Date());
      
      await execute(
        `INSERT INTO notification_preferences 
         (user_id, approved, in_progress, completed, verified, false_report, created_at, updated_at)
         VALUES (?, TRUE, TRUE, TRUE, TRUE, TRUE, ?, ?)`,
        [userId, currentTimestamp, currentTimestamp]
      );

      // Retrieve the newly created preferences
      preferences = await queryRow<NotificationPreferences>(
        `SELECT * FROM notification_preferences WHERE user_id = ?`,
        [userId]
      );
    }

    return jsonWithCors(
      {
        success: true,
        preferences: serializePreferences(preferences!)
      },
      { status: 200, request }
    );
  } catch (error: any) {
    console.error("Error retrieving notification preferences:", error);

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

/**
 * PUT /api/notifications/preferences
 * Update user's notification preferences
 * 
 * Request Body:
 * {
 *   approved?: boolean;
 *   inProgress?: boolean;
 *   completed?: boolean;
 *   verified?: boolean;
 *   falseReport?: boolean;
 * }
 * 
 * Requirements: 6.3, 6.4, 6.6
 */
export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const limit = enforceRateLimit(request, "notifications-preferences-put", 30, 60_000);
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
    const { approved, inProgress, completed, verified, falseReport } = body;

    // Validate at least one preference is provided
    if (
      approved === undefined &&
      inProgress === undefined &&
      completed === undefined &&
      verified === undefined &&
      falseReport === undefined
    ) {
      return jsonWithCors(
        { message: "Setidaknya satu preferensi harus disediakan." },
        { status: 400, request }
      );
    }

    // Validate boolean types
    const validateBoolean = (value: any, fieldName: string) => {
      if (value !== undefined && typeof value !== 'boolean') {
        throw new Error(`${fieldName} harus berupa boolean.`);
      }
    };

    try {
      validateBoolean(approved, 'approved');
      validateBoolean(inProgress, 'inProgress');
      validateBoolean(completed, 'completed');
      validateBoolean(verified, 'verified');
      validateBoolean(falseReport, 'falseReport');
    } catch (validationError: any) {
      return jsonWithCors(
        { message: validationError.message },
        { status: 400, request }
      );
    }

    const currentTimestamp = formatDateForMySQL(new Date());

    // Check if preferences exist
    const existingPreferences = await queryRow<NotificationPreferences>(
      `SELECT * FROM notification_preferences WHERE user_id = ?`,
      [userId]
    );

    if (!existingPreferences) {
      // Create new preferences with provided values (defaults to TRUE for unspecified)
      await execute(
        `INSERT INTO notification_preferences 
         (user_id, approved, in_progress, completed, verified, false_report, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          approved !== undefined ? approved : true,
          inProgress !== undefined ? inProgress : true,
          completed !== undefined ? completed : true,
          verified !== undefined ? verified : true,
          falseReport !== undefined ? falseReport : true,
          currentTimestamp,
          currentTimestamp
        ]
      );
    } else {
      // Build dynamic UPDATE query for only provided fields
      const updates: string[] = [];
      const values: any[] = [];

      if (approved !== undefined) {
        updates.push('approved = ?');
        values.push(approved);
      }
      if (inProgress !== undefined) {
        updates.push('in_progress = ?');
        values.push(inProgress);
      }
      if (completed !== undefined) {
        updates.push('completed = ?');
        values.push(completed);
      }
      if (verified !== undefined) {
        updates.push('verified = ?');
        values.push(verified);
      }
      if (falseReport !== undefined) {
        updates.push('false_report = ?');
        values.push(falseReport);
      }

      updates.push('updated_at = ?');
      values.push(currentTimestamp);
      values.push(userId);

      await execute(
        `UPDATE notification_preferences SET ${updates.join(', ')} WHERE user_id = ?`,
        values
      );
    }

    // Retrieve updated preferences
    const updatedPreferences = await queryRow<NotificationPreferences>(
      `SELECT * FROM notification_preferences WHERE user_id = ?`,
      [userId]
    );

    return jsonWithCors(
      {
        success: true,
        message: "Preferensi notifikasi berhasil diperbarui.",
        preferences: serializePreferences(updatedPreferences!)
      },
      { status: 200, request }
    );
  } catch (error: any) {
    console.error("Error updating notification preferences:", error);

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
