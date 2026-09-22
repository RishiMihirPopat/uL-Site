'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../admin.module.css';
import { Article } from '@/lib/types/article';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadArticles = () => {
    setLoading(true);
    fetch('/api/admin/articles')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setArticles(data);
        }
      })
      .catch(() => showToast('error', 'Failed to load articles'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', 'Article deleted');
        setArticles((prev) => prev.filter((a) => a.id !== id));
      } else {
        showToast('error', 'Failed to delete article');
      }
    } catch {
      showToast('error', 'Network error');
    }
  };

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.author.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>Articles & Editorial Dispatches</h1>
          <p className={styles.headerSubtitle}>
            Write, edit, and publish long-form essays, field notes, and interview dispatches with Markdown formatting.
          </p>
        </div>
        <div className={styles.actions}>
          <Link href="/admin/dashboard" className={styles.btn}>
            &larr; Dashboard
          </Link>
          <Link href="/admin/articles/new" className={`${styles.btn} ${styles.btnPrimary}`}>
            + Write New Article
          </Link>
        </div>
      </div>

      {toastMsg && (
        <div
          className={`${styles.alert} ${
            toastMsg.type === 'success' ? styles.alertSuccess : styles.alertError
          }`}
        >
          {toastMsg.type === 'success' ? '✓' : '✕'} {toastMsg.text}
        </div>
      )}

      {/* ── Articles Table Card ── */}
      <div className={styles.card}>
        <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 className={styles.cardTitle}>All Articles ({articles.length})</h2>
            <p className={styles.cardDesc}>Published and draft editorial dispatches.</p>
          </div>

          <input
            type="search"
            placeholder="Search by title, author, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.input}
            style={{ maxWidth: '280px' }}
          />
        </div>

        <div className={styles.tableWrap}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', fontStyle: 'italic', color: '#888' }}>
              Loading articles...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center' }}>
              <p style={{ fontStyle: 'italic', color: '#888', margin: '0 0 1rem' }}>
                {search ? 'No articles match your search query.' : 'No articles created yet.'}
              </p>
              <Link href="/admin/articles/new" className={`${styles.btn} ${styles.btnPrimary}`}>
                + Create Your First Article
              </Link>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Article Title</th>
                  <th>Author</th>
                  <th>Date & Read Time</th>
                  <th>Status</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((art) => (
                  <tr key={art.id}>
                    <td>
                      <strong style={{ display: 'block', color: 'var(--color-text, #1A1714)', fontSize: '0.92rem' }}>
                        {art.title}
                      </strong>
                      <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted, #3D332A)', fontFamily: 'var(--font-mono, monospace)' }}>
                        slug: /articles/{art.slug}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.88rem', color: 'var(--color-text, #1A1714)' }}>{art.author}</span>
                      {art.authorRole && (
                        <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--color-text-muted, #3D332A)', fontStyle: 'italic' }}>
                          {art.authorRole}
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted, #3D332A)', fontFamily: 'var(--font-mono, monospace)', display: 'block' }}>
                        {art.publishedAt}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted, #3D332A)', fontFamily: 'var(--font-mono, monospace)' }}>
                        {art.readTime}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          art.status === 'published' ? styles.badgeActive : styles.badgeHidden
                        }`}
                      >
                        {art.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'nowrap' }}>
                        <Link
                          href={`/admin/articles/${art.id}`}
                          className={`${styles.btn} ${styles.btnSmall}`}
                          title="Edit Article"
                        >
                          Edit
                        </Link>
                        <a
                          href={`/articles/${art.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${styles.btn} ${styles.btnSmall}`}
                          title="View on site"
                        >
                          View ↗
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDelete(art.id, art.title)}
                          className={`${styles.btn} ${styles.btnSmall} ${styles.btnDanger}`}
                          title="Delete Article"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
