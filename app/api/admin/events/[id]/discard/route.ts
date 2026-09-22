import { eventService } from '@/lib/services/event.service';
import { getSessionRole, unauthorizedResponse } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const role = await getSessionRole();
  if (!role) return unauthorizedResponse();

  const { id } = await params;

  try {
    const result = await eventService.discardEvent(id);
    if (!result.success) {
      return Response.json({ error: result.error }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ error: err.message || 'Failed to discard event' }, { status: 500 });
  }
}
