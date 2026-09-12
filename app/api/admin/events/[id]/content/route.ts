import { getDb } from '@/lib/db';
import { isAuthenticated, unauthorizedResponse } from '@/lib/auth';
import { validateEventLinks, normalizeTags } from '@/lib/validators';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return unauthorizedResponse();
  const { id } = await params;
  const body = await request.json();

  const validation = validateEventLinks({
    youtube_urls: body.youtube_urls,
    substack_urls: body.substack_urls,
  });

  if (!validation.valid) {
    const errorMsg = Object.values(validation.errors).join(' ');
    return Response.json({ error: errorMsg, errors: validation.errors }, { status: 400 });
  }

  const db = getDb();
  let query = 'UPDATE events SET youtube_urls = ?, substack_urls = ?, updated_at = datetime(\'now\')';
  const queryParams: any[] = [
    body.youtube_urls ? (typeof body.youtube_urls === 'string' ? body.youtube_urls : JSON.stringify(body.youtube_urls)) : '[]',
    body.substack_urls ? (typeof body.substack_urls === 'string' ? body.substack_urls : JSON.stringify(body.substack_urls)) : '[]',
  ];

  if (body.archive_badge !== undefined || body.badge !== undefined) {
    query += ', archive_badge = ?';
    queryParams.push((body.archive_badge !== undefined ? body.archive_badge : body.badge) || null);
  }

  if (body.archive_tags !== undefined || body.tags !== undefined) {
    const rawTags = body.archive_tags !== undefined ? body.archive_tags : body.tags;
    query += ', archive_tags = ?';
    queryParams.push(JSON.stringify(normalizeTags(rawTags)));
  }

  query += ' WHERE id = ?';
  queryParams.push(id);

  db.prepare(query).run(...queryParams);
  return Response.json({ success: true });
}
