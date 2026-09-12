import { getArticleBySlug, getAdjacentArticles } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article || article.status !== 'published') {
    return Response.json({ error: 'Article not found' }, { status: 404 });
  }

  const adjacent = getAdjacentArticles(slug);

  return Response.json({
    article,
    adjacent,
  });
}
