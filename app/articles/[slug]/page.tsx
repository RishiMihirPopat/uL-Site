import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getAdjacentArticles, getPublishedArticles } from '@/lib/db';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: 'Article Not Found — unLecture' };

  return {
    title: `${article.title} — unLecture`,
    description: article.subtitle || `An essay by ${article.author} on unLecture.`,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const { prev, next } = getAdjacentArticles(slug);
  const allArticles = getPublishedArticles().filter((a) => a.slug !== slug);

  return (
    <main className={styles.main}>
      {/* ── Top Navigation Bar ── */}
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <Link href="/" className={styles.backLink}>
            &larr; Back to Home
          </Link>
          <span className={styles.categoryBadge}>Article</span>
        </div>
      </div>

      <article className={styles.articleContainer}>
        {/* ── Article Header ── */}
        <header className={styles.header}>
          <div className={styles.metaRow}>
            <span className={styles.metaDate}>{article.publishedAt}</span>
            <span className={styles.metaDot}>&bull;</span>
            <span className={styles.metaReadTime}>{article.readTime}</span>
          </div>

          <h1 className={styles.title}>{article.title}</h1>

          {article.subtitle && (
            <p className={styles.subtitle}>{article.subtitle}</p>
          )}

          {/* Author Byline */}
          <div className={styles.bylineBox}>
            <div className={styles.bylineAvatar}>
              <span>{article.author.charAt(0)}</span>
            </div>
            <div className={styles.bylineInfo}>
              <strong className={styles.authorName}>{article.author}</strong>
              {article.authorRole && (
                <span className={styles.authorRole}>{article.authorRole}</span>
              )}
            </div>
          </div>
        </header>

        {/* ── Cover Image ── */}
        {article.coverImage && (
          <div className={styles.coverImageWrap}>
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              priority
              className={styles.coverImage}
            />
          </div>
        )}

        {/* ── Markdown Content Body ── */}
        <div className={styles.bodyWrap}>
          <MarkdownRenderer content={article.content} />
        </div>

        {/* ── Article Switcher (Next / Previous) ── */}
        <div className={styles.switcherSection}>
          <h3 className={styles.switcherSectionTitle}>Switch Between Articles</h3>
          <div className={styles.switcherGrid}>
            {prev ? (
              <Link href={`/articles/${prev.slug}`} className={`${styles.switchCard} ${styles.switchCardPrev}`}>
                <span className={styles.switchLabel}>&larr; Previous Article</span>
                <strong className={styles.switchTitle}>{prev.title}</strong>
                <span className={styles.switchAuthor}>by {prev.author}</span>
              </Link>
            ) : (
              <div className={`${styles.switchCard} ${styles.switchCardDisabled}`}>
                <span className={styles.switchLabel}>First Article</span>
                <span className={styles.switchEmpty}>You are at the earliest published essay</span>
              </div>
            )}

            {next ? (
              <Link href={`/articles/${next.slug}`} className={`${styles.switchCard} ${styles.switchCardNext}`}>
                <span className={styles.switchLabel}>Next Article &rarr;</span>
                <strong className={styles.switchTitle}>{next.title}</strong>
                <span className={styles.switchAuthor}>by {next.author}</span>
              </Link>
            ) : (
              <div className={`${styles.switchCard} ${styles.switchCardDisabled}`}>
                <span className={styles.switchLabel}>Latest Article</span>
                <span className={styles.switchEmpty}>You are reading the latest article</span>
              </div>
            )}
          </div>
        </div>

        {/* ── More Articles List ── */}
        {allArticles.length > 0 && (
          <section className={styles.moreSection}>
            <div className={styles.moreHeader}>
              <h2 className={styles.moreTitle}>From the unLecture Desk</h2>
              <span className={styles.moreSubtitle}>More published articles</span>
            </div>

            <div className={styles.moreGrid}>
              {allArticles.slice(0, 3).map((item) => (
                <Link key={item.id} href={`/articles/${item.slug}`} className={styles.moreCard}>
                  <div className={styles.moreCardImage}>
                    <Image
                      src={item.coverImage || '/category-covers/unLecture-cover.jpg'}
                      alt={item.title}
                      fill
                      className={styles.moreImg}
                    />
                  </div>
                  <div className={styles.moreCardContent}>
                    <span className={styles.moreCategory}>Article</span>
                    <strong className={styles.moreCardTitle}>{item.title}</strong>
                    <span className={styles.moreAuthor}>by {item.author}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
