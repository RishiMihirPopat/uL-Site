# DESIGN.md

## Project

**Name:** unLecture
**Description:** A recurring series of lectures, conversations, and gatherings in unconventional spaces across India — de-pedestalising important conversations and making ideas speakable again.

---

## Color Tokens

All values are CSS custom properties defined in `globals.css`. "Live" below means actually referenced by at least one component today (V2 site or the still-mounted V1 leftovers like `EventCard`, `AllUpcomingEventsModal`, `MarkdownRenderer`, `HeroDraggables`, `FormatEventsList`, `events/[slug]`) — not just declared.

### Backgrounds
| Token | CSS Variable | Value | Notes |
|-------|-------------|-------|-------|
| Background | `--color-bg` | `#F5EFE0` | Warm cream / paper — V1 base |
| Background (surface) | `--color-bg-surface` | `#EDE4D3` | Slightly deeper cream — cards, sections |
| Background (dark) | `--color-bg-dark` | `#2A2420` | Near-black warm surface — footers, inverted blocks |
| Background (V2) | `--color-bg-v2` | `#FFF9F2` | The actual background color of the live Figma-redesigned site |

### Brand / Primary
| Token | CSS Variable | Value | Notes |
|-------|-------------|-------|-------|
| Primary | `--color-primary` | `#6B2D2D` | Deep maroon / oxblood — signature color, used throughout V2 |
| Primary (hover) | `--color-primary-hover` | `#7D3636` | Slightly lifted maroon for hover states |

### Text
| Token | CSS Variable | Value | Notes |
|-------|-------------|-------|-------|
| Text (primary) | `--color-text` | `#1A1714` | Near-black / warm ink |
| Text (muted) | `--color-text-muted` | `#3D332A` | Soft brown — secondary text, captions |
| Text (on dark) | `--color-text-on-dark` | `#F0E8DC` | Warm off-white — text on maroon or dark bg |

### Supporting
| Token | CSS Variable | Value | Notes |
|-------|-------------|-------|-------|
| Olive | `--color-olive` | `#5A5A3C` | Muted green — tags, secondary accents |
| Border | `--color-border` | `#D6C9B0` | Faint warm line |
| Border (strong) | `--color-border-strong` | `#BFB09A` | Slightly darker border for emphasis |
| Error | `--color-error` | `#A63224` | Warm deep red — form/validation errors |

### Legacy palette (still live, V1 components only)
These are not part of the V2 Figma system — they're only kept because `EventCard.module.css`, `AllUpcomingEventsModal.module.css`, `MarkdownRenderer.module.css`, `HeroDraggables.module.css`, and `FormatEventsList.module.css` (pre-redesign components, still mounted on `events/[slug]`) still reference them. Don't design new V2 work around these.

| Token | CSS Variable | Value |
|-------|-------------|-------|
| Mustard (light) | `--color-mustard-light` | `#E8D08A` |
| Terracotta | `--color-terracotta` | `#C26540` |
| Dusty rose | `--color-dusty-rose` | `#B88585` |
| Parchment | `--color-parchment` | `#FBF5E8` |

Declared but confirmed **unused** anywhere (dead — safe to remove whenever `globals.css` is next touched): `--color-primary-light`, `--color-accent`, `--color-accent-hover`, `--color-olive-light`, `--color-mustard`, `--color-mustard-bg`, `--color-sage-green`, `--color-forest`, `--color-overlay-archive`, `--shadow-card`, `--shadow-lift`, `--shadow-polaroid`.

---

## Typography

### Font Families

| Role | CSS Variable | Family | Notes |
|------|-------------|--------|-------|
| Body | `--font-body` | `Times New Roman`, Georgia, serif | System font, no hosting needed |
| Brand | `--font-brand` | Atelier, `Times New Roman`, serif | Self-hosted (`/fonts/atelier.woff2`). Signature punctuation — "unLecture" mark, headings |
| Mono | `--font-mono` | `Chivo Mono`, `Courier New`, monospace | Self-hosted (`/fonts/chivo-mono.woff2`). Labels, pills, nav, form text — V2's workhorse UI font |
| Article | `--font-article` | `Ancizar Serif`, Georgia, serif | Self-hosted (`/fonts/ancizar-serif.woff2`). Article/blog body copy |
| Display | `--font-display` | Berliner, `Abril Fatface`, serif | **Dead** — fonts never added, falls through to system serif |
| Dynamic | `--font-dynamic` | Merriweather, Georgia, serif | **Dead** — font never added, falls through to system serif |

Only Atelier, Chivo Mono, and Ancizar Serif are actually self-hosted and live. Montserrat is also loaded (Google Fonts CDN, `globals.css` top) for the two still-live V1 components (`EventCard`, `AllUpcomingEventsModal`) — not part of the V2 system, don't use it in new work.

---

## Spacing, Type Scale & Radius

Not documented as a fixed system. The mobile build introduced a lot of one-off, Figma-exact pixel values (widths, gaps, radii, font sizes) that don't map cleanly onto the `--space-*` / `--text-*` / `--radius-*` scale still declared in `globals.css` — those variables remain in the file and are fine to reach for when a value genuinely matches, but they are not a constraint on new work.

Going forward the site is moving toward a more open-canvas layout with a lot of relative positioning and bespoke sizing per section, so we're deliberately not building out a rigid spacing/type/radius system to document here. See `developer-updated.md` for the reasoning.

---

## Component Decisions

- **Icons:** `@phosphor-icons/react`, `weight="bold"` (Events page cards — `Calendar`, `UserCircle`). Duotone remains the nominal default per `CLAUDE.md` but hasn't actually been used anywhere yet.

---

## Open Design Questions

_No open questions yet._
