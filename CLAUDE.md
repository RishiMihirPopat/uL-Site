# CLAUDE.md

## Before Every Session

1. Read `context-docs/design.md` — design system, tokens, component inventory.
2. Read `context-docs/build-log.md` — what has been built, what is next, what was decided.

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
| 0 | Read Docs | Read `context-docs/design.md` and `context-docs/build-log.md` |
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

- Update `context-docs/build-log.md` after every meaningful change — new file, new component, new decision.
- Update `context-docs/design.md` after any design system change — new token, updated color, changed spacing scale.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
