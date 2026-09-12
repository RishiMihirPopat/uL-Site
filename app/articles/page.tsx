import { redirect } from 'next/navigation';
import { getPublishedArticles } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function ArticlesIndexPage() {
  const published = getPublishedArticles();

  if (published.length === 0) {
    redirect('/');
  }

  // Redirect to the latest published article
  redirect(`/articles/${published[0].slug}`);
}
