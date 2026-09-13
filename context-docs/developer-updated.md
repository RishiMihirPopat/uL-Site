# DEVELOPER-UPDATED.md

Plain-language handoff: what changed in this rebuild, why, what's coming in V3, and what the next developer needs to do. Skim, don't study.

---

## What Changed (V2)

1. **Core structure rebuilt.** The old skeleton didn't hold up from a UX perspective. This is V1 of the funnel strategy: the core focus is getting organic new leads through the site. Per Sonalika's request, the hero carousel is now the landing page's main focus element.
2. **Pages simplified.** A lot of the old page structure didn't make sense, so it was rebuilt around just two things: Events and Articles. Each gets its own page with its own sorting and filters, so each page stays focused on the one job it's built for.
3. **No combined archive page.** Old-style archives that mixed everything together are gone. Each category keeps its own history inside its own page instead. We don't have enough volume yet to justify a separate archive, and moving to Neon makes it even less necessary right now, but the structure has been kept scalable so one can be added later without a rebuild.
4. **No anchor links.** The site is too small to need them, and anchors just bloat the navbar and hurt the UX. The nav's job is to move users between pages of the site, not between sections within a single page.
5. **Fully responsive**, with real mobile-specific assets built for it, not just the desktop assets resized down.
6. **`public/` folder reorganized** so the asset structure actually makes sense. `archive` and `upload` were left untouched, since those are linked to the existing SQLite/admin code.

## content.ts

`lib/content.ts` centralizes all static site copy (labels, headings, descriptions) in one place, separate from event/article data (which lives in SQLite). This makes copy easier to scan and change without touching component files, which makes our work easier day to day.

## Fonts

Both CDN-format and self-hosted `.woff2` font files have been uploaded, so there's no single point of failure if one source goes down.

---

## What's Next (V3)

We need a real replanning pass with Sonalika before jumping into building V3 randomly. There are some core decisions still to make:

1. **Different look and feel.** V3 takes a non-standard approach: an open-canvas layout with no grid or standard layout rules. The core goal is a "wow factor" experience that speaks about unLecture visually and gets people to register for events.
2. **Articles move to Substack.** Instead of hosting blog content here, the site will show a list and redirect out to Substack. Nobody visits websites like this to read blogs anymore, it's a tricky habit to fight. Moving articles to Substack also builds a real shared community there, which fits the current trend better. The community lives on Substack, not on the website, so the site becomes the funnel into that community.
3. **Standardize asset sizes.** Once sizes are defined (posters, covers, etc.), we'll have a single properly-exported asset available in every size we need, instead of depending on clipping/cropping to fake it, which doesn't hold up well.
4. **Events page approach** needs its own fresh decision for V3, not finalized yet.
5. **Admin panel revamped**, and moved to its own subdomain instead of a URL slug, since that isolates it much better. The focus is on making it as easy as possible for the founders to use, since they're the actual target audience, not us.
6. **Build new code for reasonable future scale, not just the present case, but don't over-engineer it.** This applies to V3 work specifically, not the current site.

---

## For the Next Developer

1. Clean up unnecessary code, then host on Vercel (see Hosting below).
2. **Drop the SQLite dependency in V3.** The site needs to be easy to use for the founders first, not for us, so make sure nothing requires our specific dependency or knowledge to operate. Keep it simple.
3. Performance is solid right now, but V3 will bring a lot more assets to depend on. If that starts affecting how easily the site runs, move asset storage to Cloudflare or another CDN.

## Hosting (Vercel)

- `better-sqlite3` is a native module. Vercel's default Next.js build handles it fine, but if serverless deploys ever break on it, that's the first suspect (may need `output: 'standalone'` or moving off SQLite, per the V3 plan above).
- Required env vars: `ADMIN_PASSWORD`, `ADMIN_SECRET`, `MANAGER_PASSWORD`, `DB_PATH`. Set these in Vercel's project settings, nothing else is needed to deploy.
- No other special config, standard `next build` / `next start`.

---

_Personal build-log notes are kept separately by the current developer, not duplicated here._
