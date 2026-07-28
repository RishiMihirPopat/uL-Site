import { getDb } from '@/lib/db';
import { isAuthenticated, unauthorizedResponse } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return unauthorizedResponse();
  const { id } = await params;
  let badge = null;
  let tags = null;
  let archive_image = null;
  try {
    const body = await request.json();
    badge = body.badge;
    tags = body.tags ? JSON.stringify(body.tags) : null;
    archive_image = body.archive_image;
  } catch {}
  
  const db = getDb();
  let query = "UPDATE events SET archive_status = 'archived'";
  const queryParams = [];
  
  if (badge !== undefined) { query += ', archive_badge = ?'; queryParams.push(badge); }
  if (tags !== null) { query += ', archive_tags = ?'; queryParams.push(tags); }
  if (archive_image !== undefined) { query += ', archive_image = ?'; queryParams.push(archive_image); }
  
  query += ' WHERE id = ?';
  queryParams.push(id);
  
  const stmt = db.prepare(query);
  stmt.run(...queryParams);
  return Response.json({ success: true });
}
