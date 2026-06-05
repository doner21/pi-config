---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260526184029
context_saturation_estimate: "~14%"
---

# Plan: Resolve SSL Certificate for www.ramen-don.co.uk on Railway

## Task Statement

Restore HTTPS for `www.ramen-don.co.uk` by allowing Railway's Let's Encrypt SSL provisioning to complete for the freshly re-added custom domain (created 2026-05-26T18:29:07.515Z), verifying the outcome, and handling escalation if provisioning stalls. Separately flag Next.js build errors for a future code-fix deployment.

## Invariants

1. CNAME `www.ramen-don.co.uk` -> `q3lk4evq.up.railway.app` must remain intact
2. Railway service `ramen-don` (463a48df) must remain deployed and running
3. Must NOT trigger Let's Encrypt rate limit (5 duplicate certs/week) - no blind domain delete/re-add
4. Must NOT modify/delete existing GoDaddy DNS: SPF, MS365 TXT, Office 365 CNAMEs, MX
5. Custom domain entry in Railway must NOT be deleted until Phase 3 Step 3.6 prerequisites are ALL met
6. `railway domain rm` and `railway service delete` are FORBIDDEN except at gated Phase 3 Step 3.6

## Success Criteria

1. `curl -sI https://www.ramen-don.co.uk` returns HTTP 200 with valid TLS - no SEC_E_WRONG_PRINCIPAL
2. `openssl` shows DNS:www.ramen-don.co.uk in certificate SANs
3. Railway GraphQL query returns `certificates` array with >=1 entry, status `issued`
4. Railway HTTP logs show traffic routing via custom domain host header
5. No regression: `https://ramen-don-production.up.railway.app` still returns HTTP 200
6. No regression: GoDaddy SPF, MS365 TXT, Office 365 CNAME/MX records unchanged
7. Root cause documented as SSL cert provisioning delay after domain re-add

## Implementation Steps

---

### PHASE 0 - Pre-Verification Baseline (execute once, immediately)

**Step 0.1 - Record current state snapshot**

```bash
# 1. Railway cert status via GraphQL
railway graphql -p 114db40c-6367-4b70-b600-5d764e67ddd2 -e production \
  --query 'query { service(id: \"463a48df-7487-43c8-bf1a-158a13cae382\") { customDomains { edges { node { id domain certificates { issuedAt domain } dnsRecords { hostlabel requiredValue recordType } createdAt } } } } }'

# 2. Service health
curl -sI https://ramen-don-production.up.railway.app

# 3. DNS snapshot
nslookup -type=CNAME www.ramen-don.co.uk
nslookup -type=TXT ramen-don.co.uk

# 4. Current UTC timestamp
date -u +\"%Y-%m-%dT%H:%M:%SZ\"
```

**Step 0.2 - Confirm invariants intact**
- [ ] CNAME target is `q3lk4evq.up.railway.app`
- [ ] SPF TXT: `v=spf1 include:secureserver.net -all`
- [ ] MS365 TXT: `NETORGFT18898329.onmicrosoft.com`
- [ ] Service HTTP 200 on Railway domain
- If any invariant violated, ABORT and report to Orchestrator immediately.


### PHASE 1 - Wait-and-Monitor Loop (max 3 iterations, ~15 min each)

**Decision tree for the entire phase:**

```
START Phase 1
|
+-- Step 1.N: Query certificates array
|     |
|     +-- certs[] non-empty AND status=issued?
|     |     +-- GOTO Phase 2 (SUCCESS PATH)
|     |
|     +-- certs[] still empty?
|           |
|           +-- Elapsed < 1 hour since 18:29:07 UTC?
|           |     +-- Wait 15 min, loop to Step 1.N+1
|           |
|           +-- Elapsed 1-2 hours?
|           |     +-- Check Railway dashboard TXT verification status
|           |     |     +-- Verified (green checkmark)? -> Wait 15 min, loop
|           |     |     +-- Pending verification? -> GOTO Phase 3 (TXT path)
|           |     +-- Also: attempt domain reachability test with -k
|           |
|           +-- Elapsed > 2 hours AND still empty?
|                 +-- GOTO Phase 3 (FULL ESCALATION)
```

**Step 1.1 - First check (~35 min post-creation, ~19:00 UTC)**
```bash
railway graphql -p 114db40c-6367-4b70-b600-5d764e67ddd2 -e production   --query 'query { service(id: "463a48df-7487-43c8-bf1a-158a13cae382") { customDomains { edges { node { domain certificates { issuedAt domain } } } } } }'
```
- If `certificates` array has entries -> **jump to Phase 2 immediately**
- If empty -> calculate elapsed time from 18:29:07. If <1 hour, wait 15 min, proceed to 1.2

**Step 1.2 - Second check (~50 min, ~19:15 UTC)**
Repeat same GraphQL query.
- If certificates present -> **jump to Phase 2**
- If empty AND elapsed >=1 hour -> check Railway dashboard domain verification:
  Dashboard: cooperative-laughter -> ramen-don -> Settings -> Domains
  Record whether www.ramen-don.co.uk shows green checkmark (verified) or orange (pending).
- If verified but empty certs -> wait 15 min, proceed to 1.3
- If pending verification -> note for Phase 3

**Step 1.3 - Third check (~65 min, ~19:30 UTC)**
Repeat GraphQL query + attempt reachability:
```bash
curl -skI https://www.ramen-don.co.uk 2>&1
```
- If certificates present -> **jump to Phase 2**
- If empty AND elapsed >=2 hours -> **proceed to Phase 3**

---

### PHASE 2 - Success Verification (cert provisioned)

Execute only when certificates[] is confirmed non-empty.

**Step 2.1 - SSL handshake verification**
```bash
curl -sI https://www.ramen-don.co.uk
```
Expected: HTTP 200 or 3xx, no SSL errors. No -k flag.

**Step 2.2 - Certificate SAN verification**
```bash
openssl s_client -connect www.ramen-don.co.uk:443 -servername www.ramen-don.co.uk </dev/null 2>/dev/null | openssl x509 -noout -text | grep -A1 "Subject Alternative Name"
```
Expected: DNS:www.ramen-don.co.uk in output.

**Step 2.3 - Certificate expiry check**
```bash
echo | openssl s_client -connect www.ramen-don.co.uk:443 -servername www.ramen-don.co.uk 2>/dev/null | openssl x509 -noout -dates
```
Expected: notAfter ~90 days in future (Let's Encrypt standard).

**Step 2.4 - Service reachability via custom domain**
```bash
railway logs --http --filter @host:www.ramen-don.co.uk --lines 5
```
Expected: >=1 HTTP log line (edge->service routing confirmed).

**Step 2.5 - Regression check**
```bash
curl -sI https://ramen-don-production.up.railway.app
```
Expected: HTTP 200 unchanged.

**Step 2.6 - Browser manual verification** (human action - instruct user)
Navigate to https://www.ramen-don.co.uk. Confirm: no SSL warning, padlock icon, page loads.

**Step 2.7 - HSTS/bad-cert cache clearing** (human action - instruct user)
- Chrome: chrome://net-internals/#hsts -> Delete domain security policies for ramen-don.co.uk
- Firefox: Clear recent history (last hour) or Private Window
- Safari: Preferences -> Privacy -> Manage Website Data -> search ramen-don -> Remove

---

### PHASE 3 - Escalation (cert NOT provisioned after 2+ hours)

Execute only if certificates[] still empty AND >=2 hours elapsed since 18:29:07 UTC.

**Step 3.1 - Check Railway dashboard domain verification status**
Railway Dashboard -> cooperative-laughter -> ramen-don -> Settings -> Domains
- Green checkmark = verified, cert delayed -> skip to Step 3.4
- Pending/Orange = verification incomplete -> proceed to Step 3.2

**Step 3.2 - Check GoDaddy DNS for missing Railway TXT verification record**
```bash
curl -s "https://api.godaddy.com/v1/domains/ramen-don.co.uk/records"   -H "Authorization: sso-key <GODADDY_API_KEY>:<GODADDY_API_SECRET>"
```
Look for TXT record matching `railway-verification*` pattern. If missing, get required TXT value from Railway dashboard.

**Step 3.3 - Add Railway TXT verification record at GoDaddy (if needed)**
```bash
# PATCH appends to existing records - does NOT overwrite SPF/MS365 TXT records
curl -s -X PATCH "https://api.godaddy.com/v1/domains/ramen-don.co.uk/records"   -H "Authorization: sso-key <KEY>:<SECRET>"   -H "Content-Type: application/json"   -d '[{"type":"TXT","name":"@","data":"<VERIFICATION_VALUE>","ttl":600}]'
```
CRITICAL: PATCH appends; does not replace. SPF, MS365, Office 365 records are safe.
Alternative safer approach: use specific-record endpoint PUT if API version uses replace-all.

**Step 3.4 - Wait + re-query after DNS propagation**
Wait 15 minutes, then:
```bash
nslookup -type=TXT ramen-don.co.uk
railway graphql -p 114db40c-6367-4b70-b600-5d764e67ddd2 -e production   --query 'query { service(id: "463a48df-7487-43c8-bf1a-158a13cae382") { customDomains { edges { node { domain certificates { issuedAt domain } } } } } }'
```
- If certificates present -> jump to Phase 2
- If still empty -> proceed to Step 3.5

**Step 3.5 - Check Let's Encrypt rate limit status**
```bash
curl -s "https://crt.sh/?q=%25.ramen-don.co.uk&output=json" | python3 -c "
import json, sys
certs = json.load(sys.stdin)
print(f'Total cert entries: {len(certs)}')
weeks_certs = [c for c in certs if c.get('not_before','') > '2026-05-19']
print(f'Issued in last 7 days: {len(weeks_certs)}')
for c in weeks_certs[:10]:
    print(f'  {c[\"not_before\"]} | {c[\"issuer_name\"]}')
"
```
- If 5+ certs in last 7 days -> rate limit hit. STOP all domain ops. Domain blocked up to 7 days.
- If <5 certs -> rate limit NOT hit. Proceed to Step 3.6.

**Step 3.6 - LAST RESORT: Remove and re-add domain**

GATE CHECK - ALL must be true:
- [ ] >=3 hours elapsed since 18:29:07 UTC
- [ ] Let's Encrypt rate limit confirmed NOT hit (Step 3.5)
- [ ] Railway TXT verification record confirmed in place at GoDaddy (if applicable)
- [ ] User explicitly approved this action (document in Execution Report)

```bash
# 1. Get domain ID
railway graphql -p 114db40c-6367-4b70-b600-5d764e67ddd2 -e production   --query 'query { service(id: "463a48df-7487-43c8-bf1a-158a13cae382") { customDomains { edges { node { id domain } } } } }'

# 2. Remove domain via GraphQL mutation
curl -X POST "https://backboard.railway.com/graphql/v2"   -H "Authorization: Bearer <RAILWAY_TOKEN>"   -H "Content-Type: application/json"   -d '{"query":"mutation { customDomainDelete(id: \"<DOMAIN_ID>\") }"}'

# 3. Wait 5 minutes (cooldown)

# 4. Re-add domain
curl -X POST "https://backboard.railway.com/graphql/v2"   -H "Authorization: Bearer <RAILWAY_TOKEN>"   -H "Content-Type: application/json"   -d '{"query":"mutation { customDomainCreate(input: { domain: \"www.ramen-don.co.uk\", environmentId: \"5752ba83-e593-453d-a171-ca46b0e5c288\", projectId: \"114db40c-6367-4b70-b600-5d764e67ddd2\", serviceId: \"463a48df-7487-43c8-bf1a-158a13cae382\" }) { id domain status { dnsRecords { hostlabel requiredValue recordType } } } }"}'

# 5. Record new createdAt timestamp, restart monitoring from Phase 1
```
ROLLBACK: If re-add fails or rate limit hits, stop all domain ops. Engage Railway support.

**Step 3.7 - Railway support escalation (final fallback)**
Open ticket at https://help.railway.com with:
- Service ID: 463a48df-7487-43c8-bf1a-158a13cae382
- Environment ID: 5752ba83-e593-453d-a171-ca46b0e5c288
- Domain: www.ramen-don.co.uk
- Timeline: domain created 18:29:07 UTC, certs[] empty as of [current time]
- DNS: CNAME confirmed correct -> q3lk4evq.up.railway.app
- Steps attempted: which of 3.1-3.6 executed and results

---

### PHASE 4 - Apex Domain (ramen-don.co.uk) Configuration

Current state: ramen-don.co.uk A-records -> GoDaddy parked IPs (3.33.251.168, 15.197.225.128). Visitors see GoDaddy parked page, not Ramen Don site.

Constraint: .co.uk TLD does NOT support CNAME at apex. Railway needs CNAME for domain verification.

**Step 4.1 - Recommended: GoDaddy Domain Forwarding**
GoDaddy Domain Portfolio -> ramen-don.co.uk -> Forwarding:
- Forward to: https://www.ramen-don.co.uk
- Type: 301 (Permanent)
- Forward with masking: OFF

This is the wiki-recommended approach. Zero cost, no Railway custom domain slot consumed.

**Step 4.2 - Alternative: Railway second custom domain**
Add ramen-don.co.uk as 2nd custom domain in Railway (consumes slot 2/2 on Hobby Plan). Same procedure as www domain, but apex likely requires A records since CNAME unsupported.

**Step 4.3 - Execute chosen option**
This step is independent of SSL fix for www. Can run in parallel or deferred. Requires GoDaddy access - may need user action.

---

### PHASE 5 - Deployment Stability Flag

3 FAILED deployments are build errors unrelated to SSL. Running service (deploy ee02aa78) is healthy, but any new code deploy will fail until routes are fixed.

| Deployment | Time (UTC+1) | Error |
|---|---|---|
| 39479b69 | 17:12:58 | Failed to collect page data for /api/booking/confirm |
| b23eec97 | 17:33:26 | Failed to collect page data for /api/admin/bookings/email-jobs |
| 7e61cc44 | 17:35:57 | Failed to collect page data for /api/booking/confirm |

Root cause insight (from project wiki): Missing RESEND_API_KEY env var is a known cause of build failures in /api/booking/confirm. Next.js build collects page data for static generation; these routes call APIs that fail without proper config.

**Step 5.1 - Verify RESEND_API_KEY is set**
```bash
railway variables list -s ramen-don -p 114db40c-6367-4b70-b600-5d764e67ddd2 -e production | grep RESEND
```
If missing -> this is the primary fix.

**Step 5.2 - Flag for separate NenFlow run**
Build errors in booking/confirm and email-jobs routes prevent successful deployments. Fix needed before any code changes can go live. Likely causes: missing RESEND_API_KEY, unguarded Supabase queries during build, or SSR-dependent code in statically-analyzed paths.

**Step 5.3 - Emergency workaround for urgent deploys**
- Add `export const dynamic = 'force-dynamic'` to affected route files to skip static generation
- Or temporarily set RESEND_API_KEY to a placeholder value

---

## Handoff Notes

### Key Reference Table

| Item | Value |
|------|-------|
| Railway Project ID | 114db40c-6367-4b70-b600-5d764e67ddd2 |
| Railway Service ID | 463a48df-7487-43c8-bf1a-158a13cae382 |
| Railway Environment ID | 5752ba83-e593-453d-a171-ca46b0e5c288 |
| Service name | ramen-don (project: cooperative-laughter) |
| Environment | production |
| Domain created at | 2026-05-26T18:29:07.515Z |
| CNAME target | q3lk4evq.up.railway.app |
| Railway service URL | https://ramen-don-production.up.railway.app |
| Railway GraphQL endpoint | https://backboard.railway.com/graphql/v2 |
| GoDaddy API base | https://api.godaddy.com/v1 |
| GoDaddy nameservers | ns35/ns36.domaincontrol.com |
| Let's Encrypt rate limit | 5 duplicate certs/week per domain |
| Max custom domains (Hobby) | 2 (currently using 1) |
| Railway CLI path | C:/Users/doner/AppData/Roaming/npm/railway (v4.40.0) |
| Railway auth token | ~/.railway/config.json -> user.accessToken |

### Critical Constraints (Executor must uphold)

1. FORBIDDEN until Phase 3.6 gate: railway domain rm, GraphQL customDomainDelete, any domain delete
2. Never modify these GoDaddy records: SPF TXT, MS365 TXT, Office 365 CNAMEs (autodiscover, email, sip, msoid, lyncdiscover), MX
3. Never delete the Railway service - domain binding tied to it
4. All GraphQL queries in Phases 0-2 are read-only - no mutations
5. PATCH not PUT when adding TXT to GoDaddy - PATCH appends, PUT replaces all

### Runtime Unknowns (Executor to resolve)

1. Does the Executor have GoDaddy API credentials? (Check user-provided key/secret or env vars)
2. Is the Railway CLI authenticated? (railway whoami)
3. What is the exact Railway TXT verification value if needed? (Only visible in Railway dashboard, not in standard customDomains query)
4. Is RESEND_API_KEY environment variable present? (Explains build failures - check Phase 5)

### Decisions Made

1. Primary strategy: Wait-and-monitor (Phase 1, 3 iterations x 15 min = 45 min). Lowest risk given 95% confidence cert is provisioning.
2. No preemptive TXT addition: Railway API shows no TXT requirement in dnsRecords. Only add if dashboard shows pending verification.
3. Deployment errors separated: Build errors are independent of SSL. Flagged for separate NenFlow run.
4. Apex domain deferred: Options presented to user (Phase 4), not auto-executed.

### Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Let's Encrypt rate limit partially consumed | Low (15%) | High (7-day block) | crt.sh check before re-add (Step 3.5) |
| Railway TXT verification hidden from API | Low (15%) | Medium (stalled provisioning) | Dashboard check (Steps 1.2, 3.1) |
| GoDaddy DNS propagation delay after TXT add | Medium (40%) | Low (extra wait) | 15 min wait built in (Step 3.4) |
| Browser HSTS pinning stale cert error | Medium (50%) | Low (user confusion) | Browser cache clear (Step 2.7) |
| RESEND_API_KEY missing (build errors) | High (70%) | Medium (blocks deploys) | Phase 5 verification + separate run flag |

### Artifact Chain

INTAKE (ATT_0) -> RESEARCH (ATT_1) -> PLAN (ATT_2 - this file) -> EXECUTION (ATT_3, by Executor)
