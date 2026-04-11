import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';
import { COOKIE_NAME } from './session';
import { getJwtSecretKey } from './secrets';

/**
 * Extract JWT token dari Bearer header (Flutter) ATAU cookie (Web).
 * Prioritas: Bearer header > Cookie
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return request.cookies.get(COOKIE_NAME)?.value || null;
}

/**
 * Verifikasi token dan kembalikan payload user.
 * Support dual-mode: Bearer token (Flutter) dan Cookie (Web).
 */
export async function getAuthPayloadFromRequest(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) throw new Error('Token autentikasi tidak ditemukan.');
  const secret = getJwtSecretKey();
  const { payload } = await jose.jwtVerify(token, secret);
  return payload as { id: number; email: string; name: string; phone?: string; isOperator?: boolean };
}

/**
 * CORS response headers untuk Flutter mobile access.
 */
export function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Handle OPTIONS preflight request.
 */
export function handleCorsOptions() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

/**
 * Wrap NextResponse.json with CORS headers.
 */
export function jsonWithCors(data: any, init?: { status?: number; headers?: Record<string, string> }) {
  const headers = { ...corsHeaders(), ...(init?.headers || {}) };
  return NextResponse.json(data, { status: init?.status || 200, headers });
}
