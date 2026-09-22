'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, UserCircle } from '@phosphor-icons/react';
import { articlesPageV2 } from '../lib/content';
import { EASE } from '../lib/constants/animation';
import { formatArticleDate } from '../lib/utils/dateTime';
import { useOutsideClose } from '../lib/hooks/useOutsideClose';
import styles from './ArticlesPageV2.module.css';

function toTitleCase(s: string): string {
  return s.replace(/\b\w+/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
}

export interface ArticlesPageCard {
  id: string;
  slug: string;
  title: string;
  author?: string;
  coverImage: string;
  publishedAt: string;
}

interface ArticlesPageV2Props {
  articles: ArticlesPageCard[];
}

type SortOrder = 'newest' | 'oldest';

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
    const matched = q
      ? articles.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            (a.author && a.author.toLowerCase().includes(q))
        )
      : articles;
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
          src="/wavy-shapes/website/articles-wavy-shapes.png"
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
                src="/custom-assets/contact-select-arrow.svg"
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
                  <div className={styles.cardMetaRows}>
                    <div className={styles.cardMetaRow}>
                      <Calendar weight="bold" className={styles.cardMetaIcon} />
                      <p className={styles.cardMeta}>{formatArticleDate(a.publishedAt)}</p>
                    </div>
                    {a.author?.trim() && (
                      <div className={styles.cardMetaRow}>
                        <UserCircle weight="bold" className={styles.cardMetaIcon} />
                        <p className={styles.cardMeta}>BY {toTitleCase(a.author.trim())}</p>
                      </div>
                    )}
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
              <img src="/custom-assets/contact-select-arrow.svg" alt="" className={styles.pageArrowPrev} />
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
              <img src="/custom-assets/contact-select-arrow.svg" alt="" className={styles.pageArrowNext} />
            </button>
          </div>
        )}
      </motion.div>

      {/* ── Mobile (node 217:4968) — dedicated header/wave + card list +
             pagination, sharing all the state/filtering above with the
             desktop layout. CSS-hidden on desktop. ── */}
      <section className={styles.headerWaveMobileV2}>
        <img
          src="/wavy-shapes/mobile/article-wavy-shape.png"
          alt=""
          className={styles.waveImgMobileV2}
          aria-hidden="true"
        />
        <div className={styles.headerInnerMobileV2}>
          <h1 className={styles.headingMobileV2}>{articlesPageV2.heading}</h1>
          <div className={styles.filterColMobileV2}>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={articlesPageV2.searchPlaceholder}
              className={styles.searchInputMobileV2}
              aria-label="Search for articles"
            />
            <div className={styles.filterRowMobileV2}>
              <div className={styles.dropdownWrapMobileV2} ref={sortRef}>
                <button
                  type="button"
                  className={styles.pillBtnMobileV2}
                  onClick={() => setSortOpen((v) => !v)}
                  aria-haspopup="listbox"
                  aria-expanded={sortOpen}
                >
                  SORT
                  <img
                    src="/custom-assets/contact-select-arrow.svg"
                    alt=""
                    aria-hidden="true"
                    className={`${styles.pillArrowMobileV2} ${sortOpen ? styles.pillArrowMobileV2Open : ''}`}
                  />
                </button>
                {sortOpen && (
                  <ul className={styles.dropdownMenuMobileV2} role="listbox">
                    {(['newest', 'oldest'] as SortOrder[]).map((opt) => (
                      <li key={opt}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={sort === opt}
                          className={styles.dropdownOptionMobileV2}
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
          </div>
        </div>
      </section>

      <div className={styles.contentMobileV2}>
        {pageItems.length > 0 ? (
          <div className={styles.gridMobileV2}>
            {pageItems.map((a) => (
              <Link
                key={a.id}
                href={`/articles/${a.slug}`}
                className={styles.cardMobileV2}
                data-cursor-label="Click to Read!"
              >
                <div className={styles.cardMobileInnerV2}>
                  <div className={styles.cardPhotoMobileV2}>
                    {a.coverImage ? (
                      <Image src={a.coverImage} alt={a.title} fill sizes="351px" className={styles.cardImgMobileV2} />
                    ) : (
                      <div className={styles.cardImgPlaceholderMobileV2} />
                    )}
                  </div>
                  <div className={styles.cardBodyMobileV2}>
                    <p className={styles.cardTitleMobileV2}>{a.title}</p>
                    <div className={styles.cardMetaRowsMobileV2}>
                      <div className={styles.cardMetaRowMobileV2}>
                        <Calendar weight="bold" className={styles.cardMetaIconMobileV2} />
                        <p className={styles.cardMetaMobileV2}>{formatArticleDate(a.publishedAt)}</p>
                      </div>
                      {a.author?.trim() && (
                        <div className={styles.cardMetaRowMobileV2}>
                          <UserCircle weight="bold" className={styles.cardMetaIconMobileV2} />
                          <p className={styles.cardMetaMobileV2}>BY {toTitleCase(a.author.trim())}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className={styles.emptyMsgMobileV2}>No articles found.</p>
        )}

        {totalPages > 1 && (
          <div className={styles.paginationMobileV2}>
            <button
              type="button"
              className={styles.pageArrowBtnMobileV2}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={clampedPage === 0}
              aria-label="Previous page"
            >
              <img src="/custom-assets/arrow-prev.svg" alt="" className={styles.pageArrowPrevMobileV2} />
            </button>
            <span className={styles.pageIndicatorMobileV2}>
              {String(clampedPage + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
            </span>
            <button
              type="button"
              className={styles.pageArrowBtnMobileV2}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={clampedPage >= totalPages - 1}
              aria-label="Next page"
            >
              <img src="/custom-assets/arrow-next.svg" alt="" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
