import crypto from 'crypto';
import { runAutoArchive } from '@/lib/db';

function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;

  // In development without a configured secret, allow local testing
  if (!cronSecret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[SECURITY ERROR] CRON_SECRET is not configured in production environment.');
      return false;
    }
    return true;
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;

  const expectedHeader = `Bearer ${cronSecret}`;
  const headerBuf = Buffer.from(authHeader);
  const expectedBuf = Buffer.from(expectedHeader);

  if (headerBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(headerBuf, expectedBuf);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const count = await runAutoArchive();
    return Response.json({ success: true, result: count });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const count = await runAutoArchive();
    return Response.json({ success: true, result: count });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

