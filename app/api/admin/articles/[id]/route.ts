import { articleService } from '@/lib/db';
import { isAuthenticated, unauthorizedResponse } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) return unauthorizedResponse();
  const { id } = await params;
  const article = articleService.getArticleById(id);
  if (!article) return Response.json({ error: 'Article not found' }, { status: 404 });
  return Response.json(article);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) return unauthorizedResponse();
  const { id } = await params;

  try {
    const body = await request.json();
    articleService.updateArticle(id, body);
    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ error: err.message || 'Failed to update article' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) return unauthorizedResponse();
  const { id } = await params;

  try {
    articleService.deleteArticle(id);
    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ error: err.message || 'Failed to delete article' }, { status: 500 });
  }
}
