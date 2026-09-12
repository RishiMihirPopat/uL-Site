/**
 * Complete Database Seeder for unLecture.
 * Populates events across all 4 formats, all 5 lifecycle statuses,
 * plus interactive YouTube and Substack links for the 2-Tab Archive.
 * 
 * Run with: npx tsx scripts/seed.ts
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'unlecture.db');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id              TEXT PRIMARY KEY,
    title           TEXT NOT NULL,
    speaker         TEXT NOT NULL,
    venue           TEXT NOT NULL,
    category        TEXT NOT NULL,
    date            TEXT NOT NULL,
    event_datetime  TEXT,
    time            TEXT DEFAULT '',
    price           TEXT DEFAULT '',
    description     TEXT DEFAULT '',
    image           TEXT NOT NULL,
    urbanaut_url    TEXT DEFAULT '',
    archive_status  TEXT NOT NULL DEFAULT 'active',
    archive_image   TEXT,
    archive_badge   TEXT,
    archive_tags    TEXT DEFAULT '[]',
    youtube_urls    TEXT DEFAULT '[]',
    substack_urls   TEXT DEFAULT '[]',
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  INSERT OR IGNORE INTO settings (key, value) VALUES ('auto_archive_days', '7');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('auto_archive_action', 'archive');
`);

/* ════════════════════════════════════════════════
   1. ACTIVE EVENTS (All 4 Formats)
   ════════════════════════════════════════════════ */

const activeEvents = [
  // ── unLecture (Flagship) ──
  {
    id: 'ul-virtue-darwin',
    category: 'unlecture',
    title: 'Does Virtue Survive Darwinian Competition?',
    speaker: 'Prof. Brishti Guha',
    venue: 'IFC Social, New Delhi',
    date: 'Sat, 12 Sep',
    event_datetime: '2026-09-12T19:00:00+05:30',
    time: '7:00 PM',
    price: '₹550',
    description: 'An inquiry into evolutionary game theory, altruism, and whether moral goodness is an evolutionary stable strategy or an accidental byproduct of kinship.',
    image: 'https://d10y46cwh6y6x1.cloudfront.net/images/7D45C6BEF38044E4A26BD773DF63A0E8_converted_webp.webp',
    urbanaut_url: 'https://urbanaut.app/spot/ul-does-virtue-survive-darwinian-competition',
    archive_badge: 'FLAGSHIP',
    archive_status: 'active',
  },
  {
    id: 'ul-news-questions',
    category: 'unlecture',
    title: 'When the News Stopped Asking Questions',
    speaker: 'Manisha Pande',
    venue: 'The Piano Man, Eldeco Centre',
    date: 'Sat, 19 Sep',
    event_datetime: '2026-09-19T18:30:00+05:30',
    time: '6:30 PM',
    price: '₹499',
    description: 'Investigating the structural collapse of prime-time investigative journalism, media incentives, and the new underground ecosystems of truth-telling.',
    image: 'https://d10y46cwh6y6x1.cloudfront.net/images/90346EF5F5B3477DAAB9EB2FFEABF7E3_converted_webp.webp',
    urbanaut_url: 'https://urbanaut.app/spot/ul-when-the-news-stopped-asking-questions',
    archive_badge: 'FAST FILLING',
    archive_status: 'active',
  },
  {
    id: 'ul-indian-scifi',
    category: 'unlecture',
    title: 'The Secret History of Indian Sci-Fi',
    speaker: 'Gautam Bhatia',
    venue: 'Siyah Arthouse, Saket',
    date: 'Sat, 26 Sep',
    event_datetime: '2026-09-26T19:00:00+05:30',
    time: '7:00 PM',
    price: '₹499',
    description: 'From 19th-century Bengali anti-colonial utopias to contemporary cyberpunk Delhi: tracing how Indian speculative fiction imagined alternate futures.',
    image: 'https://d10y46cwh6y6x1.cloudfront.net/images/95AF6B8634C64F37A015D13BD1334485_converted_webp.webp',
    urbanaut_url: 'https://urbanaut.app/spot/ul-the-secret-history-of-indian-sci-fi',
    archive_badge: null,
    archive_status: 'active',
  },

  // ── Grounds for Thought (Café Conversations) ──
  {
    id: 'gft-ads-natural',
    category: 'grounds-for-thought',
    title: 'How Ads Invented What Feels Natural',
    speaker: 'Anish Dasgupta',
    venue: 'Blue Tokai, Vasant Vihar',
    date: 'Sun, 13 Sep',
    event_datetime: '2026-09-13T17:00:00+05:30',
    time: '5:00 PM - 7:00 PM',
    price: '₹400',
    description: 'From diamond engagement rings to morning orange juice: how mid-century marketing campaigns engineered our deep-seated biological desires.',
    image: 'https://d10y46cwh6y6x1.cloudfront.net/images/8B8B2A1AF42943B58452AD0315268087_converted_webp.webp',
    urbanaut_url: 'https://urbanaut.app/spot/gft-how-ads-invented-what-feels-natural',
    archive_badge: 'BLUE TOKAI SERIES',
    archive_status: 'active',
  },
  {
    id: 'gft-business-education',
    category: 'grounds-for-thought',
    title: 'Is Business Education Already Outdated?',
    speaker: 'Dr. Yogesh Kumar Jain',
    venue: 'Blue Tokai, Panchsheel Park',
    date: 'Sun, 20 Sep',
    event_datetime: '2026-09-20T17:00:00+05:30',
    time: '5:00 PM - 7:00 PM',
    price: '₹400',
    description: 'Deconstructing 20th-century MBA case studies in an era of distributed AI, climate externalities, and radical post-industrial work shifts.',
    image: 'https://d10y46cwh6y6x1.cloudfront.net/images/B25DBB288C6B42299633A7ACB5E4FD85_converted_webp.webp',
    urbanaut_url: 'https://urbanaut.app/spot/gft-is-business-education-already-outdated',
    archive_badge: null,
    archive_status: 'active',
  },

  // ── Community Events ──
  {
    id: 'comm-philosophy-salons',
    category: 'community',
    title: 'Philosophy of the Ordinary: Everyday Aesthetics',
    speaker: 'Radhika Sen & Collective',
    venue: 'The Parallel Salon, Bandra, Mumbai',
    date: 'Sat, 19 Sep',
    event_datetime: '2026-09-19T16:00:00+05:30',
    time: '4:00 PM - 6:30 PM',
    price: '₹350',
    description: 'An interactive reading circle and dialogue exploring why we find beauty in worn tea cups, metro commutes, and decaying brick walls.',
    image: 'https://d10y46cwh6y6x1.cloudfront.net/images/1F278BA4C6414DD481BED08D2057D44E_converted_webp.webp',
    urbanaut_url: 'https://urbanaut.app/spot/comm-philosophy-of-the-ordinary',
    archive_badge: 'COMMUNITY SALON',
    archive_status: 'active',
  },
  {
    id: 'comm-cinema-soundscapes',
    category: 'community',
    title: 'Listening to Cinema: The Art of Sonic Storytelling',
    speaker: 'Karan M. (Sound Designer)',
    venue: 'Harkat Studios, Versova, Mumbai',
    date: 'Sun, 27 Sep',
    event_datetime: '2026-09-27T18:00:00+05:30',
    time: '6:00 PM',
    price: '₹450',
    description: 'Close-listening session deconstructing sound design in Indian parallel cinema, foley craft, and ambient field recordings.',
    image: 'https://d10y46cwh6y6x1.cloudfront.net/images/390273972A5C4BDBB57754C71F40628F_converted_webp.webp',
    urbanaut_url: 'https://urbanaut.app/spot/comm-listening-to-cinema',
    archive_badge: 'WORKSHOP',
    archive_status: 'active',
  },

  // ── unLecture Series (Curated Masterclasses) ──
  {
    id: 'series-architecture-memory',
    category: 'unlecture-series',
    title: 'The Architecture of Memory: Delhi’s Lost Baolis',
    speaker: 'Dr. Swapna Liddle',
    venue: 'India Habitat Centre, Lodhi Road',
    date: 'Sat, 3 Oct',
    event_datetime: '2026-10-03T18:00:00+05:30',
    time: '6:00 PM',
    price: '₹800',
    description: 'Part 1 of our 3-part urban history series: examining medieval water architecture, Delhi’s subterranean stepwells, and hydrological memory.',
    image: 'https://d10y46cwh6y6x1.cloudfront.net/images/6F4DD141F6A249E3A1E4C0B0B965C4B4_converted_webp.webp',
    urbanaut_url: 'https://urbanaut.app/spot/series-architecture-of-memory',
    archive_badge: '3-PART SERIES',
    archive_status: 'active',
  },
];

/* ════════════════════════════════════════════════
   2. PENDING ARCHIVE EVENTS (Concluded, Media Review Needed)
   ════════════════════════════════════════════════ */

const pendingArchiveEvents = [
  {
    id: 'pending-drinks-empires',
    category: 'unlecture',
    title: 'Fermentation, Distillation & Empire Building',
    speaker: 'Gagan Sharma',
    venue: 'Fort City Brewing, Hauz Khas',
    date: 'Sun, 10 Aug',
    event_datetime: '2026-08-10T19:00:00+05:30',
    time: '7:00 PM',
    price: '₹699',
    description: 'How botanical trades and alcohol monopolies quietly shaped colonial trade routes across the Indian Ocean.',
    image: '/archive/drinksgagan.JPG',
    urbanaut_url: 'https://urbanaut.app/spot/drinks-that-changed-the-world',
    archive_status: 'pending_archive',
    archive_image: null,
    archive_badge: 'CONCLUDED',
    archive_tags: '["history","botany","empire"]',
    youtube_urls: '[]',
    substack_urls: '[]',
  },
  {
    id: 'pending-delhi-ruins',
    category: 'grounds-for-thought',
    title: 'Why Delhi Never Let Its Ruins Die',
    speaker: 'Rana Safvi',
    venue: 'Blue Tokai, Mehrauli',
    date: 'Sat, 01 Aug',
    event_datetime: '2026-08-01T17:00:00+05:30',
    time: '5:00 PM',
    price: '₹400',
    description: 'Living alongside 800 years of monuments: monument conservation, residential encroachments, and poetic memory.',
    image: '/archive/apar.JPG',
    urbanaut_url: 'https://urbanaut.app/spot/grounds-for-thought-delhi-ruins',
    archive_status: 'pending_archive',
    archive_image: null,
    archive_badge: 'CONCLUDED',
    archive_tags: '["delhi","heritage","monuments"]',
    youtube_urls: '[]',
    substack_urls: '[]',
  },
];

/* ════════════════════════════════════════════════
   3. ARCHIVED EVENTS (Past Gatherings & Dispatches)
   ════════════════════════════════════════════════ */

const archivedEvents = [
  // ── Past Gathering 1 ──
  {
    id: 'sex-death-life',
    category: 'unlecture',
    title: 'Sex, Death, And The Long War Of Life',
    speaker: 'Ambarish Satwik',
    venue: 'The Piano Man (Eldeco Centre), Malviya Nagar',
    date: 'June 2026',
    event_datetime: '2026-06-15T19:00:00+05:30',
    time: '',
    price: '₹550',
    description: "unLecture's biggest crowd yet -- 170 strong -- settled in for surgeon-turned-writer Ambarish Satwik's provocation that you were never meant to exist, and that this might be the most liberating fact about you. A dark, funny, unsparingly scientific tour through evolution, sex, and mortality.",
    image: '/archive/ambarish.JPG',
    urbanaut_url: 'https://urbanaut.app/spot/sex-death-and-the-long-war-of-life-13825',
    archive_status: 'archived',
    archive_image: '/archive/ambarish.JPG',
    archive_badge: 'RECORD ATTENDANCE -- 170 GUESTS',
    archive_tags: '["evolution","biology","mortality","philosophy"]',
    youtube_urls: JSON.stringify([
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://www.youtube.com/watch?v=kJQP7ki4L14'
    ]),
    substack_urls: JSON.stringify([
      'https://unlecture.substack.com/p/sex-death-and-the-long-war-of-life'
    ]),
  },

  // ── Past Gathering 2 ──
  {
    id: 'slenderman',
    category: 'unlecture',
    title: 'The Curious Case of Slenderman: How Digital Myths Are Born',
    speaker: 'Vaibhav Dwivedi',
    venue: 'Siyah Arthouse, Saket',
    date: 'October 2025',
    event_datetime: '2025-10-25T19:00:00+05:30',
    time: '',
    price: '₹450',
    description: "A Halloween-season descent into the internet's most infamous urban legend, led by St. Stephen's professor Vaibhav Dwivedi, tracing how a 2009 forum hoax metastasized into a myth millions still believe.",
    image: '/archive/hero.JPG',
    urbanaut_url: 'https://urbanaut.app/spot/unlecture-the-curious-case-of-slenderman',
    archive_status: 'archived',
    archive_image: '/archive/hero.JPG',
    archive_badge: 'HALLOWEEN SPECIAL',
    archive_tags: '["internet","folklore","mythology","culture"]',
    youtube_urls: JSON.stringify([
      'https://www.youtube.com/watch?v=jNQXAC9IVRw'
    ]),
    substack_urls: JSON.stringify([
      'https://unlecture.substack.com/p/how-digital-monsters-are-born'
    ]),
  },

  // ── Past Gathering 3 ──
  {
    id: 'sarkari-official',
    category: 'unlecture',
    title: 'The Powerful, Powerless Sarkari Official',
    speaker: 'Yamini Aiyar',
    venue: 'Siyah Arthouse, Saket',
    date: 'September 2025',
    event_datetime: '2025-09-20T19:00:00+05:30',
    time: '',
    price: '₹450',
    description: "Public policy scholar Yamini Aiyar unpacked the paradox of India's frontline bureaucrats -- officials who hold enormous discretionary power on paper, and almost none of it in practical governance.",
    image: '/archive/yamini2.jpg',
    urbanaut_url: 'https://urbanaut.app/spot/unlecture-the-powerful-powerless-sarkari-official',
    archive_status: 'archived',
    archive_image: '/archive/yamini2.jpg',
    archive_badge: 'SOLD OUT',
    archive_tags: '["policy","bureaucracy","governance","india"]',
    youtube_urls: JSON.stringify([
      'https://www.youtube.com/watch?v=9bZkp7q19f0'
    ]),
    substack_urls: JSON.stringify([
      'https://unlecture.substack.com/p/the-frontline-bureaucrat'
    ]),
  },

  // ── Past Gathering 4 ──
  {
    id: 'digital-rights',
    category: 'grounds-for-thought',
    title: 'Grounds for Thought: A Guide to Digital Rights in India',
    speaker: 'Apar Gupta',
    venue: 'Blue Tokai Coffee Roasters, Mehrauli',
    date: 'November 2025',
    event_datetime: '2025-11-15T17:00:00+05:30',
    time: '',
    price: '₹400',
    description: "The debut edition of Grounds for Thought with Blue Tokai: Internet Freedom Foundation director Apar Gupta broken down what your constitutional rights look like when data, feeds, and apps can vanish overnight.",
    image: '/archive/apar.JPG',
    urbanaut_url: 'https://urbanaut.app/spot/grounds-for-thought-a-guide-to-digital-rights-9463',
    archive_status: 'archived',
    archive_image: '/archive/apar.JPG',
    archive_badge: 'INAUGURAL EDITION',
    archive_tags: '["technology","internet","law","rights"]',
    youtube_urls: JSON.stringify([
      'https://www.youtube.com/watch?v=3JZ_D3ELwOQ'
    ]),
    substack_urls: JSON.stringify([
      'https://unlecture.substack.com/p/digital-freedoms-in-a-connected-age'
    ]),
  },

  // ── Dispatch / Article 1 ──
  {
    id: 'article-why-we-gather',
    category: 'article',
    title: 'Why We Gather in Third Spaces: A Defense of the Physical Lecture',
    speaker: 'unLecture Editorial Desk',
    venue: 'Editorial Essay',
    date: 'August 2026',
    event_datetime: '2026-08-14T12:00:00+05:30',
    time: '',
    price: '',
    description: 'In an era of hyper-curated online algorithms and 1.5x podcast speeds, what makes a room full of strangers sharing an unhurried intellectual evening irreplaceable?',
    image: '/archive/hero.JPG',
    urbanaut_url: '',
    archive_status: 'archived',
    archive_image: '/archive/hero.JPG',
    archive_badge: 'EDITORIAL ESSAY',
    archive_tags: '["culture","third-spaces","gatherings","philosophy"]',
    youtube_urls: '[]',
    substack_urls: JSON.stringify([
      'https://unlecture.substack.com/p/why-we-gather-in-third-spaces'
    ]),
  },

  // ── Dispatch / Article 2 ──
  {
    id: 'article-delhi-water-maps',
    category: 'article',
    title: 'Subterranean Delhi: Mapping Medieval Wells Beneath the Modern Grid',
    speaker: 'Dr. Swapna Liddle',
    venue: 'Historical Dispatch',
    date: 'July 2026',
    event_datetime: '2026-07-20T10:00:00+05:30',
    time: '',
    price: '',
    description: 'An excerpted field dispatch from our urban history masterclass on the hydrological memory of Delhi and the sacred geography of Sultanate-era stepwells.',
    image: '/archive/apar.JPG',
    urbanaut_url: '',
    archive_status: 'archived',
    archive_image: '/archive/apar.JPG',
    archive_badge: 'RESEARCH DISPATCH',
    archive_tags: '["delhi","urbanism","history","architecture"]',
    youtube_urls: '[]',
    substack_urls: JSON.stringify([
      'https://unlecture.substack.com/p/subterranean-delhi'
    ]),
  },
];

/* ════════════════════════════════════════════════
   4. HIDDEN DRAFT & DISCARDED TRASH (For Admin verification)
   ════════════════════════════════════════════════ */

const testStateEvents = [
  {
    id: 'draft-ai-consciousness',
    category: 'unlecture',
    title: 'Draft: The Problem of Machine Consciousness',
    speaker: 'TBD Speaker',
    venue: 'Tentative Venue',
    date: 'TBD Oct 2026',
    event_datetime: '2026-10-20T19:00:00+05:30',
    time: '7:00 PM',
    price: '₹500',
    description: 'Internal draft event being scheduled with speakers and venue partners.',
    image: '/archive/hero.JPG',
    urbanaut_url: '',
    archive_status: 'hidden',
    archive_image: null,
    archive_badge: 'INTERNAL DRAFT',
    archive_tags: '["ai","philosophy","consciousness"]',
    youtube_urls: '[]',
    substack_urls: '[]',
  },
  {
    id: 'discarded-test-event',
    category: 'community',
    title: 'Cancelled / Discarded Salon Prototype',
    speaker: 'Past Host',
    venue: 'Old Location',
    date: 'Jan 2025',
    event_datetime: '2025-01-10T19:00:00+05:30',
    time: '',
    price: '₹200',
    description: 'A test event that was discarded into trash.',
    image: '/archive/hero.JPG',
    urbanaut_url: '',
    archive_status: 'discarded',
    archive_image: null,
    archive_badge: 'CANCELLED',
    archive_tags: '["test"]',
    youtube_urls: '[]',
    substack_urls: '[]',
  },
];

/* ════════════════════════════════════════════════
   5. EXECUTE DATABASE SEEDING
   ════════════════════════════════════════════════ */

const insertStmt = db.prepare(`
  INSERT OR REPLACE INTO events (
    id, title, speaker, venue, category, date, event_datetime,
    time, price, description, image, urbanaut_url,
    archive_status, archive_image, archive_badge, archive_tags,
    youtube_urls, substack_urls
  ) VALUES (
    @id, @title, @speaker, @venue, @category, @date, @event_datetime,
    @time, @price, @description, @image, @urbanaut_url,
    @archive_status, @archive_image, @archive_badge, @archive_tags,
    @youtube_urls, @substack_urls
  )
`);

const insertAll = db.transaction(() => {
  // Clear old table to ensure clean state
  db.prepare('DELETE FROM events').run();

  for (const e of activeEvents) {
    insertStmt.run({
      ...e,
      archive_image: null,
      archive_tags: '[]',
      youtube_urls: '[]',
      substack_urls: '[]',
    });
  }

  for (const e of pendingArchiveEvents) {
    insertStmt.run(e);
  }

  for (const e of archivedEvents) {
    insertStmt.run(e);
  }

  for (const e of testStateEvents) {
    insertStmt.run(e);
  }
});

insertAll();

const counts = db.prepare(`
  SELECT archive_status, COUNT(*) as c FROM events GROUP BY archive_status
`).all() as { archive_status: string; c: number }[];

console.log('✅ Database seeded successfully!');
console.table(counts);

db.close();
