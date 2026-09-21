import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();
import Database from 'better-sqlite3';
import { neon } from '@neondatabase/serverless';
import path from 'path';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('ERROR: DATABASE_URL is not set in environment or .env.local');
  process.exit(1);
}

const sqlitePath = path.join(process.cwd(), 'data', 'unlecture.db');
console.log(`Reading from SQLite: ${sqlitePath}`);
const sqlite = new Database(sqlitePath);
const sql = neon(databaseUrl);

async function migrate() {
  console.log('Connecting to Neon DB and initializing schema...');

  // 1. Create Tables
  await sql`
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
      venue_map_url   TEXT DEFAULT '',
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
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
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS testimonials (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      recommender TEXT NOT NULL,
      quote       TEXT NOT NULL,
      order_index INTEGER DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `;

  console.log('Schema created successfully on Neon.');

  // 2. Migrate Events
  const events = sqlite.prepare('SELECT * FROM events').all() as any[];
  console.log(`Migrating ${events.length} events...`);
  for (const ev of events) {
    await sql`
      INSERT INTO events (
        id, title, speaker, venue, category, date, event_datetime, time, price, description,
        image, urbanaut_url, archive_status, archive_image, archive_badge, archive_tags,
        youtube_urls, substack_urls, created_at, updated_at
      ) VALUES (
        ${ev.id}, ${ev.title}, ${ev.speaker}, ${ev.venue}, ${ev.category}, ${ev.date},
        ${ev.event_datetime || null}, ${ev.time || ''}, ${ev.price || ''}, ${ev.description || ''},
        ${ev.image}, ${ev.urbanaut_url || ''}, ${ev.archive_status || 'active'},
        ${ev.archive_image || null}, ${ev.archive_badge || null}, ${ev.archive_tags || '[]'},
        ${ev.youtube_urls || '[]'}, ${ev.substack_urls || '[]'},
        ${ev.created_at ? new Date(ev.created_at) : new Date()},
        ${ev.updated_at ? new Date(ev.updated_at) : new Date()}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        speaker = EXCLUDED.speaker,
        venue = EXCLUDED.venue,
        category = EXCLUDED.category,
        date = EXCLUDED.date,
        event_datetime = EXCLUDED.event_datetime,
        time = EXCLUDED.time,
        price = EXCLUDED.price,
        description = EXCLUDED.description,
        image = EXCLUDED.image,
        urbanaut_url = EXCLUDED.urbanaut_url,
        archive_status = EXCLUDED.archive_status,
        archive_image = EXCLUDED.archive_image,
        archive_badge = EXCLUDED.archive_badge,
        archive_tags = EXCLUDED.archive_tags,
        youtube_urls = EXCLUDED.youtube_urls,
        substack_urls = EXCLUDED.substack_urls,
        updated_at = NOW();
    `;
  }

  // 3. Migrate Articles
  const articles = sqlite.prepare('SELECT * FROM articles').all() as any[];
  console.log(`Migrating ${articles.length} articles...`);
  for (const art of articles) {
    await sql`
      INSERT INTO articles (
        id, slug, title, subtitle, author, author_role, category, cover_image,
        content, read_time, status, published_at, created_at, updated_at
      ) VALUES (
        ${art.id}, ${art.slug}, ${art.title}, ${art.subtitle || ''}, ${art.author},
        ${art.author_role || ''}, ${art.category || 'Essay'}, ${art.cover_image || ''},
        ${art.content}, ${art.read_time || '5 min read'}, ${art.status || 'published'},
        ${art.published_at},
        ${art.created_at ? new Date(art.created_at) : new Date()},
        ${art.updated_at ? new Date(art.updated_at) : new Date()}
      )
      ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug,
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        author = EXCLUDED.author,
        author_role = EXCLUDED.author_role,
        category = EXCLUDED.category,
        cover_image = EXCLUDED.cover_image,
        content = EXCLUDED.content,
        read_time = EXCLUDED.read_time,
        status = EXCLUDED.status,
        published_at = EXCLUDED.published_at,
        updated_at = NOW();
    `;
  }

  // 4. Migrate Testimonials
  const testimonials = sqlite.prepare('SELECT * FROM testimonials').all() as any[];
  console.log(`Migrating ${testimonials.length} testimonials...`);
  for (const t of testimonials) {
    await sql`
      INSERT INTO testimonials (id, title, recommender, quote, order_index, created_at)
      VALUES (
        ${t.id}, ${t.title}, ${t.recommender}, ${t.quote}, ${t.order_index || 0},
        ${t.created_at ? new Date(t.created_at) : new Date()}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        recommender = EXCLUDED.recommender,
        quote = EXCLUDED.quote,
        order_index = EXCLUDED.order_index;
    `;
  }

  // 5. Migrate Settings
  const settings = sqlite.prepare('SELECT * FROM settings').all() as any[];
  console.log(`Migrating ${settings.length} settings...`);
  for (const s of settings) {
    await sql`
      INSERT INTO settings (key, value)
      VALUES (${s.key}, ${s.value})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
    `;
  }

  // 6. Verify row counts on Neon
  const [eventCount] = await sql`SELECT COUNT(*)::int as count FROM events`;
  const [articleCount] = await sql`SELECT COUNT(*)::int as count FROM articles`;
  const [testimonialCount] = await sql`SELECT COUNT(*)::int as count FROM testimonials`;
  const [settingsCount] = await sql`SELECT COUNT(*)::int as count FROM settings`;

  console.log('\n--- MIGRATION SUMMARY ---');
  console.log(`Events migrated: ${eventCount.count} (SQLite had: ${events.length})`);
  console.log(`Articles migrated: ${articleCount.count} (SQLite had: ${articles.length})`);
  console.log(`Testimonials migrated: ${testimonialCount.count} (SQLite had: ${testimonials.length})`);
  console.log(`Settings migrated: ${settingsCount.count} (SQLite had: ${settings.length})`);
  console.log('--- ALL DATA SUCCESSFULLY MIGRATED TO NEON DB ---');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
