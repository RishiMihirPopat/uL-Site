import { eventService } from '@/lib/services/event.service';
import { isAuthenticated, unauthorizedResponse } from '@/lib/auth';

export async function POST(request: Request) {
  if (!(await isAuthenticated())) return unauthorizedResponse();
  const body = await request.json();

  try {
    const result = await eventService.createEvent(body);
    if (!result.success) {
      return Response.json({ error: result.error, errors: result.errors }, { status: 400 });
    }

    return Response.json({ id: result.id });
  } catch (err: any) {
    if (err.code === '23505') {
      return Response.json({ error: 'An event with this ID already exists. Please try again.' }, { status: 409 });
    }
    return Response.json({ error: err.message || 'Failed to create event' }, { status: 500 });
  }
}
