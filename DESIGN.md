# DESIGN.md

## Project

**Name:** unLecture
**Description:** A recurring series of lectures, conversations, and gatherings in unconventional spaces across India — de-pedestalising important conversations and making ideas speakable again.

---

## Color Tokens

All values are CSS custom properties defined in `globals.css`.

### Backgrounds
| Token | CSS Variable | Value | Notes |
|-------|-------------|-------|-------|
| Background | `--color-bg` | `#F5EFE0` | Main warm cream / paper |
| Background (surface) | `--color-bg-surface` | `#EDE4D3` | Slightly deeper cream — cards, sections |
| Background (dark) | `--color-bg-dark` | `#2A2420` | Near-black warm surface — footers, inverted blocks |

### Brand / Primary
| Token | CSS Variable | Value | Notes |
|-------|-------------|-------|-------|
| Primary | `--color-primary` | `#6B2D2D` | Deep maroon / oxblood — signature color |
| Primary (hover) | `--color-primary-hover` | `#7D3636` | Slightly lifted maroon for hover states |
| Primary (light) | `--color-primary-light` | `#EAD9D9` | Faint maroon tint — subtle bg, active states |

### Accent
| Token | CSS Variable | Value | Notes |
|-------|-------------|-------|-------|
| Accent | `--color-accent` | `#B5562E` | Muted terracotta / rust |
| Accent (hover) | `--color-accent-hover` | `#C96A40` | Lifted terracotta for hover |

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
| Olive (light) | `--color-olive-light` | `#7A7A54` | Lifted olive for hover or subtle use |
| Border | `--color-border` | `#D6C9B0` | Faint warm line |
| Border (strong) | `--color-border-strong` | `#BFB09A` | Slightly darker border for emphasis |
| Error | `--color-error` | `#A63224` | Warm deep red — fits palette, not jarring |

### V2 Extended Palette
| Token | CSS Variable | Value | Notes |
|-------|-------------|-------|-------|
| Mustard | `--color-mustard` | `#C8892A` | Warm golden — quote borders, accents |
| Mustard (light) | `--color-mustard-light` | `#E8D08A` | Tape strips, card shadow layer |
| Mustard (bg) | `--color-mustard-bg` | `#FAF0D0` | Pale mustard — quote section background |
| Terracotta | `--color-terracotta` | `#C26540` | Format card 1 overlay, CTA diamond, ornaments |
| Sage green | `--color-sage-green` | `#6B7A5A` | Format card 2 overlay |
| Dusty rose | `--color-dusty-rose` | `#B88585` | Format card 3 overlay, tape accent |
| Parchment | `--color-parchment` | `#FBF5E8` | About section bg, format card bg |

---

## Typography

### Font Families

| Role | Family | Notes |
|------|--------|-------|
| Body | `Times New Roman`, Georgia, serif | Carries most of the weight — editorial, clean |
| Display | Berliner, `Abril Fatface`, serif | Emphasis moments only — posters, key headings |
| Brand | Atelier | Signature punctuation — "unLecture" mark, standout callouts only |
| Dynamic | Merriweather, serif | Visual/reel moments — secondary, restrained |

Self-hosting required for: Atelier, Berliner, Abril Fatface, Merriweather.
Times New Roman and Georgia are system fonts — no hosting needed.

### Type Scale

Sizes are proposed editorial defaults — confirm before writing to `globals.css`.

| Style | CSS Variable | Size | Weight | Line Height |
|-------|-------------|------|--------|-------------|
| H1 | `--text-h1` | `3rem` | 400 | 1.1 |
| H2 | `--text-h2` | `2rem` | 400 | 1.2 |
| H3 | `--text-h3` | `1.375rem` | 400 | 1.3 |
| Body | `--text-body` | `1.0625rem` | 400 | 1.7 |
| Small | `--text-small` | `0.875rem` | 400 | 1.5 |

---

## Spacing Scale

All spacing uses a consistent scale via CSS custom properties.

| Token | CSS Variable | Value |
|-------|-------------|-------|
| XS | `--space-xs` | `4px` |
| SM | `--space-sm` | `8px` |
| MD | `--space-md` | `16px` |
| LG | `--space-lg` | `24px` |
| XL | `--space-xl` | `32px` |
| 2XL | `--space-2xl` | `48px` |

---

## Border Radius

| Token | CSS Variable | Value |
|-------|-------------|-------|
| Fine | `--radius-fine` | `2px` |
| Default | `--radius-md` | `4px` |
| Full | `--radius-full` | `9999px` |

---

## Component Decisions

- **Icons:** `@phosphor-icons/react` installed and first used on the Events page cards (`Calendar`, `UserCircle`), `weight="bold"` per explicit instruction — overrides the duotone default above for that instance; duotone remains the default elsewhere until told otherwise.

---

## Open Design Questions

_No open questions yet._
