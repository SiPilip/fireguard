import { NextRequest } from 'next/server';
import { getAuthPayloadFromRequest, handleCorsOptions, jsonWithCors } from '@/lib/cors';

// OPTIONS: CORS preflight
export async function OPTIONS() {
  return handleCorsOptions();
}

export async function GET(request: NextRequest) {
  try {
    // Support dual-mode: Bearer token (Flutter) dan Cookie (Web)
    const payload = await getAuthPayloadFromRequest(request);

    // Kirim kembali payload yang berisi data pengguna/operator
    return jsonWithCors(payload);
    
  } catch (error) {
    return jsonWithCors({ message: 'Token tidak valid atau kedaluwarsa.' }, { status: 401 });
  }
}
