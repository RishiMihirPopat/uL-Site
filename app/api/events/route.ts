import { getActiveEvents, runAutoArchive } from '@/lib/db';

export async function GET(request: Request) {
  runAutoArchive();
  const events = getActiveEvents();
  return Response.json(events);
}
