import { isAuthenticated, unauthorizedResponse } from '@/lib/auth';
import { uploadService } from '@/lib/services/upload.service';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export async function POST(request: Request) {
  if (!(await isAuthenticated())) return unauthorizedResponse();

  try {
    const formData = await request.formData();
    const file = (formData.get('file') || formData.get('image')) as File | null;
    if (!file) {
      return Response.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return Response.json({ error: 'Invalid file type. Allowed formats: JPEG, PNG, WebP.' }, { status: 400 });
    }

    // Validate file extension
    const extension = ('.' + (file.name.split('.').pop() || '')).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return Response.json({ error: 'Invalid file extension. Allowed extensions: .jpg, .jpeg, .png, .webp.' }, { status: 400 });
    }

    const folderType = formData.get('type') === 'archive' ? 'archive' : 'posters';
    const result = await uploadService.saveFile(file, folderType);

    return Response.json({ success: true, url: result.url, filename: result.filename });
  } catch (error: any) {
    return Response.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}

