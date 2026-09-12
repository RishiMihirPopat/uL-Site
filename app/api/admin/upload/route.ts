import { isAuthenticated, unauthorizedResponse } from '@/lib/auth';
import { uploadService } from '@/lib/services/upload.service';

export async function POST(request: Request) {
  if (!(await isAuthenticated())) return unauthorizedResponse();

  try {
    const formData = await request.formData();
    const file = (formData.get('file') || formData.get('image')) as File | null;
    if (!file) {
      return Response.json({ error: 'No image file provided' }, { status: 400 });
    }

    const folderType = formData.get('type') === 'archive' ? 'archive' : 'posters';
    const result = await uploadService.saveFile(file, folderType);

    return Response.json({ success: true, url: result.url, filename: result.filename });
  } catch (error: any) {
    return Response.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
