# God-Mode 4.1 — One-Paste Kickstart (Project-Only)

Paste this into Cursor when opening a repo to initialize **only the project essentials**.  
**Do NOT create reference/learning docs** (prompts, cheatsheets, matrices).

---

## What I want you (Cursor Agent) to do

1) **Register context & rules**
   - Load `.cursor/context.json` and `.cursor/rules.json`.
   - Open all referenced files in the workspace.

2) **Verify or create ONLY these files** (project scaffolding):
   - `docs/prd.md` (Product Requirements Document)
   - `docs/planning.md` (Dynamic phases; unlimited `## Phase:` sections)
   - `docs/phases.md` (reusable phase template)
   - `docs/brand.tokens.md` (create/update later during Brand Integration)
   - `smart_prompts/build.md` · `smart_prompts/fix.md` · `smart_prompts/ship.md`
   - `brand/README.md` + `brand/brand.config.json` (placeholders; consume `brand/logo.png` & `brand/colour_palette.png` if present)

   **Do NOT generate** any of the following (if absent, leave them absent):
   - `docs/prompts/requirements-to-prd.md`
   - `docs/prompts/prd-to-requirements.md`
   - `docs/cheatsheet.md`
   - `docs/tracks-and-components.md`
   - Any other reference-only or learning materials

3) **Ask me to pick a primary Track** (no extra files needed):
   - Website (Next.js — App Router, SSR/SSG, SEO, PWA)
   - App (React + Vite or Next.js SPA — PWA/offline)
   - Node API (Express/Hono)
   - Python Backend (FastAPI/Flask)
   - Hybrid (Next.js frontend + Python FastAPI backend)
   - Mobile (React Native + Expo) — optional
   - Agent/AI Service (LangChain/LlamaIndex + vector DB) — optional

4) **Ask me to toggle Components** (no extra docs; record choices):
   - ORM: Drizzle · Prisma · SQLAlchemy · None
   - DB: Neon Postgres · Supabase · SQLite (dev) · MySQL · Mongo
   - Auth: NextAuth.js · Clerk · Firebase Auth · Auth.js · Custom
   - Storage: Cloudflare R2 · S3 · Supabase Storage · Local (dev)
   - Payments (Ghana-ready): Paystack · Flutterwave · (MoMo via PSP) · Stripe · None
   - Deployment: Vercel · Cloudflare Pages/Workers · Railway · Fly.io · Render · Shared hosting
   - Testing: Vitest/Jest · Playwright (e2e) · ESLint · Prettier · Zod/Valibot
   - UI & Theming: TailwindCSS · shadcn/ui · CSS Variables · Storybook (optional)
   - Analytics/Monitoring: PostHog · Plausible · Sentry · OpenTelemetry

   **Write my selections to** `docs/selections.json` and use them when scaffolding code/tests/config.
   Do not create any explanatory/reference markdown files for these selections.

5) **Parse phases dynamically**
   - Read all `## Phase:` headings in `docs/planning.md` and render a live checklist (unlimited phases).

6) **Offer to run `/build` on the first slice**
   - Scaffold tests, data contracts, error states, Per-Feature Smoke.
   - Ask for my approval before proceeding.

---

## Branding Rules (no reference docs)

- If `/brand/brand.config.json` exists, use its tokens (colors, radii, typography, shadows).
- If only `/brand/colour_palette.png` exists, parse HEX labels and propose token mapping.
- Map tokens into **CSS variables + Tailwind theme + shadcn/ui**.
- Place `logo.png` in header/footer; generate favicon if possible.
- Produce/update `docs/brand.tokens.md` (OK to create/update this one).
- **Do not** generate any brand how-to or marketing docs.

---

## Quality & Testing Gates (enforce from `.cursor/rules.json`)

- **Smoke tests**: Per-Feature + Unified nightly.
- **Error envelope**: `{ ok: boolean, data?: any, error?: string }`.
- **Security**: OWASP Top 10 hygiene.
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
- Always pair code with tests; block merges if smoke tests fail.
- Summarize outputs and propose next steps.
