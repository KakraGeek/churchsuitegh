# God-Mode 4 — One-Paste Kickstart (Comprehensive + Expanded Tracks & Components)

Paste this into Cursor when opening a repo to initialize the workflow.
This sets up the **entire God-Mode 4 system** and now includes **stack Tracks** and **Component Toggles** you can mix & match per project.

---

## What I want you (Cursor Agent) to do

1. **Register context & rules**
   - Load `.cursor/context.json` and `.cursor/rules.json`.
   - Ensure all referenced files are open in the workspace.

2. **Verify or create the following files** (if missing, generate boilerplates from your knowledge of God-Mode 4):
   - `docs/prd.md` (Product Requirements Document)
   - `docs/planning.md` (Dynamic phases file)
   - `docs/phases.md` (Reusable phase template)
   - `docs/prompts/requirements-to-prd.md` and `docs/prompts/prd-to-requirements.md` (Master prompts)
   - `docs/cheatsheet.md` (Workflow file categories)
   - `docs/tracks-and-components.md` (reference matrix)
   - `docs/brand.tokens.md` (to be created later during Brand Integration)
   - `smart_prompts/build.md` · `fix.md` · `ship.md`
   - `brand/README.md` + `brand/brand.config.json` (placeholders; consume `logo.png` and `colour_palette.png` if present)

3. **Ask me to pick a Track (choose ONE as primary)**
   - **Website (Next.js)** — App Router, SSR/SSG, SEO, PWA install
   - **App (React + Vite)** — SPA-first, PWA/offline emphasis
   - **Node API (Express/Hono)** — REST/JSON APIs, server-render optional
   - **Python Backend (FastAPI/Flask)** — API-first with Jinja or frontend-as-client
   - **Hybrid (Next.js frontend + Python FastAPI backend)** — split repo or mono
   - **Mobile (React Native + Expo)** — optional, if this repo is mobile-focused
   - **Agent/AI Service** — (LangChain/LlamaIndex + vector DB) optional

4. **Ask me to toggle Components (select MANY)**
   - **ORM & DB**
     - ORM: Drizzle · Prisma · SQLAlchemy · None
     - Database: Neon Postgres · Supabase · SQLite (dev) · MySQL · Mongo
     - Migrations enabled: Yes/No
   - **Auth**
     - NextAuth.js · Clerk · Firebase Auth · Auth.js (standalone) · Custom
   - **Storage & Files**
     - Cloudflare R2 · S3 · Supabase Storage · Local (dev)
   - **Payments (Ghana-ready)**
     - Paystack · Flutterwave · (MoMo via PSP) · Stripe (int’l) · None
   - **Deployment**
     - Vercel · Cloudflare Pages/Workers · Railway · Fly.io · Render · Shared hosting
   - **Testing**
     - Vitest/Jest · Playwright (e2e) · ESLint · Prettier · Zod/Valibot
   - **UI & Theming**
     - TailwindCSS · shadcn/ui · CSS Variables · Storybook (optional)
   - **Analytics/Monitoring**
     - PostHog · Plausible · Sentry · OpenTelemetry (optional)

5. **Record my selections as a small config** (`docs/selections.json`) and respect them for all subsequent steps.

6. **Parse phases dynamically**
   - Read all `## Phase:` headings in `docs/planning.md` and render a live checklist (unlimited phases).

7. **Offer to run `/build` on the first slice**
   - Scaffold tests, data contracts, error states, Per-Feature Smoke.
   - Ask for my approval before proceeding.

---

## Branding Rules

- If `/brand/brand.config.json` exists, use its tokens (colors, radii, typography, shadows).
- If only `/brand/colour_palette.png` exists, parse HEX labels and propose token mapping.
- Map tokens into **CSS variables + Tailwind theme + shadcn/ui**.
- Place `logo.png` in header/footer; generate favicon if possible.
- Produce/update `docs/brand.tokens.md` documenting HEX codes + roles.

---

## Quality & Testing Gates

- Enforce `.cursor/rules.json`:
  - **Smoke tests** (Per-Feature + Unified nightly).
  - **Error envelope**: `{ ok: boolean, data?: any, error?: string }`.
  - **OWASP Top 10** hygiene.
  - **Accessibility**: WCAG AA.
  - **Performance budgets**: LCP < 2500ms, INP < 200ms.

---

## Commands to Use Next

- **/build** → Implement a slice end-to-end (UI, logic, tests, docs).
- **/fix** → Debug/refactor with tests-first.
- **/ship** → Harden, add e2e, deploy, release notes.
- *(Optional)* /phase → Insert a new phase section into `planning.md`.

---

## Ground Rules

- Keep changes minimal and incremental; show diffs before major edits.
- Always pair code with tests.
- Block merges if smoke tests fail.
- Summarize outputs and propose next steps.