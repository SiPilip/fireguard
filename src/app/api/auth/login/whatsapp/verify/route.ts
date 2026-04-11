import { NextResponse } from "next/server";

export async function POST() {
    return NextResponse.json(
        { message: "Login WhatsApp sudah dinonaktifkan." },
        { status: 410 }
    );
}
