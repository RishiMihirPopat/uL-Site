import { testimonialRepository } from '@/lib/repositories/testimonial.repository';
import { isAuthenticated, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAuthenticated())) return unauthorizedResponse();
  const testimonials = testimonialRepository.getAll();
  return Response.json(testimonials);
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) return unauthorizedResponse();
  try {
    const body = await request.json();
    if (!body.title || !body.quote) {
      return Response.json({ error: 'Title and Quote are required.' }, { status: 400 });
    }
    const id = testimonialRepository.create(body);
    return Response.json({ success: true, id });
  } catch {
    return Response.json({ error: 'Failed to create testimonial' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) return unauthorizedResponse();
  try {
    const body = await request.json();
    if (!body.id) {
      return Response.json({ error: 'Testimonial ID is required.' }, { status: 400 });
    }
    testimonialRepository.update(body.id, body);
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Failed to update testimonial' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) return unauthorizedResponse();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return Response.json({ error: 'Testimonial ID is required.' }, { status: 400 });
    }
    testimonialRepository.delete(id);
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Failed to delete testimonial' }, { status: 500 });
  }
}
