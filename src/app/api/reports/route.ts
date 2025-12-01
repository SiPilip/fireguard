import { NextRequest, NextResponse } from "next/server";
import { executeAndGetLastInsertId } from "@/lib/db";
import * as jose from "jose";
import { serialize } from "cookie";
import path from "path";
import { writeFile, mkdir } from "fs/promises";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key-for-dev";
const COOKIE_NAME = "auth_token";

async function getAuthPayload(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) throw new Error("Token autentikasi tidak ditemukan.");
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jose.jwtVerify(token, secret);
  return payload as { id: number; phone: string };
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthPayload(request);
    
    // Verify user exists in database, create if not (untuk handle database reset)
    const { queryRow, executeAndGetLastInsertId: createUser } = await import("@/lib/db");
    const dbUser = await queryRow("SELECT id FROM users WHERE id = ?", [user.id]);
    
    let userId = user.id;
    let needsNewToken = false;
    
    if (!dbUser && user.phone) {
      // User tidak ada di database, buat user baru dengan phone dari token
      userId = await createUser(
        "INSERT INTO users (phone_number) VALUES (?)",
        [user.phone]
      );
      needsNewToken = true; // Flag to create new JWT token
    }
    
    const formData = await request.formData();
    const fireLatitude = formData.get("fireLatitude") as string;
    const fireLongitude = formData.get("fireLongitude") as string;
    const reporterLatitude = formData.get("reporterLatitude") as string | null;
    const reporterLongitude = formData.get("reporterLongitude") as string | null;
    const description = formData.get("description") as string | null;
    const address = formData.get("address") as string | null;
    const mediaFile = formData.get("media") as File | null;
    const notes = formData.get("notes") as string | null;
    const contact = formData.get("contact") as string | null;
    const categoryId = formData.get("categoryId") as string | null;

    if (!fireLatitude || !fireLongitude || !mediaFile) {
      return NextResponse.json(
        { message: "Data laporan tidak lengkap (lokasi kebakaran dan media wajib)." },
        { status: 400 }
      );
    }

    // ... (kode upload file tetap sama)
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const buffer = Buffer.from(await mediaFile.arrayBuffer());
    const filename = `${Date.now()}-${mediaFile.name.replace(/\s/g, "_")}`;
    await writeFile(path.join(uploadsDir, filename), buffer);
    const mediaUrl = `/uploads/${filename}`;

    const currentTimestamp = new Date().toISOString();
    
    // Try with category_id first, fallback to without if column doesn't exist
    let reportId: number;
    try {
      reportId = await executeAndGetLastInsertId(
        "INSERT INTO reports (user_id, fire_latitude, fire_longitude, reporter_latitude, reporter_longitude, description, address, media_url, notes, contact, category_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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

    // If new user was created, generate new JWT token with correct user_id
    if (needsNewToken) {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const newToken = await new jose.SignJWT({ id: userId, phone: user.phone })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secret);

      const serializedCookie = serialize(COOKIE_NAME, newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return new NextResponse(
        JSON.stringify({ message: "Laporan berhasil dikirim!", reportId }),
        {
          status: 201,
          headers: { 'Set-Cookie': serializedCookie },
        }
      );
    }

    return NextResponse.json(
      { message: "Laporan berhasil dikirim!", reportId },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message.includes("autentikasi")) {
      return NextResponse.json({ message: "Akses ditolak." }, { status: 401 });
    }
    
    // Handle specific database errors
    if (error.code === 'SQLITE_CONSTRAINT') {
      return NextResponse.json(
        { message: "Terjadi kesalahan validasi data. Silakan login ulang dan coba lagi." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        message: "Terjadi kesalahan pada server.",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
