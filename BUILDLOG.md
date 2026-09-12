# BUILDLOG.md

**Project:** unLecture
**Version:** v0.1.0

---

## Current Status

V2 complete. Vintage Indian postcard / editorial magazine aesthetic. Nav, Footer, Home+About page rebuilt and confirmed running at localhost:3000. Events and Contact pages not yet built.

---

## What's Been Built

- `CLAUDE.md` — project rules and phase structure
- `DESIGN.md` — all tokens confirmed (colors, typography, spacing, border radius)
- `BUILDLOG.md` — this file
- Next.js 16.2.9 scaffold — App Router, TypeScript, ESLint, no Tailwind
- `app/globals.css` — full token system (colors, type scale, spacing, radius, max-width)
- `components/Nav.tsx` + `Nav.module.css` — site header with wordmark and nav links
- `components/Footer.tsx` + `Footer.module.css` — footer with email and social links (URLs TBD)
- `app/layout.tsx` — root layout with Nav + Footer
- `app/page.tsx` + `page.module.css` — V1: Home + About page (hero, about, three formats, CTA)
- `app/page.tsx` + `page.module.css` — V2: vintage postcard/editorial redesign (tape hero, mustard quote, textured about, paper-cutout format cards, dark footer)
- `data/archive.ts` — ArchiveCard type + 10 placeholder event records
- `components/PostcardArchive.tsx` + `PostcardArchive.module.css` — interactive archive: flip animation, full-screen overlay, CSS-columns scrapbook grid, real-time search, detail view
- `components/HeroDraggables.tsx` + `HeroDraggables.module.css` — 12 scattered draggable objects on hero: parchment placeholder cards, custom drag hook with inertia (82% friction), positions set via CSS custom properties (no style={{}} props), session-only positions, mobile display-only
- `data/events.ts` — Event type + 7 placeholder events across 3 formats (Grounds for Thought, unLecture, Community)
- `app/events/[slug]/page.tsx` + `page.module.css` — 3 static filtered event pages (/grounds-for-thought, /unlecture, /community); format cards on homepage link here; nav Events → smooth-scrolls to #formats
- `components/NewsletterForm.tsx` + `NewsletterForm.module.css` — replaces homepage CTA; email-only form, Google Apps Script POST (no-cors), loading/success/error states, magazine subscription card aesthetic (maroon bg, cream text, underline input, parchment button); APPS_SCRIPT_URL placeholder constant with setup instructions in component

---

## In Progress

- Phase 1: finalize type scale, spacing, and border radius tokens

---

## Up Next

- Phase 2: core components (Nav, Footer, layout shell)
- Phase 3: Home/About, Events, Contact pages

---

## Change History

| Version | Date | Notes |
|---------|------|-------|
| v0.8.9 | 2026-08-18 | Event Card Hierarchy Redesign & 2-Tab Archive with Sorting: redesigned EventCard with a 2-column metadata box for speaker and venue; added direct status selector dropdown in admin lifecycle banner; updated Archive into a 2-tab dossier ('Past Gatherings' and 'Articles & Logs') with chronological and alphabetical sorting; added interactive client-side sorting and filter search to format category pages |
| v0.8.8 | 2026-08-17 | SOLID Principles Refactor: segregated event domain interfaces (`lib/types/event.ts`), added format registry (`lib/constants/formats.ts`) & lifecycle machine (`lib/domain/lifecycle.ts`), created repository layer (`IEventRepository`, `SqliteEventRepository`) and domain services (`eventService`, `uploadService`), and modularized admin forms into focused reusable subcomponents |
| v0.8.7 | 2026-08-17 | Tag Normalization & Database Cleanup: added robust `normalizeTags` and `formatTagsForDisplay` helpers to strip bracket/quote remnants, sanitized tag inputs in all admin forms and API routes, and ran database cleanup migration for existing rows |
| v0.8.6 | 2026-08-17 | Admin Portal Complete Overhaul: unified fragmented edit forms into a single intuitive edit screen with lifecycle status banner; added live search, format dropdowns, and count tabs to Events directory; redesigned Dashboard with quick action shortcuts; aligned entire portal styling to unLecture parchment and terracotta brand design system |
| v0.8.5 | 2026-08-17 | Press Marquee Fix: restored the infinite seamless marquee layout (`carouselWrap`, `carouselInner`, `logoItem`, `logoFrame`, `logoImg`) with CSS gradient edge masking and hover opacity transitions for the "As seen in" section |
| v0.8.4 | 2026-08-15 | Archive Badge & Tags Persistence Fix: fixed payload serialization in `handleContentSubmit`, `handlePublishArchive`, and API endpoints (`/api/admin/events/[id]/content` and `/archive`) so special badges and tags save properly to the database and render on both archive and active event cards |
| v0.8.3 | 2026-08-15 | Link Validation: added comprehensive frontend and API route validation (`lib/validators.ts`) for poster image URLs, Urbanaut booking links, YouTube video URLs, and Substack article links with real-time error indicators |
| v0.8.2 | 2026-08-15 | Card Loading Feedback: added instant loading spinner overlay on format cards when clicked (`FormatCardLink`) and created streaming skeleton page `app/events/[slug]/loading.tsx` for visual feedback during transitions |
| v0.8.1 | 2026-08-15 | Restored "How We Gather" Section: restored the tall portrait color-blocked format cards grid with hover description overlays and rotation tilts directly from `uL-website-use-backup` |
| v0.8.0 | 2026-08-15 | Meeting Feedback Implementation: Backup created (`uL-website-use-backup-2026-08`); replaced stark white with cream parchment background on PostcardArchive polaroid and cards; enforced uniform EventCard height and bottom button alignment matching backup scrapbook aesthetic; expanded sticky Nav with format category links (Grounds for Thought, unLecture, Community, Series) and #about jump; implemented Pending Archive workflow for completed events waiting on photos/media; added Super Admin vs Event Manager RBAC in auth and admin dashboard with soft-delete protections; added auto-formatting from `event_datetime` to display `date` and `time` in admin forms; added direct photo file uploads and live thumbnail previews for event posters and archive photos |
| v0.7.2 | 2026-07-28 | How We Gather Layout Polish: removed background box containers in favor of thick 4px section color dividers (`.sectionDivider`); added per-section color schemes (`data-format` attributes for Terracotta, Forest Green, Primary Dark, and Olive); restricted right horizontal scroll track to the latest 3 active events per category followed by an editorial "View all [Format] events &rarr;" End Card |
| v0.7.1 | 2026-07-28 | How We Gather Layout Refinement: transformed each format row into a distinct elevated block card (`.formatRow`) with color-coded accent left borders; updated event cards container (`.eventsGridRow`) to a strict horizontal scroll container (`overflow-x: auto`, `scroll-snap-type: x mandatory`) with custom styled terracotta scrollbar and `Scroll →` indicator |
| v0.7.0 | 2026-07-28 | How We Gather UI Overhaul: replaced 4-column card grid with bold typography header (`h2.formatsHeading`) and dedicated horizontal row per format (`.formatRow`); left side displays format title, description, and link; right side displays live active events cards belonging to that event category directly from SQLite database |
| v0.6.0 | 2026-07-22 | Event Management System & SQLite API: implemented SQLite backend (lib/db.ts) with unified events table and settings table; added password-gated auth (lib/auth.ts); added 15 API routes under /api/ (events CRUD, archive, hide, restore, discard, content links, cover image upload, settings, cron auto-archive); built complete admin dashboard at /admin; updated PostcardArchive and event format pages to fetch dynamically from API; added YouTube video thumbnails and Substack article sections to archive detail modal |
| v0.5.6 | 2026-07-22 | Header Cleanup: removed wordmark scroll morphing per user request; restored standard Nav component and hero left h1.heroWordmark headline |
| v0.5.5 | 2026-07-22 | Dynamic IntersectionObserver Scroll Morphing: upgraded scroll detection from fixed pixel scroll Y thresholds to dynamic IntersectionObserver element boundary tracking (threshold: 0.15, rootMargin: -64px); wordmark morph triggers dynamically the exact millisecond hero headline element crosses the sticky header cutoff line |
| v0.5.4 | 2026-07-22 | Persistent Sticky Header & Wordmark Scroll Morph: updated Nav header to position sticky with glassmorphism backdrop blur (backdrop-filter: blur(12px)); implemented Framer Motion layoutId="unlecture-brand-wordmark" scroll morph so hero headline 'unLecture' projects directly into the sticky top navigation header bar as the user scrolls down |
| v0.5.3 | 2026-07-22 | 3D Card Back Flip & Component Fade-In: polaroid flips over 180deg onto dark parchment back face; dark back face expands into full-screen page background; archive header and postcard grid float and fade into view on top with staggered Framer Motion timing |
| v0.9.0 | 2026-08-26 | Website Development Feedback & Updates: simplified top nav (Home, Events, About Us, Archive, Contact Us); restored clean EventCard rendition; added Admin Dashboard Carousel Event Picker with interactive checkmarks; added full Testimonials CRUD in Admin; auto-advancing Hero Lecture Slideshow; 6-paragraph About Us section with Manifesto quote on left; 3-column community recommendations carousel; scroll-to-top route transitions |
| v0.5.2 | 2026-07-22 | Framer Motion layoutId Morph: replaced manual keyframes/rotations with Framer Motion layoutId="postcard-archive-card"; hero polaroid card smoothly morphs, scales, and expands into full-screen archive overlay, and morphs back down on close |
| v0.5.1 | 2026-07-22 | Screencast Video Diagnosis & Fix: moved AnimatePresence directly inside ClientPortal to wrap {isOpen && motion.div} so Framer Motion tracks motion children exit lifecycle across portal mounts; applied z-index 999999 and solid background on overlay (eliminating background text bleed); removed artificial opacity 0 image delay |
| v0.5.0 | 2026-07-22 | 3D Spin & Expand Archive Transition: converted hero polaroid to motion.button with 3D Y-axis spin (rotateY: 360deg, scale: 1.12); seamlessly hands off to archive overlay which expands outward from 3D spin origin (scale: 0.35 -> 1.0, rotateY: -120deg -> 0deg); closing overlay reverses spin morph back into hero polaroid |
| v0.4.13 | 2026-07-22 | Fixed AnimatePresence Portal Architecture & Image Reservation: moved AnimatePresence outside ClientPortal wrapper so Framer Motion tracks full exit lifecycle across portal mount/unmount; fixed cardImg heights (160px/185px/140px/168px) to eliminate layout shift blank boxes |
| v0.4.12 | 2026-07-22 | Archive Motion & Image Fix: assigned explicit key props (key="archive-overlay-modal" and key="archive-detail-modal") inside AnimatePresence mode="wait" to enable smooth 0.38s scale & fade-in / exit transitions on modal open & dismiss; updated ArchiveImage to eliminate blank box flashes |
| v0.4.10 | 2026-07-22 | Card Padding Upgrade: increased inner padding and surrounding grid spacing on PostcardArchive cards (16px 16px 28px padding, 48px column gap) and EventCard components (16px 24px 24px body padding) |
| v0.4.9 | 2026-07-22 | Restored slanted archive card rotations: re-enabled 5n rotation angles (-2.2deg to 2.5deg) for postcard scrapbook aesthetic |
| v0.4.8 | 2026-07-22 | Archive Contrast & Legibility Upgrade: styled searchInput with a semi-opaque pill background container and crisp placeholder contrast (eliminated text bleed); removed 5n card rotation tilts for clean grid legibility; upgraded cardDate, cardTitle, cardSpeaker, cardVenue, and cardBadge with high-contrast oxblood & dark ink colors |
| v0.4.7 | 2026-07-22 | Postcard Archive fixes: rendered overlay modal via React Portal (createPortal) directly on document.body with z-index 99999 (eliminated background ghosting and DOM bleed through hero); wrapped overlay and detail card in Framer Motion AnimatePresence (smooth exit transitions); implemented ArchiveImage skeleton shimmer with 0.35s image fade-in |
| v0.4.6 | 2026-07-22 | Route Page Transitions: created app/template.tsx with Framer Motion motion.div key={pathname}; all route changes (navigating to event format pages and returning via 'All formats') now play smooth 0.38s cubic-bezier(0.16, 1, 0.3, 1) entrance/exit transitions |
| v0.4.5 | 2026-07-21 | Fix visual issues: removed legacy CSS shape expand overlay (eliminated stray red box stretching across cards); updated HeaderTitle and BackButton with Framer Motion transitions (eliminated heading double rendering, added smooth exit animation for 'All formats' button) |
| v0.4.4 | 2026-07-21 | Framer Motion Shared Title Morphing: created AnimatedTitle client components using layoutId; format card titles on home page now seamlessly project, scale, and move to destination header title positions on a cubic-bezier(0.16, 1, 0.3, 1) curve without text duplication |
| v0.4.3 | 2026-07-21 | Framer Motion integration: added framer-motion library; converted EventCard and BookingModal to Framer Motion components with staggered physics-based entrance transitions and smooth modal scale animations; eliminated text duplication/alignment issues |
| v0.4.2 | 2026-07-21 | Animations overhaul: fixed card flash bug by keeping expansion overlay fullscreen during fade out; implemented FLIP shared-element title flight (#card-title-flyer) from card to header; added staggered float-up animation for event grid cards; applied cubic-bezier(0.16, 1, 0.3, 1) curves across transitions |
| v0.4.1 | 2026-07-07 | Archive: replaced 10 placeholder cards with 5 real events; extended ArchiveCard interface (speaker, specialBadge, category, urbanautUrl); grid cards now show badge + speaker; detail view shows badge, speaker, Urbanaut link; images from /archive/ folder |
| v0.4.0 | 2026-07-03 | Hero draggables: removed notebook (notebook.png), key, washi tape (postcard), and spiral (spiral.png) objects; 6 remaining objects repositioned to match screenshot — camera (3,2), cassette (14,8), flower (2,19), zines (79,1), coffee (83,53), polaroid/bill (57,50) |
| v0.3.9 | 2026-07-02 | EventCard redesign: compact layout matching Urbanaut proportions — image fixed 210px height, object-fit contain (full poster, no cropping), dark bg letterbox, tighter body padding (sm/md), 4px element gap, smaller typography, smaller Book Now button |
| v0.3.8 | 2026-07-02 | Event data: scraped all 9 Urbanaut events via browser automation — real poster images (CloudFront CDN), venue names, speakers, dates, prices; added remotePatterns to next.config.ts for CloudFront + S3 domains |
| v0.3.7 | 2026-07-02 | Events system: replaced placeholder data with 9 real Urbanaut events (7 unLecture, 2 GFT); added EventCard component (Book Now → iframe modal), BookingModal with Escape/click-outside close + external fallback link; added unlecture-series route; filtering now by category field; card styles moved to EventCard.module.css |
| v0.3.6 | 2026-07-02 | Nav: removed Events tab; Contact: new /contact page with 4-field form (name, email, phone, message), Google Apps Script POST (no-cors), success/error states, two-column editorial layout |
| v0.3.5 | 2026-07-02 | Format cards — 4-column grid (repeat(4,1fr), gap 24px), images always visible, gradient always on, title pinned to bottom, description on hover, numbers removed, nth-child object-position for GFT (right) and unLecture (left), added unLecture Series card (series-cover.JPG), tablet breakpoint at 900px (2-col), mobile stays 1-col |
| v0.3.4 | 2026-07-02 | Footer social links — replaced placeholder # hrefs with real URLs; removed YouTube and Substack; kept Instagram (theunlecture) and LinkedIn (unlecture) only |
| v0.3.3 | 2026-06-29 | Hero draggable positions — repositioned all 10 items to match design screenshot; tuned xPct/yPct values for camera, notebook, cassette, flower, key, zines, coffee, film, polaroid, postcard |
| v0.3.2 | 2026-06-29 | Newsletter fix — fixed Apps Script doPost parsing bug (URL-encoded data fallback); emails now save to Google Sheet |
| v0.3.1 | 2026-06-26 | Newsletter signup — replaced CTA section with Google Sheets-ready email form; magazine card aesthetic |
| v0.3.0 | 2026-06-26 | Events system — 3 filtered format pages, clickable homepage cards, Nav smooth-scroll to #formats, 7 placeholder events in data/events.ts |
| v0.2.2 | 2026-06-24 | Draggable hero objects — 12 vintage-card placeholders scattered in corners/edges, custom drag + inertia hook, no new dependencies |
| v0.2.1 | 2026-06-24 | Interactive postcard archive — click hero polaroid to flip + open archive overlay with scrapbook grid, search, and detail view |
| v0.2.0 | 2026-06-24 | V2 redesign — vintage Indian postcard + editorial magazine aesthetic. Extended palette, new Nav/Footer, rewritten page |
| v0.1.1 | 2026-06-23 | All design tokens confirmed — colors, typography, spacing, radius written to globals.css |
| v0.1.0 | 2026-06-23 | Next.js scaffold initialized, design tokens partially confirmed |
| v0.0.0 | 2026-06-23 | Project initialized |
