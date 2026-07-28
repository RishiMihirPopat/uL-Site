import { getDb } from '@/lib/db';
import { isAuthenticated, unauthorizedResponse } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return unauthorizedResponse();
  const { id } = await params;
  
  const formData = await request.formData();
  const file = formData.get('file') as File;
  if (!file) return Response.json({ error: 'No file' }, { status: 400 });
  
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  
  const uploadDir = path.join(process.cwd(), 'public', 'archive');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const filepath = path.join(uploadDir, filename);
  
  await writeFile(filepath, buffer);
  
  const db = getDb();
  const stmt = db.prepare('UPDATE events SET archive_image = ? WHERE id = ?');
  stmt.run(`/archive/${filename}`, id);
  
  return Response.json({ success: true, url: `/archive/${filename}` });
}
