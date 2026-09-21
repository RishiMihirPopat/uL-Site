/**
 * Testimonial Repository Interface & Neon Postgres Implementation.
 */

import { getDatabaseConnection } from '../db/client';
import { buildParameterizedUpdate } from '../db/sql-utils';
import { Testimonial } from '../types/testimonial';

export interface ITestimonialRepository {
  getAll(): Promise<Testimonial[]>;
  getById(id: string): Promise<Testimonial | null>;
  create(testimonial: Partial<Testimonial>): Promise<string>;
  update(id: string, testimonial: Partial<Testimonial>): Promise<void>;
  delete(id: string): Promise<void>;
}

export class NeonTestimonialRepository implements ITestimonialRepository {
  private get sql() {
    return getDatabaseConnection();
  }

  public async getAll(): Promise<Testimonial[]> {
    const rows = await this.sql`
      SELECT * FROM testimonials ORDER BY order_index ASC, created_at DESC
    `;
    return rows as Testimonial[];
  }

  public async getById(id: string): Promise<Testimonial | null> {
    const rows = await this.sql`
      SELECT * FROM testimonials WHERE id = ${id} LIMIT 1
    `;
    return (rows[0] as Testimonial) || null;
  }

  public async create(testimonial: Partial<Testimonial>): Promise<string> {
    const id = testimonial.id || `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const title = testimonial.title || '';
    const recommender = testimonial.recommender || '';
    const quote = testimonial.quote || '';
    const orderIndex = testimonial.order_index ?? 0;

    await this.sql`
      INSERT INTO testimonials (id, title, recommender, quote, order_index, created_at)
      VALUES (${id}, ${title}, ${recommender}, ${quote}, ${orderIndex}, NOW())
    `;

    return id;
  }

  public async update(id: string, testimonial: Partial<Testimonial>): Promise<void> {
    const queryData = buildParameterizedUpdate('testimonials', id, testimonial as Record<string, unknown>);
    if (!queryData) return;

    await this.sql.query(queryData.query, queryData.values as any[]);
  }

  public async delete(id: string): Promise<void> {
    await this.sql`DELETE FROM testimonials WHERE id = ${id}`;
  }
}

export const testimonialRepository = new NeonTestimonialRepository();
