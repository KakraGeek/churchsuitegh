# /build — Feature Creation (Generic)

**Notify → Approve → Proceed.** Ask before large changes.

## Inputs
- Current `docs/prd.md` and `docs/planning.md`
- Target Track: Website or App
- Target slice name

## Expectations
1) Plan the slice (story, acceptance, data contract).
2) Generate code: UI, state, API route/server action.
3) Add tests: unit + integration + Per‑Feature Smoke.
4) Include UX states: loading/empty/error.
5) Update docs (README snippet) and add a CHANGELOG entry draft.
6) Ask for approval before refactors or dep shifts.

## Steps
- Read PRD + Planning; restate the slice scope.
- Propose file changes; wait for approval.
- Implement minimally then extend; keep commits small.
- Run tests and show results; fix as needed.
- Present a short demo plan (how to verify locally).

## Brand Tokens (if `/brand` exists)
- Read `/brand/brand.config.json` if present; else extract from `colour_palette.png`.
- Map tokens to CSS variables and Tailwind config; update shadcn theme.
- Use `logo.png` in layout; keep image overlays via CSS (no baked text).
