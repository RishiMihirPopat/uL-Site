/**
 * One-time seed script: migrates hardcoded data from data/events.ts and data/archive.ts into SQLite.
 * Run with: npx tsx scripts/seed.ts
 */
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'unlecture.db');

// Ensure data dir exists
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

/* ── Seed active events ── */

const activeEvents = [
  {
    id: 'ul-01',
    category: 'unlecture',
    title: 'Does Virtue Survive Darwinian Competition?',
    speaker: 'Brishti Guha',
    venue: 'IFC Social',
    date: 'Sat, 4 Jul',
    event_datetime: '2026-07-04T19:00:00+05:30',
    time: '',
    price: '550',
    description: '',
    image: 'https://d10y46cwh6y6x1.cloudfront.net/images/7D45C6BEF38044E4A26BD773DF63A0E8_converted_webp.webp',
    urbanaut_url: 'https://urbanaut.app/spot/ul-does-virtue-survive-darwinian-competition',
  },
  {
    id: 'ul-02',
    category: 'unlecture',
    title: 'When the News Stopped Asking Questions',
    speaker: 'Manisha Pande',
    venue: 'The Piano Man, Eldeco Centre',
    date: 'Sat, 11 Jul',
    event_datetime: '2026-07-11T19:00:00+05:30',
    time: '',
    price: '499',
    description: '',
    image: 'https://d10y46cwh6y6x1.cloudfront.net/images/90346EF5F5B3477DAAB9EB2FFEABF7E3_converted_webp.webp',
    urbanaut_url: 'https://urbanaut.app/spot/ul-when-the-news-stopped-asking-questions',
  },
  {
    id: 'ul-03',
    category: 'unlecture',
    title: 'Beyond the Tiger',
    speaker: 'Mahesh Rangarajan',
    venue: 'Depot 48',
    date: 'Sat, 18 Jul',
    event_datetime: '2026-07-18T19:00:00+05:30',
    time: '',
    price: '499',
    description: '',
    image: 'https://d10y46cwh6y6x1.cloudfront.net/images/1F278BA4C6414DD481BED08D2057D44E_converted_webp.webp',
    urbanaut_url: 'https://urbanaut.app/spot/ul-beyond-the-tiger',
  },
  {
    id: 'ul-04',
    category: 'unlecture',
    title: 'One Ring to Rule Them All',
    speaker: 'Suprit Singh',
    venue: 'The Piano Man Jazz Club',
    date: 'Sat, 18 Jul',
    event_datetime: '2026-07-18T19:00:00+05:30',
    time: '',
    price: '699',
    description: '',
    image: 'https://d10y46cwh6y6x1.cloudfront.net/images/A76A13D3F9904D868C6B9A4157BF0D4A_converted_webp.webp',
    urbanaut_url: 'https://urbanaut.app/spot/ul-one-ring-to-rule-them-all',
  },
  {
    id: 'ul-05',
    category: 'unlecture',
    title: 'Physics Across Frontiers',
    speaker: 'Abhishek Iyer',
    venue: 'Siyah Arthouse',
    date: 'Sun, 19 Jul',
    event_datetime: '2026-07-19T19:00:00+05:30',
    time: '',
    price: '499',
    description: '',
    image: 'https://d10y46cwh6y6x1.cloudfront.net/images/390273972A5C4BDBB57754C71F40628F_converted_webp.webp',
    urbanaut_url: 'https://urbanaut.app/spot/ul-physics-across-frontiers',
  },
  {
    id: 'ul-06',
    category: 'unlecture',
    title: 'The Secret History of Indian Sci-Fi',
    speaker: 'Gautam Bhatia',
    venue: 'The Piano Man, Eldeco Centre',
    date: 'Sun, 26 Jul',
    event_datetime: '2026-07-26T19:00:00+05:30',
    time: '',
    price: '499',
    description: '',
    image: 'https://d10y46cwh6y6x1.cloudfront.net/images/95AF6B8634C64F37A015D13BD1334485_converted_webp.webp',
    urbanaut_url: 'https://urbanaut.app/spot/ul-the-secret-history-of-indian-sci-fi',
  },
  {
    id: 'ul-07',
    category: 'unlecture',
    title: 'Badass Begums: The Women of the Mughal Era',
    speaker: 'Anoushka Jain',
    venue: 'Chor Bizarre',
    date: 'Thu, 30 Jul',
    event_datetime: '2026-07-30T19:00:00+05:30',
    time: '',
    price: '499',
    description: '',
    image: 'https://d10y46cwh6y6x1.cloudfront.net/images/6F4DD141F6A249E3A1E4C0B0B965C4B4_converted_webp.webp',
    urbanaut_url: 'https://urbanaut.app/spot/ul-badass-begums-the-women-of-the-mughal-era',
  },
  {
    id: 'gft-01',
    category: 'grounds-for-thought',
    title: 'How Ads Invented What Feels Natural',
    speaker: 'Anish Dasgupta',
    venue: 'Blue Tokai, Vasant Vihar',
    date: 'Sat, 4 Jul',
    event_datetime: '2026-07-04T17:00:00+05:30',
    time: '5:00 pm - 7:00 pm',
    price: '400',
    description: '',
    image: 'https://d10y46cwh6y6x1.cloudfront.net/images/8B8B2A1AF42943B58452AD0315268087_converted_webp.webp',
    urbanaut_url: 'https://urbanaut.app/spot/gft-how-ads-invented-what-feels-natural',
  },
  {
    id: 'gft-02',
    category: 'grounds-for-thought',
    title: 'Is Business Education Already Outdated?',
    speaker: 'Dr. Yogesh Kumar Jain',
    venue: 'Blue Tokai, Panchsheel Park',
    date: 'Sun, 5 Jul',
    event_datetime: '2026-07-05T17:00:00+05:30',
    time: '5:00 pm - 7:00 pm',
    price: '400',
    description: '',
    image: 'https://d10y46cwh6y6x1.cloudfront.net/images/B25DBB288C6B42299633A7ACB5E4FD85_converted_webp.webp',
    urbanaut_url: 'https://urbanaut.app/spot/gft-is-business-education-already-outdated',
  },
];

/* ── Seed archived events ── */

const archivedEvents = [
  {
    id: 'sex-death-life',
    category: 'unlecture',
    title: 'Sex, Death, And The Long War Of Life',
    speaker: 'Ambarish Satwik',
    venue: 'The Piano Man (Eldeco Centre), Malviya Nagar',
    date: 'June 2026',
    event_datetime: '2026-06-15T19:00:00+05:30',
    description: "unLecture's biggest crowd yet -- 170 strong -- settled in for surgeon-turned-writer Ambarish Satwik's provocation that you were never meant to exist, and that this might be the most liberating fact about you. A dark, funny, unsparingly scientific tour through evolution, sex, and mortality, complimentary drink included.",
    image: '/archive/ambarish.JPG',
    urbanaut_url: 'https://urbanaut.app/spot/sex-death-and-the-long-war-of-life-13825',
    archive_tags: '["evolution","science","mortality","biology"]',
    archive_badge: 'RECORD ATTENDANCE -- 170 GUESTS',
  },
  {
    id: 'slenderman',
    category: 'unlecture',
    title: 'unLecture: The Curious Case of Slenderman',
    speaker: 'Vaibhav Dwivedi',
    venue: 'Siyah Arthouse, Saket',
    date: 'October 2025',
    event_datetime: '2025-10-25T19:00:00+05:30',
    description: "A Halloween-season descent into the internet's most infamous urban legend, led by St. Stephen's professor Vaibhav Dwivedi, tracing how a 2009 forum hoax metastasized into a myth millions still believe. Equal parts folklore lecture and ghost story, with a live performance and custom merch to match the mood.",
    image: '/archive/hero.JPG',
    urbanaut_url: 'https://urbanaut.app/spot/unlecture-the-curious-case-of-slenderman',
    archive_tags: '["internet","folklore","myth","culture"]',
    archive_badge: 'HALLOWEEN SPECIAL',
  },
  {
    id: 'sarkari-official',
    category: 'unlecture',
    title: 'unLecture: The Powerful, Powerless Sarkari Official',
    speaker: 'Yamini Aiyar',
    venue: 'Siyah Arthouse, Saket',
    date: 'September 2025',
    event_datetime: '2025-09-20T19:00:00+05:30',
    description: "unLecture's second-ever outing sold out fast, as public policy scholar Yamini Aiyar unpacked the paradox of India's frontline bureaucrats -- officials who hold enormous power on paper and almost none of it in practice. Signed copies of her book and a live music set sweetened an already unmissable afternoon.",
    image: '/archive/yamini2.jpg',
    urbanaut_url: 'https://urbanaut.app/spot/unlecture-the-powerful-powerless-sarkari-official',
    archive_tags: '["policy","bureaucracy","governance","india"]',
    archive_badge: 'SOLD OUT',
  },
  {
    id: 'drinks-changed-world',
    category: 'unlecture',
    title: 'Drinks That Changed the World',
    speaker: 'Gagan Sharma',
    venue: 'Fort City Brewing, Hauz Khas',
    date: 'December 2025',
    event_datetime: '2025-12-14T19:00:00+05:30',
    description: "unLecture's first plunge into pure sensory storytelling: award-winning sommelier Gagan Sharma traced how alcohol has quietly toppled empires and sparked rebellions, one curated pour at a time. Part history lecture, part tasting, entirely unlike anything in a classroom.",
    image: '/archive/drinksgagan.JPG',
    urbanaut_url: 'https://urbanaut.app/spot/drinks-that-changed-the-world',
    archive_tags: '["history","alcohol","empires","tasting"]',
    archive_badge: null,
  },
  {
    id: 'digital-rights',
    category: 'grounds-for-thought',
    title: 'Grounds for Thought: A Guide to Digital Rights',
    speaker: 'Apar Gupta',
    venue: 'Blue Tokai Coffee Roasters, Mehrauli',
    date: 'November 2025',
    event_datetime: '2025-11-15T17:00:00+05:30',
    description: "The debut edition of Grounds for Thought, unLecture's new lecture series with Blue Tokai, brought Internet Freedom Foundation director Apar Gupta to break down what your rights look like when your data, your feed, and your favorite app can all vanish on a single order. Coffee in hand, the crowd left with a plain-English map of the fight for a free internet.",
    image: '/archive/apar.JPG',
    urbanaut_url: 'https://urbanaut.app/spot/grounds-for-thought-a-guide-to-digital-rights-9463',
    archive_tags: '["internet","rights","policy","technology"]',
    archive_badge: 'FIRST EDITION',
  },
];

/* ── Insert ── */

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
  for (const e of activeEvents) {
    insertStmt.run({
      ...e,
      archive_status: 'active',
      archive_image: null,
      archive_badge: null,
      archive_tags: '[]',
      youtube_urls: '[]',
      substack_urls: '[]',
    });
  }

  for (const e of archivedEvents) {
    insertStmt.run({
      ...e,
      time: '',
      price: '',
      archive_status: 'archived',
      archive_image: null,
      archive_badge: e.archive_badge ?? null,
      archive_tags: e.archive_tags,
      youtube_urls: '[]',
      substack_urls: '[]',
    });
  }
});

insertAll();

const activeCount = (db.prepare(`SELECT COUNT(*) as c FROM events WHERE archive_status = 'active'`).get() as { c: number }).c;
const archivedCount = (db.prepare(`SELECT COUNT(*) as c FROM events WHERE archive_status = 'archived'`).get() as { c: number }).c;

console.log(`Seeded ${activeCount} active events and ${archivedCount} archived events.`);
console.log(`Database at: ${DB_PATH}`);

db.close();
