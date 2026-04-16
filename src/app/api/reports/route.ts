import { NextRequest, NextResponse } from "next/server";
import { executeAndGetLastInsertId, formatDateForMySQL } from "@/lib/db";
import * as jose from "jose";
import { serialize } from "cookie";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { COOKIE_NAME } from "@/lib/session";
import { getJwtSecretKey } from "@/lib/secrets";
import { getAuthPayloadFromRequest, handleCorsOptions, jsonWithCors } from "@/lib/cors";
import { enforceRateLimit } from "@/lib/rate-limit";

// OPTIONS: CORS preflight
export async function OPTIONS() {
  return handleCorsOptions();
}

async function getAuthPayload(request: NextRequest) {
  return getAuthPayloadFromRequest(request);
}

export async function POST(request: NextRequest) {
  try {
    const limit = enforceRateLimit(request, "reports-submit", 20, 60_000);
    if (!limit.allowed) {
      return jsonWithCors(
        { message: "Terlalu banyak laporan dalam waktu singkat. Coba lagi sebentar." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) }, request }
      );
    }

    const user = await getAuthPayload(request);

    // Verify user exists in database
    const { queryRow } = await import("@/lib/db");
    const dbUser = await queryRow("SELECT id FROM users WHERE id = ?", [user.id]);

    if (!dbUser) {
      return jsonWithCors(
        { message: "User tidak ditemukan. Silakan login ulang." },
        { status: 401 }
      );
    }

    const userId = user.id;

    const formData = await request.formData();
    // Flutter sends snake_case field names
    const fireLatitude = (formData.get("fire_latitude") ?? formData.get("fireLatitude")) as string;
    const fireLongitude = (formData.get("fire_longitude") ?? formData.get("fireLongitude")) as string;
    const reporterLatitude = (formData.get("reporter_latitude") ?? formData.get("reporterLatitude")) as string | null;
    const reporterLongitude = (formData.get("reporter_longitude") ?? formData.get("reporterLongitude")) as string | null;
    const description = formData.get("description") as string | null;
    const address = formData.get("address") as string | null;
    const mediaFile = formData.get("media") as File | null;
    const notes = formData.get("notes") as string | null;
    const contact = formData.get("contact") as string | null;
    const categoryId = (formData.get("category_id") ?? formData.get("categoryId")) as string | null;
    const kelurahanId = (formData.get("kelurahan_id") ?? formData.get("kelurahanId")) as string | null;

    const fireLatNumber = Number(fireLatitude);
    const fireLngNumber = Number(fireLongitude);
    const reporterLatNumber = reporterLatitude ? Number(reporterLatitude) : null;
    const reporterLngNumber = reporterLongitude ? Number(reporterLongitude) : null;
    const parsedCategoryId = categoryId ? Number(categoryId) : 1;
    const parsedKelurahanId = kelurahanId ? Number(kelurahanId) : null;

    if (!fireLatitude || !fireLongitude) {
      return jsonWithCors(
        { message: "Data laporan tidak lengkap (lokasi kejadian wajib)." },
        { status: 400 }
      );
    }

    if (
      Number.isNaN(fireLatNumber) ||
      Number.isNaN(fireLngNumber) ||
      fireLatNumber < -90 ||
      fireLatNumber > 90 ||
      fireLngNumber < -180 ||
      fireLngNumber > 180
    ) {
      return jsonWithCors({ message: "Koordinat lokasi kejadian tidak valid." }, { status: 400, request });
    }

    if (
      reporterLatNumber !== null &&
      (Number.isNaN(reporterLatNumber) || reporterLatNumber < -90 || reporterLatNumber > 90)
    ) {
      return jsonWithCors({ message: "Koordinat pelapor (latitude) tidak valid." }, { status: 400, request });
    }

    if (
      reporterLngNumber !== null &&
      (Number.isNaN(reporterLngNumber) || reporterLngNumber < -180 || reporterLngNumber > 180)
    ) {
      return jsonWithCors({ message: "Koordinat pelapor (longitude) tidak valid." }, { status: 400, request });
    }

    if (!Number.isInteger(parsedCategoryId) || parsedCategoryId <= 0) {
      return jsonWithCors({ message: "Kategori tidak valid." }, { status: 400, request });
    }

    if (parsedKelurahanId !== null && (!Number.isInteger(parsedKelurahanId) || parsedKelurahanId <= 0)) {
      return jsonWithCors({ message: "Kelurahan tidak valid." }, { status: 400, request });
    }

    // Upload dan kompresi file jika ada (opsional)
    let mediaUrl: string | null = null;
    if (mediaFile && mediaFile.size > 0) {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });

      const originalBuffer = Buffer.from(await mediaFile.arrayBuffer());
      const isImage = mediaFile.type.startsWith('image/');
      const isVideo = mediaFile.type.startsWith('video/');

      let finalBuffer: Buffer | any = originalBuffer;
      let extension = mediaFile.name.split('.').pop() || 'jpg';

      // Kompresi hanya untuk gambar
      if (isImage) {
        try {
          const sharp = (await import('sharp')).default;

          // Kompresi gambar: resize max 1200px dan quality 80%
          finalBuffer = await sharp(originalBuffer)
            .resize(1200, 1200, {
              fit: 'inside',
              withoutEnlargement: true
            })
            .jpeg({ quality: 80 })
            .toBuffer();

          extension = 'jpg'; // Konversi semua ke JPEG
          console.log(`Image compressed: ${originalBuffer.length} -> ${finalBuffer.length} bytes (${Math.round((1 - finalBuffer.length / originalBuffer.length) * 100)}% reduction)`);
        } catch (compressError) {
          console.error('Image compression failed, using original:', compressError);
          finalBuffer = originalBuffer;
        }
      }

      const filename = `${Date.now()}-${isImage ? 'img' : 'vid'}.${extension}`;
      await writeFile(path.join(uploadsDir, filename), finalBuffer);
      mediaUrl = `/uploads/${filename}`;
    }

    const currentTimestamp = formatDateForMySQL(new Date());

    // Insert report dengan category_id dan kelurahan_id
    let reportId: number;
    try {
      reportId = await executeAndGetLastInsertId(
        "INSERT INTO reports (user_id, fire_latitude, fire_longitude, reporter_latitude, reporter_longitude, description, address, media_url, notes, contact, category_id, kelurahan_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          userId,
          fireLatNumber,
          fireLngNumber,
          reporterLatNumber,
          reporterLngNumber,
          description,
          address,
          mediaUrl,
          notes,
          contact,
          parsedCategoryId,
          parsedKelurahanId,
          'pending',
          currentTimestamp
        ]
      );
    } catch (dbError: any) {
      // Fallback: insert without category_id if column doesn't exist
      if (dbError.message?.includes('category_id') || dbError.message?.includes('no column')) {
        reportId = await executeAndGetLastInsertId(
          "INSERT INTO reports (user_id, fire_latitude, fire_longitude, reporter_latitude, reporter_longitude, description, address, media_url, notes, contact, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            userId,
            fireLatNumber,
            fireLngNumber,
            reporterLatNumber,
            reporterLngNumber,
            description,
            address,
            mediaUrl,
            notes,
            contact,
            'pending',
            currentTimestamp
          ]
        );
      } else {
        throw dbError;
      }
    }

    if (global.wss) {
      const newReport = {
        id: reportId,
        fire_latitude: fireLatNumber,
        fire_longitude: fireLngNumber,
        reporter_latitude: reporterLatNumber,
        reporter_longitude: reporterLngNumber,
        media_url: mediaUrl,
        status: "pending",
        created_at: currentTimestamp,
        phone_number: user.phone,
      };
      global.wss.broadcast(
        JSON.stringify({ type: "NEW_REPORT", payload: newReport })
      );
    }

    return jsonWithCors(
      { message: "Laporan berhasil dikirim!", reportId },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message.includes("autentikasi")) {
      return jsonWithCors({ message: "Akses ditolak." }, { status: 401 });
    }

    if (error.code === 'SQLITE_CONSTRAINT') {
      return jsonWithCors(
        { message: "Terjadi kesalahan validasi data. Silakan login ulang dan coba lagi." },
        { status: 400 }
      );
    }

    return jsonWithCors(
      {
        message: "Terjadi kesalahan pada server.",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
