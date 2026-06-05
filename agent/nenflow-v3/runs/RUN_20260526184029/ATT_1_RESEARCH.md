---
artifact_type: RESEARCH
role: RESEARCHER
run_id: RUN_20260526184029
context_saturation_estimate: ~18%
---

# Research: SSL Certificate Misconfiguration -- www.ramen-don.co.uk

## Investigation Scope

Per INTAKE: Investigate SSL cert misconfiguration on www.ramen-don.co.uk (ERR_CERT_COMMON_NAME_INVALID) -- Railway-hosted Next.js site, GoDaddy DNS. All seven INTAKE investigation points addressed below.

---

## Key Finding: SSL Certificate Has NOT Been Provisioned (95% confidence)

**This is the primary root cause.** The certificates array for www.ramen-don.co.uk is **empty**. Without a provisioned SSL certificate, Railway edge proxy cannot present a certificate matching the custom domain, so it falls back to the *.up.railway.app wildcard.

### Evidence Chain

#### A. Railway GraphQL API -- certificates: []

Query returned:
- domain: www.ramen-don.co.uk
- dnsRecords: [{hostlabel: www, requiredValue: q3lk4evq.up.railway.app}]
- certificates: []  <-- EMPTY -- no SSL certificate provisioned
- createdAt: 2026-05-26T18:29:07.515Z  <-- Created only ~16 min before investigation
- updatedAt: 2026-05-26T18:29:08.123Z

#### B. openssl Certificate Inspection

- www.ramen-don.co.uk:443 -- Certificate: CN=*.up.railway.app, SAN: DNS:*.up.railway.app only (Issuer: Lets Encrypt R12, Apr 5-Jul 4 2026). No ramen-don.co.uk in SANs.
- ramen-don-production.up.railway.app:443 -- Certificate: CN=*.up.railway.app, SAN: DNS:*.up.railway.app (Issuer: Lets Encrypt E7, May 4-Aug 2 2026). Valid, service returns HTTP 200.
- q3lk4evq.up.railway.app:443 -- Same *.up.railway.app cert; HTTP 404.

#### C. Edge Routing Behavior (curl with Host header)

curl -sI https://www.ramen-don.co.uk -> SEC_E_WRONG_PRINCIPAL (SSL verification fails)

curl -sI https://ramen-don-production.up.railway.app -> HTTP 200 (service healthy, SSL passes)

curl -sI -H "Host: www.ramen-don.co.uk" https://ramen-don-production.up.railway.app -> HTTP 404, X-Railway-Fallback: true

curl -sI -H "Host: www.ramen-don.co.uk" https://q3lk4evq.up.railway.app -> HTTP 404, X-Railway-Fallback: true

**Interpretation:** Railway edge receives traffic for www.ramen-don.co.uk but cannot present a matching certificate (none exists), so it presents the fallback *.up.railway.app cert (causing the browser error) and routes into fallback mode (404). The service itself is healthy.

#### D. No HTTP Logs for Custom Domain

railway logs --http --filter @host:www.ramen-don.co.uk returns no output. Traffic with Host: www.ramen-don.co.uk never reaches the service -- Railway edge rejects it before logging.


---

## Finding 2: Railway-Provided Domain Works Correctly

https://ramen-don-production.up.railway.app returns HTTP 200 with valid SSL. Service is deployed and functional. Recent HTTP logs show normal traffic (GET /, GET /menu, POST /api/booking/confirm, all 200).

---

## Finding 3: FAILED Deployments -- Build Errors, NOT Domain/SSL Related

| Deployment ID | Status | Time (UTC+1) | Error |
|---|---|---|---|
| 39479b69 | FAILED | 17:12:58 | Failed to collect page data for /api/booking/confirm |
| b23eec97 | FAILED | 17:33:26 | Failed to collect page data for /api/admin/bookings/email-jobs |
| 7e61cc44 | FAILED | 17:35:57 | Failed to collect page data for /api/booking/confirm |

All three failed at the **Next.js npm run build** stage -- code-level build errors in route handlers. **None involved domain or SSL configuration.** These are separate issues in the application code (likely database connection or missing data during static generation).

The 4 REMOVED deployments (17:39-18:01) were clean container stops (SIGTERM). The SUCCESS deployment (ee02aa78, 17:59:13) shows a normal Next.js 16.2.3 build and start.

---

## Finding 4: Domain Was Freshly (Re-)Added -- Timeline

- 17:12:58  FIRST FAILED     -- build error (/api/booking/confirm)
- 17:33:26  SECOND FAILED    -- build error (/api/admin/bookings/email-jobs)
- 17:35:57  THIRD FAILED     -- build error (/api/booking/confirm)
- 17:39:51  REMOVED          -- clean removal
- 17:40:25  REMOVED          -- clean removal
- 17:40:47  REMOVED          -- clean removal
- 17:59:13  SUCCESS          -- latest healthy deploy (ee02aa78)
- 18:01:52  REMOVED          -- clean removal
- 18:29:07  DOMAIN CREATED   -- www.ramen-don.co.uk (re-)added to Railway (per createdAt timestamp)
- 18:45~    INVESTIGATION    -- certificates array still empty (~16 min since creation)

**Key insight:** Domain was created at 18:29:07 UTC. At investigation time (~18:45 UTC), only ~16 minutes elapsed. Railway docs: SSL provisioning typically within 1 hour, can take up to 72 hours. Waiting is expected.

GoDaddy DNS CNAME already pointed to q3lk4evq.up.railway.app before the 18:29 creation -- suggesting the domain was previously configured, deleted during deployment turbulence, and re-added (Railway preserved same CNAME target).


---

## Finding 5: DNS Configuration Matches Railway Expectations

### Public DNS Records
- www.ramen-don.co.uk -> CNAME -> q3lk4evq.up.railway.app (MATCHES Railway expected value)
- ramen-don.co.uk -> A -> 15.197.225.128, 3.33.251.168 (GoDaddy parked IPs)
- ramen-don.co.uk -> TXT -> v=spf1 include:secureserver.net -all (SPF)
- ramen-don.co.uk -> TXT -> NETORGFT18898329.onmicrosoft.com (MS365 verification)
- No Railway verification TXT record visible in public DNS
- No CAA records detected (no blocking)
- SOA serial: 2026052610 (confirms DNS was updated today)
- Nameservers: ns35/ns36.domaincontrol.com (GoDaddy)

### Railway GraphQL: Required DNS Records
Railway API only shows the CNAME record as required -- no TXT verification record shown. Possible reasons: (a) TXT verification was already completed from a previous domain binding; (b) Railway no longer requires TXT verification for CNAME-based domains; or (c) TXT records are hidden from this API field once verification passes.

---

## Finding 6: GoDaddy DNS Configuration

DNS hosted on GoDaddy nameservers. CNAME www -> q3lk4evq.up.railway.app is correctly configured per Railway expectation. Apex points to GoDaddy parked IPs (not relevant to www SSL). SPF and MS365 TXT records are unrelated and must be preserved (per invariants).

---

## Finding 7: SSL Certificate Chain Details

www.ramen-don.co.uk:443 presents:
- Subject: CN=*.up.railway.app
- SAN: DNS:*.up.railway.app (only)
- Issuer: Lets Encrypt R12
- Valid: Apr 5 to Jul 4 2026
- Key: RSA 4096-bit

This is Railway edge wildcard fallback -- not a misconfigured custom certificate for ramen-don.

---

## Updated Probability Ranking

| # | Hypothesis | Before | After | Reasoning |
|---|-----------|--------|-------|-----------|
| 1 | SSL cert still provisioning | ~40% | 95% | certificates: [] confirmed; domain created 16 min ago; docs say within 1 hour |
| 2 | Missing Railway TXT verification | ~30% | 15% | API shows no TXT requirement in dnsRecords; CNAME matches; likely just waiting |
| 3 | Lets Encrypt rate limit | ~20% | 3% | Domain created only once today; 5/week limit unlikely triggered |
| 4 | DNS propagation delay | ~10% | 0% | DNS resolves correctly -- eliminated |


---

## Constraints Identified (beyond INTAKE)

1. **Do NOT delete/re-add domain again.** certificates array is empty; a second re-add would restart the provisioning timer and risk Lets Encrypt rate limit (5/week).
2. **Build errors in Next.js are unrelated but block deployment.** The api/booking/confirm and api/admin/bookings/email-jobs routes fail during next build. These must be fixed before next code deploy but do NOT affect current running service.
3. **Railway Hobby Plan** -- confirmed via GraphQL. Max 2 custom domains per service; currently using 1.
4. **Redeploying will NOT fix SSL.** SSL provisioning happens at the Railway edge layer independently of service deployments. A redeploy without code fixes would just create another FAILED deployment.

---

## Existing Patterns

### Railway Domain Lifecycle
Domain configured via railway dashboard/CLI -> Railway generates unique CNAME target (q3lk4evq.up.railway.app) -> User configures DNS CNAME (+ optionally TXT verification) -> Railway provisions SSL via Lets Encrypt -> Certificates appear in status.certificates -> Edge proxy uses certificate for TLS termination for custom domain.

### Current Service State
- Next.js 16.2.3 running on railway.internal network
- Service port: 8080 (standard Railway convention)
- Build system: Railpack (npm-based)
- GitHub repo: doner21/ramen-don

---

## Recommendations

### Immediate Action (NOW): WAIT

SSL provisioning for a newly added custom domain typically takes 15-60 minutes. At investigation time, only ~16 minutes had elapsed. Monitor via:

1. GraphQL API query to check certificates array
2. HTTP logs (will show traffic once cert is active): railway logs --http --filter @host:www.ramen-don.co.uk --lines 5

### If Certificates Still Empty After 1 Hour

1. Check Railway dashboard -> Service -> Settings -> Domains -> verify www.ramen-don.co.uk shows green checkmark (verified status)
2. If showing pending verification, a TXT record may be needed -- check Railway dashboard for the exact TXT record details
3. If showing verified but no cert after 2+ hours, contact Railway support

### After SSL Is Provisioned

1. Verify: curl -sI https://www.ramen-don.co.uk returns HTTP 200
2. Verify: openssl shows www.ramen-don.co.uk in SANs
3. Fix build errors in api/booking/confirm and api/admin/bookings/email-jobs (separate PLAN needed)
4. Optionally: Set up apex domain forwarding (ramen-don.co.uk -> www.ramen-don.co.uk)

### What NOT To Do

- Do NOT railway domain (re-add) -- resets provisioning, risks rate limit
- Do NOT delete and recreate the service -- domain binding would be lost
- Do NOT redeploy without fixing build errors -- will just create more FAILED deployments
- Do NOT change GoDaddy DNS -- CNAME is already correct

---

## Unknowns Remaining

1. **Was a TXT verification record ever configured at GoDaddy?** Public DNS shows none, and Railway API shows no TXT requirement. The Planner should verify in GoDaddy DNS management console.
2. **What caused the domain to be deleted and re-added?** Was this manual user action or an automated process? The Planner may want to check Railway audit logs or the user deployment history.
3. **Can the build errors be fixed without affecting SSL?** Yes -- code deploys and SSL provisioning are independent. But until build errors are fixed, the next code deploy will fail even though the running service (and SSL, once provisioned) will work fine.
4. **Is the Lets Encrypt rate limit cache clear?** The domain was only created once today. If it was previously deleted/re-added earlier in the week (e.g., during the Apr 15-20 deployment turbulence visible in deployment history), the 5/week limit could already be partially consumed. The Planner should proceed cautiously.
