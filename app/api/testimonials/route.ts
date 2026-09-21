import { testimonialRepository } from '@/lib/repositories/testimonial.repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  const testimonials = await testimonialRepository.getAll();
  return Response.json(testimonials);
}
