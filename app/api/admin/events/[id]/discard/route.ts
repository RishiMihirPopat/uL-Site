import { eventService } from '@/lib/services/event.service';
import { getSessionRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const role = await getSessionRole();
  if (!role) return unauthorizedResponse();
  if (role !== 'super_admin') {
    return forbiddenResponse('Permission denied: Permanent deletion requires super_admin role.');
  }

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
