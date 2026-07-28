import { validatePassword, createSession, setSessionCookie, clearSession } from '@/lib/auth';

export async function POST(request: Request) {
  const { password } = await request.json();
  if (validatePassword(password)) {
    const session = await createSession();
    await setSessionCookie(session);
    return Response.json({ success: true });
  }
  return Response.json({ error: 'Invalid password' }, { status: 401 });
}

export async function DELETE(request: Request) {
  await clearSession();
  return Response.json({ success: true });
}
