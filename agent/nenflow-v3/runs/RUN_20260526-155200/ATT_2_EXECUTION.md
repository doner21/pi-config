---
artifact_type: EXECUTION_REPORT
role: EXECUTOR
run_id: RUN_20260526-155200
status: BLOCKED_AT_PHASE_3
---

# ATT_2_EXECUTION — Ramen Don: Git Push, Railway Deploy, GoDaddy Domain Link

## Summary

| Phase | Status | Detail |
|-------|--------|--------|
| Phase 1 — Audit & Prepare | ✅ PASS | tsc, tests, next build all clean; .gitignore updated |
| Phase 2 — Commit | ✅ PASS | 14 files staged, commit d6f8343, tree clean |
| Phase 3 — Push to GitHub | ❌ BLOCKED | GitHub push protection rejected for historical secrets |
| Phase 4 — Merge to main | ⏳ NOT REACHED | |
| Phase 5 — Configure Railway | ⏳ NOT REACHED | |
| Phase 6 — Link GoDaddy | ⏳ NOT REACHED | |
| Phase 7 — Local Cleanup | ⏳ NOT REACHED | |

---

## Phase 1 — Audit & Prepare ✅

### 1.1 TypeScript Check

```
npx tsc --noEmit → exit code 0, zero errors
```

### 1.2 Unit Tests

```
npm run test:unit → 4 test files, 16 tests passed (353ms)
```

Test files: all 4 passing. Zero failures.

### 1.3 Production Build

```
npx next build → Compiled successfully, 38 pages generated
```

Next.js 16.2.3 (Turbopack). All routes compiled. No build warnings or errors.

### 1.4 .gitignore Update

Appended the following entries to `.gitignore`:

```
/graphify-out/cache/
/tests/screenshots/
/github-snapshot.md
/railway-snapshot.md
```

**Verification** (`git status --short`) confirmed that:
- `graphify-out/cache/ast/*` (19 files) → excluded
- `tests/screenshots/*` (4 files) → excluded
- `github-snapshot.md` → excluded
- `railway-snapshot.md` → excluded

Remaining untracked: exactly 11 production paths (the same set listed in the Plan Step 2.1).

No unexpected tracked-file modifications detected.

---

## Phase 2 — Commit ✅

### 2.1 Staging

Staged 12 paths (resolving to 14 files):

```
git add .gitignore HANDOFF.md HANDOFF_MULTI_TABLE_BOOKING_ISSUES.md \
  scripts/ specs/ \
  src/components/admin/InteractiveFloorPlan.tsx \
  src/lib/booking/resource-allocation.ts \
  src/lib/error-message.ts \
  src/lib/floor-plan/ \
  supabase/migrations/006_floor_plan_tables.sql \
  supabase/migrations/20260519100648_multi_table_bookings.sql
```

CRLF warnings (Windows-normal, harmless): applied to all staged text files.

### 2.2 Verification

`git diff --cached --stat`:

```
 .gitignore                                         |    6 +
 HANDOFF.md                                         |  224 +++
 HANDOFF_MULTI_TABLE_BOOKING_ISSUES.md              |  404 +++++
 scripts/apply-migration-006.mjs                    |  121 ++
 scripts/floor-plan-verify.png                      |  Bin 0 -> 87861 bytes
 scripts/verify-floor-plan.mjs                      |   44 +
 specs/floor-plan-fix-spec.md                       |   56 +
 specs/floor-plan-intake-spec.md                    |  554 +++++++
 src/components/admin/InteractiveFloorPlan.tsx      | 1642 ++++++++++++++++++++
 src/lib/booking/resource-allocation.ts             |  146 ++
 src/lib/error-message.ts                           |    3 +
 src/lib/floor-plan/table-positions.ts              |   48 +
 supabase/migrations/006_floor_plan_tables.sql      |   26 +
 .../20260519100648_multi_table_bookings.sql        |   57 +
 14 files changed, 3331 insertions(+)
```

✅ Confirmed INCLUDED: .gitignore, HANDOFF*.md, scripts/, specs/, src/, migrations/
✅ Confirmed EXCLUDED: graphify-out/cache/, tests/screenshots/, snapshot.md files

### 2.3 Commit

```
Commit: d6f8343
Branch: booking-system-build-out
Message: feat: multi-table booking system with interactive admin floor plan
```

Working tree: clean (`git status --short` empty).

---

## Phase 3 — Push to GitHub ❌ BLOCKED

### 3.1 Push Attempt

```
git push origin booking-system-build-out
```

**Result:** Remote rejected by GitHub push protection.

### Error Detail

```
remote: error: GH013: Repository rule violations found for refs/heads/booking-system-build-out.
remote: - GITHUB PUSH PROTECTION
remote:   - Push cannot contain secrets
remote:
remote:     —— GCP API Key Bound to a Service Account ————————————
remote:      locations:
remote:        - commit: 4d17bbafe33698a8292c1dfbcaa13a1b4fe26e76
remote:          path: .pi/extensions/mcp-stitch.ts:27
remote:        - commit: 4d17bbafe33698a8292c1dfbcaa13a1b4fe26e76
remote:          path: assets for booking system/{.txt:9
remote:
remote:      (?) To push, remove secret from commit(s) or follow this URL to allow the secret.
remote:      https://github.com/doner21/ramen-don/security/secret-scanning/unblock-secret/3EGj46KWbrBSy2BQThfXnxye9xz
```

### Root Cause

Commit `4d17bbaf` ("Booking system build out") — the 11th commit from the branch tip, authored prior to this run — contains:

1. **`.pi/extensions/mcp-stitch.ts`** — exposes a GCP API key (`[REDACTED]`) at line 27. This is a Pi extension configuration file that was auto-committed with a live API key.

2. **`assets for booking system/{.txt`** — a scratch/asset file also containing a GCP API key reference.

### Branch History Context

- Branch `booking-system-build-out` has **290 commits** total
- Commit `4d17bbaf` is commit #11 from tip (not deep, but still baked into DAG)
- Required secret removal must rewrite history from `4d17bbaf` through tip (11 commits + commit d6f8343)

### Resolution Options

**Option A — Allow the secret via GitHub UI (fastest)**
1. Navigate to: https://github.com/doner21/ramen-don/security/secret-scanning/unblock-secret/3EGj46KWbrBSy2BQThfXnxye9xz
2. Follow the "allow" flow if the keys are expired or test-only
3. Retry `git push origin booking-system-build-out`

**Option B — Remove secrets from branch history**
Requires rewriting 12 commits. Steps:
1. Identify the exact blobs to remove: `.pi/extensions/mcp-stitch.ts`, `assets for booking system/{.txt`
2. Use `git filter-branch` or `git filter-repo` to purge those files from all commits
3. Force-push the cleaned branch (this is the one force-push the plan should allow, as it's cleaning leaked credentials)
4. Or: `git rebase -i 4d17bbaf~1` and edit commit `4d17bbaf` to remove the secret files

**Option C — Squash-merge alternative path**
Create a new branch from a pre-secret commit, cherry-pick clean commits only, then push.

**Recommended:** Option A if the key can be deactivated. Option B if the key is still active and must not be published.

### 3.2 Verification

Not reached — push was rejected before any refs were transferred.

---

## Phases 4–7 — Manual Steps (Not Attempted)

Per the Executor mandate: browser automation is NOT attempted. These are documented for the Orchestrator to guide manually.

### Phase 4 — Merge to main on GitHub

1. Open https://github.com/doner21/ramen-don (login as doner21)
2. Select `booking-system-build-out` from branch dropdown
3. Click "Compare and pull request"
4. Base: **main**, Compare: booking-system-build-out
5. Title: "Deploy: booking-system-build-out to main"
6. Confirm no conflicts; click "Merge pull request" then "Confirm merge"
7. Verify: `git ls-remote origin refs/heads/main`
8. Verify locally: `git fetch origin && git log origin/main --oneline -5`

### Phase 5 — Configure Railway

1. Open https://railway.app (login with GitHub doner21)
2. Navigate to Ramen Don project (ID: `114db40c-6367-4b70-b600-5d764e67ddd2`)
3. Service → Settings → Source/Deploy section
4. **Record current branch value** before changing
5. Change branch dropdown to `main`, save
6. Watch build log; confirm `next build` succeeds
7. Check Variables tab for required env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
8. Add any missing vars from `.env.local`, then redeploy if needed
9. Note Railway-provided domain (e.g., `ramen-don.up.railway.app`)
10. Open it in browser to verify site loads

### Phase 6 — Link GoDaddy Domain

1. Railway: Settings → Networking → Custom Domain
2. Add: `ramen-don.co.uk`
3. Copy Railway-provided DNS records EXACTLY
4. GoDaddy DNS Management: **Screenshot existing records before changes**
5. Add DNS records (typical: CNAME `www` → `ramen-don.up.railway.app`)
6. Note: `.uk` TLD may not support apex CNAME; fallback to `www` CNAME + apex redirect
7. Wait for propagation (5–60 min)
8. Railway: Custom Domain status → "Verified"
9. Railway provisions SSL certificate (additional 2–10 min)
10. Verify: `nslookup ramen-don.co.uk`
11. Open https://ramen-don.co.uk with valid SSL

### Phase 7 — Local Cleanup

```bash
cd C:/Users/doner/ramen-don
git fetch origin
git checkout main
git pull origin main
```

---

## Invariants Status

| # | Invariant | Status |
|---|-----------|--------|
| I1 | No lost work | ✅ All production files committed (d6f8343) |
| I2 | Git history preserved | ⚠️ Pending — push blocked; no history rewritten |
| I3 | main is exact tree | ⚠️ Not yet merged (Phase 4 pending) |
| I4 | Railway watches main | ⚠️ Not yet configured (Phase 5 pending) |
| I5 | GoDaddy targets Railway | ⚠️ Not yet configured (Phase 6 pending) |
| I6 | Build must succeed | ✅ Local tsc, tests, next build all pass |

---

## Executor Prohibitions — Compliance

| Prohibition | Complied? |
|-------------|-----------|
| Do NOT push directly to origin/main | ✅ No push to main attempted |
| Do NOT commit graphify-out/cache/ast/* | ✅ Excluded via .gitignore |
| Do NOT commit tests/screenshots/ | ✅ Excluded via .gitignore |
| Do NOT commit snapshot.md files | ✅ Excluded via .gitignore |
| Do NOT change Railway branch without recording | ✅ Phase 5 not reached |
| Do NOT delete GoDaddy DNS records without copying | ✅ Phase 6 not reached |
| Do NOT force-push anything | ✅ No force-push attempted |
