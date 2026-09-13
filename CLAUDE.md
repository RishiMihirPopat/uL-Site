# CLAUDE.md

## Before Every Session

1. Read `Context Docs/DESIGN.md` — design system, tokens, component inventory.
2. Read `Context Docs/BUILDLOG.md` — what has been built, what is next, what was decided.

Do not start work until both files have been read.

---

## Stack

- **Framework:** Next.js App Router
- **Styling:** Plain CSS Modules only — no Tailwind, no styled-components, no UI libraries
- **Icons:** Phosphor Icons, duotone variant only
- **Fonts:** Self-hosted (no Google Fonts CDN)

---

## Build Phases

Work proceeds strictly in order. Never skip or merge phases.

| Phase | Name | Description |
|-------|------|-------------|
| 0 | Read Docs | Read `Context Docs/DESIGN.md` and `Context Docs/BUILDLOG.md` |
| 1 | Tokens | Define all CSS custom properties in `globals.css` |
| 2 | Components | Build reusable components |
| 3 | Pages | Assemble pages from components |
| 4 | Functionality | Add interactivity, data, logic |

---

## CSS Rules

- **No hardcoded values.** All colors, spacing, font sizes, radii, and shadows must use CSS custom properties defined in `globals.css`.
- **CSS Modules only.** Every component gets exactly one `.module.css` file. No inline styles, no `style={{}}` props.
- **No global class name collisions.** Never use generic class names like `.container` or `.wrapper` in module files.

---

## Dependency Rules

- Add no unnecessary dependencies.
- If something can be done in ~10 lines of native code (browser APIs, CSS, vanilla JS), do that instead.
- Ask before adding any new package.

---

## File Budget

- Start every new feature or section with **2–3 files maximum**.
- Ask before creating additional files.
- Prefer extending an existing file over creating a new one when reasonable.

---

## Communication Rules

- No preamble. No summaries after completing a task.
- Status updates are one sentence only.
- If something is unclear before starting, ask **one question**, then wait for an answer. Never ask mid-task.
- If something is going wrong, stop immediately and say so directly.

---

## Logging Rules

- Update `Context Docs/BUILDLOG.md` after every meaningful change — new file, new component, new decision.
- Update `Context Docs/DESIGN.md` after any design system change — new token, updated color, changed spacing scale.
