# /fix — Debug & Refactor (Generic)

**Notify → Approve → Proceed.**

## Inputs
- Bug report or refactor target
- Logs or failing tests

## Expectations
1) Reproduce issue; add/repair tests first.
2) Fix with smallest effective change.
3) Maintain API/error envelope stability.
4) Provide regression tests and risk notes.
5) Update docs and changelog entry draft.

## Steps
- Summarize root cause.
- Propose minimal fix; wait for approval.
- Implement; run tests; show outputs.
- Verify Per‑Feature Smoke still passes.