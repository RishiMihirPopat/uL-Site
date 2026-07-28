import { getDb } from '@/lib/db';
import { isAuthenticated, unauthorizedResponse } from '@/lib/auth';

function slugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) return unauthorizedResponse();
  const body = await request.json();
  const id = body.id || slugify(body.title);
  
  const db = getDb();
  try {
    const stmt = db.prepare(`
      INSERT INTO events (
        id, title, speaker, venue, category, date, event_datetime, time, price, description, image, urbanaut_url, archive_status, archive_image, archive_badge, archive_tags, youtube_urls, substack_urls
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);
    stmt.run(
      id, body.title, body.speaker, body.venue, body.category, body.date, body.event_datetime, body.time, body.price, body.description, body.image, body.urbanaut_url, body.archive_status || 'active', body.archive_image, body.archive_badge, body.archive_tags ? JSON.stringify(body.archive_tags) : null, body.youtube_urls ? JSON.stringify(body.youtube_urls) : null, body.substack_urls ? JSON.stringify(body.substack_urls) : null
    );
    return Response.json({ id });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
