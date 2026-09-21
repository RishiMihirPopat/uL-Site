/**
 * Article Repository Interface & Neon Postgres Implementation (SOLID - SRP & LSP).
 */

import { getDatabaseConnection } from '../db/client';
import { buildParameterizedUpdate } from '../db/sql-utils';
import { ArticleRow } from '../types/article';

export interface IArticleRepository {
  getAll(): Promise<ArticleRow[]>;
  getPublished(): Promise<ArticleRow[]>;
  getById(id: string): Promise<ArticleRow | null>;
  getBySlug(slug: string): Promise<ArticleRow | null>;
  create(article: Partial<ArticleRow>): Promise<void>;
  update(id: string, updates: Partial<ArticleRow>): Promise<void>;
  delete(id: string): Promise<void>;
}

export class NeonArticleRepository implements IArticleRepository {
  private get sql() {
    return getDatabaseConnection();
  }

  async getAll(): Promise<ArticleRow[]> {
    const rows = await this.sql`
      SELECT * FROM articles ORDER BY published_at DESC, created_at DESC
    `;
    return rows as ArticleRow[];
  }

  async getPublished(): Promise<ArticleRow[]> {
    const rows = await this.sql`
      SELECT * FROM articles WHERE status = 'published' ORDER BY published_at DESC, created_at DESC
    `;
    return rows as ArticleRow[];
  }

  async getById(id: string): Promise<ArticleRow | null> {
    const rows = await this.sql`
      SELECT * FROM articles WHERE id = ${id} LIMIT 1
    `;
    return (rows[0] as ArticleRow) || null;
  }

  async getBySlug(slug: string): Promise<ArticleRow | null> {
    const rows = await this.sql`
      SELECT * FROM articles WHERE slug = ${slug} LIMIT 1
    `;
    return (rows[0] as ArticleRow) || null;
  }

  async create(article: Partial<ArticleRow>): Promise<void> {
    const id = article.id || `art-${Date.now()}`;
    const slug = article.slug || id;
    const title = article.title || 'Untitled Article';
    const subtitle = article.subtitle || '';
    const author = article.author || 'unLecture Collective';
    const author_role = article.author_role || '';
    const category = article.category || 'Essay';
    const cover_image = article.cover_image || '/category-covers/unlecture.jpg';
    const content = article.content || '';
    const read_time = article.read_time || '4 min read';
    const status = article.status || 'published';
    const published_at = article.published_at || new Date().toISOString().split('T')[0];

    await this.sql`
      INSERT INTO articles (
        id, slug, title, subtitle, author, author_role, category, cover_image,
        content, read_time, status, published_at, created_at, updated_at
      ) VALUES (
        ${id}, ${slug}, ${title}, ${subtitle}, ${author}, ${author_role}, ${category}, ${cover_image},
        ${content}, ${read_time}, ${status}, ${published_at}, NOW(), NOW()
      )
    `;
  }

  async update(id: string, updates: Partial<ArticleRow>): Promise<void> {
    const queryData = buildParameterizedUpdate('articles', id, updates as Record<string, unknown>, { setUpdatedAt: true });
    if (!queryData) return;

    await this.sql.query(queryData.query, queryData.values as any[]);
  }

  async delete(id: string): Promise<void> {
    await this.sql`DELETE FROM articles WHERE id = ${id}`;
  }
}

export const articleRepository = new NeonArticleRepository();
