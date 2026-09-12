import { getActiveEvents, getCarouselEventIds, setCarouselEventIds } from '@/lib/db';
import { isAuthenticated, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAuthenticated())) return unauthorizedResponse();

  const activeEvents = getActiveEvents();
  const selectedIds = getCarouselEventIds();

  return Response.json({
    activeEvents,
    selectedIds: selectedIds.length > 0 ? selectedIds : activeEvents.filter(e => e.category === 'unlecture').map(e => e.id),
  });
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) return unauthorizedResponse();

  try {
    const body = await request.json();
    if (!Array.isArray(body.selectedIds)) {
      return Response.json({ error: 'selectedIds must be an array of event IDs' }, { status: 400 });
    }

    setCarouselEventIds(body.selectedIds);
    return Response.json({ success: true, selectedIds: body.selectedIds });
  } catch {
    return Response.json({ error: 'Failed to update carousel events' }, { status: 500 });
  }
}
