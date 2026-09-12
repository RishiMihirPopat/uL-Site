/**
 * Article Service (SOLID - SRP & Business Logic).
 */

import { IArticleRepository, articleRepository } from '../repositories/article.repository';
import { Article, ArticleRow } from '../types/article';

export class ArticleService {
  constructor(private repo: IArticleRepository = articleRepository) {}

  private mapRow(row: ArticleRow): Article {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      subtitle: row.subtitle,
      author: row.author,
      authorRole: row.author_role,
      category: row.category,
      coverImage: row.cover_image,
      content: row.content,
      readTime: row.read_time || this.calculateReadTime(row.content),
      status: row.status,
      publishedAt: row.published_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  calculateReadTime(content: string): string {
    if (!content) return '1 min read';
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  }

  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  getAllArticles(): Article[] {
    return this.repo.getAll().map((r) => this.mapRow(r));
  }

  getPublishedArticles(): Article[] {
    return this.repo.getPublished().map((r) => this.mapRow(r));
  }

  getArticleBySlug(slug: string): Article | null {
    const row = this.repo.getBySlug(slug);
    return row ? this.mapRow(row) : null;
  }

  getArticleById(id: string): Article | null {
    const row = this.repo.getById(id);
    return row ? this.mapRow(row) : null;
  }

  /**
   * Retrieves next and previous articles in sequence for smooth article switching.
   */
  getAdjacentArticles(slug: string): { prev: Article | null; next: Article | null } {
    const published = this.getPublishedArticles();
    const index = published.findIndex((a) => a.slug === slug);
    if (index === -1) return { prev: null, next: null };

    return {
      prev: index > 0 ? published[index - 1] : null,
      next: index < published.length - 1 ? published[index + 1] : null,
    };
  }

  createArticle(data: Partial<ArticleRow>): void {
    if (!data.slug && data.title) {
      data.slug = this.generateSlug(data.title);
    }
    if (data.content && !data.read_time) {
      data.read_time = this.calculateReadTime(data.content);
    }
    this.repo.create(data);
  }

  updateArticle(id: string, updates: Partial<ArticleRow>): void {
    if (updates.content && !updates.read_time) {
      updates.read_time = this.calculateReadTime(updates.content);
    }
    this.repo.update(id, updates);
  }

  deleteArticle(id: string): void {
    this.repo.delete(id);
  }
}

export const articleService = new ArticleService();
