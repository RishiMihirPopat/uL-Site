import { getEventById } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = getEventById(id);
  if (!event) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(event);
}
