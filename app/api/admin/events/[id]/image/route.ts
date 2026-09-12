import { getDb } from '@/lib/db';
import { isAuthenticated, unauthorizedResponse } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return unauthorizedResponse();
  const { id } = await params;
  
  const formData = await request.formData();
  const file = (formData.get('file') || formData.get('image')) as File | null;
  if (!file) return Response.json({ error: 'No image file provided' }, { status: 400 });
  
  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${Date.now()}-${safeName}`;
  
  const target = formData.get('target') === 'poster' ? 'poster' : 'archive';
  const folder = target === 'poster' ? 'uploads' : 'archive';
  const uploadDir = path.join(process.cwd(), 'public', folder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const filepath = path.join(uploadDir, filename);
  await writeFile(filepath, buffer);
  
  const publicUrl = `/${folder}/${filename}`;
  const db = getDb();
  if (target === 'poster') {
    db.prepare('UPDATE events SET image = ?, updated_at = datetime(\'now\') WHERE id = ?').run(publicUrl, id);
  } else {
    db.prepare('UPDATE events SET archive_image = ?, updated_at = datetime(\'now\') WHERE id = ?').run(publicUrl, id);
  }
  
  return Response.json({ success: true, url: publicUrl, imagePath: publicUrl });
}
