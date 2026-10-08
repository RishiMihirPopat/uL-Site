# unLecture (`uL-website-use`)

Official web platform for **unLecture** — a recurring series of intimate lectures, salons, conversations, and gatherings hosted in unconventional spaces across Delhi NCR.

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Neon Serverless Postgres**, **Vercel Blob**, and **Framer Motion**. Styled with pure **CSS Modules** and an editorial design system.

---

## 📖 Developer Handover Documentation

**Incoming developers: Please read [`HANDOVER.md`](./HANDOVER.md) first.**

It contains the exhaustive, end-to-end technical guide covering:
- Architecture & SOLID implementation patterns
- Design system, self-hosted fonts, and the 1920px desktop zoom reflow
- Neon Serverless Postgres schema & retry resilience
- Multi-tier HMAC authentication & edge route guards (`proxy.ts`)
- Event lifecycle state machine (`active` ➔ `hidden` ➔ `archived`)
- In-article photo upload workflows & safe runtime asset streaming
- External integrations (Urbanaut ticketing & Google Sheets lead capture)
- The 10 automated test suites (236 passing assertions)
- Deployment on Vercel & required environment variables
- V3 strategic roadmap & founder guidance

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy the example environment configuration:
```bash
cp .env.example .env.local
```
Fill in your database connection string and admin secrets.

### 3. Run Automated Tests
```bash
npm test
```
Executes all 10 test suites (236 assertions) covering services, validation, auth, and database integration.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm start
```

---

## 🗂 Key Directories
- [`app/`](./app/): Next.js App Router pages, layout, and API route handlers.
- [`components/`](./components/): Reusable UI components & admin subcomponents.
- [`lib/`](./lib/): Domain services, repositories, validators, auth, and site copy (`lib/content.ts`).
- [`context-docs/`](./context-docs/): Architectural design logs, decision history, and build notes.
- [`scripts/`](./scripts/): Automated test runner and database migration scripts.