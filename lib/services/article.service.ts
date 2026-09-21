/**
 * Article Service (SOLID - SRP & Business Logic).
 */

import { IArticleRepository, articleRepository } from '../repositories/article.repository';
import { Article, ArticleRow } from '../types/article';
import { slugify } from '../utils/slug';

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
    return slugify(title);
  }

  async getAllArticles(): Promise<Article[]> {
    const rows = await this.repo.getAll();
    return rows.map((r) => this.mapRow(r));
  }

  async getPublishedArticles(): Promise<Article[]> {
    const rows = await this.repo.getPublished();
    return rows.map((r) => this.mapRow(r));
  }

  async getArticleBySlug(slug: string): Promise<Article | null> {
    const row = await this.repo.getBySlug(slug);
    return row ? this.mapRow(row) : null;
  }

  async getArticleById(id: string): Promise<Article | null> {
    const row = await this.repo.getById(id);
    return row ? this.mapRow(row) : null;
  }

  /**
   * Retrieves next and previous articles in sequence for smooth article switching.
   */
  async getAdjacentArticles(slug: string): Promise<{ prev: Article | null; next: Article | null }> {
    const published = await this.getPublishedArticles();
    const index = published.findIndex((a) => a.slug === slug);
    if (index === -1) return { prev: null, next: null };

    return {
      prev: index > 0 ? published[index - 1] : null,
      next: index < published.length - 1 ? published[index + 1] : null,
    };
  }

  async createArticle(data: Partial<ArticleRow>): Promise<void> {
    if (!data.slug && data.title) {
      data.slug = this.generateSlug(data.title);
    }
    if (data.content && !data.read_time) {
      data.read_time = this.calculateReadTime(data.content);
    }
    await this.repo.create(data);
  }

  async updateArticle(id: string, updates: Partial<ArticleRow>): Promise<void> {
    const data = { ...updates };
    delete (data as any).id;
    delete (data as any).created_at;
    delete (data as any).updated_at;

    if (data.content && !data.read_time) {
      data.read_time = this.calculateReadTime(data.content);
    }
    await this.repo.update(id, data);
  }

  async deleteArticle(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}

export const articleService = new ArticleService();
