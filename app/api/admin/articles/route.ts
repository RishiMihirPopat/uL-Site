import { getAllArticles, articleService } from '@/lib/db';
import { isAuthenticated, unauthorizedResponse } from '@/lib/auth';

export async function GET() {
  if (!(await isAuthenticated())) return unauthorizedResponse();
  const articles = await getAllArticles();
  return Response.json(articles);
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) return unauthorizedResponse();

  try {
    const body = await request.json();
    if (!body.title || !body.author || !body.content) {
      return Response.json({ error: 'Title, author, and content are required' }, { status: 400 });
    }

    await articleService.createArticle(body);
    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ error: err.message || 'Failed to create article' }, { status: 500 });
  }
}
