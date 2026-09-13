'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, UserCircle } from '@phosphor-icons/react';
import { eventsPageV2 } from '../lib/content';
import styles from './EventsPageV2.module.css';

const EASE = [0.16, 1, 0.3, 1] as const;

function toTitleCase(text: string) {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export interface EventsPageCard {
  id: string;
  title: string;
  speaker: string;
  venue: string;
  date: string;
  image: string;
}

interface EventsPageV2Props {
  upcoming: EventsPageCard[];
  past: EventsPageCard[];
}

type EventType = 'upcoming' | 'past';
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

export default function EventsPageV2({ upcoming, past }: EventsPageV2Props) {
  const [type, setType] = useState<EventType>('upcoming');
  const [sort, setSort] = useState<SortOrder>('newest');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const [typeOpen, setTypeOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const typeRef = useOutsideClose(typeOpen, () => setTypeOpen(false));
  const sortRef = useOutsideClose(sortOpen, () => setSortOpen(false));

  useEffect(() => {
    setPage(0);
  }, [type, sort, search]);

  const filtered = useMemo(() => {
    const base = type === 'upcoming' ? upcoming : past;
    const q = search.trim().toLowerCase();
    const matched = q
      ? base.filter((e) =>
          e.title.toLowerCase().includes(q) ||
          e.speaker.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q)
        )
      : base;
    // Each source array already arrives in the DB's natural order
    // (upcoming: soonest first; past: most recently happened first) —
    // "newest first" keeps that order, "oldest first" reverses it.
    return sort === 'newest' ? matched : [...matched].reverse();
  }, [type, sort, search, upcoming, past]);

  const perPage = eventsPageV2.perPage;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const clampedPage = Math.min(page, totalPages - 1);
  const pageItems = filtered.slice(clampedPage * perPage, clampedPage * perPage + perPage);

  return (
    <div className={styles.pageV2}>
      <section className={styles.headerWaveV2}>
        <motion.img
          src="/wavy-shapes/website/events-wavy-shape.png"
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
          <h1 className={styles.heading}>{eventsPageV2.heading}</h1>

          <div className={styles.filterRow}>
            <div className={styles.dropdownWrap} ref={typeRef}>
              <button
                type="button"
                className={styles.pillBtn}
                onClick={() => setTypeOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={typeOpen}
              >
                TYPE: {type === 'upcoming' ? 'UPCOMING EVENTS' : 'PAST EVENTS'}
              </button>
              <img
                src="/custom-assets/contact-select-arrow.svg"
                alt=""
                aria-hidden="true"
                className={`${styles.pillArrow} ${typeOpen ? styles.pillArrowOpen : ''}`}
              />
              {typeOpen && (
                <ul className={styles.dropdownMenu} role="listbox">
                  {(['upcoming', 'past'] as EventType[]).map((opt) => (
                    <li key={opt}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={type === opt}
                        className={styles.dropdownOption}
                        onClick={() => { setType(opt); setTypeOpen(false); }}
                      >
                        {opt === 'upcoming' ? 'Upcoming Events' : 'Past Events'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={eventsPageV2.searchPlaceholder}
              className={styles.searchInput}
              aria-label="Search for events"
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
            {pageItems.map((ev) => (
              <div key={ev.id} className={styles.card}>
                <div className={styles.cardPhoto}>
                  {ev.image ? (
                    <Image src={ev.image} alt={ev.title} fill sizes="465px" className={styles.cardImg} />
                  ) : (
                    <div className={styles.cardImgPlaceholder} />
                  )}
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.cardTitle}>{ev.title}</p>
                  <div className={styles.cardMetaRows}>
                    <div className={styles.cardMetaRow}>
                      <Calendar weight="bold" className={styles.cardMetaIcon} />
                      <p className={`${styles.cardMeta} ${styles.cardMetaDateRow}`}>
                        <span className={styles.cardMetaDate}>{ev.date}</span>
                        {ev.venue && ev.venue !== '—' && (
                          <span className={styles.cardMetaVenue}>&nbsp;@ {ev.venue}</span>
                        )}
                      </p>
                    </div>
                    {ev.speaker && ev.speaker !== '—' && (
                      <div className={styles.cardMetaRow}>
                        <UserCircle weight="bold" className={styles.cardMetaIcon} />
                        <p className={styles.cardMeta}>BY {toTitleCase(ev.speaker)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.emptyMsg}>No events found.</p>
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

      {/* ── Mobile (node 217:4565) — dedicated header/wave + card list +
             pagination, sharing all the state/filtering above with the
             desktop layout. CSS-hidden on desktop. ── */}
      <section className={styles.headerWaveMobileV2}>
        <img
          src="/wavy-shapes/mobile/events-wavy-shape.png"
          alt=""
          className={styles.waveImgMobileV2}
          aria-hidden="true"
        />
        <div className={styles.headerInnerMobileV2}>
          <h1 className={styles.headingMobileV2}>{eventsPageV2.heading}</h1>
          <div className={styles.filterColMobileV2}>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={eventsPageV2.searchPlaceholder}
              className={styles.searchInputMobileV2}
              aria-label="Search for events"
            />
            <div className={styles.filterRowMobileV2}>
              <div className={`${styles.dropdownWrapMobileV2} ${styles.dropdownWrapMobileV2Type}`} ref={typeRef}>
                <button
                  type="button"
                  className={styles.pillBtnMobileV2}
                  onClick={() => setTypeOpen((v) => !v)}
                  aria-haspopup="listbox"
                  aria-expanded={typeOpen}
                >
                  TYPE
                  <img
                    src="/custom-assets/contact-select-arrow.svg"
                    alt=""
                    aria-hidden="true"
                    className={`${styles.pillArrowMobileV2} ${typeOpen ? styles.pillArrowMobileV2Open : ''}`}
                  />
                </button>
                {typeOpen && (
                  <ul className={styles.dropdownMenuMobileV2} role="listbox">
                    {(['upcoming', 'past'] as EventType[]).map((opt) => (
                      <li key={opt}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={type === opt}
                          className={styles.dropdownOptionMobileV2}
                          onClick={() => { setType(opt); setTypeOpen(false); }}
                        >
                          {opt === 'upcoming' ? 'Upcoming Events' : 'Past Events'}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className={`${styles.dropdownWrapMobileV2} ${styles.dropdownWrapMobileV2Sort}`} ref={sortRef}>
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
            {pageItems.map((ev) => (
              <div key={ev.id} className={styles.cardMobileV2}>
                <div className={styles.cardMobileInnerV2}>
                  <div className={styles.cardPhotoMobileV2}>
                    {ev.image ? (
                      <Image src={ev.image} alt={ev.title} fill sizes="351px" className={styles.cardImgMobileV2} />
                    ) : (
                      <div className={styles.cardImgPlaceholderMobileV2} />
                    )}
                  </div>
                  <div className={styles.cardBodyMobileV2}>
                    <p className={styles.cardTitleMobileV2}>{ev.title}</p>
                    <div className={styles.cardMetaRowsMobileV2}>
                      <div className={styles.cardMetaRowMobileV2}>
                        <Calendar weight="bold" className={styles.cardMetaIconMobileV2} />
                        <p className={`${styles.cardMetaMobileV2} ${styles.cardMetaDateRowMobileV2}`}>
                          <span className={styles.cardMetaDateMobileV2}>{ev.date}</span>
                          {ev.venue && ev.venue !== '—' && (
                            <span className={styles.cardMetaVenueMobileV2}>&nbsp;@ {ev.venue}</span>
                          )}
                        </p>
                      </div>
                      {ev.speaker && ev.speaker !== '—' && (
                        <div className={styles.cardMetaRowMobileV2}>
                          <UserCircle weight="bold" className={styles.cardMetaIconMobileV2} />
                          <p className={styles.cardMetaMobileV2}>BY {toTitleCase(ev.speaker)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.emptyMsgMobileV2}>No events found.</p>
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
