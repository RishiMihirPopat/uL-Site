import { getAllEvents } from '@/lib/db';
import { isAuthenticated, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: Request) {
  if (!(await isAuthenticated())) return unauthorizedResponse();
  return Response.json(getAllEvents());
}
