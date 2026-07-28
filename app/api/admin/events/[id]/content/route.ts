import { getDb } from '@/lib/db';
import { isAuthenticated, unauthorizedResponse } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return unauthorizedResponse();
  const { id } = await params;
  const body = await request.json();
  const db = getDb();
  const stmt = db.prepare('UPDATE events SET youtube_urls = ?, substack_urls = ? WHERE id = ?');
  stmt.run(
    body.youtube_urls ? JSON.stringify(body.youtube_urls) : '[]',
    body.substack_urls ? JSON.stringify(body.substack_urls) : '[]',
    id
  );
  return Response.json({ success: true });
}
