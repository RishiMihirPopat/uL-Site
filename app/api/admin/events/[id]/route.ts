import { eventService } from '@/lib/services/event.service';
import { eventRepository } from '@/lib/repositories/event.repository';
import { isAuthenticated, unauthorizedResponse } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return unauthorizedResponse();
  const { id } = await params;
  const body = await request.json();

  const result = eventService.updateEvent(id, body);
  if (!result.success) {
    return Response.json({ error: result.error, errors: result.errors }, { status: 400 });
  }

  return Response.json({ success: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return unauthorizedResponse();
  const { id } = await params;
  eventRepository.delete(id);
  return Response.json({ success: true });
}
