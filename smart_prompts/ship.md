# /ship — Harden, Test, Deploy (Generic)

**Notify → Approve → Proceed.**

## Expectations
- Add/verify e2e tests (Playwright).
- Security sweep (OWASP), headers/CSP.
- A11y/perf budgets validated.
- Prepare deploy (envs, CI, build).
- Generate release notes (WHAT changed, WHY, HOW to roll back).

## Website Track
- SEO checks (sitemap, robots, meta, og).
- Structured data where applicable.
- SSR/SSG correctness and caching notes.

## App Track
- PWA audit (offline, cache, installability).
- Background sync and error recovery notes.

## Steps
- Produce a hardened checklist with status.
- Propose deployment plan; wait for approval.
- Execute deploy; post release notes and tag.