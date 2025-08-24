# Planning (ChurchSuiteGH) — God-Mode 4

> **Track Toggle:**  
> - [ ] Website (Next.js)  
> - [ ] App (React+Vite or SPA)

---

## Phase: Repo Setup
**Goal:** Initialize repo & tooling.  
**Tasks:**  
- Create `/docs`, `/smart_prompts`, `/.cursor`, `/brand`.  
- Add baseline docs + prompts.  
- Install packages: Next.js, Tailwind, shadcn/ui, Drizzle ORM, Neon Postgres driver.  
- Setup lint/test configs.  
**Exit Criteria:** Repo runs basic app skeleton with lint/test passing.  

---

## Phase: Brand Integration
**Goal:** Apply brand tokens & logo.  
**Tasks:**  
- Detect `/brand/logo.png` + `/brand/colour_palette.png`.  
- Generate CSS variables + Tailwind theme.  
- Apply shadcn/ui theme.  
- Create `docs/brand.tokens.md`.  
**Exit Criteria:** CSS vars + shadcn theme applied; tokens documented.  

---

## Phase: Slicing
**Goal:** Break PRD into vertical slices.  
**Tasks:**  
- Membership, Attendance, MoMo Giving, Calendar/Events, Communications.  
- Document DoR for each slice.  
- Prioritize by user value & feasibility.  
**Exit Criteria:** Slice backlog with DoR ready.  

---

## Phase: BUILD (repeatable per slice)
**Goal:** Implement one slice end-to-end.  
**Tasks:**  
- Implement UI + API.  
- Add Zod contracts, UX states (loading/error/empty).  
- Write unit/integration + Per-Feature Smoke tests.  
- Update docs + changelog draft.  
**Exit Criteria:** Slice feature running with tests green.  

---

## Phase: FIX (repeatable as needed)
**Goal:** Debug/refactor with tests-first.  
**Tasks:**  
- Reproduce issue; write failing test.  
- Apply minimal fix.  
- Verify error envelope + regression tests.  
**Exit Criteria:** Bug resolved; smoke tests pass.  

---

## Phase: Hardening
**Goal:** Prep for production.  
**Tasks:**  
- e2e tests (Playwright).  
- OWASP/security sweep.  
- Lighthouse perf + a11y checks.  
- SEO/PWA audits.  
**Exit Criteria:** App production-ready; RC build passes.  

---

## Phase: Ship
**Goal:** Deploy MVP.  
**Tasks:**  
- Deploy to Vercel (primary) + config env keys.  
- Run Unified Smoke.  
- Prepare release notes.  
**Exit Criteria:** MVP tagged + live with rollback plan.  

---

## Add more phases as needed
Copy `docs/phases.md` template for future additions (e.g., Finance, Child Check-in, Worship Planning).
