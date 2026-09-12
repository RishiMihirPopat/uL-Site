'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArticleForm } from '@/components/admin/ArticleForm';
import styles from '../../admin.module.css';

export default function NewArticlePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/admin/articles');
      } else {
        setError(data.error || 'Failed to create article');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>Write New Article</h1>
          <p className={styles.headerSubtitle}>
            Compose an editorial essay or dispatch with Markdown headers, bold, italics, quotes, and links.
          </p>
        </div>
        <Link href="/admin/articles" className={styles.btn}>
          &larr; Back to Articles
        </Link>
      </div>

      {error && <div className={`${styles.alert} ${styles.alertError}`}>✕ {error}</div>}

      <ArticleForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
