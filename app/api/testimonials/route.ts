import { testimonialRepository } from '@/lib/repositories/testimonial.repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  const testimonials = testimonialRepository.getAll();
  return Response.json(testimonials);
}
