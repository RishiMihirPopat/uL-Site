import { getSetting, setSetting } from '@/lib/db';
import { isAuthenticated, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: Request) {
  if (!(await isAuthenticated())) return unauthorizedResponse();
  return Response.json({
    auto_archive_days: getSetting('auto_archive_days'),
    auto_archive_action: getSetting('auto_archive_action')
  });
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) return unauthorizedResponse();
  const body = await request.json();
  if (body.auto_archive_days !== undefined) setSetting('auto_archive_days', body.auto_archive_days);
  if (body.auto_archive_action !== undefined) setSetting('auto_archive_action', body.auto_archive_action);
  return Response.json({ success: true });
}
