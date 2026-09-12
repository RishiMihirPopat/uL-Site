/**
 * Article Repository Interface & SQLite Implementation (SOLID - SRP & LSP).
 */

import { getDatabaseConnection } from '../db/client';
import { ArticleRow, ArticleStatus } from '../types/article';

export interface IArticleRepository {
  getAll(): ArticleRow[];
  getPublished(): ArticleRow[];
  getById(id: string): ArticleRow | null;
  getBySlug(slug: string): ArticleRow | null;
  create(article: Partial<ArticleRow>): void;
  update(id: string, updates: Partial<ArticleRow>): void;
  delete(id: string): void;
}

export class SqliteArticleRepository implements IArticleRepository {
  private get db() {
    return getDatabaseConnection();
  }

  getAll(): ArticleRow[] {
    return this.db
      .prepare('SELECT * FROM articles ORDER BY published_at DESC, created_at DESC')
      .all() as ArticleRow[];
  }

  getPublished(): ArticleRow[] {
    return this.db
      .prepare("SELECT * FROM articles WHERE status = 'published' ORDER BY published_at DESC, created_at DESC")
      .all() as ArticleRow[];
  }

  getById(id: string): ArticleRow | null {
    return (
      (this.db.prepare('SELECT * FROM articles WHERE id = ?').get(id) as ArticleRow) || null
    );
  }

  getBySlug(slug: string): ArticleRow | null {
    return (
      (this.db.prepare('SELECT * FROM articles WHERE slug = ?').get(slug) as ArticleRow) || null
    );
  }

  create(article: Partial<ArticleRow>): void {
    const id = article.id || `art-${Date.now()}`;
    const stmt = this.db.prepare(`
      INSERT INTO articles (
        id, slug, title, subtitle, author, author_role, category, cover_image, content, read_time, status, published_at, created_at, updated_at
      ) VALUES (
        @id, @slug, @title, @subtitle, @author, @author_role, @category, @cover_image, @content, @read_time, @status, @published_at, datetime('now'), datetime('now')
      )
    `);

    stmt.run({
      id,
      slug: article.slug || id,
      title: article.title || 'Untitled Article',
      subtitle: article.subtitle || '',
      author: article.author || 'unLecture Collective',
      author_role: article.author_role || '',
      category: article.category || 'Essay',
      cover_image: article.cover_image || '/category-covers/unLecture-cover.jpg',
      content: article.content || '',
      read_time: article.read_time || '4 min read',
      status: article.status || 'published',
      published_at: article.published_at || new Date().toISOString().split('T')[0],
    });
  }

  update(id: string, updates: Partial<ArticleRow>): void {
    const existing = this.getById(id);
    if (!existing) return;

    const merged = { ...existing, ...updates };
    const stmt = this.db.prepare(`
      UPDATE articles SET
        slug = @slug,
        title = @title,
        subtitle = @subtitle,
        author = @author,
        author_role = @author_role,
        category = @category,
        cover_image = @cover_image,
        content = @content,
        read_time = @read_time,
        status = @status,
        published_at = @published_at,
        updated_at = datetime('now')
      WHERE id = @id
    `);

    stmt.run({
      id,
      slug: merged.slug,
      title: merged.title,
      subtitle: merged.subtitle || '',
      author: merged.author,
      author_role: merged.author_role || '',
      category: merged.category,
      cover_image: merged.cover_image,
      content: merged.content,
      read_time: merged.read_time,
      status: merged.status,
      published_at: merged.published_at,
    });
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM articles WHERE id = ?').run(id);
  }
}

export const articleRepository = new SqliteArticleRepository();
