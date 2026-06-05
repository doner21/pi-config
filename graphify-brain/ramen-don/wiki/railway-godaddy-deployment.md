---
type: wiki-page
title: Railway & GoDaddy Deployment
tags: [devops, deployment, railway, godaddy, dns]
---

# Railway + GoDaddy Deployment Procedure

## Stack
- **Hosting**: Railway (https://railway.com)
- **Domain**: GoDaddy (ramen-don.co.uk)
- **Git**: GitHub (https://github.com/doner21/ramen-don)
- **Framework**: Next.js 16 (auto-detected by Railway's Nixpacks)

## Deployment Pipeline

### 1. Git → GitHub
```bash
git add <files>
git commit -m "feat: description"
git push origin <branch>
```

### 2. Create & Merge PR
Via `gh` CLI:
```bash
gh pr create --base main --head <branch> --title "..." --body "..."
gh pr merge <number> --merge --admin
```

### 3. Railway Deploy
The Railway CLI is at `C:\Users\doner\AppData\Roaming\npm\railway` (v4.40.0).

```bash
railway login              # Authenticate with GitHub
railway link -p <project-id>
railway service link <service-id>
railway up                 # Upload & deploy from current directory
railway service status     # Check deployment
railway logs --build       # View build logs
```

**Known issues:**
- Missing `RESEND_API_KEY` env var will cause build failure at `next build` (collects page data for `/api/booking/confirm`)
- Add missing vars: `railway variable set KEY=VALUE --skip-deploys`

### 4. Environment Variables (Railway)
Required vars:
| Var | Source |
|-----|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM_ADDRESS` | Resend from email |

Check current: `railway variables list`

### 5. Custom Domain (Railway API)
Railway's GraphQL API is at `https://backboard.railway.com/graphql/v2`.

**Auth token** stored in `~/.railway/config.json` → `user.accessToken`.

**Add domain:**
```bash
# Add custom domain
curl -X POST "https://backboard.railway.com/graphql/v2" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { customDomainCreate(input: { domain: \"www.ramen-don.co.uk\", environmentId: \"<env-id>\", projectId: \"<project-id>\", serviceId: \"<service-id>\" }) { id domain status { dnsRecords { hostlabel requiredValue recordType } } } }"}'
```

**Delete domain:**
```bash
curl -X POST "https://backboard.railway.com/graphql/v2" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { customDomainDelete(id: \"<domain-id>\") }"}'
```

**Project IDs:**
| Item | ID |
|------|----|
| Project ID | `114db40c-6367-4b70-b600-5d764e67ddd2` |
| Service ID | `463a48df-7487-43c8-bf1a-158a13cae382` |
| Environment ID | `5752ba83-e593-453d-a171-ca46b0e5c288` |
| Project name | `cooperative-laughter` |
| Service name | `ramen-don` |
| Service domain | `ramen-don-production.up.railway.app` |

### 6. GoDaddy DNS (API)
**Auth:** API Key + Secret → `Authorization: sso-key <key>:<secret>`

**API base:** `https://api.godaddy.com/v1`

**Get all records:**
```bash
curl -X GET "https://api.godaddy.com/v1/domains/ramen-don.co.uk/records" \
  -H "Authorization: sso-key <key>:<secret>"
```

**Update specific record:**
```bash
curl -X PUT "https://api.godaddy.com/v1/domains/ramen-don.co.uk/records/CNAME/www" \
  -H "Authorization: sso-key <key>:<secret>" \
  -H "Content-Type: application/json" \
  -d '[{"data":"<railway-cname-target>","name":"www","ttl":600,"type":"CNAME"}]'
```

**Replace all records:**
```bash
curl -X PUT "https://api.godaddy.com/v1/domains/ramen-don.co.uk/records" \
  -H "Authorization: sso-key <key>:<secret>" \
  -H "Content-Type: application/json" \
  -d '[...]'  # Must include ALL records (NS, MX, TXT, etc.)
```

**Current DNS records for ramen-don.co.uk:**
- A `@` → Railway IP (for apex — NOT recommended, Railway needs CNAME for verification)
- CNAME `www` → Railway CNAME target
- CNAME records for Office 365 (autodiscover, email, sip, msoid, lyncdiscover)
- MX record for Office 365
- TXT for SPF + Microsoft domain verification
- NS records for GoDaddy name servers

**Important:** `.co.uk` TLD doesn't support CNAME at apex. Use www subdomain:
1. Point `www.ramen-don.co.uk` (CNAME) → Railway CNAME target in Railway UI
2. Set up **Domain Forwarding** in GoDaddy dashboard: `ramen-don.co.uk` → `https://www.ramen-don.co.uk` (301 permanent)

### 7. Railway MCP Server Fix
The `@railway/mcp-server` package is **deprecated**. Railway MCP is now bundled in the CLI:
```
railway mcp
```
The extension at `~/.pi/agent/extensions/railway-mcp.ts` was updated to use `railway mcp` instead of `npx -y @railway/mcp-server`.
