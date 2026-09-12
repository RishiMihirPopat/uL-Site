import { getPublishedArticles } from '@/lib/db';

export async function GET() {
  return Response.json(getPublishedArticles());
}
