import { getAllEvents } from '@/lib/db';
import { isAuthenticated, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: Request) {
  if (!(await isAuthenticated())) return unauthorizedResponse();
  const events = await getAllEvents();
  return Response.json(events);
}
