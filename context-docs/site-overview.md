# SITE-OVERVIEW.md

General reference doc for unLecture site context that doesn't fit neatly into `DESIGN.md` (design system) or `BUILDLOG.md`/`DESIGN-BUILD-LOG.md` (build history). Add to this over time — decisions, deferred work, content sourcing, anything future sessions need to know that isn't a design token or a changelog entry.

---

## Deferred sections: Testimonials & Ticker

**Status as of 2026-09-13:** removed from the live site (V1 deleted entirely, no V2 replacement built yet). This is a deliberate gap, not an oversight — tracked here so they can be rebuilt from scratch against the Figma V2 design whenever that's ready, rather than half-migrating the old V1 implementation.

### What they were (V1)

- **Testimonials** (`TestimonialsCarousel.tsx`) — a 3-column horizontally-scrolling/carousel section of community testimonials, pulled from the `testimonials` DB table via `getAllTestimonials()` (still in `lib/db.ts` — the data layer was **not** removed). Rendered on the V1 homepage between "About Us" and "Featured In," and again inside the V1 mobile About overlay (`MobileAboutModal.tsx`, also removed) under a "From the community" heading.
- **Ticker** (`TickerBanner.tsx`) — a horizontally-scrolling marquee strip of site-wide announcement text, sourced from `getTickerText()`/`setTickerText()` in `lib/db.ts` (settings table — also untouched). Rendered on the V1 homepage directly above "How We Gather." Editable from the admin dashboard.

### What's still there to rebuild from

- DB layer: `lib/db.ts` — `getAllTestimonials()`, `getTickerText()`, `setTickerText()`, the `testimonials` table and `settings.tickerText` field. Fully intact.
- Admin CRUD for testimonials and the ticker text field: still live in `/admin` (not part of the V1 UI deletion — the admin panel isn't versioned V1/V2, it's the CMS backend).
- No Figma frame has been identified/linked for either section's V2 look yet — check the Figma file for a "Testimonials" or "Ticker" node before starting; if none exists, this needs a design pass first, not just a rebuild.

### When picking this back up

1. Confirm with the user whether Testimonials and Ticker are still wanted at all (some sites drop these on a redesign) before spending time on them.
2. If yes: find/confirm the Figma node, then build fresh V2 components following the same pattern as the other V2 sections (`HowWeGatherSection.tsx`, `AsSeenInSection.tsx`, etc. in `components/`) — real exported shape assets, `FadeIn`/scroll-reveal choreography, tokens from `DESIGN.md`.
3. Data-fetch the same way HomeView already does for other sections (server component calling `lib/db.ts` functions, passing props down to a client component).

---

## V1 → V2 migration (2026-09-13)

The site ran two parallel homepage/page implementations for a while (`lib/flags.ts` `SITE_VERSION` toggle) while the Figma V2 redesign was built out section by section. Once V2 covered the whole site, V1 was deleted outright — components, CSS, the `/old` reference route, the flag system itself. See `DESIGN-BUILD-LOG.md` for the itemized deletion log.

**Not touched by that deletion**, per instruction: `lib/db.ts` and everything under `lib/repositories/`, `lib/services/`, `lib/types/`, `lib/domain/`, the SQLite schema/client, and the `/admin` CMS. All of that is version-agnostic backend, not V1 UI.

If you're reading old commit history or old `DESIGN-BUILD-LOG.md` entries and see `isV2`, `SITE_VERSION`, `forceVersion`, or a component named without a `V2` suffix (e.g. `NewsletterForm` vs `NewsletterFormV2`) — that's V1-era code that no longer exists. The `V2` suffix on remaining component names is now vestigial (there's no more V1 to disambiguate from) but was left as-is rather than mass-renamed, to avoid unnecessary churn.
