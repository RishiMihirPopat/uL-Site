'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar } from '@phosphor-icons/react';
import { articlesPageV2 } from '../lib/content';
import styles from './ArticlesPageV2.module.css';

const EASE = [0.16, 1, 0.3, 1] as const;

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

export interface ArticlesPageCard {
  id: string;
  slug: string;
  title: string;
  coverImage: string;
  publishedAt: string;
}

interface ArticlesPageV2Props {
  articles: ArticlesPageCard[];
}

type SortOrder = 'newest' | 'oldest';

function useOutsideClose(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);
  return ref;
}

export default function ArticlesPageV2({ articles }: ArticlesPageV2Props) {
  const [sort, setSort] = useState<SortOrder>('newest');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useOutsideClose(sortOpen, () => setSortOpen(false));

  useEffect(() => {
    setPage(0);
  }, [sort, search]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matched = q ? articles.filter((a) => a.title.toLowerCase().includes(q)) : articles;
    // Source array already arrives most-recently-published first (DB
    // ORDER BY published_at DESC) — "newest first" keeps that order,
    // "oldest first" reverses it.
    return sort === 'newest' ? matched : [...matched].reverse();
  }, [sort, search, articles]);

  const perPage = articlesPageV2.perPage;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const clampedPage = Math.min(page, totalPages - 1);
  const pageItems = filtered.slice(clampedPage * perPage, clampedPage * perPage + perPage);

  return (
    <div className={styles.pageV2}>
      <section className={styles.headerWaveV2}>
        <motion.img
          src="/main%20images/Articles%20Wavy%20Shapes.png"
          alt=""
          className={styles.waveImgV2}
          aria-hidden="true"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
        />

        <motion.div
          className={styles.headerInnerV2}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65, ease: EASE }}
        >
          <h1 className={styles.heading}>{articlesPageV2.heading}</h1>

          <div className={styles.filterRow}>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={articlesPageV2.searchPlaceholder}
              className={styles.searchInput}
              aria-label="Search for articles"
            />

            <div className={styles.dropdownWrap} ref={sortRef}>
              <button
                type="button"
                className={styles.pillBtn}
                onClick={() => setSortOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={sortOpen}
              >
                SORT: {sort === 'newest' ? 'NEWEST FIRST' : 'OLDEST FIRST'}
              </button>
              <img
                src="/figma-assets/contact-select-arrow.svg"
                alt=""
                aria-hidden="true"
                className={`${styles.pillArrow} ${sortOpen ? styles.pillArrowOpen : ''}`}
              />
              {sortOpen && (
                <ul className={styles.dropdownMenu} role="listbox">
                  {(['newest', 'oldest'] as SortOrder[]).map((opt) => (
                    <li key={opt}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={sort === opt}
                        className={styles.dropdownOption}
                        onClick={() => { setSort(opt); setSortOpen(false); }}
                      >
                        {opt === 'newest' ? 'Newest First' : 'Oldest First'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      <motion.div
        className={styles.contentV2}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8, ease: EASE }}
      >
        {pageItems.length > 0 ? (
          <div className={styles.grid}>
            {pageItems.map((a) => (
              <Link key={a.id} href={`/articles/${a.slug}`} className={styles.card} data-cursor-label="Click to Read!">
                <div className={styles.cardPhoto}>
                  {a.coverImage ? (
                    <Image src={a.coverImage} alt={a.title} fill sizes="465px" className={styles.cardImg} />
                  ) : (
                    <div className={styles.cardImgPlaceholder} />
                  )}
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.cardTitle}>{a.title}</p>
                  <div className={styles.cardMetaRow}>
                    <Calendar weight="bold" className={styles.cardMetaIcon} />
                    <p className={styles.cardMeta}>{formatDate(a.publishedAt)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className={styles.emptyMsg}>No articles found.</p>
        )}

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.pageArrowBtn}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={clampedPage === 0}
              aria-label="Previous page"
            >
              <img src="/figma-assets/contact-select-arrow.svg" alt="" className={styles.pageArrowPrev} />
            </button>
            <span className={styles.pageIndicator}>
              {String(clampedPage + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
            </span>
            <button
              type="button"
              className={styles.pageArrowBtn}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={clampedPage >= totalPages - 1}
              aria-label="Next page"
            >
              <img src="/figma-assets/contact-select-arrow.svg" alt="" className={styles.pageArrowNext} />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
