import { getPublishedArticles } from '@/lib/db';

export async function GET() {
  const articles = await getPublishedArticles();
  return Response.json(articles);
}
