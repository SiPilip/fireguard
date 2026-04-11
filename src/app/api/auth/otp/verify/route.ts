import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { message: 'Endpoint OTP WhatsApp sudah dinonaktifkan.' },
    { status: 410 }
  );
}