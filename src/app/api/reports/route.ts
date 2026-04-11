import { NextRequest, NextResponse } from "next/server";
import { executeAndGetLastInsertId, formatDateForMySQL } from "@/lib/db";
import * as jose from "jose";
import { serialize } from "cookie";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { COOKIE_NAME } from "@/lib/session";
import { getJwtSecretKey } from "@/lib/secrets";
import { getAuthPayloadFromRequest, handleCorsOptions, jsonWithCors } from "@/lib/cors";

// OPTIONS: CORS preflight
export async function OPTIONS() {
  return handleCorsOptions();
}

async function getAuthPayload(request: NextRequest) {
  return getAuthPayloadFromRequest(request);
}

export async function POST(request: NextRequest) {
  try {
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

    if (!fireLatitude || !fireLongitude) {
      return jsonWithCors(
        { message: "Data laporan tidak lengkap (lokasi kejadian wajib)." },
        { status: 400 }
      );
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
          parseFloat(fireLatitude),
          parseFloat(fireLongitude),
          reporterLatitude ? parseFloat(reporterLatitude) : null,
          reporterLongitude ? parseFloat(reporterLongitude) : null,
          description,
          address,
          mediaUrl,
          notes,
          contact,
          categoryId ? parseInt(categoryId) : 1,
          kelurahanId ? parseInt(kelurahanId) : null,
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
            parseFloat(fireLatitude),
            parseFloat(fireLongitude),
            reporterLatitude ? parseFloat(reporterLatitude) : null,
            reporterLongitude ? parseFloat(reporterLongitude) : null,
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
        fire_latitude: parseFloat(fireLatitude),
        fire_longitude: parseFloat(fireLongitude),
        reporter_latitude: reporterLatitude ? parseFloat(reporterLatitude) : null,
        reporter_longitude: reporterLongitude ? parseFloat(reporterLongitude) : null,
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
