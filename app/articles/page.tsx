import { getPublishedArticles } from '@/lib/db';
import ArticlesPageV2 from '@/components/ArticlesPageV2';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Our Articles — unLecture',
  description: 'Read unLecture\'s articles and dispatches.',
};

export default async function ArticlesIndexPage() {
  const published = await getPublishedArticles();
  const articles = published.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    coverImage: a.coverImage,
    publishedAt: a.publishedAt,
  }));

  return <ArticlesPageV2 articles={articles} />;
}
