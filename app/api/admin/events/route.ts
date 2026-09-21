import { eventService } from '@/lib/services/event.service';
import { isAuthenticated, unauthorizedResponse } from '@/lib/auth';

export async function POST(request: Request) {
  if (!(await isAuthenticated())) return unauthorizedResponse();
  const body = await request.json();

  const result = await eventService.createEvent(body);
  if (!result.success) {
    return Response.json({ error: result.error, errors: result.errors }, { status: 400 });
  }

  return Response.json({ id: result.id });
}
