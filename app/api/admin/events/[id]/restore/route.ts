import { getDb } from '@/lib/db';
import { isAuthenticated, unauthorizedResponse } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return unauthorizedResponse();
  const { id } = await params;
  const db = getDb();
  const stmt = db.prepare("UPDATE events SET archive_status = 'archived' WHERE id = ?");
  stmt.run(id);
  return Response.json({ success: true });
}
