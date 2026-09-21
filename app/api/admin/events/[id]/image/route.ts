import { eventRepository } from '@/lib/db';
import { isAuthenticated, unauthorizedResponse } from '@/lib/auth';
import { uploadService } from '@/lib/services/upload.service';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return unauthorizedResponse();
  const { id } = await params;

  try {
    const formData = await request.formData();
    const file = (formData.get('file') || formData.get('image')) as File | null;
    if (!file) return Response.json({ error: 'No image file provided' }, { status: 400 });

    const target = formData.get('target') === 'poster' ? 'poster' : 'archive';
    const folderType = target === 'poster' ? 'posters' : 'archive';
    const result = await uploadService.saveFile(file, folderType);

    if (target === 'poster') {
      await eventRepository.update(id, { image: result.url });
    } else {
      await eventRepository.update(id, { archive_image: result.url });
    }

    return Response.json({ success: true, url: result.url, imagePath: result.url });
  } catch (error: any) {
    return Response.json({ error: error.message || 'Failed to upload image' }, { status: 500 });
  }
}
