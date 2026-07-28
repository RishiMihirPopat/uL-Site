import { getDb } from '@/lib/db';
import { isAuthenticated, unauthorizedResponse } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return unauthorizedResponse();
  const { id } = await params;
  const body = await request.json();
  const db = getDb();
  try {
    const fields = Object.keys(body).map(k => `${k} = ?`).join(', ');
    const values = Object.values(body);
    const stmt = db.prepare(`UPDATE events SET ${fields} WHERE id = ?`);
    stmt.run(...values, id);
    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return unauthorizedResponse();
  const { id } = await params;
  const db = getDb();
  const stmt = db.prepare('DELETE FROM events WHERE id = ?');
  stmt.run(id);
  return Response.json({ success: true });
}
