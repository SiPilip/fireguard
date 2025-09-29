import { NextRequest, NextResponse } from "next/server";
import { executeAndGetLastInsertId } from "@/lib/db";
import * as jose from "jose";
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
    const formData = await request.formData();
    const latitude = formData.get("latitude") as string;
    const longitude = formData.get("longitude") as string;
    const mediaFile = formData.get("media") as File | null;

    if (!latitude || !longitude || !mediaFile) {
      return NextResponse.json(
        { message: "Data laporan tidak lengkap." },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const buffer = Buffer.from(await mediaFile.arrayBuffer());
    const filename = `${Date.now()}-${mediaFile.name.replace(/\s/g, "_")}`;
    // await writeFile(path.join(uploadsDir, filename), buffer);
    const mediaUrl = `/uploads/${filename}`;

    const reportId = await executeAndGetLastInsertId(
      "INSERT INTO reports (user_id, latitude, longitude, media_url) VALUES (?, ?, ?, ?)",
      [user.id, parseFloat(latitude), parseFloat(longitude), mediaUrl]
    );

    if (global.wss) {
      const newReport = {
        id: reportId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        media_url: mediaUrl,
        status: "Pending",
        created_at: new Date().toISOString(),
        phone_number: user.phone,
      };
      global.wss.broadcast(
        JSON.stringify({ type: "NEW_REPORT", payload: newReport })
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
    console.error("[API Create Report] Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
