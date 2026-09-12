import { eventService } from '@/lib/services/event.service';
import { getSessionRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const role = await getSessionRole();
  if (!role) return unauthorizedResponse();

  const { id } = await params;
  const result = eventService.transitionStatus(id, 'hide', role);
  if (!result.success) {
    return result.status === 403 ? forbiddenResponse(result.error) : Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({ success: true });
}
