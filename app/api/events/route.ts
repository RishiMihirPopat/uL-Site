import { getActiveEvents, runAutoArchive } from '@/lib/db';

export async function GET(request: Request) {
  await runAutoArchive();
  const events = await getActiveEvents();
  return Response.json(events);
}
