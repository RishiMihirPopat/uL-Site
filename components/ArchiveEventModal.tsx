'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  UserCircle,
  MapPin,
  YoutubeLogo,
  Article,
  ArrowSquareOut,
  Play,
} from '@phosphor-icons/react';
import { FORMAT_REGISTRY } from '../lib/constants/formats';
import { EASE } from '../lib/constants/animation';
import { useModalDismiss } from '../lib/hooks/useModalDismiss';
import type { EventsPageCard } from './EventsPageV2';
import styles from './ArchiveEventModal.module.css';

interface ArchiveEventModalProps {
  event: EventsPageCard | null;
  onClose: () => void;
}

function toTitleCase(text: string) {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

export default function ArchiveEventModal({ event, onClose }: ArchiveEventModalProps) {
  const [mounted, setMounted] = useState(false);
  const bodyScrollRef = useRef<HTMLDivElement>(null);
  const [articlesMap, setArticlesMap] = useState<
    Record<string, { title: string; author?: string; subtitle?: string; readTime?: string }>
  >({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Locks body scroll, pauses Lenis, and attaches Escape key listener
  useModalDismiss(Boolean(event), onClose);

  // Fetch internal articles to enrich any linked /articles/... slugs
  useEffect(() => {
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

  const displayPhoto = event ? (event.archiveImage || event.image) : '';
  const formatInfo = event ? FORMAT_REGISTRY[event.category as keyof typeof FORMAT_REGISTRY] : null;
  const formatName = formatInfo?.name || (event?.category ? event.category.replace(/-/g, ' ') : '');

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {event && (
        <motion.div
          key={`archive-modal-${event.id}`}
          className={styles.backdrop}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${event.title} — Archive Dossier`}
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: EASE }}
        >
          <motion.article
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent
            onWheel={(e) => {
              if (bodyScrollRef.current && !bodyScrollRef.current.contains(e.target as Node)) {
                bodyScrollRef.current.scrollTop += e.deltaY;
              }
            }}
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            {/* Top Bar Navigation — Archival Dossier Strip */}
            <div className={styles.topBar}>
              <button type="button" className={styles.backBtn} onClick={onClose}>
                <span className={styles.backArrow}>←</span> BACK TO ARCHIVE
              </button>

              <div className={styles.topBarRight}>
                {event.specialBadge && (
                  <span className={styles.topSpecialBadge}>
                    {event.specialBadge}
                  </span>
                )}
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={onClose}
                  aria-label="Close archive dossier"
                >
                  <span className={styles.closeText}>CLOSE</span>
                  <span className={styles.closeIcon}>✕</span>
                </button>
              </div>
            </div>

          {/* Scrollable Dossier Content */}
          <div
            ref={bodyScrollRef}
            className={styles.bodyScroll}
            data-lenis-prevent
          >
            {/* Event Recap Photo Frame */}
            {displayPhoto && (
              <div className={styles.photoFrame}>
                <Image
                  src={displayPhoto}
                  alt={event.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className={styles.photoImg}
                  priority
                />
              </div>
            )}

            {/* Signature Scalloped Wave Strip Divider */}
            <div className={styles.waveDivider} aria-hidden="true">
              <svg
                viewBox="0 0 1200 24"
                preserveAspectRatio="none"
                className={styles.waveSvg}
              >
                <path
                  d="M0,6 C100,-4 200,16 300,6 C400,-4 500,16 600,6 C700,-4 800,16 900,6 C1000,-4 1100,16 1200,6 L1200,18 C1100,28 1000,8 900,18 C800,28 700,8 600,18 C500,28 400,8 300,18 C200,28 100,8 0,18 Z"
                  fill="var(--color-primary)"
                  opacity="0.85"
                />
              </svg>
            </div>

            {/* Event Header Information */}
            <div className={styles.detailHeader}>
              <div className={styles.metaRow}>
                <span className={styles.categoryBadge}>{formatName}</span>
                {event.date && (
                  <span className={styles.metaItem}>
                    <Calendar size={15} weight="bold" className={styles.metaIcon} />
                    {event.date}
                  </span>
                )}
                {event.venue && event.venue !== '—' && (
                  <a
                    href={(event as any).venueMapUrl || (event as any).venue_map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.metaItemLink}
                    title={`View ${event.venue} on Google Maps`}
                  >
                    <MapPin size={15} weight="bold" className={styles.metaIcon} />
                    {event.venue} ↗
                  </a>
                )}
              </div>

              <h1 className={styles.eventTitle}>{event.title}</h1>

              {event.speaker && event.speaker !== '—' && (
                <div className={styles.speakerRow}>
                  <UserCircle size={18} weight="bold" className={styles.speakerIcon} />
                  <span>
                    BY <span className={styles.speakerName}>{toTitleCase(event.speaker)}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Description & Narrative */}
            {event.description && (
              <div className={styles.descriptionSection}>
                <p className={styles.descriptionText}>{event.description}</p>

                {event.tags && event.tags.length > 0 && (
                  <div className={styles.tagsRow}>
                    {event.tags.map((tag) => (
                      <span key={tag} className={styles.tagPill}>
                        #{tag.replace(/^#+/, '').toUpperCase()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* YouTube Session Videos Section */}
            {event.youtubeUrls && event.youtubeUrls.length > 0 && (
              <div className={styles.videoSection}>
                <h3 className={styles.sectionTitle}>
                  <YoutubeLogo size={18} weight="bold" className={styles.sectionIcon} />
                  Session Recordings & Videos
                </h3>
                <div className={styles.videoGrid}>
                  {event.youtubeUrls.map((url) => {
                    const videoId = getYouTubeId(url);
                    const thumbUrl = videoId
                      ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                      : null;

                    return (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.videoCard}
                      >
                        <div className={styles.videoThumbWrap}>
                          {thumbUrl ? (
                            <img
                              src={thumbUrl}
                              alt="Video recording thumbnail"
                              className={styles.videoThumb}
                            />
                          ) : (
                            <div className={styles.videoThumbPlaceholder} />
                          )}
                          <div className={styles.videoPlayOverlay}>
                            <div className={styles.playCircle}>
                              <Play size={18} weight="fill" />
                            </div>
                          </div>
                        </div>
                        <div className={styles.videoMeta}>
                          <span className={styles.videoLabel}>Watch Recording</span>
                          <span className={styles.videoArrow}>↗</span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Related Notes, Essays & Substack Dispatches */}
            {event.substackUrls && event.substackUrls.length > 0 && (
              <div className={styles.articlesSection}>
                <h3 className={styles.sectionTitle}>
                  <Article size={18} weight="bold" className={styles.sectionIcon} />
                  Related Notes & Dispatches
                </h3>
                <div className={styles.articleList}>
                  {event.substackUrls.map((url) => {
                    const isInternalArticle = url.startsWith('/articles/');
                    const matched = isInternalArticle ? articlesMap[url] : null;

                    if (isInternalArticle) {
                      return (
                        <Link
                          key={url}
                          href={url}
                          className={styles.articleCard}
                          onClick={onClose}
                        >
                          <div className={styles.articleKickerRow}>
                            <span>UNLECTURE ARTICLE</span>
                            {matched?.readTime && (
                              <span className={styles.articleReadTime}>
                                {matched.readTime}
                              </span>
                            )}
                          </div>
                          <h4 className={styles.articleTitle}>
                            {matched ? matched.title : 'Read unLecture Article'}
                          </h4>
                          {matched?.subtitle && (
                            <p className={styles.articleSubtitle}>{matched.subtitle}</p>
                          )}
                          <div className={styles.articleFooter}>
                            <span className={styles.articleAuthor}>
                              {matched?.author ? `by ${matched.author}` : 'by unLecture'}
                            </span>
                            <span className={styles.articleCta}>
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
                        className={styles.substackCard}
                      >
                        <div className={styles.substackLeft}>
                          <span className={styles.substackKicker}>SUBSTACK ESSAY</span>
                          <h4 className={styles.substackTitle}>Read Dispatch on Substack</h4>
                        </div>
                        <span className={styles.substackArrow} aria-hidden="true">
                          ↗
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* View on Urbanaut Archive Record */}
            {event.urbanautUrl && (
              <a
                href={event.urbanautUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.urbanautBtn}
              >
                <span>View Original Gathering Record on Urbanaut</span>
                <ArrowSquareOut size={16} weight="bold" />
              </a>
            )}
          </div>
        </motion.article>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
