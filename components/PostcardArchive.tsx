'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './PostcardArchive.module.css';

/* ── Type matching the API response ── */

export interface ArchiveCard {
  id: string;
  date: string;
  title: string;
  venue: string;
  speaker: string;
  description: string;
  image: string;
  tags: string[];
  specialBadge?: string;
  category: string;
  urbanautUrl: string;
  youtubeUrls?: string[];
  substackUrls?: string[];
}

/* ── ClientPortal helper ── */

function ClientPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return createPortal(children, document.body);
}

/* ── YouTube thumbnail helper ── */

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

export default function PostcardArchive({
  initialCards = [],
  isModalOnly = false,
}: {
  initialCards?: ArchiveCard[];
  isModalOnly?: boolean;
}) {
  const [cards, setCards] = useState<ArchiveCard[]>(initialCards);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'articles' | 'events'>('articles');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title_asc' | 'title_desc'>('newest');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [articlesMap, setArticlesMap] = useState<
    Record<string, { title: string; author: string; subtitle?: string; readTime?: string; coverImage?: string }>
  >({});
  const [lastViewedId, setLastViewedId] = useState<string | null>(
    initialCards.length > 0 ? initialCards[0].id : null
  );

  const searchRef = useRef<HTMLInputElement>(null);

  /* ── Fetch archive data & published articles from API ── */

  useEffect(() => {
    fetch('/api/archive')
      .then((r) => r.json())
      .then((data: ArchiveCard[]) => {
        setCards(data);
        setLastViewedId((prev) => prev ?? (data.length > 0 ? data[0].id : null));
      })
      .catch((err) => {
        console.error('Failed to load archive:', err);
      });

    fetch('/api/articles')
      .then((r) => r.json())
      .then((articles: any[]) => {
        if (Array.isArray(articles)) {
          const map: Record<string, any> = {};
          articles.forEach((a) => {
            map[a.slug] = a;
            map[`/articles/${a.slug}`] = a;
          });
          setArticlesMap(map);
        }
      })
      .catch(() => {});
  }, []);

  /* ── Listen to Navigation & URL Hash Events ── */
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleHash = () => {
      if (typeof window !== 'undefined' && window.location.hash === '#archive') {
        setIsOpen(true);
      }
    };

    handleHash();
    window.addEventListener('open-unlecture-archive', handleOpen);
    window.addEventListener('hashchange', handleHash);

    return () => {
      window.removeEventListener('open-unlecture-archive', handleOpen);
      window.removeEventListener('hashchange', handleHash);
    };
  }, []);

  /* ── Segregate Events vs Articles ── */
  const eventCards = useMemo(() => {
    return cards.filter((c) => c.category !== 'article');
  }, [cards]);

  const articleCards = useMemo(() => {
    return cards.filter(
      (c) => c.category === 'article' || (c.substackUrls && c.substackUrls.length > 0)
    );
  }, [cards]);

  const currentTabPool = activeTab === 'articles' ? articleCards : eventCards;

  /* ── Search filtering ── */
  const filteredCards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return currentTabPool;
    return currentTabPool.filter(
      (card) =>
        card.title.toLowerCase().includes(q) ||
        card.venue.toLowerCase().includes(q) ||
        card.speaker.toLowerCase().includes(q) ||
        card.date.toLowerCase().includes(q) ||
        (card.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }, [searchQuery, currentTabPool]);

  /* ── Chronological & Alphabetical Sorting ── */
  const sortedCards = useMemo(() => {
    const list = [...filteredCards];
    if (sortBy === 'newest') {
      list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    } else if (sortBy === 'oldest') {
      list.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    } else if (sortBy === 'title_asc') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'title_desc') {
      list.sort((a, b) => b.title.localeCompare(a.title));
    }
    return list;
  }, [filteredCards, sortBy]);

  const selectedCard: ArchiveCard | undefined = selectedId
    ? cards.find((c) => c.id === selectedId)
    : undefined;

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSelectedId(null);
    setSearchQuery('');
    if (typeof window !== 'undefined' && window.location.hash === '#archive') {
      try {
        const cleanUrl = window.location.pathname + window.location.search;
        window.history.replaceState(window.history.state || {}, document.title, cleanUrl);
      } catch {
        try {
          window.location.hash = '';
        } catch {}
      }
    }
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedId(null);
  }, []);

  const handleCardClick = (card: ArchiveCard) => {
    setSelectedId(card.id);
    setLastViewedId(card.id);
  };

  const handleTagClick = (tag: string) => {
    setSelectedId(null);
    setSearchQuery(tag);
  };

  /* ── Focus search when archive opens ─── */
  useEffect(() => {
    if (isOpen) {
      const raf = requestAnimationFrame(() => {
        searchRef.current?.focus();
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isOpen]);

  /* ── Keyboard: Escape closes detail then archive ─── */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedId) handleCloseDetail();
        else handleClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, selectedId, handleClose, handleCloseDetail]);

  /* ── Lock body scroll while archive is open ─── */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Optional trigger button when not in modal-only mode */}
      {!isModalOnly && (
        <div className={styles.polaroidContainer}>
          <button
            type="button"
            className={styles.openArchiveBtn}
            onClick={() => setIsOpen(true)}
          >
            Look inside Archive &rarr;
          </button>
        </div>
      )}

      {/* ── Fullscreen Archive Overlay ─── */}
      <ClientPortal>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="archive-overlay-fullscreen"
              className={styles.overlay}
              role="dialog"
              aria-modal="true"
              aria-label="Look inside: articles and past events"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Header Bar */}
              <motion.div
                className={styles.overlayHeader}
                initial={{ opacity: 0, y: -14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className={styles.overlayTitleBlock}>
                  <p className={styles.overlayTitle}>From the Desk & Archive</p>
                  <p className={styles.overlaySubtitle}>
                    A look inside: articles & past gatherings
                  </p>
                </div>

                <div className={styles.overlayHeaderRight}>
                  <div className={styles.searchBox}>
                    <input
                      ref={searchRef}
                      type="search"
                      placeholder="Search articles, topics, speakers, venues..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={styles.searchInput}
                      aria-label="Search archive"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        className={styles.searchClearBtn}
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <button
                    className={styles.closeBtn}
                    onClick={handleClose}
                    aria-label="Close archive"
                  >
                    ✕
                  </button>
                </div>
              </motion.div>

              {/* Subheader Toolbar: Left Tabs & Right Sort Controls */}
              <div className={styles.subToolbar}>
                <div className={styles.tabGroupLeft}>
                  <button
                    type="button"
                    className={`${styles.tabBtn} ${activeTab === 'articles' ? styles.tabBtnActive : ''}`}
                    onClick={() => setActiveTab('articles')}
                  >
                    Articles <span className={styles.tabCount}>({articleCards.length})</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.tabBtn} ${activeTab === 'events' ? styles.tabBtnActive : ''}`}
                    onClick={() => setActiveTab('events')}
                  >
                    Past Gatherings <span className={styles.tabCount}>({eventCards.length})</span>
                  </button>
                </div>

                <div className={styles.sortGroup}>
                  <label htmlFor="archive-sort" className={styles.sortLabel}>
                    Sort by:
                  </label>
                  <select
                    id="archive-sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className={styles.sortSelect}
                  >
                    <option value="newest">Chronological (Newest First)</option>
                    <option value="oldest">Chronological (Oldest First)</option>
                    <option value="title_asc">Alphabetical (A &rarr; Z)</option>
                    <option value="title_desc">Alphabetical (Z &rarr; A)</option>
                  </select>
                </div>
              </div>

              {/* Scrollable grid */}
              <motion.div
                className={styles.gridWrap}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 14 }}
                transition={{ duration: 0.32, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) handleClose();
                }}
              >
                {sortedCards.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>No items found matching &ldquo;{searchQuery}&rdquo;</p>
                    {searchQuery && (
                      <button
                        type="button"
                        className={styles.clearSearchBtn}
                        onClick={() => setSearchQuery('')}
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  <div className={styles.grid}>
                    {sortedCards.map((card, i) => (
                      <motion.button
                        key={card.id}
                        className={styles.card}
                        onClick={() => handleCardClick(card)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.32,
                          delay: 0.12 + i * 0.025,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        aria-label={`View ${card.title}`}
                      >
                        <div className={styles.cardTape} aria-hidden="true" />
                        <div className={styles.cardImg}>
                          <img
                            src={card.image}
                            alt={card.title}
                            className={styles.cardImgEl}
                          />
                        </div>
                        <div className={styles.cardMeta}>
                          {activeTab === 'articles' ? (
                            <div className={styles.cardHeaderRow}>
                              <span className={styles.articleBadge}>Article</span>
                              {card.tags && card.tags[0] && (
                                <span className={styles.cardDate}>#{card.tags[0]}</span>
                              )}
                            </div>
                          ) : (
                            <div className={styles.cardHeaderRow}>
                              <span className={styles.cardDate}>{card.date}</span>
                              {card.specialBadge && (
                                <span className={styles.cardBadge}>
                                  {card.specialBadge}
                                </span>
                              )}
                            </div>
                          )}
                          <p className={styles.cardTitle}>{card.title}</p>
                          <p className={styles.cardSpeaker}>{card.speaker}</p>
                          {card.venue && card.venue !== '—' && activeTab === 'events' && (
                            <p className={styles.cardVenue}>{card.venue}</p>
                          )}
                          {activeTab === 'articles' && card.description && (
                            <p className={styles.articleExcerpt}>
                              {card.description}
                            </p>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Detail view overlay */}
              <AnimatePresence>
                {selectedCard && (
                  <motion.div
                    key="archive-detail-backdrop"
                    className={styles.detailBackdrop}
                    onClick={handleCloseDetail}
                    role="presentation"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <motion.article
                      key="archive-detail-card"
                      className={styles.detailCard}
                      onClick={(e) => e.stopPropagation()}
                      initial={{ opacity: 0, scale: 0.98, y: 14 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98, y: 14 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {/* Top Bar Navigation */}
                      <div className={styles.detailTopBar}>
                        <button
                          className={styles.detailBack}
                          onClick={handleCloseDetail}
                          aria-label="Back to archive"
                        >
                          &larr; Back to Archive
                        </button>
                        <div className={styles.detailTopRight}>
                          {selectedCard.specialBadge && (
                            <span className={styles.detailTopBadge}>
                              {selectedCard.specialBadge}
                            </span>
                          )}
                          <button
                            className={styles.detailCloseBtn}
                            onClick={handleCloseDetail}
                            aria-label="Close detail view"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      <div className={styles.detailImgWrap}>
                        <img
                          src={selectedCard.image}
                          alt={selectedCard.title}
                          className={styles.detailImg}
                        />
                      </div>
                      <div className={styles.detailBody}>
                        <div className={styles.detailMeta}>
                          {selectedCard.date && (
                            <span className={styles.detailDate}>
                              {selectedCard.date}
                            </span>
                          )}
                          {selectedCard.venue && selectedCard.venue !== '—' && (
                            <span className={styles.detailVenue}>
                              {selectedCard.venue}
                            </span>
                          )}
                          {selectedCard.specialBadge && (
                            <span className={styles.detailSpecialBadge}>
                              {selectedCard.specialBadge}
                            </span>
                          )}
                        </div>

                        <h2 className={styles.detailTitle}>{selectedCard.title}</h2>
                        {selectedCard.speaker && selectedCard.speaker !== '—' && (
                          <p className={styles.detailSpeaker}>
                            {activeTab === 'articles' ? 'Author / Thinker: ' : 'Led by '}
                            <strong>{selectedCard.speaker}</strong>
                          </p>
                        )}
                        <p className={styles.detailDesc}>{selectedCard.description}</p>

                        {/* YouTube Video Section */}
                        {selectedCard.youtubeUrls && selectedCard.youtubeUrls.length > 0 && (
                          <div className={styles.videoSection}>
                            <h3 className={styles.sectionHeading}>
                              Session Recordings & Videos
                            </h3>
                            <div className={styles.videoGrid}>
                              {selectedCard.youtubeUrls.map((url) => {
                                const id = getYouTubeId(url);
                                if (!id) return null;
                                return (
                                  <a
                                    key={url}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.videoThumbWrap}
                                  >
                                    <img
                                      src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`}
                                      alt="YouTube Video Thumbnail"
                                      className={styles.videoThumb}
                                    />
                                    <div className={styles.videoPlayOverlay}>
                                      <span className={styles.playText}>Watch Video &rarr;</span>
                                    </div>
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Website Hosted Articles & Substack Essays */}
                        {selectedCard.substackUrls && selectedCard.substackUrls.length > 0 && (
                          <div className={styles.articleFeatureSection}>
                            <h3 className={styles.articleFeatureSectionTitle}>
                              Related Notes & Essays
                            </h3>
                            <div className={styles.articleFeatureList}>
                              {selectedCard.substackUrls.map((url, i) => {
                                const isWebsiteArticle = url.startsWith('/articles/');
                                const matched = isWebsiteArticle ? articlesMap[url] : null;

                                if (isWebsiteArticle) {
                                  return (
                                    <Link
                                      key={url}
                                      href={url}
                                      className={styles.articleFeatureCard}
                                      onClick={() => setIsOpen(false)}
                                    >
                                      <div className={styles.articleFeatureHeader}>
                                        <span className={styles.articleKicker}>
                                          UNLECTURE ARTICLE
                                        </span>
                                        {matched?.readTime && (
                                          <span className={styles.articleReadTime}>
                                            {matched.readTime}
                                          </span>
                                        )}
                                      </div>

                                      <h4 className={styles.articleFeatureTitle}>
                                        {matched ? matched.title : 'Read unLecture Article'}
                                      </h4>

                                      {matched?.subtitle && (
                                        <p className={styles.articleFeatureSubtitle}>
                                          {matched.subtitle}
                                        </p>
                                      )}

                                      <div className={styles.articleFeatureFooter}>
                                        <span className={styles.articleFeatureAuthor}>
                                          {matched?.author ? `by ${matched.author}` : 'by unLecture'}
                                        </span>
                                        <span className={styles.articleFeatureCta}>
                                          Read Full Article &rarr;
                                        </span>
                                      </div>
                                    </Link>
                                  );
                                }

                                return (
                                  <a
                                    key={url}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.substackFeatureCard}
                                  >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                      <span style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', fontWeight: 700 }}>
                                        SUBSTACK ESSAY
                                      </span>
                                      <span style={{ fontWeight: 600, color: '#1A1714', fontSize: '1rem' }}>
                                        Read Dispatch on Substack
                                      </span>
                                    </div>
                                    <span style={{ color: 'var(--color-terracotta)', fontWeight: 600 }} aria-hidden="true">&rarr;</span>
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {selectedCard.urbanautUrl && (
                          <a
                            href={selectedCard.urbanautUrl}
                            target={selectedCard.urbanautUrl.startsWith('/') ? undefined : '_blank'}
                            rel="noopener noreferrer"
                            className={styles.detailLink}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (selectedCard.urbanautUrl.startsWith('/')) {
                                setIsOpen(false);
                              }
                            }}
                          >
                            {selectedCard.category === 'article' ? 'Read Full Article →' : 'View on Urbanaut →'}
                          </a>
                        )}

                        <div className={styles.detailTags}>
                          {(selectedCard.tags || []).map((tag) => (
                            <button
                              key={tag}
                              className={styles.detailTag}
                              onClick={() => handleTagClick(tag)}
                            >
                              #{tag.replace(/^#+/, '')}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.article>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </ClientPortal>
    </>
  );
}
