/**
 * Database client singleton & schema manager following Single Responsibility Principle (SRP).
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { normalizeTags } from '../validators';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'unlecture.db');

const globalForDb = globalThis as unknown as { _db: Database.Database | null };
if (!globalForDb._db) {
  globalForDb._db = null;
}

export function getDatabaseConnection(): Database.Database {
  if (globalForDb._db) return globalForDb._db;

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(DB_PATH, { timeout: 5000 });
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  
  initializeSchema(db);
  globalForDb._db = db;
  return db;
}

function initializeSchema(db: Database.Database): void {
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

    CREATE TABLE IF NOT EXISTS articles (
      id           TEXT PRIMARY KEY,
      slug         TEXT UNIQUE NOT NULL,
      title        TEXT NOT NULL,
      subtitle     TEXT DEFAULT '',
      author       TEXT NOT NULL,
      author_role  TEXT DEFAULT '',
      category     TEXT NOT NULL DEFAULT 'Essay',
      cover_image  TEXT NOT NULL DEFAULT '',
      content      TEXT NOT NULL,
      read_time    TEXT DEFAULT '5 min read',
      status       TEXT NOT NULL DEFAULT 'published',
      published_at TEXT NOT NULL,
      created_at   TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    INSERT OR IGNORE INTO settings (key, value) VALUES ('auto_archive_days', '7');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('auto_archive_action', 'archive');
  `);

  // Seed default articles if table is empty
  try {
    const artCount = db.prepare('SELECT COUNT(*) as count FROM articles').get() as { count: number };
    if (artCount.count === 0) {
      const insertArt = db.prepare(`
        INSERT INTO articles (id, slug, title, subtitle, author, author_role, category, cover_image, content, read_time, status, published_at)
        VALUES (@id, @slug, @title, @subtitle, @author, @author_role, @category, @cover_image, @content, @read_time, @status, @published_at)
      `);

      insertArt.run({
        id: 'art-why-we-gather-in-third-spaces',
        slug: 'why-we-gather-in-third-spaces',
        title: 'Why We Gather in Third Spaces: A Defense of the Physical Lecture',
        subtitle: 'In an era of hyper-curated online algorithms and 1.5x podcast speeds, what makes a room full of strangers listening to one speaker irreplaceable?',
        author: 'unLecture Editorial Desk',
        author_role: 'unLecture Collective',
        category: 'Culture',
        cover_image: '/category-covers/unLecture-cover.jpg',
        content: `### The Vanishing Third Space

Sociologist Ray Oldenburg coined the term **"third places"** to describe the neutral ground where people gather outside of home (*the first place*) and work (*the second place*). In mid-century public life, these were coffeehouses, bookshops, public squares, and neighborhood pubs.

Today, as our physical spheres shrink and digital spaces commodify our attention, the opportunity to encounter an unfamiliar idea in the presence of strangers has become a luxury.

> "A lecture in an unconventional space is not an academic exercise; it is an act of shared presence and community inquiry."

---

### What Changes When the Lecture Hall Disappears?

When you step out of a fluorescent-lit auditorium and into a dimly lit café, a quiet terrace in Shahpur Jat, or a courtyard in Mehrauli:

1. **The pedestal dissolves**: The hierarchy between the speaker on a raised podium and a seated audience vanishes. Questions become conversational exchanges.
2. **Context shapes contemplation**: Ideas about architectural heritage feel immediate when surrounded by medieval stone; discussions on literature resonate deeper over steaming pour-overs.
3. **Serendipity returns**: You speak to the stranger seated on the wooden bench next to you—someone you would never have matched with on an algorithm.

### Looking Forward

At unLecture, we continue to de-pedestalise ideas across Delhi NCR, Mumbai, and beyond. Whether it is an evening on medieval underground aquifers or the feminist retellings of Indian epics, we believe that real conversations require **real physical rooms**.`,
        read_time: '4 min read',
        status: 'published',
        published_at: '2025-11-14',
      });

      insertArt.run({
        id: 'art-powerful-powerless-sarkari-official',
        slug: 'the-powerful-powerless-sarkari-official',
        title: 'The Powerful, Powerless Sarkari Official',
        subtitle: 'Public policy scholar Yamini Aiyar unpacked the paradox of India\'s frontline bureaucrats — officials endowed with immense statutory power yet paralyzed by structural bottlenecks.',
        author: 'Yamini Aiyar',
        author_role: 'Public Policy Scholar & Former CPR President',
        category: 'Policy',
        cover_image: '/category-covers/gft-cover.png',
        content: `### Inside the Frontline of the Indian State

India's frontline bureaucracy presents a fascinating paradox: at once omnipresent in citizens' daily lives, yet frequently incapacitated by procedural paralysis.

During our recent gathering, **Yamini Aiyar** unpicked the internal incentives, unwritten norms, and structural friction that define governance at the grassroots.

> "We often view the state from the top down—as policy documents and cabinet decrees. But governance is actually decided in the sub-divisional magistrate's office on a humid Tuesday morning."

---

### Key Themes Explored

- **Discretion vs. Surveillance**: Why low-level functionaries are micromanaged on procedures but left without discretionary support to solve localized crises.
- **The Shadow of Audit Culture**: How the fear of post-facto audit inquiries disincentivizes proactive public service delivery.
- **Humanizing the Bureaucrat**: Shifting the narrative from bureaucratic apathy to understanding structural constraint.

### Reflections from the Gathering

The conversation with Yamini traversed beyond academic policy critique into candid personal observations from decades of fieldwork across rural and urban India.`,
        read_time: '5 min read',
        status: 'published',
        published_at: '2025-10-20',
      });

      insertArt.run({
        id: 'art-curious-case-of-slenderman',
        slug: 'the-curious-case-of-slenderman',
        title: 'The Curious Case of Slenderman: How Digital Myths Are Born',
        subtitle: 'A Halloween-season descent into the internet\'s most infamous urban legend, led by St. Stephen\'s philosopher Vaibhav Dwivedi.',
        author: 'Vaibhav Dwivedi',
        author_role: 'Philosopher, St. Stephen\'s College',
        category: 'Internet & Folklore',
        cover_image: '/category-covers/community-cover.jpg',
        content: `### From Photoshop Contest to Collective Psyche

In June 2009, an online forum poster named Eric Knudsen submitted two black-and-white photographs featuring an elongated, faceless figure in a suit lingering behind children. Within months, **Slenderman** transformed from a pixelated joke into a global folklore phenomenon.

In this essay, we examine how the internet operates as a high-velocity myth-making machine.

---

### The Anatomy of a Digital Tulpa

1. **Crowdsourced Canon**: Unlike traditional folklore that evolves over centuries of oral repetition, internet lore develops through collaborative fiction, video series (e.g. *Marble Hornets*), and alternate reality games.
2. **The Blurring of Irony and Belief**: The eerie phenomenon wherein participants knowingly engage in fiction, yet experience visceral psychological horror.
3. **The Parallels with Classical Demons**: Why the faceless, suited figure mirrors ancient trickster spirits and forest spectres across European and South Asian folklore.

> "The internet did not extinguish our hunger for ghost stories; it merely gave the spirits higher-bandwidth cathedrals."`,
        read_time: '6 min read',
        status: 'published',
        published_at: '2025-10-31',
      });
    }
  } catch {}

  // Seed default testimonials if table is empty
  try {
    const count = db.prepare('SELECT COUNT(*) as count FROM testimonials').get() as { count: number };
    if (count.count === 0) {
      const insertRec = db.prepare(`
        INSERT INTO testimonials (id, title, recommender, quote, order_index)
        VALUES (@id, @title, @recommender, @quote, @order_index)
      `);
      insertRec.run({
        id: 'rec-network-1976',
        title: 'Network, 1976 [Film]',
        recommender: 'Rec by Kezia',
        quote: '"The perfect watch if you missed Abhinandan\'s lecture and want to get started on understanding incentive structures and their radical affect on journalism. Try not to draw too many parallels between the current state of journalism in our country :P"',
        order_index: 1,
      });
      insertRec.run({
        id: 'rec-all-about-love',
        title: 'All About Love, Bell Hooks [Book]',
        recommender: 'Rec by Mishka',
        quote: '"The book\'s beginning highlights the reality that love usually isn\'t defined, but should be. And it developed into a meditation, sometimes contradictory about love. Take what resonates and leave the rest, but for someone trying to understand love, my favourite takeaway is \'love is as love does.\'"',
        order_index: 2,
      });
      insertRec.run({
        id: 'rec-jorge-ben-jor',
        title: 'Jorge Ben Jor [Musician]',
        recommender: 'Rec by Sonaika',
        quote: '"Recently decided that I am going to experience travelling the world through music by exploring influential songs and musicians from different regions. Clearly, I haven\'t made it past Brazil yet. It\'s just that good."',
        order_index: 3,
      });
    }
  } catch {}

  // Data migration: clean up any legacy double-encoded tags
  try {
    const rows = db.prepare('SELECT id, archive_tags FROM events WHERE archive_tags IS NOT NULL').all() as any[];
    const updateStmt = db.prepare('UPDATE events SET archive_tags = ? WHERE id = ?');
    for (const row of rows) {
      if (row.archive_tags && (row.archive_tags.includes('"[') || row.archive_tags.includes(']"') || row.archive_tags.includes('\\"'))) {
        const cleaned = normalizeTags(row.archive_tags);
        updateStmt.run(JSON.stringify(cleaned), row.id);
      }
    }
  } catch {}
}
