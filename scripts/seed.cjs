/**
 * Standalone seed script using CommonJS for instant node execution.
 */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

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

  CREATE TABLE IF NOT EXISTS testimonials (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    recommender TEXT NOT NULL,
    quote       TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  INSERT OR IGNORE INTO settings (key, value) VALUES ('auto_archive_days', '7');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('auto_archive_action', 'archive');
`);

const defaultTestimonials = [
  {
    id: 'rec-network-1976',
    title: 'Network, 1976 [Film]',
    recommender: 'Rec by Kezia',
    quote: '"The perfect watch if you missed Abhinandan\'s lecture and want to get started on understanding incentive structures and their radical affect on journalism. Try not to draw too many parallels between the current state of journalism in our country :P"',
    order_index: 1,
  },
  {
    id: 'rec-all-about-love',
    title: 'All About Love, Bell Hooks [Book]',
    recommender: 'Rec by Mishka',
    quote: '"The book\'s beginning highlights the reality that love usually isn\'t defined, but should be. And it developed into a meditation, sometimes contradictory about love. Take what resonates and leave the rest, but for someone trying to understand love, my favourite takeaway is \'love is as love does.\'"',
    order_index: 2,
  },
  {
    id: 'rec-jorge-ben-jor',
    title: 'Jorge Ben Jor [Musician]',
    recommender: 'Rec by Sonaika',
    quote: '"Recently decided that I am going to experience travelling the world through music by exploring influential songs and musicians from different regions. Clearly, I haven\'t made it past Brazil yet. It\'s just that good."',
    order_index: 3,
  },
  {
    id: 'rec-seeing-like-a-state',
    title: 'Seeing Like a State, James C. Scott [Book]',
    recommender: 'Rec by Kabir',
    quote: '"If Yamini\'s lecture on bureaucracy got your gears turning about why well-intentioned schemes often collapse into chaos, this book is the holy grail. Essential reading for understanding urban planning and governance."',
    order_index: 4,
  },
  {
    id: 'rec-the-dawn-of-everything',
    title: 'The Dawn of Everything, David Graeber [Book]',
    recommender: 'Rec by Tara',
    quote: '"A breathtaking rethink of human history, hierarchy, and social freedom. Perfect companion to discussions on how human beings have gathered and re-invented cities over millennia."',
    order_index: 5,
  },
];

/* ── Active Events ── */
const activeEvents = [
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

/* ── Pending Archive Events ── */
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

/* ── Archived Events (Past Gatherings & Dispatches) ── */
const archivedEvents = [
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

/* ── Hidden & Discarded Test Events ── */
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

  db.prepare('DELETE FROM testimonials').run();
  const insertTestimonialStmt = db.prepare(`
    INSERT INTO testimonials (id, title, recommender, quote, order_index)
    VALUES (@id, @title, @recommender, @quote, @order_index)
  `);
  for (const t of defaultTestimonials) {
    insertTestimonialStmt.run(t);
  }
});

insertAll();

const rows = db.prepare('SELECT archive_status, COUNT(*) as count FROM events GROUP BY archive_status').all();
const recCount = db.prepare('SELECT COUNT(*) as count FROM testimonials').get();
console.log('Database successfully populated with events:');
console.log(JSON.stringify(rows, null, 2));
console.log(`Testimonials populated: ${recCount.count}`);

db.close();
