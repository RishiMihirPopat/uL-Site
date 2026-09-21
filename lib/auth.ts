import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_COOKIE = 'ul_admin_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
function getAuthSecret(): string {
  const secret = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error('ADMIN_SECRET or ADMIN_PASSWORD environment variable is not configured.');
  }
  return secret;
}

export type AdminRole = 'super_admin' | 'event_manager';

function getAdminPassword(): string | null {
  return process.env.ADMIN_PASSWORD || null;
}

function getManagerPassword(): string | null {
  return process.env.MANAGER_PASSWORD || null;
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function signPayload(payload: string): string {
  const hmac = crypto.createHmac('sha256', getAuthSecret()).update(payload).digest('hex');
  return `${Buffer.from(payload).toString('base64url')}.${hmac}`;
}

function verifyPayload(signedValue: string): string | null {
  try {
    const parts = signedValue.split('.');
    if (parts.length !== 2) return null;
    const [b64Payload, signature] = parts;
    const payload = Buffer.from(b64Payload, 'base64url').toString('utf-8');
    const expectedHmac = crypto.createHmac('sha256', getAuthSecret()).update(payload).digest('hex');

    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expectedHmac, 'hex');
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function validateRole(password: string): AdminRole | null {
  if (!password) return null;
  const adminPass = getAdminPassword();
  if (adminPass && timingSafeStringEqual(password, adminPass)) {
    return 'super_admin';
  }
  const managerPass = getManagerPassword();
  if (managerPass && timingSafeStringEqual(password, managerPass)) {
    return 'event_manager';
  }
  return null;
}

export function validatePassword(password: string): boolean {
  return validateRole(password) !== null;
}

export function createSession(role: AdminRole = 'super_admin'): string {
  const timestamp = Date.now();
  const payload = `${role}:${timestamp}`;
  return signPayload(payload);
}

export async function getSessionRole(): Promise<AdminRole | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const payload = verifyPayload(token);
    if (!payload) return null;

    const [role, timestampStr] = payload.split(':');
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp) || Date.now() - timestamp > SESSION_MAX_AGE * 1000) {
      return null;
    }

    if (role === 'super_admin' || role === 'event_manager') {
      return role as AdminRole;
    }
    return null;
  } catch {
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const role = await getSessionRole();
  return role !== null;
}

export async function isSuperAdmin(): Promise<boolean> {
  const role = await getSessionRole();
  return role === 'super_admin';
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export function unauthorizedResponse(): Response {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}

export function forbiddenResponse(message = 'Forbidden'): Response {
  return Response.json({ error: message }, { status: 403 });
}
