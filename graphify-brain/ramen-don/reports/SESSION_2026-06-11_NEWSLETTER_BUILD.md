# Session Report — Newsletter System Build (2026-06-11/12)

## Outcome
Complete newsletter subscription + campaign system implemented for ramen-don via
orchestrated planner/executor/verifier loop. **G7 final audit: PASS-WITH-CONDITIONS.**
All 9 intake falsifiers CLEAR, all 8 invariants HOLD, zero regressions.
**Post-release incident (2026-06-12):** subscription failed in real use — migration
007 was never applied to the live Supabase DB despite all gates passing. Fixed by
owner running the SQL in the dashboard editor; verified end-to-end. Full post-mortem
in `specs/REPORT_NEWSLETTER_BUILD.md` and below.

## Artifacts
- Intake: `specs/SPEC_NEWSLETTER_INTAKE.md`
- Plan/orchestration spec: `specs/PLAN_NEWSLETTER_ORCHESTRATION.md`
- Pattern brief (RES-1): `specs/research/NEWSLETTER_PATTERN_BRIEF.md`
- Consolidation report: `specs/REPORT_NEWSLETTER_BUILD.md`

## What was built
- Migration `supabase/migrations/007_newsletter_system.sql` — newsletter_subscribers /
  newsletter_campaigns / newsletter_dismissals + RLS (service-role all; anon insert-only
  on dismissals); seeded `newsletter_active='false'`.
- `src/lib/newsletter.ts` (business logic), `email.ts` + `sendSubscriptionConfirmation()`,
  `sendCampaign()` (batched <=50, DEV_EMAIL_REDIRECT-gated, never silent-fails).
- Public APIs: `/api/newsletter/{subscribe,dismiss,status}` (consent !== true → 400;
  sha256 IP hash; `{dismissed}` only). Admin APIs: `/api/admin/newsletter/{settings,
  subscribers,send,campaigns}` — all `requireAdminUser()` first.
- `NewsletterPopup` (BookingOverlay pattern; localStorage → status-API → render;
  `?newsletter=1` override), `NewsletterButton` (footer, custom-event trigger),
  `/privacy` placeholder page.
- Admin pages: `/admin/newsletter` (image picker + toggle), `/subscribers` (CSV export),
  `/compose` (zero-dependency contentEditable rich text + raw HTML modes),
  `/campaigns` (history) + `NewsletterTabs`.
- Booking integration: `newsletter_opt_in` (try/catch-isolated, never blocks booking),
  `PostBookingSignup` on confirmation page, separated gold CTA block in booking email
  template (template-only diff).
- Playwright suite `tests/e2e/newsletter.spec.ts`: 7 scenarios × 2 browsers = 14/14 pass,
  0 skips; uses `tests/e2e/helpers/newsletter-db.ts` (service-role toggle of
  site_settings — established the DB-driven e2e pattern for this repo).

## Post-mortem: "migration never applied" incident (2026-06-12)
- **Symptom:** "Could not complete newsletter subscription" on local dev footer form.
- **Root cause:** `PGRST205` — newsletter tables absent from live Supabase; migration
  007 existed as a file only. Resend was NOT the cause (send failure is non-fatal).
- **Failure trace:** (1) Gate G1 was artifact-only — checked SQL text (idempotency,
  naming, RLS definitions), never application; (2) Phase 0 executor EXPLICITLY flagged
  "migration not applied to a live DB" and the Planning Agent ratified G1 past the
  flag without converting it to a blocker; (3) RES-1 brief never documented HOW
  migrations get applied in this project (manually, dashboard SQL editor); (4) G6
  e2e mocked the subscribe POST — stubbing the exact edge that would have exposed the
  missing table (intake's "toy conditions" trap, realized); (5) orchestrate hard-gate
  false positives biased adjudication toward "exists and compiles" over "functions
  against live infrastructure".
- **Caught by:** representative use (owner's real submission) — the intake's
  Representative Environment layer, arrived at too late.
- **Fix:** owner ran `scripts/apply-newsletter-migration.sql` (migration + NOTIFY
  pgrst reload) in dashboard; verified: service-role inserts OK, live subscribe → 200
  + row, consent-less → 400, test rows cleaned.
- **Secondary discovery:** production ramen-don.co.uk has NO newsletter code — all 36
  files uncommitted to the Railway-deployed repo. Deployment pending owner decision
  (recommend: toggle newsletter_active=false → push → activate via admin when ready).

## Binding harness rules adopted (apply to all future ramen-don orchestrations)
1. Infrastructure packets close ONLY with a live effect-probe (insert→select→cleanup),
   never file inspection alone.
2. Flag-to-task rule: every executor "remaining issues/uncertainty" line becomes a
   tracked blocker; no gate closes past it silently.
3. One unmocked write path per feature in e2e — mock third parties, never the
   project's own persistence edge.
4. Every packet states an environment manifest: which DB/email/runtime it targets and
   who owns applying changes there.

## Key decisions / learnings
- Model routing: GPT-5.5 Codex (backend P0–P2) + DeepSeek V4 Pro (frontend P3–P4,
  and all roles after Codex 429 usage-limit at ~21:48 UTC).
- `subagent` tool CANNOT run openai-codex (OAuth) — returns empty; only `orchestrate`
  subprocesses can. reviewer/pev-researcher agent JSONs pinned to deepseek instead.
- `orchestrate` post-execution hard gates ("text-only response"/"truncation") false-
  positived on EVERY implementation phase; standing procedure became: Planning Agent
  adjudicates each gate directly on disk (git diff, tsc, tests, build) + dispatches
  reviewer subagent for code-level verification.
- Pre-existing baseline failure: `tests/unit/auth.test.ts:214` (untracked file, fails
  on clean tree) — waived in all gates; suite baseline is 1 failed / 59 passed.
- G6 first attempt FAILED legitimately (6/7 scenarios skipped — server-rendered active
  flag unreachable by route mocking). Repair: real-DB toggling via service-role helper.

## Open items (conditions)
1. HUMAN GATE 1: privacy policy content — placeholder at `/privacy`; owner copy needed
   before production activation.
2. HUMAN GATES 2–4 (post-deploy): first campaign review, image selection, activation.
3. ~~Vote-leg~~ DONE: owner authorized Claude Opus 4.8 as VER-2; independent
   re-derivation of G4/G5/G7 returned AGREE (all PASS). Voted gates discharged.
   Non-blocking notes: ?newsletter=1 Layer-0 override precedes dismissal check
   (intentional; comment it), empty try/finally in spec teardown, optional
   reordering of booking-route newsletter insert after transactional bookkeeping.
4. Manual evidence for SC 6/7/9/16: real email receipt screenshots, admin image picker
   screenshot, post-booking subscriber DB check in a deployed env.
5. Resend free tier 100/day — paid plan before large sends. Unsubscribe self-service,
   double opt-in, scheduling, analytics = v2.
6. DEPLOYMENT: newsletter feature not yet pushed to Railway repo — production does
   not have it. Pre-deploy: set newsletter_active=false; activate post-deploy via
   /admin/newsletter after Human Gates 1 (privacy copy) and 3 (image) clear.
