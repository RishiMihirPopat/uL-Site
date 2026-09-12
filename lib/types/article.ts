export type ArticleStatus = 'published' | 'draft';

export interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  author: string;
  author_role?: string;
  category: string;
  cover_image: string;
  content: string;
  read_time?: string;
  status: ArticleStatus;
  published_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  author: string;
  authorRole?: string;
  category: string;
  coverImage: string;
  content: string;
  readTime: string;
  status: ArticleStatus;
  publishedAt: string;
  createdAt?: string;
  updatedAt?: string;
}
