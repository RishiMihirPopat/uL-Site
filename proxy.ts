import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE = 'ul_admin_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getAuthSecret(): string {
  const secret = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error('ADMIN_SECRET or ADMIN_PASSWORD environment variable is not configured.');
  }
  return secret;
}

async function verifySessionToken(token: string, secret: string): Promise<boolean> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [b64Payload, signatureHex] = parts;
    if (!b64Payload || !signatureHex) return false;

    // Decode base64url payload
    const decoded = atob(b64Payload.replace(/-/g, '+').replace(/_/g, '/'));
    const [role, timestampStr] = decoded.split(':');
    if (role !== 'super_admin' && role !== 'event_manager') return false;

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp) || Date.now() - timestamp > SESSION_MAX_AGE * 1000) {
      return false;
    }

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    if (signatureHex.length % 2 !== 0) return false;
    const sigBytes = new Uint8Array(signatureHex.length / 2);
    for (let i = 0; i < signatureHex.length; i += 2) {
      sigBytes[i / 2] = parseInt(signatureHex.substring(i, i + 2), 16);
    }

    return await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      enc.encode(decoded)
    );
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page without session check, or redirect to dashboard if already authenticated
  if (pathname === '/admin' || pathname === '/admin/') {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (token) {
      try {
        const isValid = await verifySessionToken(token, getAuthSecret());
        if (isValid) {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
      } catch {}
    }
    return NextResponse.next();
  }

  // Allow login / authentication endpoints
  if (pathname === '/api/admin/auth') {
    return NextResponse.next();
  }

  // Check auth for all other /admin/* pages and /api/admin/* endpoints
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  let isAuthenticated = false;
  if (token) {
    try {
      isAuthenticated = await verifySessionToken(token, getAuthSecret());
    } catch {
      isAuthenticated = false;
    }
  }

  if (!isAuthenticated) {
    if (pathname.startsWith('/api/admin/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // For admin pages, redirect to /admin login
    const loginUrl = new URL('/admin', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path+',
    '/api/admin/:path*',
  ],
};
