---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260526-155200
clarification_needed: false
recommended_next_step: PLAN
context_saturation_estimate: "~3%"
context_handoff_threshold_percent: 65
context_handoff_threshold_source: default
---

# ATT_0_INTAKE — Ramen Don: Git Push, Railway Deploy, GoDaddy Domain Link

## Task Summary

Push the current `booking-system-build-out` branch (latest booking system development) to GitHub,
merge it into `main`, trigger a Railway deployment, and link the GoDaddy domain `ramen-don.co.uk`
to the Railway deployment.

## Task Type

**DevOps / Deployment pipeline orchestration** — 5 sequential sub-tasks:
1. Commit all pending booking-system work locally
2. Push `booking-system-build-out` to GitHub
3. Merge `booking-system-build-out` → `main` on GitHub (merge commit or PR merge)
4. Ensure Railway deploys from `main`
5. Link GoDaddy `ramen-don.co.uk` domain to Railway deployment

## User Intent

The user has completed significant booking system development on a feature branch and now wants
to ship it. The intent is: **productionise the booking system by deploying it to Railway and
pointing the live domain at it.**

## Goal Attractor

- **End state**: `ramen-don.co.uk` serves the booking-system-build-out code from Railway, via
  GitHub `main` branch.
- **Intermediate state**: All local work committed, pushed, merged to `main` on GitHub.
  Railway auto-deploys from `main`.

## Constraints

### Hard Constraints
1. **Must not lose local work** — commit all changes before any destructive Git operations.
2. **Must not overwrite GitHub `main` with incomplete work** — the merge must preserve
   `booking-system-build-out` history.
3. **Railway deployment must succeed** — the code must build (Next.js `next build`).
4. **Domain must resolve correctly** — `ramen-don.co.uk` must point to Railway's provided
   CNAME/IP after deployment.

### Soft Constraints
5. Prefer a PR-based merge for audit trail vs. direct push to main.
6. The Graphify knowledge graph files and `.playwright-mcp` artifacts should be excluded from
   the commit if they are not production-relevant.
7. GoDaddy DNS changes should use the correct record types (CNAME for subdomain, A/ALIAS for apex).

## Invariants

1. **I1**: The `booking-system-build-out` branch's uncommitted work must be committed before
   any push/merge.
2. **I2**: The GitHub `main` branch after the merge must have the exact same tree as
   `booking-system-build-out`.
3. **I3**: Railway must be configured to deploy from the `main` branch of
   `doner21/ramen-don`.
4. **I4**: The GoDaddy DNS for `ramen-don.co.uk` must point to the Railway deployment's
   provided custom domain endpoint.

## Success Criteria

1. **SC1 (Commit)**: All current work on `booking-system-build-out` is committed locally with a
   meaningful commit message.
2. **SC2 (Push)**: `booking-system-build-out` is pushed to `origin` and visible on GitHub.
3. **SC3 (Merge)**: GitHub `main` contains all commits from `booking-system-build-out`.
4. **SC4 (Deploy)**: Railway shows a successful deployment of the latest `main` commit.
5. **SC5 (Domain)**: `ramen-don.co.uk` resolves to the Railway deployment and serves the site.

## Ambiguities

1. **A1**: Does Railway currently deploy from `main` or `ramen-don_alpha`? The GitHub default
   branch is `ramen-don_alpha`. Railway may be watching `ramen-don_alpha`.
2. **A2**: Is the GoDaddy domain currently pointing anywhere? Need to check current DNS records.
3. **A3**: Are there environment variables in Railway that need updating for the booking system?
4. **A4**: Should graphify-out, scripts/, specs/, HANDOFF.md, test screenshots be committed or
   excluded? These are development artifacts, not production code.

## Routing Decision

**recommended_next_step: PLAN** — the intake is clear enough. We need a PLAN to handle the
ambiguities and sequential deployment steps. No RESEARCH phase needed; the task is
well-understood DevOps work.

## Context Assessment

- The ORCHESTRATOR has access to: local Git state, branch diffs, Graphify report, GitHub repo
  structure (via browser), Railway project ID, GoDaddy domain name.
- **Gaps**: Cannot automate Railway login (browser session required), cannot automate GoDaddy
  login (browser session required), cannot see current Railway branch config or GoDaddy DNS
  records without login.
- **Mitigation**: Plan will handle the automatable parts (commits, push, PR creation) and
  provide manual steps for Railway/GoDaddy with clear instructions.
