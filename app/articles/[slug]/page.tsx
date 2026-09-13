import { notFound } from 'next/navigation';
import { getArticleBySlug, getAdjacentArticles } from '@/lib/db';
import ArticleDetailPageV2 from '@/components/ArticleDetailPageV2';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: 'Article Not Found — unLecture' };

  return {
    title: `${article.title} — unLecture`,
    description: article.subtitle || `An essay by ${article.author} on unLecture.`,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const { prev, next } = getAdjacentArticles(slug);

  return (
    <ArticleDetailPageV2
      title={article.title}
      subtitle={article.subtitle}
      coverImage={article.coverImage}
      content={article.content}
      prev={prev ? { slug: prev.slug, title: prev.title } : null}
      next={next ? { slug: next.slug, title: next.title } : null}
    />
  );
}
