import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_COOKIE = 'ul_admin_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || 'unlecture2025';
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/* Active sessions stored in memory -- resets on server restart, which is fine */
const activeSessions = new Set<string>();

export function createSession(): string {
  const token = crypto.randomBytes(32).toString('hex');
  activeSessions.add(hashToken(token));
  return token;
}

export function validatePassword(password: string): boolean {
  return password === getAdminPassword();
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return false;
    return activeSessions.has(hashToken(token));
  } catch {
    return false;
  }
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
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    activeSessions.delete(hashToken(token));
  }
  cookieStore.delete(SESSION_COOKIE);
}

export function unauthorizedResponse(): Response {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
