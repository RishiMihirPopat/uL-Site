import { eventService } from '@/lib/services/event.service';
import { isAuthenticated, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return unauthorizedResponse();
  const { id } = await params;
  const event = await eventService.getEventById(id);
  if (!event) return Response.json({ error: 'Event not found' }, { status: 404 });
  return Response.json(event);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return unauthorizedResponse();
  const { id } = await params;
  const body = await request.json();

  const result = await eventService.updateEvent(id, body);
  if (!result.success) {
    return Response.json({ error: result.error, errors: result.errors }, { status: 400 });
  }

  return Response.json({ success: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return unauthorizedResponse();
  const { id } = await params;
  await eventService.deleteEvent(id);
  return Response.json({ success: true });
}
