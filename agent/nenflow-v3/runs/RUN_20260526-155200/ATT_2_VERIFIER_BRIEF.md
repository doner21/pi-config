---
artifact_type: VERIFIER_BRIEF
role: EXECUTOR (for VERIFIER)
run_id: RUN_20260526-155200
---

# ATT_2_VERIFIER_BRIEF — Ramen Don: Git Push, Railway Deploy, GoDaddy Domain Link

## Verification Summary

| Phase | Executor Claims | Verifier Must Confirm |
|-------|----------------|----------------------|
| 1 | Audit checks passed; .gitignore updated | tsc, tests, next build outputs; .gitignore entries |
| 2 | Commit d6f8343 authored with 14 files; tree clean | git log, git diff, file presence |
| 3 | Push blocked by GitHub secret scanning | Push error message; secret locations |
| 4–7 | Not attempted (manual) | Documented for orchestrator |

---

## Phase 1 — Audit & Prepare

### V1.1 — TypeScript

**Claim:** `npx tsc --noEmit` returned zero errors.

**Independent verification:**
```bash
cd C:/Users/doner/ramen-don && npx tsc --noEmit 2>&1; echo "EXIT: $?"
```
- Expected: exit code 0, no stderr output
- PASS if: exit 0 and no diagnostic lines

### V1.2 — Unit Tests

**Claim:** `npm run test:unit` passed — 4 files, 16 tests.

**Independent verification:**
```bash
cd C:/Users/doner/ramen-don && npm run test:unit 2>&1
```
- Expected: "Tests  16 passed (16)" or "all tests passed"
- PASS if: zero failures, exit code 0

### V1.3 — Production Build

**Claim:** `npx next build` compiled successfully with 38 pages.

**Independent verification:**
```bash
cd C:/Users/doner/ramen-don && npx next build 2>&1
```
- Expected: "✓ Compiled successfully", "✓ Generating static pages"
- PASS if: no "Failed", "Error", or "Build error" in output; exit code 0

### V1.4 — .gitignore

**Claim:** Added 4 exclusion entries. graphify-out/cache/, tests/screenshots/, and snapshot files no longer appear in `git status`.

**Independent verification:**
```bash
cd C:/Users/doner/ramen-don
grep -n "graphify-out/cache\|tests/screenshots\|github-snapshot\|railway-snapshot" .gitignore
git status --short | grep -E "graphify-out/cache|tests/screenshots|snapshot.md"
```
- Expected: grep finds the 4 entries in .gitignore; second grep returns empty (no matches)
- PASS if: entries present AND no matching untracked files in git status

---

## Phase 2 — Commit

### V2.1 — Staged Files

**Claim:** 14 files staged, 3331 insertions.

**Independent verification:**
```bash
cd C:/Users/doner/ramen-don && git show --stat d6f8343
```
- Expected: 14 files changed, 3331 insertions
- PASS if: the stat matches exactly AND file list includes all 12 paths from the plan

**Required file list check:**
```bash
cd C:/Users/doner/ramen-don && git show --name-only d6f8343
```
Expect these paths:
```
.gitignore
HANDOFF.md
HANDOFF_MULTI_TABLE_BOOKING_ISSUES.md
scripts/apply-migration-006.mjs
scripts/floor-plan-verify.png
scripts/verify-floor-plan.mjs
specs/floor-plan-fix-spec.md
specs/floor-plan-intake-spec.md
src/components/admin/InteractiveFloorPlan.tsx
src/lib/booking/resource-allocation.ts
src/lib/error-message.ts
src/lib/floor-plan/table-positions.ts
supabase/migrations/006_floor_plan_tables.sql
supabase/migrations/20260519100648_multi_table_bookings.sql
```

### V2.2 — Exclusion Verification

**Claim:** graphify-out/cache/, tests/screenshots/, and snapshot.md files are NOT in the commit.

**Independent verification:**
```bash
cd C:/Users/doner/ramen-don && git show --name-only d6f8343 | grep -E "graphify-out/cache|tests/screenshots|snapshot.md"
```
- Expected: empty output
- PASS if: no matches

### V2.3 — Clean Tree

**Claim:** Working tree is clean after commit.

**Independent verification:**
```bash
cd C:/Users/doner/ramen-don && git status --porcelain
```
- Expected: empty output
- PASS if: no output (no modified or untracked files)

### V2.4 — Commit Message

**Claim:** Commit message is "feat: multi-table booking system with interactive admin floor plan"

**Independent verification:**
```bash
cd C:/Users/doner/ramen-don && git log -1 --format="%s" d6f8343
```
- PASS if: output matches the claimed message exactly

---

## Phase 3 — Push (BLOCKED)

### V3.1 — Push Rejection

**Claim:** `git push origin booking-system-build-out` was rejected by GitHub with secret scanning violations.

**Independent verification:**
```bash
cd C:/Users/doner/ramen-don && git push origin booking-system-build-out 2>&1; echo "EXIT: $?"
```
- Expected: exit code 1, message contains "GH013", "repository rule violations", "Push cannot contain secrets"
- PASS if: push is still rejected with same error

**Note:** If the push succeeds (someone resolved the secrets), the Verifier should note this and check the remote ref instead.

### V3.2 — Remote Verification (if secrets resolved)

If push later succeeds:
```bash
cd C:/Users/doner/ramen-don
LOCAL_SHA=$(git rev-parse booking-system-build-out)
REMOTE_SHA=$(git ls-remote origin refs/heads/booking-system-build-out | awk '{print $1}')
echo "Local: $LOCAL_SHA"
echo "Remote: $REMOTE_SHA"
```
- PASS if: LOCAL_SHA == REMOTE_SHA and remote returns a non-empty SHA

### V3.3 — Secret Locations Confirmation

**Claim:** Secrets are in commit `4d17bbaf` at:
- `.pi/extensions/mcp-stitch.ts:27`
- `assets for booking system/{.txt:9`

**Independent verification:**
```bash
cd C:/Users/doner/ramen-don
git show 4d17bbaf:.pi/extensions/mcp-stitch.ts 2>/dev/null | head -30
git show 4d17bbaf:"assets for booking system/{.txt" 2>/dev/null
```
- PASS if: files exist in that commit and contain API key strings

---

## Phases 4–7 — Manual (Not Verifiable by Automaton)

These phases require browser interaction (GitHub, Railway, GoDaddy). The Verifier must use browser-based observation.

### Phase 4 — Merge to main

**Expected end state:**
- `git ls-remote origin refs/heads/main` returns a SHA that includes commit d6f8343 (or its equivalent)
- GitHub UI shows "main" branch with the booking-system-build-out code

### Phase 5 — Railway Deploy

**Expected end state:**
- Railway dashboard shows service with branch = "main", status = Active/Success
- Railway default domain (e.g., `ramen-don.up.railway.app`) serves the Ramen Don site
- Build log shows `next build` succeeded

### Phase 6 — GoDaddy Domain

**Expected end state:**
- `nslookup ramen-don.co.uk` resolves to Railway IPs
- `curl -I https://ramen-don.co.uk` returns HTTP 200 with valid SSL certificate
- Railway custom domain status shows "Active" with HTTPS

### Phase 7 — Local Cleanup

**Expected end state:**
- `git branch --show-current` returns `main`
- `git status --porcelain` is empty
- `git log --oneline -1` shows the merge commit or squashed equivalent

---

## Overall PASS/FAIL Conditions

| Criterion | PASS Condition |
|-----------|---------------|
| SC1 (Commit) | d6f8343 exists on booking-system-build-out; working tree clean; 14 correct files committed |
| SC2 (Push) | `git ls-remote origin refs/heads/booking-system-build-out` matches local tip SHA |
| SC3 (Merge) | GitHub main contains booking-system-build-out commits |
| SC4 (Deploy) | Railway shows Active/Success deployment of main |
| SC5 (Domain) | ramen-don.co.uk resolves and serves site from Railway with HTTPS |

**Current verifiable status:** SC1 = PASS, SC2–SC5 = NOT YET REACHABLE (blocked at Phase 3 push rejection).

---

## Invariant Guard Checks

The Verifier should independently confirm these invariants are not violated:

| # | Invariant | How to Verify |
|---|-----------|---------------|
| I1 | No lost work | All 14 files in commit d6f8343; no dangling untracked production files |
| I2 | Git history preserved | Branch DAG intact; merge commit (not fast-forward) if Phase 4 executed |
| I3 | main is exact tree | `git diff booking-system-build-out..main` is empty after merge |
| I4 | Railway watches main | Railway Settings → branch = "main" |
| I5 | GoDaddy targets Railway | DNS records point to Railway endpoint |
| I6 | Build must succeed | `npx next build` exit 0 (local); Railway deploy log shows success |

---

## Executor Prohibition Compliance to Verify

- [ ] No direct push to origin/main
- [ ] No graphify-out/cache/ast/* committed
- [ ] No tests/screenshots/* committed
- [ ] No github-snapshot.md or railway-snapshot.md committed
- [ ] No force-push attempted
