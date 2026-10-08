# Developer Handover Documentation — unLecture

Welcome to **unLecture** (`uL-website-use`). This document provides a complete, exhaustive handover for incoming developers, detailing every layer of the architecture, domain logic, design system, API specifications, database design, testing infrastructure, and roadmap.

---

## Table of Contents
1. [Project Overview & Philosophy](#1-project-overview--philosophy)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Repository Structure](#3-repository-structure)
4. [Design System & Responsive Architecture](#4-design-system--responsive-architecture)
5. [Database Architecture & Data Layer (Neon Postgres)](#5-database-architecture--data-layer-neon-postgres)
6. [Domain Model & Event Lifecycle State Machine](#6-domain-model--event-lifecycle-state-machine)
7. [Authentication, Security & Edge Route Protection](#7-authentication-security--edge-route-protection)
8. [Public Pages & User Experience Workflows](#8-public-pages--user-experience-workflows)
9. [Admin Portal & Content Management](#9-admin-portal--content-management)
10. [Media Storage & In-Article Upload Pipeline](#10-media-storage--in-article-upload-pipeline)
11. [External Integrations (Ticketing & Google Sheets)](#11-external-integrations-ticketing--google-sheets)
12. [API Reference & Route Handlers](#12-api-reference--route-handlers)
13. [Automated Testing & Quality Assurance](#13-automated-testing--quality-assurance)
14. [Deployment, Environment Variables & Operations](#14-deployment-environment-variables--operations)
15. [V3 Strategic Roadmap & Handoff Notes](#15-v3-strategic-roadmap--handoff-notes)

---

## 1. Project Overview & Philosophy

### 1.1 What is unLecture?
**unLecture** is an intellectual and cultural initiative in Delhi NCR that organizes lectures, salon conversations, and community gatherings in unconventional, casual public spaces (independent cafés like Blue Tokai, art studios, and community spaces). The goal is to de-pedestalise rigorous academic discourse, making niche, profound ideas speakable and accessible to anyone.

### 1.2 Core Architectural Principles
* **Zero UI Library Bloat:** No Tailwind, no Bootstrap, no styled-components, no heavy component kits. Every component uses scoped **CSS Modules** (`.module.css`).
* **Design Token Centrality:** Zero hardcoded colors or arbitrary fonts. All visual attributes reference CSS variables declared in `app/globals.css`.
* **Copy Separation (`lib/content.ts`):** All human-written static marketing copy is isolated from UI components in a single configuration file. Editing site copy never requires modifying layout code.
* **SOLID Architecture:** Repositories handle data access, domain services encapsulate business logic and transformations, and UI components purely handle presentation.
* **Serverless Resiliency:** Neon Serverless Postgres with automatic exponential-backoff retry on network timeouts, resilient asset stream fallback, and pure TypeScript type safety.

---

## 2. Tech Stack & Dependencies

| Area | Technology | Version | Purpose / Rationale |
|---|---|---|---|
| **Framework** | Next.js (App Router) | `^16.3.5` | React Server Components, server actions, dynamic routing, streaming |
| **Runtime Library** | React & React DOM | `19.2.4` | Latest React concurrent features and hooks |
| **Language** | TypeScript | `^5` | Strict type contracts across client, domain, API, and DB |
| **Database** | Neon Serverless Postgres | `^1.1.0` | Pooled serverless SQL over HTTP (`@neondatabase/serverless`) |
| **Object Storage** | Vercel Blob | `^2.8.0` | Serverless persistent image hosting for posters and archive recaps |
| **Motion** | Framer Motion | `^12.42.2` | Spring physics, carousels, modal enter/exit animations, gesture tracking |
| **Smooth Scroll** | Lenis | `^1.3.26` | Inertia-smoothed trackpad and mousewheel scrolling |
| **Iconography** | Phosphor Icons React | `^2.1.10` | Standardized bold weight icons (`@phosphor-icons/react`) |
| **Script Runner** | tsx | dev | Fast native execution of TypeScript scripts and test suites |

---

## 3. Repository Structure

```
uL-website-use/
├── app/                           # Next.js App Router root
│   ├── layout.tsx                 # Global layout shell (Lenis, Cursor, ScaleWrap, Nav, Footer)
│   ├── page.tsx                   # Landing page (Server Component wrapping HomeView)
│   ├── page.module.css            # Landing page layout, wave sections, and responsive rules
│   ├── template.tsx               # Framer Motion page entrance transition wrapper
│   ├── globals.css                # Global CSS variables, font-face declarations, reset, 1920px zoom
│   ├── proxy.ts                   # Edge route guard (middleware) for /admin and /api/admin
│   ├── contact/                   # /contact page (ContactFormV2)
│   ├── events/                    # /events catalog & archive directory
│   │   └── [slug]/                # Dynamic category route (legacy format views)
│   ├── articles/                  # /articles editorial directory
│   │   └── [slug]/                # /articles/[slug] long-form essay reader
│   ├── admin/                     # Protected Admin Portal
│   │   ├── page.tsx               # Admin login screen
│   │   ├── layout.tsx             # Admin shell with dedicated navigation header & role badge
│   │   ├── dashboard/             # Admin KPI metrics and quick actions
│   │   ├── events/                # Event listing table with search, format filters, lifecycle tabs
│   │   │   ├── new/               # New event creation form
│   │   │   └── [id]/              # Unified edit view with lifecycle banner & tabbed fields
│   │   ├── articles/              # Articles management table
│   │   │   ├── new/               # Markdown article authoring interface
│   │   │   └── [id]/              # Article editing and photo upload interface
│   │   └── testimonials/          # Community recommendations manager
│   ├── api/                       # REST route handlers
│   │   ├── admin/                 # Admin operations (auth, events, articles, upload, carousel)
│   │   ├── events/                # Public event endpoints
│   │   ├── articles/              # Public article endpoints
│   │   ├── testimonials/          # Public testimonial list
│   │   ├── archive/               # Legacy archive queries
│   │   └── cron/auto-archive/     # Automated event auto-expiry endpoint (secured by CRON_SECRET)
│   ├── uploads/[...path]/         # Safe runtime local uploads stream handler
│   └── archive/[...path]/         # Safe runtime archive photos stream handler
├── components/                    # Modular React components
│   ├── admin/                     # Reusable admin subcomponents
│   │   ├── ArticleForm.tsx        # Split-screen Markdown editor with drag/drop & paste upload
│   │   ├── EventLifecycleBanner.tsx # Visual state machine transition header
│   │   ├── EventSessionFields.tsx # Title, speaker, venue, Google Maps, price, booking type
│   │   ├── EventScheduleFields.tsx# Event datetime, display date, time
│   │   ├── EventMediaFields.tsx   # Poster upload and URL inputs
│   │   ├── EventArchiveRecapFields.tsx # Recap image, YouTube links, Substack dispatches, badges, tags
│   │   └── StatusBadge.tsx        # Color-coded lifecycle indicator
│   ├── Nav.tsx                    # Public navigation (1120px desktop bar, mobile Menu pill)
│   ├── MobileMenu.tsx             # Fullscreen dark mobile menu overlay
│   ├── Footer.tsx                 # Clean single-row brand footer
│   ├── HeroLectureCarousel.tsx    # 3-card desktop & peek mobile carousel with 15s autoplay
│   ├── HowWeGatherSection.tsx     # Format tickets (desktop staggered grid, mobile infinite carousel)
│   ├── TestimonialsSection.tsx    # Community Recommends auto-advancing carousel
│   ├── AsSeenInSection.tsx        # Infinite press logo marquee with CSS edge feathering
│   ├── NewsletterFormV2.tsx       # Google Apps Script newsletter capture form
│   ├── ContactFormV2.tsx          # Google Apps Script contact submission form
│   ├── EventsPageV2.tsx           # Directory view: filters (type, format), search, pagination
│   ├── ArchiveEventModal.tsx      # Blown-up archival postcard dossier (portal-rendered)
│   ├── BookingModal.tsx           # Urbanaut ticketing iframe overlay
│   ├── ArticlesPageV2.tsx         # Articles catalog with search and pagination
│   ├── ArticleDetailPageV2.tsx    # Editorial reading room with wave dividers and prev/next links
│   ├── MarkdownRenderer.tsx       # Custom Markdown parser with inline images and block formatting
│   ├── SmoothScroll.tsx           # Lenis inertia scroll provider
│   ├── ScaleWrap.tsx              # Public 1920px zoom wrapper (bypasses /admin)
│   └── CustomCursor.tsx           # Spring-following cursor tooltip follower
├── lib/                           # Core library and domain logic
│   ├── auth.ts                    # HMAC-SHA256 token signer, password verifier, session cookie
│   ├── content.ts                 # Single source of truth for all public marketing copy
│   ├── db.ts                      # Unified database facade re-exporting services and repositories
│   ├── validators.ts              # URL, tag, and form link validators
│   ├── constants/                 # animation.ts (EASE curves), formats.ts (FORMAT_REGISTRY)
│   ├── db/                        # client.ts (Neon connection & retry), sql-utils.ts (dynamic SQL)
│   ├── domain/                    # lifecycle.ts (Event lifecycle state machine)
│   ├── hooks/                     # useOutsideClose.ts, useModalDismiss.ts
│   ├── repositories/              # event, article, testimonial, settings repositories
│   ├── services/                  # event.service.ts, article.service.ts, upload.service.ts
│   ├── types/                     # TypeScript contracts (event.ts, article.ts, testimonial.ts)
│   └── utils/                     # dateTime.ts, formatPrice.ts, id.ts, slug.ts, upload.ts
├── public/                        # Static static assets
│   ├── card-shapes/               # Ticket cutout PNGs (website and mobile variants)
│   ├── category-covers/           # High-res photography for event formats
│   ├── custom-assets/             # Grid texture, gold arrow cursor, favicon, manifesto backgrounds
│   ├── fonts/                     # Self-hosted WOFF2 fonts (Atelier, Chivo Mono, Ancizar Serif)
│   ├── news-features-logo/        # Press publication logos (Times of India, Vogue, etc.)
│   └── wavy-shapes/               # Scalloped boundary divider SVGs and PNGs
├── scripts/                       # Migration and test scripts
│   ├── migrate-to-neon.ts         # SQLite -> Neon Postgres automated migrator
│   ├── seed.ts                    # Local SQLite seeder
│   ├── run-all-tests.ts           # Test runner (10 suites, 236 assertions)
│   └── tests/                     # 10 modular unit and integration test suites
├── context-docs/                  # Build history, design specifications, and logs
│   ├── build-log.md               # Milestones and active architectural decisions
│   ├── design-build-log.md        # Fine-grained per-change commit history
│   ├── design.md                  # Color and typography design tokens
│   └── developer-updated.md       # High-level context and V3 strategy
├── proxy.ts                       # Next.js 16 Edge proxy middleware
└── next.config.ts                 # Next.js configuration (remote image patterns, security headers)
```

---

## 4. Design System & Responsive Architecture

### 4.1 Aesthetic Concept
The visual identity embodies a **vintage literary salon meets Indian postcard** aesthetic:
* **Paper Textures & Cream Palettes:** Warm cream page canvas (`--color-bg-v2`: `#FFF9F2`) overlaid with a fixed 5% opacity grid texture (`bg-grid-texture.png`).
* **Rich Accent Colors:** Oxblood deep maroon (`--color-primary`: `#6B2D2D`), supporting olive (`--color-olive`: `#5A5A3C`), and warm dark charcoal (`--color-bg-dark`: `#2A2420`).
* **Scalloped Wave Dividers:** Sections transition through natural-aspect organic wavy SVG/PNG assets located in `public/wavy-shapes/`.
* **Perforated Ticket Cards:** Formats and events are rendered inside ticket-style shape assets from `public/card-shapes/`.

### 4.2 Typography System
All production fonts are **self-hosted in `public/fonts/`** as `.woff2` files to prevent third-party CDN latency or downtime:
1. **Atelier (`--font-brand`):** Signature editorial serif used for the unLecture wordmark and major display headings.
2. **Chivo Mono (`--font-mono`):** Clean monospace used for UI navigation, kicker labels, badge pills, buttons, and metadata tags.
3. **Ancizar Serif (`--font-article`):** Elegant book serif with synthetic weight support used for reading long-form article essays.
4. **Times New Roman / Georgia (`--font-body`):** System serif fallback for general body text.
5. **Montserrat:** Loaded via Google Fonts strictly for legacy V1 modal components.

### 4.3 Desktop Scale-to-Fit (The 1920px Canvas Pattern)
The public site was authored against an exact **1920px Figma canvas**. To guarantee mathematical fidelity without elements wrapping or breaking between 901px and 1919px:
* In `app/globals.css`:
  ```css
  .v2-scale-wrap {
    zoom: 1;
    width: 100%;
    max-width: 100%;
    overflow-x: clip;
  }
  @media (min-width: 901px) and (max-width: 1919px) {
    .v2-scale-wrap {
      zoom: calc(100vw / 1920px);
    }
  }
  ```
* **Why CSS `zoom` instead of `transform: scale`?** CSS `zoom` reflows layout geometry, adjusts true scroll height, and does not interfere with `position: fixed` ancestors (such as navigation or modal backdrops).
* **Isolation of Admin Views (`components/ScaleWrap.tsx`):** The zoom wrapper specifically targets public pages. Admin routes (`/admin/*`) bypass `ScaleWrap` and render at standard `100vw` so admin tables and forms never suffer from visual shrinkage or scroll cutoff.

### 4.4 Mobile-Dedicated Engineering (`<= 900px`)
Mobile layouts are not simply shrunk desktop pages. Every view has dedicated mobile DOM and CSS modules:
* **Navigation:** The split desktop link group collapses into a compact `MENU` pill button that triggers a fullscreen dark staged modal (`MobileMenu.tsx`).
* **Hero Carousel:** Desktop side-card bleeds are replaced by cropped peeks with swipe navigation and click-to-book suppression.
* **How We Gather:** The desktop 4-card grid switches to an interactive infinite carousel with 15s auto-advance and synchronized description cross-fade.
* **As Seen In:** Rebuilt with isolated mobile grid markup to avoid marquee track width blowout.
* **Archive Modal:** Converts into a full-height touch sheet with responsive sticky back/close controls.

### 4.5 Smooth Scrolling & Lenis Isolation
* Smooth inertia scrolling is provided globally via `components/SmoothScroll.tsx` using the `lenis` library.
* **Modal Isolation:** When modals open (`ArchiveEventModal`, `BookingModal`), `useModalDismiss` pauses Lenis (`lenis.stop()`), applies `data-lenis-prevent`, and stops event propagation on wheel events. This prevents underlying page scrolling while reading modal content.
* **Admin Exemption:** Lenis is completely destroyed on `/admin` routes to preserve standard native browser scrolling.

---

## 5. Database Architecture & Data Layer (Neon Postgres)

### 5.1 Connection Architecture (`lib/db/client.ts`)
The site connects to **Neon Serverless Postgres** via `@neondatabase/serverless` over pooled HTTP endpoints:
* **Connection Pooling:** Uses `process.env.DATABASE_URL` (or `DATABASE_URL_POOLED`).
* **Automatic Retry on Network Latency:** Cold starts or transient fetch timeouts (`UND_ERR_CONNECT_TIMEOUT`, `ETIMEDOUT`) are intercepted by `executeWithRetry`:
  ```typescript
  export function isNetworkTimeoutError(err: any): boolean {
    const msg = (err.message || '').toLowerCase();
    const code = (err.code || err.cause?.code || '').toLowerCase();
    return (
      code === 'und_err_connect_timeout' ||
      code === 'etimedout' ||
      msg.includes('fetch failed') ||
      msg.includes('timeout')
    );
  }
  ```
  Failed queries retry up to 2 times with exponential backoff before bubbling up.

### 5.2 Schema Specification

#### 1. `events` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Unique ID (e.g. `evt_4a8f9b2c` or slug) |
| `title` | `TEXT` | `NOT NULL` | Event headline |
| `speaker` | `TEXT` | `NOT NULL` | Speaker or moderator name |
| `venue` | `TEXT` | `NOT NULL` | Venue name (e.g. "Blue Tokai, Vasant Vihar") |
| `category` | `TEXT` | `NOT NULL` | Format ID (`unlecture`, `grounds-for-thought`, `community`, `unlecture-series`) |
| `date` | `TEXT` | `NOT NULL` | Display string (e.g. "Sat, 14 Oct 2026") |
| `event_datetime`| `TEXT` | Nullable | ISO 8601 string (`YYYY-MM-DDTHH:MM:SS`) used for automated expiration |
| `time` | `TEXT` | `DEFAULT ''` | Display time (e.g. "5:00 PM - 7:00 PM") |
| `price` | `TEXT` | `DEFAULT ''` | Ticket price (e.g. "₹499" or "Free") |
| `description` | `TEXT` | `DEFAULT ''` | Event narrative / synopsis |
| `image` | `TEXT` | `NOT NULL` | Poster image URL or path |
| `urbanaut_url` | `TEXT` | `DEFAULT ''` | Ticket booking link |
| `booking_link_type` | `TEXT` | `DEFAULT 'urbanaut'` | `'urbanaut'` (opens modal iframe) or `'external'` (direct link) |
| `archive_status` | `TEXT` | `DEFAULT 'active'` | Lifecycle status: `'active'`, `'hidden'`, `'archived'` |
| `archive_image` | `TEXT` | Nullable | Post-event high-res gathering photo |
| `archive_badge` | `TEXT` | Nullable | Editorial kicker badge (e.g. "Housefull", "Special Edition") |
| `archive_tags` | `TEXT` | `DEFAULT '[]'` | JSON string array of topical tags |
| `youtube_urls` | `TEXT` | `DEFAULT '[]'` | JSON string array of YouTube video recordings |
| `substack_urls`| `TEXT` | `DEFAULT '[]'` | JSON string array of Substack recap essay links |
| `venue_map_url`| `TEXT` | `DEFAULT ''` | Google Maps location URL |
| `created_at` | `TIMESTAMPTZ`| `DEFAULT NOW()`| Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ`| `DEFAULT NOW()`| Last updated timestamp |

#### 2. `articles` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | UUID string |
| `slug` | `TEXT` | `UNIQUE NOT NULL` | URL slug (e.g. `the-architecture-of-curiosity`) |
| `title` | `TEXT` | `NOT NULL` | Essay title |
| `subtitle` | `TEXT` | `DEFAULT ''` | Lede or summary line |
| `author` | `TEXT` | `NOT NULL` | Author name |
| `author_role` | `TEXT` | `DEFAULT ''` | Author designation or bio |
| `category` | `TEXT` | `DEFAULT 'Essay'` | Topic category |
| `cover_image` | `TEXT` | `NOT NULL` | Header cover image URL |
| `content` | `TEXT` | `NOT NULL` | Full article Markdown text |
| `read_time` | `TEXT` | `DEFAULT '5 min read'` | Calculated reading duration |
| `status` | `TEXT` | `DEFAULT 'published'` | Publication status (`'published'` or `'draft'`) |
| `published_at`| `TEXT` | `NOT NULL` | Display date string |
| `created_at` | `TIMESTAMPTZ`| `DEFAULT NOW()`| Creation timestamp |
| `updated_at` | `TIMESTAMPTZ`| `DEFAULT NOW()`| Last update timestamp |

#### 3. `testimonials` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | UUID string |
| `title` | `TEXT` | `NOT NULL` | Headline takeaway |
| `recommender` | `TEXT` | `NOT NULL` | Attributed person / community member |
| `quote` | `TEXT` | `NOT NULL` | Testimonial excerpt |
| `order_index` | `INTEGER` | `DEFAULT 0` | Sort order in carousel |
| `created_at` | `TIMESTAMPTZ`| `DEFAULT NOW()`| Creation timestamp |

#### 4. `settings` Table
Key-value configuration store:
* `carousel_event_ids`: JSON array string of event IDs pinned to the homepage hero carousel.
* `auto_archive_days`: Integer string indicating threshold days before past events are hidden.
* `auto_archive_action`: Default automated action (`archive` or `discard`).
* `ticker_text`: Announcement banner text.

### 5.3 Dynamic SQL Utilities (`lib/db/sql-utils.ts`)
To eliminate SQL injection risks and avoid brittle manual query string concatenations, updates are executed via `buildParameterizedUpdate`:
```typescript
const { query, values } = buildParameterizedUpdate('events', id, updates);
await sql.query(query, values);
```
This utility automatically filters out protected columns (`id`, `created_at`, `updated_at`), builds `$1, $2, ...` placeholders, appends `updated_at = NOW()`, and maps parameter values cleanly.

---

## 6. Domain Model & Event Lifecycle State Machine

### 6.1 Event Lifecycle (`lib/domain/lifecycle.ts`)
Events progress through a strictly defined state machine:

```mermaid
stateDiagram-v2
    [*] --> Active: Create Event
    Active --> Hidden: Hide / Auto-Expire
    Hidden --> Active: Restore
    Hidden --> Archived: Archive with Recap Photos/Links
    Active --> HardDeleted: Discard (Deletes Assets)
    Hidden --> HardDeleted: Discard (Deletes Assets)
    Archived --> HardDeleted: Discard (Deletes Assets)
```

1. **Active:** Displayed in the homepage hero carousel and `/events?type=upcoming`. Tickets are bookable.
2. **Hidden:** Hidden from public listings. Reached manually via admin or automatically when `event_datetime <= NOW()`.
3. **Archived:** Preserved in the permanent historical dossier (`/events?type=archived`). Shows recap photos, YouTube recordings, Substack links, and tags.
4. **Hard Delete (`discardEvent`):** Completely deletes the database record and deletes associated uploaded files from disk or Vercel Blob.

### 6.2 Format Registry (`lib/constants/formats.ts`)
The 4 unLecture event formats follow the Open/Closed Principle:
```typescript
export const FORMAT_REGISTRY: Record<EventCategory, FormatDefinition> = {
  'unlecture': {
    id: 'unlecture',
    name: 'unLecture',
    subtitle: 'Intimate Flagship Lectures',
    description: 'De-pedestalised, deep-dive talks by thinkers, practitioners, and scholars.',
    accentColor: '#6B7A5A',
    themeClass: 'formatSage',
    badgeLabel: 'unLecture',
  },
  'grounds-for-thought': { ... },
  'community': { ... },
  'unlecture-series': { ... },
};
```
Adding a new format only requires adding an entry here; navigation filters, card stylings, and badge mappers inherit it automatically.

---

## 7. Authentication, Security & Edge Route Protection

### 7.1 Role-Based Access Control (RBAC)
The admin system recognizes two discrete roles:
* **`super_admin` (`ADMIN_PASSWORD`):** Unrestricted authority. Can create/edit/delete events, articles, testimonials, settings, and perform irreversible data purges.
* **`event_manager` (`MANAGER_PASSWORD`):** Operational authority. Can create and update event details and hide events, but cannot modify system settings or delete records.

### 7.2 Cryptographic Session Tokens (`lib/auth.ts`)
* **Session Cookie:** `ul_admin_session` (HTTP-only, `SameSite=Lax`, 7-day expiration).
* **Token Structure:** `base64url(role:timestamp).hmac_sha256_signature`
* **Signing Key:** Derived from `process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD`.
* **Tamper Proofing:** Uses Node `crypto.timingSafeEqual` and Web Crypto API to ensure constant-time comparisons, preventing timing attacks.

### 7.3 Edge Route Guard (`proxy.ts`)
Next.js 16 executes `proxy.ts` on edge runtimes before requests reach serverless handlers:
* Unauthenticated visits to `/admin` allow access to the login form.
* Authenticated visits to `/admin` automatically redirect to `/admin/dashboard`.
* Unauthenticated visits to `/admin/*` redirect to `/admin`.
* Unauthenticated API calls to `/api/admin/*` receive immediate `401 Unauthorized` responses.
* Endpoint `/api/admin/auth` is whitelisted for login verification.

---

## 8. Public Pages & User Experience Workflows

### 8.1 Homepage (`/`)
1. **Hero Carousel (`HeroLectureCarousel.tsx`):**
   * Displays 3 events simultaneously: active center card flanked by peeking neighbor cards.
   * Auto-advances every 15 seconds; resets timer on user touch/swipe or arrow clicks.
   * Directional touch locking: Prevents page scroll hijacking while swiping horizontally.
   * Direct booking trigger opens `BookingModal` or external Urbanaut link.
2. **How We Gather (`HowWeGatherSection.tsx`):**
   * Desktop: 4 perforated ticket cards with vertical stagger and doodle illustrations. Hovering reveals format narratives.
   * Mobile: Single-card auto-advancing carousel with synchronized olive description box.
3. **The Manifesto (About Us):**
   * Centered editorial text block backed by `manifesto-bg-web.png` and `manifesto-bg-mobile.png`.
4. **Community Recommends (`TestimonialsSection.tsx`):**
   * Auto-advancing 15-second carousel featuring attendee testimonials.
   * Dynamic offscreen measurer locks track height to prevent navigation button jumping.
5. **As Seen In (`AsSeenInSection.tsx`):**
   * Seamless infinite marquee featuring normalized press logos with gradient fade edges.
6. **Newsletter (`NewsletterFormV2.tsx`):**
   * Embedded in the scalloped maroon wave banner. Captures email directly to Google Sheets.

### 8.2 Events Directory (`/events`)
* Dual-mode directory: **Upcoming** and **Archived** past gatherings.
* **Filter Persistence:** Active filters (`type`, `format`, search `q`) sync to URL query parameters and `sessionStorage`, persisting across page refreshes and browser history traversals.
* **Booking Overlay (`BookingModal.tsx`):** Embedded Urbanaut ticket booking sheet with fallback external link.
* **Archival Dossier (`ArchiveEventModal.tsx`):** Blown-up postcard modal rendered via `createPortal` to `document.body`. Displays high-res recap photography, speaker bios, YouTube recordings, Substack dispatch links, and tags.

### 8.3 Articles & Essay Reader (`/articles` & `/articles/[slug]`)
* **Catalog (`/articles`):** Grid of published essays showing author, published date, reading time, and cover imagery.
* **Reader (`/articles/[slug]`):** Formatted with self-hosted `Ancizar Serif` typography, top/bottom maroon wave dividers, inline responsive images with italic captions, and previous/next article switching controls.

### 8.4 Contact (`/contact`)
* Two-column editorial contact view backed by the contact wavy divider asset.
* Captures full name, email, phone, role dropdown ("Speaker", "Venue", "Partner", "Sponsor", etc.), and message.

---

## 9. Admin Portal & Content Management

The Admin Portal is accessible at `/admin` (redirects to `/admin/dashboard` upon authentication).

### 9.1 Dashboard (`/admin/dashboard`)
* Overview cards showing total active, archived, and draft counts.
* Direct action buttons to compose an article, publish an event, or inspect settings.
* Manual trigger for `runAutoExpire()`.

### 9.2 Event Editor (`/admin/events/[id]`)
Unified editing screen divided into logical field groups:
* **Lifecycle Banner (`EventLifecycleBanner.tsx`):** Displays current status and allows transitions (`Archive`, `Hide`, `Restore`, `Discard`).
* **Session Details (`EventSessionFields.tsx`):** Title, speaker, format dropdown, venue name, Google Maps URL (with instant test link), price, booking URL, and booking type.
* **Schedule (`EventScheduleFields.tsx`):** Datetime picker (`event_datetime`), human-readable display date, and time range.
* **Media Assets (`EventMediaFields.tsx`):** File upload button for poster image, preview thumbnail, and direct URL fallback.
* **Archive Recap (`EventArchiveRecapFields.tsx`):** Recap photo upload, special badge text, tag input, and dynamic add/remove rows for YouTube video links and Substack dispatch URLs.

### 9.3 Article Editor (`components/admin/ArticleForm.tsx`)
Split-screen editorial interface:
* **Toolbar:** Quick markdown formatting buttons (Bold, Italic, Link, Heading, Quote, List, Code, Image).
* **Live Preview:** Side-by-side or tabbed real-time markdown rendering matching the public reader.
* **Auto-Calculated Read Time:** Dynamically calculates reading duration based on word count.
* **Auto Slugification:** Generates URL-friendly slugs from article titles.

---

## 10. Media Storage & In-Article Upload Pipeline

### 10.1 Hybrid Storage Architecture (`lib/services/upload.service.ts`)
* **Production Runtime (Vercel):**
  Uses `VercelBlobUploadService` (`@vercel/blob`). Uploads are sent to Vercel Blob using `process.env.BLOB_READ_WRITE_TOKEN`.
  * Safe error guard: If deployed to Vercel without a Blob store configured, the system throws an explicit, actionable error rather than failing silently against a read-only filesystem.
* **Local Development Runtime:**
  Uses `LocalUploadService`. Files are written directly to `public/uploads` or `public/archive` with sanitized timestamped filenames.

### 10.2 Safe Stream Handlers (`app/uploads` & `app/archive`)
Direct filesystem lookups are proxied through route handlers:
* `app/uploads/[...path]/route.ts`
* `app/archive/[...path]/route.ts`
* **Features:**
  * Directory traversal protection (`path.basename(decodeURIComponent(segment))`).
  * Immutable caching headers (`Cache-Control: public, max-age=31536000, immutable`).
  * **Missing File Fallback:** If a referenced image does not exist on disk, the route returns an HTTP 200 with a 1x1 transparent PNG (`TRANSPARENT_1X1_PNG`) and `no-store` cache headers. This completely prevents broken image icons on the live website.

### 10.3 In-Article Photo Workflow
`ArticleForm.tsx` enables writers to place images anywhere in article bodies:
1. **File Picker:** Click the image icon in the toolbar.
2. **Drag & Drop:** Drag an image file from the desktop directly onto the editor textarea.
3. **Clipboard Paste:** Press `Ctrl+V` with an image in the system clipboard.
The file is immediately uploaded via `/api/admin/upload`, and a formatted Markdown snippet `![Photo caption](/uploads/filename.png "Photo title")` is inserted at the exact cursor position.

---

## 11. External Integrations (Ticketing & Google Sheets)

### 11.1 Urbanaut Ticketing Integration
* Public event cards display "Book Now" buttons linking to Urbanaut event listings.
* Depending on `booking_link_type`:
  * `'urbanaut'`: Opens `BookingModal.tsx` embedding the Urbanaut checkout flow in an iframe.
  * `'external'`: Directly navigates to third-party registration pages.

### 11.2 Google Sheets Lead Capture (Google Apps Script)
Newsletter subscriptions and contact inquiries route directly to Google Sheets via Google Apps Script web apps:
* **Mode:** Standard `fetch` with `mode: 'no-cors'`.
* **Newsletter:** Submits `form_type: 'newsletter'`, `email`, and `timestamp`.
* **Contact:** Submits `form_type: 'contact'`, `name`, `email`, `phone`, `reaching_out_as`, `message`, and `timestamp`.
* **Endpoints:** Configured via `NEXT_PUBLIC_NEWSLETTER_GOOGLE_SHEET_URL` and `NEXT_PUBLIC_CONTACT_GOOGLE_SHEET_URL`.

---

## 12. API Reference & Route Handlers

### 12.1 Authentication Endpoints
* `GET /api/admin/auth`: Checks current session validity and returns `{ authenticated: boolean, role: 'super_admin' | 'event_manager' }`.
* `POST /api/admin/auth`: Accepts `{ password: string }`. Validates against `ADMIN_PASSWORD` or `MANAGER_PASSWORD`, sets `ul_admin_session` cookie, and returns `{ success: true, role }`.
* `DELETE /api/admin/auth`: Clears session cookie and logs user out.

### 12.2 Admin Event Endpoints
* `GET /api/admin/events`: Returns all events.
* `POST /api/admin/events`: Creates a new event record.
* `GET /api/admin/events/[id]`: Returns single event by ID.
* `PUT /api/admin/events/[id]`: Updates event attributes.
* `DELETE /api/admin/events/[id]`: Soft-hides or deletes an event.
* `POST /api/admin/events/[id]/archive`: Transitions status to `archived` with recap photo and link metadata.
* `POST /api/admin/events/[id]/hide`: Transitions status to `hidden`.
* `POST /api/admin/events/[id]/restore`: Transitions status back to `active`.
* `DELETE /api/admin/events/[id]/discard`: Hard-deletes event and cleans up poster and archive assets.

### 12.3 Admin Article Endpoints
* `GET /api/admin/articles`: Lists all articles including drafts.
* `POST /api/admin/articles`: Creates a new article (auto-slugifies and computes read time).
* `GET /api/admin/articles/[id]`: Returns single article by ID.
* `PUT /api/admin/articles/[id]`: Updates article content and metadata.
* `DELETE /api/admin/articles/[id]`: Deletes article record.

### 12.4 Maintenance & Cron Endpoints
* `GET /api/cron/auto-archive` & `POST /api/cron/auto-archive`:
  * Protected by `Authorization: Bearer <CRON_SECRET>` header.
  * Triggers `runAutoExpire()`, marking past active events as `hidden`.

---

## 13. Automated Testing & Quality Assurance

The codebase includes an automated test runner executing **10 test suites and 236 assertions** across domain logic, security, and runtime handlers.

Run the test suite:
```bash
npm test
```

### Test Suite Directory (`scripts/tests/`)
1. `utils.test.ts`: Validates slug generation, price formatting, unique ID generation (`evt_...`), and date parsing.
2. `validators.test.ts`: Validates URL structures (YouTube, Substack, Google Maps) and tag normalization.
3. `sql-utils.test.ts`: Verifies dynamic parameter binding, column omission, and `updated_at` injection.
4. `lifecycle.test.ts`: Verifies event state transitions and RBAC role restrictions.
5. `auth.test.ts`: Verifies HMAC token generation, payload decoding, timing-safe checks, and session cookies.
6. `article-service.test.ts`: Verifies reading time calculation, adjacent article traversal, and embedded image parsing.
7. `event-service.test.ts`: Verifies display mappings, archive card generation, and hard discard asset cleanup.
8. `upload-handlers.test.ts`: Tests `/uploads` and `/archive` route handlers, directory traversal defense, and 1x1 fallback.
9. `proxy-security.test.ts`: Tests edge route guard, login redirects, unauthenticated API blocking, and token tampering.
10. `db-integration.test.ts`: Live integration against Neon Postgres validating connection pooling, queries, and auto-expire.

---

## 14. Deployment, Environment Variables & Operations

### 14.1 Environment Variables
Create a `.env.local` file for local development. In production (Vercel), configure these in Project Settings:

```env
# ── Admin Authentication ────────────────────────────────────
ADMIN_PASSWORD=your_super_admin_secure_password
MANAGER_PASSWORD=your_event_manager_secure_password
ADMIN_SECRET=your_cryptographic_hmac_secret_key

# ── Database (Neon Serverless Postgres) ──────────────────────
DATABASE_URL=postgresql://user:password@ep-xyz.region.aws.neon.tech/neondb?sslmode=require
DATABASE_URL_POOLED=postgresql://user:password@ep-xyz-pooler.region.aws.neon.tech/neondb?sslmode=require

# ── Vercel Blob (Mandatory for Production Uploads) ───────────
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

# ── Scheduled Maintenance (Cron) ────────────────────────────
CRON_SECRET=your_secure_cron_trigger_token

# ── Google Sheets Lead Capture ──────────────────────────────
NEXT_PUBLIC_NEWSLETTER_GOOGLE_SHEET_URL=https://script.google.com/macros/s/AKfy.../exec
NEXT_PUBLIC_CONTACT_GOOGLE_SHEET_URL=https://script.google.com/macros/s/AKfy.../exec
```

### 14.2 Build & Deployment Commands
```bash
# Install dependencies
npm install

# Run development server (with webpack compiler)
npm run dev

# Run full test suite
npm test

# Build for production
npm run build

# Start production server
npm start

# Run database migration (SQLite -> Neon)
npm run db:migrate
```

---

## 15. V3 Strategic Roadmap & Handoff Notes

As documented in `context-docs/developer-updated.md` and discussions with unLecture founders (Sonalika & team), here are the strategic priorities for the next developer:

1. **Articles Migration to Substack:**
   * **Context:** The founders plan to transition article blogging directly to Substack to foster a recurring email newsletter community rather than hosting standalone blogs on the website.
   * **Implementation Recommendation:** Replace the Markdown article reader with a curated listing that redirects out to the unLecture Substack publication.
2. **Open-Canvas Visual Layout (The "Wow Factor"):**
   * **Context:** V3 aims for a non-traditional, open-canvas format without rigid box constraints, emphasizing visual surprise and atmospheric intimacy.
   * **Implementation Recommendation:** Avoid forcing rigid shared spacing systems; leverage Framer Motion absolute projections, bespoke SVG masks, and interactive draggable or floating canvas nodes.
3. **Admin Portal Isolation (Dedicated Subdomain):**
   * **Context:** To simplify maintenance and keep the marketing site completely decoupled, the admin portal should eventually move to its own subdomain (e.g. `admin.unlecture.in`).
4. **Standardized Asset Dimension Registry:**
   * **Context:** The current build uses multiple cropped asset variants (`card-shapes/website` and `card-shapes/mobile`) to fit different frames.
   * **Implementation Recommendation:** Coordinate with the design team to enforce fixed aspect ratios (such as 4:3 or 16:9) on poster and recap exports at upload time, eliminating multi-file crop requirements.
5. **Asset Storage Migration to Cloudflare CDN:**
   * If static shape and media volume expands significantly with V3's open canvas, consider serving public assets through a dedicated Cloudflare CDN or R2 bucket for edge asset caching.

---

*Handoff document prepared for unLecture development team. For further historical context, refer to `context-docs/build-log.md` and `context-docs/design-build-log.md`.*
