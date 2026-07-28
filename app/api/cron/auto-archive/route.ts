import { runAutoArchive } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const count = runAutoArchive();
    return Response.json({ success: true, archived: count });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
