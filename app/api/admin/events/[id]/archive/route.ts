import { eventService } from '@/lib/services/event.service';
import { isAuthenticated, unauthorizedResponse } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return unauthorizedResponse();
  const { id } = await params;
  
  let body: any = {};
  try {
    body = await request.json();
  } catch {}

  const result = await eventService.publishToArchive(id, {
    archive_badge: body.archive_badge !== undefined ? body.archive_badge : body.badge,
    archive_tags: body.archive_tags !== undefined ? body.archive_tags : body.tags,
    archive_image: body.archive_image !== undefined ? body.archive_image : body.image,
  });

  return Response.json(result);
}
