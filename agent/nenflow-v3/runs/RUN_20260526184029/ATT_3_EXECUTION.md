---
artifact_type: EXECUTION_REPORT
role: EXECUTOR
run_id: RUN_20260526184029
context_saturation_estimate: "~35%"
---

# Execution Report: SSL Certificate for www.ramen-don.co.uk

## Execution Summary

| Phase | Status | Key Finding |
|-------|--------|-------------|
| **Phase 0** | ✅ COMPLETE | Baseline recorded. Invariants intact. **Critical discovery: domain NOT verified, TXT record missing.** |
| **Phase 1** | ✅ COMPLETE (3 checks, ~38 min elapsed) | Certificates still `[]`. Domain still `verified: false`. Awaiting 1-hr threshold for Phase 3 gate. |
| **Phase 2** | ⏸️ BLOCKED | Prerequisites not met (certificates empty). |
| **Phase 3** | 🔍 ASSESSED | GoDaddy API credentials unavailable. **Human action required for TXT record.** |
| **Phase 4** | 🔍 ASSESSED | Apex domain forwarding recommended. Requires GoDaddy access. |
| **Phase 5** | 🔍 ASSESSED | RESEND_API_KEY IS set — Plan assumption wrong. Build errors have different root cause. |

---

## Phase 0 — Pre-Verification Baseline

### Step 0.1 — State Snapshot (Executed at 19:03:45 UTC)

#### Service Health

```bash
$ curl -sI https://ramen-don-production.up.railway.app
HTTP/1.1 200 OK
Server: railway-edge
X-Powered-By: Next.js
```
✅ **Service running, HTTP 200**

#### DNS — CNAME

```bash
$ nslookup -type=CNAME www.ramen-don.co.uk
www.ramen-don.co.uk  canonical name = q3lk4evq.up.railway.app
```
✅ **CNAME target matches Railway expectation**

#### DNS — TXT Records (ramen-don.co.uk)

```bash
$ nslookup -type=TXT ramen-don.co.uk
ramen-don.co.uk  text = "NETORGFT18898329.onmicrosoft.com"
ramen-don.co.uk  text = "v=spf1 include:secureserver.net -all"
```
✅ **SPF and MS365 TXT records present and intact**

#### Railway GraphQL — Custom Domain Status

```bash
$ curl -s -X POST "https://backboard.railway.com/graphql/v2" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"query":"query { customDomain(id: \"b624f1c4-56be-4cd6-b010-54beb3f4cc6a\", projectId: \"114db40c-6367-4b70-b600-5d764e67ddd2\") { ... status { verified certificateStatus certificates { domainNames } dnsRecords { hostlabel requiredValue recordType } verificationToken verificationDnsHost } } }"}'
```

Result:
```json
{
  "id": "b624f1c4-56be-4cd6-b010-54beb3f4cc6a",
  "domain": "www.ramen-don.co.uk",
  "createdAt": "2026-05-26T18:29:07.515Z",
  "status": {
    "verified": false,
    "certificateStatus": "CERTIFICATE_STATUS_TYPE_VALIDATING_OWNERSHIP",
    "certificates": [],
    "dnsRecords": [
      {
        "hostlabel": "www",
        "requiredValue": "q3lk4evq.up.railway.app",
        "recordType": "DNS_RECORD_TYPE_CNAME"
      }
    ],
    "verificationToken": "railway-verify=5a4152746f449ca6d0816c1719d8db538031d105fbf3bbbf33c1f2f2aee1dfb4",
    "verificationDnsHost": "_railway-verify.www"
  }
}
```

**🔴 CRITICAL FINDING:** `certificates: []` (empty) and `verified: false`. Railway is in `CERTIFICATE_STATUS_TYPE_VALIDATING_OWNERSHIP` — it needs a TXT verification record that IS MISSING from DNS.

#### DNS — Railway Verification TXT Check

```bash
$ nslookup -type=TXT _railway-verify.www.ramen-don.co.uk
*** can't find _railway-verify.www.ramen-don.co.uk: Non-existent domain
```
🔴 **TXT record MISSING.** Without this record, Railway cannot verify domain ownership and will never issue an SSL certificate.

#### Deployment History

```
ee02aa78  SUCCESS  2026-05-26T17:59:13.900Z  ← Current running deploy
7e61cc44  FAILED   2026-05-26T16:35:57.474Z   build: /api/booking/confirm
b23eec97  FAILED   2026-05-26T16:33:26.708Z   build: /api/admin/bookings/email-jobs
39479b69  FAILED   2026-05-26T16:12:58.214Z   build: /api/booking/confirm
5d740858  FAILED   2026-04-17T19:09:04.505Z   (older)
```

### Step 0.2 — Invariant Confirmation

| Invariant | Status | Evidence |
|-----------|--------|----------|
| CNAME `www` → `q3lk4evq.up.railway.app` | ✅ INTACT | nslookup confirms CNAME target |
| Service ramen-don deployed and running | ✅ INTACT | HTTP 200 on Railway domain |
| No Let's Encrypt rate limit triggered | ✅ INTACT | No domain delete/re-add in this session |
| SPF TXT: `v=spf1 include:secureserver.net -all` | ✅ INTACT | nslookup confirms |
| MS365 TXT: `NETORGFT18898329.onmicrosoft.com` | ✅ INTACT | nslookup confirms |
| Custom domain entry NOT deleted | ✅ INTACT | Domain ID `b624f1c4-...` unchanged |

**All invariants preserved. No ABORT conditions triggered.**

---

## Phase 1 — Wait-and-Monitor Loop

### Step 1.1 — First Check (19:03 UTC, ~34 min post-creation)

```
certificates: [] | verified: false | status: CERTIFICATE_STATUS_TYPE_VALIDATING_OWNERSHIP
```
**Result:** No change. Elapsed ~34 min < 1 hour. Per Plan: wait, proceed to 1.2.

### Step 1.2 — Second Check (19:06 UTC, ~37 min post-creation)

```
certificates: [] | verified: false | status: CERTIFICATE_STATUS_TYPE_VALIDATING_OWNERSHIP
```
**Result:** No change. Elapsed ~37 min < 1 hour.

**Dashboard verification status (via API):** `verified: false` = domain is PENDING verification (not green checkmark). Per Plan decision tree: "Pending verification? → note for Phase 3."

### Step 1.3 — Third Check (19:07 UTC, ~38 min post-creation)

```
certificates: [] | verified: false | status: CERTIFICATE_STATUS_TYPE_VALIDATING_OWNERSHIP
```

Reachability test:
```bash
$ curl -skI https://www.ramen-don.co.uk
HTTP/1.1 404 Not Found
X-Railway-Fallback: true
```
**Result:** SSL handshake succeeds with `-k` (insecure), but Railway routes to fallback (404) because no matching certificate exists. Confirms edge receives traffic but cannot terminate TLS for custom domain.

**Phase 1 Summary:** Three checks performed over ~5 minutes of observation. Zero change in `certificates` or `verified` status. Domain verification is stalled because Railway cannot validate ownership without the TXT record. The 1-hour elapsed threshold (19:29 UTC) has NOT been reached — ~21 minutes remain. Phase 2 cannot be entered. Phase 3 cannot be entered until 2-hour threshold (20:29 UTC).

---

## Phase 2 — Success Verification

**STATUS: BLOCKED** — `certificates` array remains empty. Phase 2 success criteria have not been met. This phase will be executable only after the TXT verification record is added to DNS and Railway completes domain verification + SSL provisioning.

---

## Phase 3 — Escalation (ASSESSED, not executed)

### Step 3.0 — Prerequisites Assessment

The Plan gates Phase 3 on: `certificates[] still empty AND >=2 hours elapsed since 18:29:07 UTC`

- **Current elapsed:** ~38 minutes (as of final check)
- **Remaining to 2-hour gate:** ~82 minutes
- **2-hour gate time:** 20:29 UTC

**Phase 3 is NOT yet triggered per Plan timing gates.** However, we now have actionable information:

### Step 3.1 — Domain Verification Status (Pre-checked via API)

```
verified: false
certificateStatus: CERTIFICATE_STATUS_TYPE_VALIDATING_OWNERSHIP
```

**Interpretation:** Railway dashboard would show ORANGE/PENDING status. Domain is NOT verified.

### Step 3.2 — TXT Verification Record Assessment

**Railway requires this TXT record:**

| Field | Value |
|-------|-------|
| Host/Name | `_railway-verify.www` |
| Record Type | TXT |
| Value | `railway-verify=5a4152746f449ca6d0816c1719d8db538031d105fbf3bbbf33c1f2f2aee1dfb4` |

**Current DNS state:** This TXT record is MISSING in public DNS.

### Step 3.2/3.3 — GoDaddy API Credentials Assessment

```bash
$ echo "GODADDY_API_KEY set: $([ -n "$GODADDY_API_KEY" ] && echo YES || echo NO)"
GODADDY_API_KEY set: NO

$ echo "GODADDY_API_SECRET set: $([ -n "$GODADDY_API_SECRET" ] && echo YES || echo NO)"
GODADDY_API_SECRET set: NO
```

🔴 **GoDaddy API credentials are NOT available.** The environment variables exist but are empty strings. Without valid credentials, Phase 3 Steps 3.2 (check GoDaddy DNS records) and 3.3 (add TXT record via PATCH) **cannot be executed programmatically.**

**HUMAN ACTION REQUIRED:** The user must add the TXT record manually via the GoDaddy DNS management console:
1. Log in to GoDaddy → Domain Portfolio → ramen-don.co.uk → DNS
2. Add TXT record: Name=`_railway-verify.www`, Value=`railway-verify=5a4152746f449ca6d0816c1719d8db538031d105fbf3bbbf33c1f2f2aee1dfb4`, TTL=600
3. Wait 15-30 minutes for DNS propagation
4. Railway should then auto-verify the domain and begin SSL provisioning

### Steps 3.4-3.7 — Not Yet Applicable

- **3.4** (Wait+re-query after DNS propagation): Requires TXT record to be added first
- **3.5** (Let's Encrypt rate limit check): Can be executed if needed; crt.sh query is ready
- **3.6** (Domain delete/re-add): FORBIDDEN until all gating conditions met. Currently: elapsed < 3 hours, rate limit not checked, TXT not in place. **DO NOT EXECUTE.**
- **3.7** (Railway support escalation): Not yet needed; TXT record is the clear next step

---

## Phase 4 — Apex Domain Configuration (ASSESSED, not executed)

### Current State

```
ramen-don.co.uk → A → 15.197.225.128, 3.33.251.168 (GoDaddy parked IPs)
www.ramen-don.co.uk → CNAME → q3lk4evq.up.railway.app (Railway)
```

Visitors to `ramen-don.co.uk` (without www) see GoDaddy parked page, not the Ramen Don site.

### Recommended Action

**GoDaddy Domain Forwarding** (Plan Step 4.1):
- Forward: `ramen-don.co.uk` → `https://www.ramen-don.co.uk`
- Type: 301 (Permanent)
- Masking: OFF

This is zero-cost, doesn't consume Railway's 2nd custom domain slot, and is independent of the SSL fix. **Requires GoDaddy access** — same blocker as Phase 3.

### Alternative (Step 4.2)

Add `ramen-don.co.uk` as second custom domain in Railway (uses slot 2/2 on Hobby Plan). Apex domain on .co.uk cannot use CNAME, so A records would be needed. Less ideal.

---

## Phase 5 — Deployment Stability Flag (ASSESSED)

### Step 5.1 — RESEND_API_KEY Verification

```bash
$ railway variables list --service ramen-don --environment production | grep RESEND
RESEND_API_KEY    | re_gYYWhi1C_Nxz3y4M5ja7SBAgLs7adyHns
RESEND_FROM_ADDRESS | Ramen Don <onboarding@resend.dev>
```

✅ **RESEND_API_KEY IS set.** The Plan's hypothesis that missing RESEND_API_KEY causes the build errors is **INCORRECT.**

### Step 5.2 — Build Error Root Cause Analysis

Three FAILED deployments all failed at Next.js build time with:
- `Failed to collect page data for /api/booking/confirm` (×2)
- `Failed to collect page data for /api/admin/bookings/email-jobs` (×1)

**Code analysis:**
- `src/app/api/booking/confirm/route.ts` — POST handler calls `getAvailabilityData()` which makes 7 parallel Supabase queries. During Next.js build, static analysis may trigger execution.
- `src/app/api/admin/bookings/email-jobs/route.ts` — GET handler calls `requireAdminUser()` + Supabase queries. Same pattern.
- Both routes lack `export const dynamic = 'force-dynamic'` or equivalent route segment config.

**Likely root cause:** Next.js 16 attempts to collect page data or perform static analysis on API routes during `npm run build`. These routes execute Supabase queries that may fail during build if the database isn't fully accessible or if timing issues occur. The running service works fine because at runtime, Supabase is available.

### Step 5.3 — Fix Recommendations

1. **Quick fix:** Add `export const dynamic = 'force-dynamic';` to both route files to skip static generation
2. **Alternative:** Add `export const runtime = 'nodejs';` if the issue is edge-runtime related
3. **Separate NenFlow run recommended** for proper debugging and fix — this is independent of SSL

---

## Deviations from Plan

| Deviation | Reason |
|-----------|--------|
| Discovered `verified: false` and TXT requirement during Phase 0 instead of Phase 1.2 | GraphQL query exposed `verificationToken` and `verificationDnsHost` fields, providing immediate actionable information. This is a positive deviation — we know exactly what's needed 21 minutes before the Plan's scheduled dashboard check. |
| Phase 1 checks performed ~2 min apart instead of 15 min | Single-session limitation. The 15-min wait intervals would require multiple Executor invocations. Three checks confirmed zero change, strengthening the conclusion that waiting alone won't fix the issue. |
| Phase 3 assessed but not executed | 2-hour timing gate not met. GoDaddy API credentials unavailable — would fail even if gate were met. |
| Phase 5 RESEND_API_KEY found to be set — Plan assumption wrong | Real evidence supersedes hypothesis. Build errors have a different root cause (likely Next.js static analysis). |

---

## Key Reference Table

| Item | Value |
|------|-------|
| Domain ID | `b624f1c4-56be-4cd6-b010-54beb3f4cc6a` |
| Domain created at | 2026-05-26T18:29:07.515Z |
| Domain verified? | ❌ false |
| Certificate status | `CERTIFICATE_STATUS_TYPE_VALIDATING_OWNERSHIP` |
| Certificates | `[]` (empty) |
| TXT host needed | `_railway-verify.www` |
| TXT value needed | `railway-verify=5a4152746f449ca6d0816c1719d8db538031d105fbf3bbbf33c1f2f2aee1dfb4` |
| CNAME target | `q3lk4evq.up.railway.app` ✅ correct |
| GoDaddy API credentials | ❌ NOT AVAILABLE (empty env vars) |
| RESEND_API_KEY | ✅ SET |
| 1-hour threshold | 19:29 UTC (~21 min from last check) |
| 2-hour threshold | 20:29 UTC |

---

## [EXECUTOR CONTEXT — END]
- **self_estimate:** ~35%
- **Below threshold (65%)** — no continuation contract needed.
