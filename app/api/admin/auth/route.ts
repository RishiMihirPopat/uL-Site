import { validateRole, createSession, setSessionCookie, clearSession, getSessionRole } from '@/lib/auth';

export async function GET() {
  const role = await getSessionRole();
  return Response.json({ authenticated: role !== null, role });
}

export async function POST(request: Request) {
  const { password } = await request.json();
  const role = validateRole(password);
  if (role) {
    const session = await createSession(role);
    await setSessionCookie(session);
    return Response.json({ success: true, role });
  }
  return Response.json({ error: 'Invalid password' }, { status: 401 });
}

export async function DELETE(request: Request) {
  await clearSession();
  return Response.json({ success: true });
}
