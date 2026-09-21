import { validateRole, createSession, setSessionCookie, clearSession, getSessionRole } from '@/lib/auth';

interface RateLimitRecord {
  attempts: number;
  resetTime: number;
}

const loginAttempts = new Map<string, RateLimitRecord>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record) return false;

  if (now > record.resetTime) {
    loginAttempts.delete(ip);
    return false;
  }

  return record.attempts >= MAX_ATTEMPTS;
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now > record.resetTime) {
    loginAttempts.set(ip, { attempts: 1, resetTime: now + WINDOW_MS });
  } else {
    record.attempts += 1;
  }
}

function clearRateLimit(ip: string): void {
  loginAttempts.delete(ip);
}

export async function GET() {
  const role = await getSessionRole();
  return Response.json({ authenticated: role !== null, role });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    return Response.json(
      { error: 'Too many failed login attempts. Please wait 15 minutes before trying again.' },
      { status: 429 }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { password } = body;
  const role = validateRole(password);
  if (role) {
    clearRateLimit(ip);
    const session = await createSession(role);
    await setSessionCookie(session);
    return Response.json({ success: true, role });
  }

  recordFailedAttempt(ip);
  return Response.json({ error: 'Invalid password' }, { status: 401 });
}

export async function DELETE(request: Request) {
  await clearSession();
  return Response.json({ success: true });
}

