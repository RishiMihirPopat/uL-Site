'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArticleForm } from '@/components/admin/ArticleForm';
import styles from '../../admin.module.css';

export default function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/articles/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setArticle(data);
        } else {
          setError(data?.error || 'Article not found');
        }
      })
      .catch(() => setError('Failed to load article'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/admin/articles');
      } else {
        setError(data.error || 'Failed to update article');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div style={{ padding: '3rem', textAlign: 'center', fontStyle: 'italic', color: '#888' }}>
          Loading article editor...
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className={styles.page}>
        <div className={`${styles.alert} ${styles.alertError}`}>
          ✕ {error || 'Article not found.'}
        </div>
        <Link href="/admin/articles" className={styles.btn}>
          &larr; Back to Articles
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>Edit Article</h1>
          <p className={styles.headerSubtitle}>
            Editing <em>{article.title}</em>
          </p>
        </div>
        <div className={styles.actions}>
          <Link href="/admin/articles" className={styles.btn}>
            &larr; Back to Articles
          </Link>
          <a
            href={`/articles/${article.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            View Live Article ↗
          </a>
        </div>
      </div>

      {error && <div className={`${styles.alert} ${styles.alertError}`}>✕ {error}</div>}

      <ArticleForm
        initialData={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          subtitle: article.subtitle,
          author: article.author,
          author_role: article.authorRole || article.author_role,
          category: article.category,
          cover_image: article.coverImage || article.cover_image,
          content: article.content,
          status: article.status,
          published_at: article.publishedAt || article.published_at,
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isEdit={true}
      />
    </div>
  );
}
