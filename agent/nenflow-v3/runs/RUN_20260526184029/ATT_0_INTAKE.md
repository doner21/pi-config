---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260526184029
clarification_needed: false
recommended_next_step: RESEARCH
context_saturation_estimate: "~4%"
context_handoff_threshold_percent: 65
context_handoff_threshold_source: default
---

# Intake: SSL Certificate Misconfiguration — ramen-don.co.uk on Railway + GoDaddy

## Task Summary

User reports that visiting `https://www.ramen-don.co.uk` yields a browser security error:
`ERR_CERT_COMMON_NAME_INVALID`. The server presents an SSL certificate for `*.up.railway.app` instead of `www.ramen-don.co.uk`. The site is hosted on **Railway** (project: cooperative-laughter, service: ramen-don), with DNS managed via **GoDaddy**.

## Task Type

**Infrastructure debugging + resolution** — SSL certificate misconfiguration on a Railway-hosted Next.js site with a GoDaddy-managed custom domain.

## User Intent

1. Diagnose why the SSL certificate is wrong
2. Fix the issue so `https://www.ramen-don.co.uk` loads securely
3. Prevent recurrence

## Goal Attractor

`https://www.ramen-don.co.uk` serves content with a valid SSL certificate matching the domain name, with no browser security warnings.

## Evidence Collected (ORCHESTRATOR pre-intake)

### Railway State
- **Project**: cooperative-laughter (`114db40c-6367-4b70-b600-5d764e67ddd2`)
- **Service**: ramen-don (`463a48df-7487-43c8-bf1a-158a13cae382`)
- **Environment**: production
- **Source repo**: doner21/ramen-don
- **Latest deploy**: SUCCESS at 2026-05-26 17:59:13 UTC (~42 min ago)
- **Deployment turbulence**: 3 FAILED, 4 REMOVED, 1 SUCCESS in past 90 minutes
- **Custom domain configured**: `www.ramen-don.co.uk` ✓
- **Service domain**: `https://ramen-don-production.up.railway.app` ✓

### DNS State (via nslookup)
- `www.ramen-don.co.uk` → CNAME → `q3lk4evq.up.railway.app` → IP `66.33.22.119` (Railway) ✓
- `ramen-don.co.uk` (apex) → IP `3.33.251.168`, `15.197.225.128` (GoDaddy parked, NOT Railway) ⚠️
- TXT records: SPF for GoDaddy + Microsoft 365, **no visible Railway verification TXT record** ⚠️
- CAA records: None detected (no blocking) ✓

### Browser Evidence
- Navigate to `https://www.ramen-don.co.uk` → `ERR_CERT_COMMON_NAME_INVALID`
- Certificate presented: `*.up.railway.app` (not `www.ramen-don.co.uk`)
- This is the exact symptom documented in Railway's SSL troubleshooting guide under "Certificate Shows Wrong Domain"

### Railway Docs (consulted)
- SSL troubleshooting: https://docs.railway.com/networking/troubleshooting/ssl
  - Cert issuance typically completes within 1 hour, can take up to 72 hours
  - Missing TXT verification record prevents domain verification and SSL provisioning
  - ⚠️ Warns: "Avoid repeatedly deleting and re-adding your domain" (Let's Encrypt rate limit: 5 dup certs/week)
- Custom domains: https://docs.railway.com/networking/domains/working-with-domains
  - Both CNAME and TXT records are required; missing TXT → 404, not SSL error
  - Domain status should show green checkmark when verified

## Likely Root Causes (ordered by probability)

| # | Hypothesis | Evidence For | Evidence Against |
|---|-----------|-------------|-----------------|
| 1 | **SSL cert still provisioning** — domain re-added recently during failed deploy cycle; Let's Encrypt hasn't completed issuance yet | Latest SUCCESS deploy only 42 min old; Railway docs say "typically within 1 hour"; recent deploy turbulence suggests domain may have been re-added | Domain may have been configured for longer |
| 2 | **Missing/incorrect Railway TXT verification record** — GoDaddy DNS lacks the TXT record Railway requires for domain ownership proof | No Railway verification TXT visible in public DNS; Railway docs say both CNAME + TXT required; without TXT, SSL provisioning can stall | Domain routing works (CNAME resolves correctly), suggesting domain was verified at some point |
| 3 | **Let's Encrypt rate limit hit** — domain was deleted/re-added >5 times during failed deploy troubleshooting | 3 FAILED + 4 REMOVED deployments in 90 min is turbulent; Railway docs warn about the 5/week limit | Unknown if domain was actually deleted/re-added vs just redeployed |
| 4 | **GoDaddy DNS propagation delay** — DNS changes not fully propagated | DNS for www.ramen-don.co.uk resolves correctly to Railway from our test location | DNS resolution tested OK |

## Ambiguities

1. **Was the domain recently deleted and re-added in Railway?** The deployment turbulence (3 FAILED, 4 REMOVED) suggests instability. Need to check if the custom domain binding itself was touched.
2. **Does GoDaddy have the Railway TXT verification record?** Our nslookup showed no Railway TXT. Need to verify via GoDaddy DNS management directly.
3. **What is the actual SSL certificate status in Railway's dashboard?** The Railway API may expose cert status (validating/issued/failed).
4. **Is the apex domain (ramen-don.co.uk) intentionally pointing to GoDaddy or should it redirect to Railway?**
5. **What caused the 3 FAILED deployments?** Build/deploy logs may reveal if domain config was part of the failure.

## Constraints

- **Do NOT repeatedly delete and re-add the custom domain** — Let's Encrypt rate limit of 5 duplicate certs/week; hitting this blocks the domain for 7 days.
- Railway Hobby Plan → max 2 custom domains per service.
- GoDaddy DNS changes may take up to 72 hours to propagate.
- We have Railway API (list/configure/read) and GoDaddy domain tools available.

## Invariants

1. CNAME `www.ramen-don.co.uk` → `*.up.railway.app` must stay intact
2. Railway service must remain deployed and running
3. Must not trigger Let's Encrypt rate limit
4. Must not break existing DNS records (SPF, Microsoft 365)

## Success Criteria

1. `https://www.ramen-don.co.uk` loads without SSL errors
2. Certificate presented matches `www.ramen-don.co.uk`
3. SSL cert is auto-renewing (Let's Encrypt)
4. Root cause identified and documented
5. No regression in existing DNS config (email, apex domain)

## Routing Decision

**RESEARCH** → The intake has identified probable causes but needs deeper investigation before a plan can be formed. Specifically:
- Check Railway's SSL cert status for the custom domain (beyond what the API shows)
- Verify GoDaddy DNS records via available tools (domain availability/management tools)
- Inspect FAILED deployment logs for domain-related errors
- Attempt to access the Railway-provided domain directly to confirm service health
- Test with a tool like SSL Labs or curl to get cert chain details
