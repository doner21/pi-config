---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260526-155200
context_saturation_estimate: "~8%"
---

# ATT_1_PLAN - Deploy booking-system-build-out to Railway via GitHub main + link GoDaddy domain

## Task Statement

Push all untracked booking-system work on booking-system-build-out to GitHub, merge it
into main, ensure Railway auto-deploys main, and point ramen-don.co.uk at the Railway
deployment so the live domain serves the multi-table floor-plan booking system.

---

## Invariants

Hard constraints the Executor must not violate.

1. **I1 - No lost work**: Every untracked production source file, migration, spec, handoff
   doc, and utility script must be committed before any push or merge. Do NOT commit
   graphify-out/cache/ast/*, tests/screenshots/, github-snapshot.md, or railway-snapshot.md.

2. **I2 - Git history preserved**: The merge of booking-system-build-out to main must use a
   merge commit (or squash-merge via PR) that preserves the full commit DAG. Do NOT
   fast-forward main to the tip of booking-system-build-out unless using a PR merge button.

3. **I3 - main is the exact tree**: After the merge, main on GitHub must contain exactly
   the same tree as booking-system-build-out (same source files, same Supabase migrations,
   same Next.js config).

4. **I4 - Railway watches main**: Railway deploy trigger must point at the main branch of
   doner21/ramen-don before the final verification step.

5. **I5 - GoDaddy DNS targets Railway**: The apex domain ramen-don.co.uk must resolve to
   Railway provided custom-domain endpoint, not to a stale IP or parked page.

6. **I6 - Build must succeed**: next build must pass on Railway for the deployment to be
   valid. tsc --noEmit and npm run test:unit must pass locally before push.

---

## Success Criteria

Observable, verifiable conditions. Every one must be independently verifiable.

1. **SC1 (Commit)**: git log --oneline -1 on booking-system-build-out shows a commit
   authored during this run that includes all production source files, migrations, specs,
   handoff docs, and scripts. git status shows clean working tree.

2. **SC2 (Push)**: git ls-remote origin refs/heads/booking-system-build-out returns a SHA
   matching the local tip of booking-system-build-out.

3. **SC3 (Merge)**: GitHub shows main branch with the latest commit from
   booking-system-build-out (via merge commit or squash). git ls-remote origin
   refs/heads/main returns a SHA that contains all commits from booking-system-build-out.

4. **SC4 (Deploy)**: Railway dashboard shows a deployment of the main branch with status
   Active or Success. The Railway-provided default domain serves the site.

5. **SC5 (Domain)**: ramen-don.co.uk resolves in DNS and serves the Ramen Don site from
   Railway. HTTPS certificate is provisioned and valid.

---

## Implementation Steps

### Phase 1 - Audit and Prepare Commit

**Step 1.1** - Verify TypeScript:

```bash
cd C:/Users/doner/ramen-don && npx tsc --noEmit
```

If errors: STOP and report.

**Step 1.2** - Verify tests:

```bash
cd C:/Users/doner/ramen-don && npm run test:unit
```

If failures: STOP and report.

**Step 1.3** - Verify production build:

```bash
cd C:/Users/doner/ramen-don && npx next build
```

If failure: STOP and report.

**Step 1.4** - Update .gitignore

Append to C:/Users/doner/ramen-don/.gitignore:
```
/graphify-out/cache/
/tests/screenshots/
/github-snapshot.md
/railway-snapshot.md
```

Verify:
```bash
cd C:/Users/doner/ramen-don && git status --short
```

Expected: graphify-out/cache/* etc no longer appear as untracked.

### Phase 2 - Commit

**Step 2.1** - Stage:
```bash
cd C:/Users/doner/ramen-don
git add .gitignore
git add HANDOFF.md HANDOFF_MULTI_TABLE_BOOKING_ISSUES.md
git add scripts/
git add specs/
git add src/components/admin/InteractiveFloorPlan.tsx
git add src/lib/booking/resource-allocation.ts
git add src/lib/error-message.ts
git add src/lib/floor-plan/
git add supabase/migrations/006_floor_plan_tables.sql
git add supabase/migrations/20260519100648_multi_table_bookings.sql
```

**Step 2.2** - Verify staging:
```bash
cd C:/Users/doner/ramen-don && git diff --cached --stat
```

Confirm INCLUDED: .gitignore, HANDOFF*.md, scripts/, specs/, src/, migrations/
Confirm EXCLUDED: graphify-out/cache/, tests/screenshots/, snapshot.md
If wrong: git reset and re-stage.

**Step 2.3** - Commit:
```bash
cd C:/Users/doner/ramen-don && git commit -m "feat: multi-table booking system with interactive admin floor plan"
```

Include body: InteractiveFloorPlan, multi-table allocation, resource-allocation.ts,
table-positions.ts, migrations 006+20260519100648, admin API, customer flow, dev store.

### Phase 3 - Push to GitHub

**Step 3.1** - Push:
```bash
cd C:/Users/doner/ramen-don && git push origin booking-system-build-out
```

**Step 3.2** - Verify:
```bash
cd C:/Users/doner/ramen-don && git ls-remote origin refs/heads/booking-system-build-out
```

SHA must match git rev-parse booking-system-build-out.

### Phase 4 - Merge to main on GitHub [MANUAL]

1. Open https://github.com/doner21/ramen-don - login as doner21
2. Select booking-system-build-out from branch dropdown
3. Click green Compare and pull request button
4. Base: **main** (NOT ramen-don_alpha), Compare: booking-system-build-out
5. Title: Deploy: booking-system-build-out to main
6. Confirm no conflicts; click Merge pull request then Confirm merge
7. Verify: git ls-remote origin refs/heads/main
8. Also: git fetch origin && git log origin/main --oneline -5

### Phase 5 - Configure Railway [MANUAL]

1. Open https://railway.app - login with GitHub (doner21)
2. Navigate to Ramen Don project (ID: 114db40c-6367-4b70-b600-5d764e67ddd2)
3. Click service > Settings > Source/Deploy section
4. Note current branch value (likely ramen-don_alpha or main)
5. If not main: change branch dropdown to main, save
6. Railway starts new deployment; watch build log
7. Confirm: next build succeeds, service status becomes Active
8. If deploy fails: check Variables tab for env vars:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
9. Add any missing vars from .env.local, then Redeploy
10. Note Railway-provided domain (e.g. ramen-don.up.railway.app)
11. Open it in browser to verify site loads

### Phase 6 - Link GoDaddy Domain [MANUAL]

1. In Railway: Settings > Networking > Custom Domain
2. Click Add Custom Domain > enter: ramen-don.co.uk
3. Railway displays required DNS records. Copy EXACTLY (type, name, value).
4. Open https://dns.godaddy.com - login, navigate to ramen-don.co.uk > DNS Management
5. **BEFORE ANY CHANGES**: screenshot or copy all existing DNS records
6. Add the DNS record(s) Railway provided:
   - Typical: CNAME www -> ramen-don.up.railway.app (TTL 1 hour)
   - If Railway gives A record for apex: A @ -> Railway IP
   - If GoDaddy rejects apex CNAME: add CNAME for www, set apex redirect to www
7. Save. DNS propagation: 5-60 minutes.
8. Return to Railway: Custom Domain status should change to Verified
9. Railway provisions SSL certificate (additional 2-10 min)
10. Final status: Active with HTTPS
11. Verify: nslookup ramen-don.co.uk
12. Open https://ramen-don.co.uk in browser - should load with valid SSL

### Phase 7 - Local Cleanup (Optional)

```bash
cd C:/Users/doner/ramen-don && git fetch origin && git checkout main && git pull origin main
```

---

## Handoff Notes

### Key file paths
- Repo root: C:/Users/doner/ramen-don
- .gitignore: C:/Users/doner/ramen-don/.gitignore
- Env example: C:/Users/doner/ramen-don/.env.local.example
- Migrations: supabase/migrations/006_floor_plan_tables.sql
  supabase/migrations/20260519100648_multi_table_bookings.sql
- Core src: src/components/admin/InteractiveFloorPlan.tsx
  src/lib/booking/resource-allocation.ts
  src/lib/booking/availability.ts
  src/lib/booking/server-data.ts

### Current Git state (confirmed)
- Branch: booking-system-build-out at commit ce104c5
- Working tree: clean (no tracked file modifications)
- Untracked: 34 items (production src, docs, specs, scripts, dev artifacts)
- Remote: origin -> https://github.com/doner21/ramen-don.git
- booking-system-build-out does NOT exist on GitHub yet
- 11 local commits on this branch (all checkpoint auto-commits)

### Railway context
- Project ID: 114db40c-6367-4b70-b600-5d764e67ddd2
- Current branch config: UNKNOWN (requires browser login)
- Required env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- Supabase project ref: usponfmwsloozdccugmb
- No railway.toml/Procfile/Dockerfile - Railway auto-detects Next.js (Nixpacks)

### GoDaddy context
- Domain: ramen-don.co.uk
- Current DNS records: UNKNOWN (requires browser login)
- .uk TLD: CNAME at apex may not be supported
- Fallback: CNAME www + apex redirect to www

### Known ambiguities (from INTAKE)
1. **A1** - Railway branch config: check in Phase 5 step 4
2. **A2** - GoDaddy DNS records: check in Phase 6 step 5
3. **A3** - Railway env vars: check in Phase 5 step 8
4. **A4** - Commit exclusions: RESOLVED (exclude graphify-out/cache, tests/screenshots, snapshots)

### Risk register
- Build fails on Railway (missing env vars): pre-test locally; check Variables tab
- GoDaddy apex CNAME unsupported: fallback to www CNAME + redirect
- PR merge conflicts: GitHub surfaces conflicts pre-merge
- Supabase schema mismatch: HANDOFF confirms migrations already applied
- Railway rate limits/credits: check dashboard before triggering deploy

### Executor prohibitions
- Do NOT push directly to origin/main - use PR merge only
- Do NOT commit graphify-out/cache/ast/*, tests/screenshots/, snapshot.md
- Do NOT change Railway branch without recording current value first
- Do NOT delete GoDaddy DNS records without copying them first
- Do NOT force-push anything
