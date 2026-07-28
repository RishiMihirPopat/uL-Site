'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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

export default function PostcardArchive() {
  const [cards, setCards] = useState<ArchiveCard[]>([]);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastViewedId, setLastViewedId] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  /* ── Fetch archive data from API ── */

  useEffect(() => {
    fetch('/api/archive')
      .then((r) => r.json())
      .then((data: ArchiveCard[]) => {
        setCards(data);
        if (data.length > 0 && !lastViewedId) {
          setLastViewedId(data[0].id);
        }
      })
      .catch((err) => {
        console.error('Failed to load archive:', err);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const heroCard = lastViewedId ? cards.find((c) => c.id === lastViewedId) : null;

  const filteredCards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter(
      (card) =>
        card.title.toLowerCase().includes(q) ||
        card.venue.toLowerCase().includes(q) ||
        card.date.toLowerCase().includes(q) ||
        (card.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }, [searchQuery, cards]);

  const selectedCard: ArchiveCard | undefined = selectedId
    ? cards.find((c) => c.id === selectedId)
    : undefined;

  /* ── 3D Card Flip onto Back -> Background Expansion Sequence ─── */

  const handlePolaroidClick = () => {
    if (isFlipping || isOpen) return;
    setIsFlipping(true);
    setTimeout(() => {
      setIsOpen(true);
    }, 360);
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSelectedId(null);
    setSearchQuery('');
    setTimeout(() => {
      setIsFlipping(false);
    }, 320);
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

  /* ════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════ */

  return (
    <>
      {/* ── 3D Polaroid Card Container ─── */}
      <div className={styles.polaroidContainer}>
        <motion.button
          className={styles.polaroid}
          onClick={handlePolaroidClick}
          aria-label="Open postcard archive"
          whileHover={{ scale: 1.025, rotate: -1 }}
          whileTap={{ scale: 0.98 }}
          animate={{
            rotateY: isFlipping || isOpen ? 180 : 0,
            rotate: isFlipping || isOpen ? 0 : -3,
            scale: isFlipping && !isOpen ? 1.06 : 1,
          }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Front Face */}
          <div style={{ backfaceVisibility: 'hidden' }}>
            <div className={styles.tape1} aria-hidden="true" />
            <div className={styles.tape2} aria-hidden="true" />
            <div className={styles.polaroidImgWrap}>
              <img
                src={heroCard?.image ?? '/images/hero-event.jpg'}
                alt={heroCard?.title ?? 'An unLecture event in a Delhi venue'}
                className={styles.polaroidImg}
              />
            </div>
            <p className={styles.polaroidCaption}>
              {heroCard ? heroCard.title : 'An evening in Delhi, 2024'}
            </p>
            <span className={styles.polaroidHint} aria-hidden="true">
              Click to open archive
            </span>
          </div>

          {/* Reverse Back Face (Dark Parchment) */}
          <div className={styles.polaroidBack}>
            <span className={styles.polaroidBackTitle}>Archive</span>
            <span className={styles.polaroidBackSub}>Opening Dossier...</span>
          </div>
        </motion.button>
      </div>

      {/* ── Fullscreen Archive Overlay ─── */}
      <ClientPortal>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="archive-overlay-fullscreen"
              className={styles.overlay}
              role="dialog"
              aria-modal="true"
              aria-label="Postcard archive"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Header */}
              <motion.div
                className={styles.overlayHeader}
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className={styles.overlayTitle}>Archive</p>
                <input
                  ref={searchRef}
                  type="search"
                  placeholder="Search by event, venue, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                  aria-label="Search archive"
                />
                <button
                  className={styles.closeBtn}
                  onClick={handleClose}
                  aria-label="Close archive"
                >
                  X
                </button>
              </motion.div>

              {/* Scrollable grid */}
              <motion.div
                className={styles.gridWrap}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.36, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) handleClose();
                }}
              >
                {filteredCards.length === 0 ? (
                  <p className={styles.emptyState}>
                    No events found for &ldquo;{searchQuery}&rdquo;
                  </p>
                ) : (
                  <div className={styles.grid}>
                    {filteredCards.map((card, i) => (
                      <motion.button
                        key={card.id}
                        className={styles.card}
                        onClick={() => handleCardClick(card)}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.35,
                          delay: 0.15 + i * 0.03,
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
                          <span className={styles.cardDate}>{card.date}</span>
                          {card.specialBadge && (
                            <span className={styles.cardBadge}>
                              {card.specialBadge}
                            </span>
                          )}
                          <p className={styles.cardTitle}>{card.title}</p>
                          <p className={styles.cardSpeaker}>{card.speaker}</p>
                          <p className={styles.cardVenue}>{card.venue}</p>
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
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <motion.article
                      key="archive-detail-card"
                      className={styles.detailCard}
                      onClick={(e) => e.stopPropagation()}
                      initial={{ opacity: 0, scale: 0.95, y: 16 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 16 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <button
                        className={styles.detailBack}
                        onClick={handleCloseDetail}
                        aria-label="Back to archive"
                      >
                        &larr; Back
                      </button>
                      <div className={styles.detailImgWrap}>
                        <img
                          src={selectedCard.image}
                          alt={selectedCard.title}
                          className={styles.detailImg}
                        />
                      </div>
                      <div className={styles.detailBody}>
                        <div className={styles.detailMeta}>
                          <span className={styles.detailDate}>
                            {selectedCard.date}
                          </span>
                          <span className={styles.detailVenue}>
                            {selectedCard.venue}
                          </span>
                        </div>
                        {selectedCard.specialBadge && (
                          <span className={styles.detailBadge}>
                            {selectedCard.specialBadge}
                          </span>
                        )}
                        <h2 className={styles.detailTitle}>
                          {selectedCard.title}
                        </h2>
                        <p className={styles.detailSpeaker}>
                          {selectedCard.speaker}
                        </p>
                        <p className={styles.detailDesc}>
                          {selectedCard.description}
                        </p>

                        {/* YouTube videos */}
                        {selectedCard.youtubeUrls && selectedCard.youtubeUrls.length > 0 && (
                          <div className={styles.detailSection}>
                            <h3 className={styles.detailSectionTitle}>Watch</h3>
                            <div className={styles.detailVideoGrid}>
                              {selectedCard.youtubeUrls.map((url) => {
                                const videoId = getYouTubeId(url);
                                return (
                                  <a
                                    key={url}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.detailVideoLink}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {videoId ? (
                                      <img
                                        src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                                        alt="YouTube video thumbnail"
                                        className={styles.detailVideoThumb}
                                      />
                                    ) : (
                                      <span className={styles.detailVideoFallback}>
                                        YouTube Video
                                      </span>
                                    )}
                                    <span className={styles.detailVideoPlay}>
                                      &#9654;
                                    </span>
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Substack articles */}
                        {selectedCard.substackUrls && selectedCard.substackUrls.length > 0 && (
                          <div className={styles.detailSection}>
                            <h3 className={styles.detailSectionTitle}>Read More</h3>
                            <div className={styles.detailArticleList}>
                              {selectedCard.substackUrls.map((url) => (
                                <a
                                  key={url}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.detailArticleLink}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {url.replace(/^https?:\/\//, '').split('/').slice(0, 2).join('/')}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        <a
                          href={selectedCard.urbanautUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.detailLink}
                          onClick={(e) => e.stopPropagation()}
                        >
                          View on Urbanaut
                        </a>
                        <div className={styles.detailTags}>
                          {(selectedCard.tags || []).map((tag) => (
                            <button
                              key={tag}
                              className={styles.detailTag}
                              onClick={() => handleTagClick(tag)}
                            >
                              #{tag}
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
