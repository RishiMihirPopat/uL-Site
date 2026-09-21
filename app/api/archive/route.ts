import { getFormattedArchivedEvents, getPublishedArticles } from '@/lib/db';

export async function GET() {
  const events = await getFormattedArchivedEvents();
  const articlesList = await getPublishedArticles();
  const publishedArticles = articlesList.map((a) => ({
    id: `art-${a.id}`,
    date: a.publishedAt,
    title: a.title,
    venue: a.readTime || 'Article',
    speaker: a.author,
    description: a.subtitle || '',
    image: a.coverImage || '/category-covers/unlecture.jpg',
    tags: ['article'],
    category: 'article',
    urbanautUrl: `/articles/${a.slug}`,
    substackUrls: [`/articles/${a.slug}`],
  }));

  return Response.json([...events, ...publishedArticles]);
}
