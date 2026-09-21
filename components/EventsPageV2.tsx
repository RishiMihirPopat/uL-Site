'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, UserCircle } from '@phosphor-icons/react';
import { eventsPageV2 } from '../lib/content';
import { FORMAT_REGISTRY } from '../lib/constants/formats';
import { EASE } from '../lib/constants/animation';
import { useOutsideClose } from '../lib/hooks/useOutsideClose';
import ArchiveEventModal from './ArchiveEventModal';
import BookingModal from './BookingModal';
import styles from './EventsPageV2.module.css';

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
  archiveImage?: string;
  category: string;
  urbanautUrl?: string;
  specialBadge?: string;
  tags?: string[];
  youtubeUrls?: string[];
  substackUrls?: string[];
  description?: string;
}

export interface EventsPageV2Props {
  upcoming: EventsPageCard[];
  archived?: EventsPageCard[];
  past?: EventsPageCard[];
  initialType?: EventType;
  initialFormat?: FormatFilter;
}

export type EventType = 'upcoming' | 'archived' | 'past';
export type FormatFilter = 'all' | 'unlecture' | 'unlecture-series' | 'community' | 'grounds-for-thought';

const FORMAT_OPTIONS: { value: FormatFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unlecture', label: FORMAT_REGISTRY['unlecture'].name },
  { value: 'unlecture-series', label: FORMAT_REGISTRY['unlecture-series'].name },
  { value: 'community', label: FORMAT_REGISTRY['community'].name },
  { value: 'grounds-for-thought', label: FORMAT_REGISTRY['grounds-for-thought'].name },
];

export default function EventsPageV2({
  upcoming,
  archived,
  past,
  initialType = 'upcoming',
  initialFormat = 'all',
}: EventsPageV2Props) {
  const archiveList = archived ?? past ?? [];
  const normalizedInitialType: 'upcoming' | 'archived' =
    initialType === 'past' || initialType === 'archived' ? 'archived' : 'upcoming';
  const [type, setType] = useState<'upcoming' | 'archived'>(normalizedInitialType);
  const [formatFilter, setFormatFilter] = useState<FormatFilter>(initialFormat);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selectedArchivedEvent, setSelectedArchivedEvent] = useState<EventsPageCard | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<{ url: string; title: string } | null>(null);

  const [typeOpen, setTypeOpen] = useState(false);
  const [formatOpen, setFormatOpen] = useState(false);
  const typeRef = useOutsideClose(typeOpen, () => setTypeOpen(false));
  const formatRef = useOutsideClose(formatOpen, () => setFormatOpen(false));

  useEffect(() => {
    if (initialType) {
      setType(initialType === 'past' || initialType === 'archived' ? 'archived' : 'upcoming');
    }
  }, [initialType]);

  useEffect(() => {
    if (initialFormat) setFormatFilter(initialFormat);
  }, [initialFormat]);

  useEffect(() => {
    setPage(0);
  }, [type, formatFilter, search]);

  const filtered = useMemo(() => {
    const base = type === 'upcoming' ? upcoming : archiveList;
    let matched = formatFilter === 'all'
      ? base
      : base.filter((e) => e.category === formatFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      matched = matched.filter((e) =>
        e.title.toLowerCase().includes(q) ||
        e.speaker.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        (e.specialBadge && e.specialBadge.toLowerCase().includes(q))
      );
    }
    return matched;
  }, [type, formatFilter, search, upcoming, archiveList]);

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
                {type === 'upcoming' ? 'UPCOMING EVENTS' : 'ARCHIVED EVENTS'}
              </button>
              <img
                src="/custom-assets/contact-select-arrow.svg"
                alt=""
                aria-hidden="true"
                className={`${styles.pillArrow} ${typeOpen ? styles.pillArrowOpen : ''}`}
              />
              {typeOpen && (
                <ul className={styles.dropdownMenu} role="listbox">
                  {(['upcoming', 'archived'] as const).map((opt) => (
                    <li key={opt}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={type === opt}
                        className={styles.dropdownOption}
                        onClick={() => { setType(opt); setTypeOpen(false); }}
                      >
                        {opt === 'upcoming' ? 'Upcoming Events' : 'Archived Events'}
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

            <div className={styles.dropdownWrap} ref={formatRef}>
              <button
                type="button"
                className={styles.pillBtn}
                onClick={() => setFormatOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={formatOpen}
              >
                TYPE: {FORMAT_OPTIONS.find((o) => o.value === formatFilter)?.label.toUpperCase() ?? 'ALL'}
              </button>
              <img
                src="/custom-assets/contact-select-arrow.svg"
                alt=""
                aria-hidden="true"
                className={`${styles.pillArrow} ${formatOpen ? styles.pillArrowOpen : ''}`}
              />
              {formatOpen && (
                <ul className={styles.dropdownMenu} role="listbox">
                  {FORMAT_OPTIONS.map((opt) => (
                    <li key={opt.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={formatFilter === opt.value}
                        className={styles.dropdownOption}
                        onClick={() => { setFormatFilter(opt.value); setFormatOpen(false); }}
                      >
                        {opt.label}
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
            {pageItems.map((ev) => {
              const isUpcomingLink = type === 'upcoming' && Boolean(ev.urbanautUrl);
              const displayImage = type === 'archived' && ev.archiveImage ? ev.archiveImage : ev.image;
              const badgeText = ev.specialBadge || FORMAT_REGISTRY[ev.category as keyof typeof FORMAT_REGISTRY]?.name || 'ARCHIVE';

              const cardContent = (
                <>
                  <div className={styles.cardPhoto}>
                    {displayImage ? (
                      <Image src={displayImage} alt={ev.title} fill sizes="465px" className={styles.cardImg} />
                    ) : (
                      <div className={styles.cardImgPlaceholder} />
                    )}
                  </div>
                  <div className={styles.cardBody}>
                    <p className={styles.cardTitle}>{ev.title}</p>
                    <div className={`${styles.cardMetaRows} ${type === 'archived' ? styles.cardMetaRowsArchived : ''}`}>
                      {type === 'archived' ? (
                        badgeText ? (
                          <div className={styles.specialBadgeCard}>
                            {badgeText}
                          </div>
                        ) : ev.speaker && ev.speaker !== '—' ? (
                          <div className={styles.cardMetaRow}>
                            <UserCircle weight="bold" className={styles.cardMetaIcon} />
                            <p className={styles.cardMeta}>BY {toTitleCase(ev.speaker)}</p>
                          </div>
                        ) : null
                      ) : (
                        <>
                          <div className={styles.cardMetaRow}>
                            <Calendar weight="bold" className={styles.cardMetaIcon} />
                            <p className={`${styles.cardMeta} ${styles.cardMetaDateRow}`}>
                              <span className={styles.cardMetaDate}>{ev.date}</span>
                              {ev.venue && ev.venue !== '—' && (
                                <a
                                  href={(ev as any).venueMapUrl || (ev as any).venue_map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.venue)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.cardMetaVenue}
                                  onClick={(e) => e.stopPropagation()}
                                  title={`View ${ev.venue} on Google Maps`}
                                >
                                  &nbsp;@ {ev.venue}
                                </a>
                              )}
                            </p>
                          </div>
                          {ev.speaker && ev.speaker !== '—' && (
                            <div className={styles.cardMetaRow}>
                              <UserCircle weight="bold" className={styles.cardMetaIcon} />
                              <p className={styles.cardMeta}>BY {toTitleCase(ev.speaker)}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </>
              );

              if (type === 'archived') {
                return (
                  <div
                    key={ev.id}
                    className={`${styles.card} ${styles.cardClickable}`}
                    data-cursor-label="View Archive"
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedArchivedEvent(ev)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedArchivedEvent(ev);
                      }
                    }}
                    aria-label={`View archive for ${ev.title}`}
                  >
                    {cardContent}
                  </div>
                );
              }

              return isUpcomingLink ? (
                <div
                  key={ev.id}
                  className={`${styles.card} ${styles.cardClickable}`}
                  data-cursor-label="Click to Book!"
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedBooking({ url: ev.urbanautUrl!, title: ev.title })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedBooking({ url: ev.urbanautUrl!, title: ev.title });
                    }
                  }}
                  aria-label={`Book tickets for ${ev.title}`}
                >
                  {cardContent}
                </div>
              ) : (
                <div key={ev.id} className={styles.card}>
                  {cardContent}
                </div>
              );
            })}
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
                  {type === 'upcoming' ? 'UPCOMING' : 'ARCHIVED'}
                  <img
                    src="/custom-assets/contact-select-arrow.svg"
                    alt=""
                    aria-hidden="true"
                    className={`${styles.pillArrowMobileV2} ${typeOpen ? styles.pillArrowMobileV2Open : ''}`}
                  />
                </button>
                {typeOpen && (
                  <ul className={styles.dropdownMenuMobileV2} role="listbox">
                    {(['upcoming', 'archived'] as const).map((opt) => (
                      <li key={opt}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={type === opt}
                          className={styles.dropdownOptionMobileV2}
                          onClick={() => { setType(opt); setTypeOpen(false); }}
                        >
                          {opt === 'upcoming' ? 'Upcoming Events' : 'Archived Events'}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className={`${styles.dropdownWrapMobileV2} ${styles.dropdownWrapMobileV2Format}`} ref={formatRef}>
                <button
                  type="button"
                  className={styles.pillBtnMobileV2}
                  onClick={() => setFormatOpen((v) => !v)}
                  aria-haspopup="listbox"
                  aria-expanded={formatOpen}
                >
                  TYPE
                  <img
                    src="/custom-assets/contact-select-arrow.svg"
                    alt=""
                    aria-hidden="true"
                    className={`${styles.pillArrowMobileV2} ${formatOpen ? styles.pillArrowMobileV2Open : ''}`}
                  />
                </button>
                {formatOpen && (
                  <ul className={styles.dropdownMenuMobileV2} role="listbox">
                    {FORMAT_OPTIONS.map((opt) => (
                      <li key={opt.value}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={formatFilter === opt.value}
                          className={styles.dropdownOptionMobileV2}
                          onClick={() => { setFormatFilter(opt.value); setFormatOpen(false); }}
                        >
                          {opt.label}
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
            {pageItems.map((ev) => {
              const isUpcomingLink = type === 'upcoming' && Boolean(ev.urbanautUrl);
              const displayImage = type === 'archived' && ev.archiveImage ? ev.archiveImage : ev.image;
              const badgeText = ev.specialBadge || FORMAT_REGISTRY[ev.category as keyof typeof FORMAT_REGISTRY]?.name || 'ARCHIVE';

              const cardMobileContent = (
                <div className={styles.cardMobileInnerV2}>
                  <div className={styles.cardPhotoMobileV2}>
                    {displayImage ? (
                      <Image src={displayImage} alt={ev.title} fill sizes="351px" className={styles.cardImgMobileV2} />
                    ) : (
                      <div className={styles.cardImgPlaceholderMobileV2} />
                    )}
                  </div>
                  <div className={styles.cardBodyMobileV2}>
                    <p className={styles.cardTitleMobileV2}>{ev.title}</p>
                    <div className={`${styles.cardMetaRowsMobileV2} ${type === 'archived' ? styles.cardMetaRowsMobileV2Archived : ''}`}>
                      {type === 'archived' ? (
                        badgeText ? (
                          <div className={styles.specialBadgeCardMobile}>
                            {badgeText}
                          </div>
                        ) : ev.speaker && ev.speaker !== '—' ? (
                          <div className={styles.cardMetaRowMobileV2}>
                            <UserCircle weight="bold" className={styles.cardMetaIconMobileV2} />
                            <p className={styles.cardMetaMobileV2}>BY {toTitleCase(ev.speaker)}</p>
                          </div>
                        ) : null
                      ) : (
                        <>
                          <div className={styles.cardMetaRowMobileV2}>
                            <Calendar weight="bold" className={styles.cardMetaIconMobileV2} />
                            <p className={`${styles.cardMetaMobileV2} ${styles.cardMetaDateRowMobileV2}`}>
                              <span className={styles.cardMetaDateMobileV2}>{ev.date}</span>
                              {ev.venue && ev.venue !== '—' && (
                                <a
                                  href={(ev as any).venueMapUrl || (ev as any).venue_map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.venue)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.cardMetaVenueMobileV2}
                                  onClick={(e) => e.stopPropagation()}
                                  title={`View ${ev.venue} on Google Maps`}
                                >
                                  &nbsp;@ {ev.venue}
                                </a>
                              )}
                            </p>
                          </div>
                          {ev.speaker && ev.speaker !== '—' && (
                            <div className={styles.cardMetaRowMobileV2}>
                              <UserCircle weight="bold" className={styles.cardMetaIconMobileV2} />
                              <p className={styles.cardMetaMobileV2}>BY {toTitleCase(ev.speaker)}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );

              if (type === 'archived') {
                return (
                  <div
                    key={ev.id}
                    className={`${styles.cardMobileV2} ${styles.cardMobileClickableV2}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedArchivedEvent(ev)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedArchivedEvent(ev);
                      }
                    }}
                    aria-label={`View archive for ${ev.title}`}
                  >
                    {cardMobileContent}
                  </div>
                );
              }

              return isUpcomingLink ? (
                <div
                  key={ev.id}
                  className={`${styles.cardMobileV2} ${styles.cardMobileClickableV2}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedBooking({ url: ev.urbanautUrl!, title: ev.title })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedBooking({ url: ev.urbanautUrl!, title: ev.title });
                    }
                  }}
                  aria-label={`Book tickets for ${ev.title}`}
                >
                  {cardMobileContent}
                </div>
              ) : (
                <div key={ev.id} className={styles.cardMobileV2}>
                  {cardMobileContent}
                </div>
              );
            })}
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

      <ArchiveEventModal
        event={selectedArchivedEvent}
        onClose={() => setSelectedArchivedEvent(null)}
      />

      <BookingModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
    </div>
  );
}
