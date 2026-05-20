---
type: community/narrative
community_id: 8
label: "Auth & Supabase Client Architecture"
size: 9
cohesion: 0.28
character: code
---

# Community 8: Auth & Supabase Client Architecture

> **9 nodes** | **Cohesion: 0.28** (moderate) | **Character: code**

## For Humans

### What It's Like

This community is **the restaurant's security and access control system**. It issues keycards (auth tokens), checks them at the door (auth guard), and provides three different levels of kitchen access (client tiers). The bartender (browser client) can pour drinks but not change the menu. The head chef (admin client) has full kitchen access. The server (server client) can read the menu on behalf of customers.

### Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                Auth & Supabase Client Architecture                │
│               (Security & Access Control System)                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Three client tiers — escalating privilege:                       │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Tier 1: Browser Client (supabase.ts)                       │ │
│  │  ┌──────────────────────────────────────────────────────┐   │ │
│  │  │ Key: NEXT_PUBLIC_SUPABASE_ANON_KEY                   │   │ │
│  │  │ RLS: ENFORCED (user can only see own data)           │   │ │
│  │  │ Auth: cookie-based (reads current browser cookies)   │   │ │
│  │  │ Cache: NEVER at module level (prevents stale RT)     │   │ │
│  │  │                                                      │   │ │
│  │  │ Used by:                                             │   │ │
│  │  │ • Login page (signInWithPassword)                    │   │ │
│  │  │ • AdminNav (signOut)                                 │   │ │
│  │  │ • AdminAuthWatcher (onAuthStateChange → redirect)    │   │ │
│  │  └──────────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Tier 2: Server Client (supabase-server.ts)                 │ │
│  │  ┌──────────────────────────────────────────────────────┐   │ │
│  │  │ Key: NEXT_PUBLIC_SUPABASE_ANON_KEY                   │   │ │
│  │  │ RLS: ENFORCED                                       │   │ │
│  │  │ Auth: next/headers cookies (SSR-compatible)          │   │ │
│  │  │ Fresh instance per request (reads current cookies)   │   │ │
│  │  │                                                      │   │ │
│  │  │ Used by:                                             │   │ │
│  │  │ • fetchers.ts (all 8 data functions)                 │   │ │
│  │  │ • Public pages via Server Components                 │   │ │
│  │  └──────────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Tier 3: Admin Client (supabase-admin.ts)                   │ │
│  │  ┌──────────────────────────────────────────────────────┐   │ │
│  │  │ Key: SUPABASE_SERVICE_ROLE_KEY (server-only)          │   │ │
│  │  │ RLS: BYPASSED (full database access)                  │   │ │
│  │  │ Auth: none (persistSession: false)                    │   │ │
│  │  │ Throws if env vars missing                            │   │ │
│  │  │                                                      │   │ │
│  │  │ Used by:                                             │   │ │
│  │  │ • All 10 admin API routes                            │   │ │
│  │  │ • Setup wizard                                       │   │ │
│  │  │ ⚠️ NEVER import in client components                  │   │ │
│  │  └──────────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Auth flow for admin:                                             │
│                                                                   │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐   │
│  │ Login    │───▶│Supabase  │───▶│Router→   │───▶│Admin     │   │
│  │ Page     │    │Auth      │    │/admin    │    │Layout    │   │
│  │email+pw  │    │signIn    │    │          │    │          │   │
│  └──────────┘    └──────────┘    └──────────┘    └────┬─────┘   │
│                                                       │          │
│                                              ┌────────┴────────┐ │
│                                              ▼                 ▼ │
│                                       ┌──────────┐    ┌──────────┐│
│                                       │AuthWatch │    │AdminNav  ││
│                                       │er (sign  │    │(sign out ││
│                                       │out→login)│    │button)   ││
│                                       └──────────┘    └──────────┘│
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  AuthError Detection (auth-errors.ts)                       │ │
│  │  Classifies errors: JWT expired, invalid token, 401, etc.  │ │
│  │  Used to trigger clean redirects instead of cryptic errors │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### What It Does

This community manages authentication and provides three Supabase client types with escalating privilege levels. The browser client handles login/logout and auth state monitoring. The server client handles SSR data fetching. The admin client (service role key) bypasses RLS for unrestricted database access — used only in API routes, never in client code.

Key design decisions:
- **Browser client is NOT cached** — prevents stale refresh tokens after middleware rotation
- **Admin client has no auth** — `persistSession: false, autoRefreshToken: false`
- **AuthError detection** — classifies Supabase errors to trigger clean redirects to `/admin/login`

### Key Nodes

| Node | Role | Connections |
|------|------|-------------|
| Supabase Three-Tier Client Architecture | Rationale describing the client stratification | 7 |
| Admin Layout (Auth Guard + Sidebar) | Wraps admin pages with AdminAuthWatcher + AdminNav | 4 |
| Admin Login | Email/password form → signInWithPassword → redirect | 3 |
| Supabase Server Client | Cookie-based SSR client for fetchers.ts | 2 |
| AdminNav | Sidebar with nav links + sign out button | 2 |
| AdminAuthWatcher | Invisible component — listens for SIGNED_OUT → redirect to login | 2 |
| Supabase Browser Client | Anon key client, intentionally not cached at module level | 1 |
| Supabase Admin Client | Service role client, bypasses RLS, throws if misconfigured | 1 |
| AuthError Detection | Utility to classify JWT/session/refresh-token errors | 1 |

### Bridge Analysis

- **→ C1 (Public Pages)**: Admin Layout connects to Client/Server Component Boundary — the admin is client-side, public is server-side
- **→ C3 (Admin CMS)**: Admin Dashboard conceptually connects to Three-Tier Architecture
- **→ C0 (Data Fetching)**: Server client is used by fetchers.ts
- **→ C2 (API Routes)**: Admin client is used by all API routes

### Cohesion Explained

**0.28** — Moderate. Three client factories, one auth page, one auth guard, one nav, one error classifier. They're tied together by the Supabase auth domain, but each piece operates independently. The cohesion is **topical** (all about auth and clients) rather than **structural** (they don't form a call chain).

## For LLMs

### Data

- **ID:** 8
- **Label:** Auth & Supabase Client Architecture
- **Size:** 9 nodes
- **Cohesion:** 0.28
- **Character:** code
- **Primary files:** src/lib/supabase.ts, src/lib/supabase-server.ts, src/lib/supabase-admin.ts, src/lib/auth-errors.ts, src/app/admin/login/page.tsx, src/app/admin/layout.tsx, src/components/admin/AdminAuthWatcher.tsx, src/components/admin/AdminNav.tsx

### Cross-Community Connections
- **Public Page Composition & Fallback Architecture** (C1) -- 1 edge(s)
  - Admin Layout (Auth Guard + Sidebar) → Client/Server Component Boundary (implements)
