import { getDatabaseConnection } from '../db/client';
import { Testimonial } from '../types/testimonial';

export interface ITestimonialRepository {
  getAll(): Testimonial[];
  getById(id: string): Testimonial | null;
  create(testimonial: Partial<Testimonial>): string;
  update(id: string, testimonial: Partial<Testimonial>): void;
  delete(id: string): void;
}

export class TestimonialRepository implements ITestimonialRepository {
  public getAll(): Testimonial[] {
    const db = getDatabaseConnection();
    return db
      .prepare('SELECT * FROM testimonials ORDER BY order_index ASC, created_at DESC')
      .all() as Testimonial[];
  }

  public getById(id: string): Testimonial | null {
    const db = getDatabaseConnection();
    const row = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(id);
    return (row as Testimonial) || null;
  }

  public create(testimonial: Partial<Testimonial>): string {
    const db = getDatabaseConnection();
    const id = testimonial.id || `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const stmt = db.prepare(`
      INSERT INTO testimonials (id, title, recommender, quote, order_index)
      VALUES (@id, @title, @recommender, @quote, @order_index)
    `);

    stmt.run({
      id,
      title: testimonial.title || '',
      recommender: testimonial.recommender || '',
      quote: testimonial.quote || '',
      order_index: testimonial.order_index ?? 0,
    });

    return id;
  }

  public update(id: string, testimonial: Partial<Testimonial>): void {
    const db = getDatabaseConnection();
    const keys = Object.keys(testimonial).filter(k => k !== 'id' && testimonial[k as keyof Testimonial] !== undefined);
    if (keys.length === 0) return;

    const setClauses = keys.map(k => `${k} = @${k}`).join(', ');
    const stmt = db.prepare(`UPDATE testimonials SET ${setClauses} WHERE id = @id`);
    stmt.run({ ...testimonial, id });
  }

  public delete(id: string): void {
    const db = getDatabaseConnection();
    db.prepare('DELETE FROM testimonials WHERE id = ?').run(id);
  }
}

export const testimonialRepository = new TestimonialRepository();
