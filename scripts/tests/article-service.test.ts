import { runner } from './harness';
import { ArticleService } from '../../lib/services/article.service';
import { IArticleRepository } from '../../lib/repositories/article.repository';
import { ArticleRow } from '../../lib/types/article';

class MockArticleRepository implements IArticleRepository {
  public articles: ArticleRow[] = [];
  public lastUpdatedId: string | null = null;
  public lastUpdatedData: Partial<ArticleRow> | null = null;

  async getAll(): Promise<ArticleRow[]> {
    return [...this.articles];
  }

  async getPublished(): Promise<ArticleRow[]> {
    return this.articles.filter((a) => a.status === 'published');
  }

  async getBySlug(slug: string): Promise<ArticleRow | null> {
    return this.articles.find((a) => a.slug === slug) || null;
  }

  async getById(id: string): Promise<ArticleRow | null> {
    return this.articles.find((a) => a.id === id) || null;
  }

  async create(article: Partial<ArticleRow>): Promise<void> {
    this.articles.push(article as ArticleRow);
  }

  async update(id: string, updates: Partial<ArticleRow>): Promise<void> {
    this.lastUpdatedId = id;
    this.lastUpdatedData = updates;
    const idx = this.articles.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.articles[idx] = { ...this.articles[idx], ...updates };
    }
  }

  async delete(id: string): Promise<void> {
    this.articles = this.articles.filter((a) => a.id !== id);
  }
}

export async function runArticleServiceTests() {
  runner.startSuite('Article Service (lib/services/article.service.ts)');

  const mockRepo = new MockArticleRepository();
  const service = new ArticleService(mockRepo);

  // 1. calculateReadTime
  runner.assertEqual(service.calculateReadTime(''), '1 min read', 'calculateReadTime: empty content returns 1 min read');
  runner.assertEqual(service.calculateReadTime('One two three four five'), '1 min read', 'calculateReadTime: short text returns 1 min read');
  const twoHundredWords = Array(200).fill('word').join(' ');
  runner.assertEqual(service.calculateReadTime(twoHundredWords), '1 min read', 'calculateReadTime: 200 words returns 1 min read');
  const fiveHundredWords = Array(500).fill('word').join(' ');
  runner.assertEqual(service.calculateReadTime(fiveHundredWords), '3 min read', 'calculateReadTime: 500 words returns 3 min read (ceil)');

  // 2. generateSlug
  runner.assertEqual(
    service.generateSlug('Why We Gather in Third Spaces'),
    'why-we-gather-in-third-spaces',
    'generateSlug: generates clean URL slug'
  );

  // 3. createArticle auto-slug & auto-readTime
  await service.createArticle({
    id: 'art-1',
    title: 'First Article',
    content: fiveHundredWords,
    status: 'published',
  });
  const createdArt = await service.getArticleById('art-1');
  runner.assert(createdArt !== null, 'createArticle: persists article to repository');
  runner.assertEqual(createdArt?.slug, 'first-article', 'createArticle: auto-generates slug from title when omitted');
  runner.assertEqual(createdArt?.readTime, '3 min read', 'createArticle: auto-calculates read time from content');

  // Add more articles for adjacent tests
  await service.createArticle({
    id: 'art-2',
    slug: 'second-article',
    title: 'Second Article',
    content: 'Short content',
    status: 'published',
  });

  await service.createArticle({
    id: 'art-3',
    slug: 'third-article',
    title: 'Third Article',
    content: 'Draft content',
    status: 'draft',
  });

  await service.createArticle({
    id: 'art-4',
    slug: 'fourth-article',
    title: 'Fourth Article',
    content: 'Published content',
    status: 'published',
  });

  // 4. getAdjacentArticles (only among published articles)
  // Published sequence: first-article (0), second-article (1), fourth-article (2)
  const adjFirst = await service.getAdjacentArticles('first-article');
  runner.assertEqual(adjFirst.prev, null, 'getAdjacentArticles: first article has no prev');
  runner.assertEqual(adjFirst.next?.slug, 'second-article', 'getAdjacentArticles: first article has second as next');

  const adjMiddle = await service.getAdjacentArticles('second-article');
  runner.assertEqual(adjMiddle.prev?.slug, 'first-article', 'getAdjacentArticles: second article has first as prev');
  runner.assertEqual(adjMiddle.next?.slug, 'fourth-article', 'getAdjacentArticles: skips draft article to fourth as next');

  const adjLast = await service.getAdjacentArticles('fourth-article');
  runner.assertEqual(adjLast.prev?.slug, 'second-article', 'getAdjacentArticles: last article has second as prev');
  runner.assertEqual(adjLast.next, null, 'getAdjacentArticles: last article has no next');

  const adjNone = await service.getAdjacentArticles('non-existent-slug');
  runner.assertEqual(adjNone, { prev: null, next: null }, 'getAdjacentArticles: unlisted slug returns null for both');

  // 5. updateArticle audit column sanitization
  await service.updateArticle('art-1', {
    title: 'Updated Title',
    id: 'tampered-id',
    created_at: 'tampered-created',
    updated_at: 'tampered-updated',
  } as any);

  runner.assert(mockRepo.lastUpdatedData !== null, 'updateArticle: calls repo update');
  runner.assertEqual(mockRepo.lastUpdatedData?.title, 'Updated Title', 'updateArticle: passes updated fields');
  runner.assert(!('id' in mockRepo.lastUpdatedData!), 'updateArticle: strips id before repository update');
  runner.assert(!('created_at' in mockRepo.lastUpdatedData!), 'updateArticle: strips created_at before repository update');
  runner.assert(!('updated_at' in mockRepo.lastUpdatedData!), 'updateArticle: strips updated_at before repository update');

  runner.endSuite();
}
