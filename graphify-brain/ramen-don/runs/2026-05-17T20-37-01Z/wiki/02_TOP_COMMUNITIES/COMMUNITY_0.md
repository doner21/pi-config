---
type: community/narrative
community_id: 0
label: "Data Fetching & Supabase Integration"
size: 19
cohesion: 0.23
character: code
---

# Community 0: Data Fetching & Supabase Integration

> **19 nodes** | **Cohesion: 0.23** (moderate) | **Character: code**

## For Humans

### What It's Like

This community is **the restaurant's supply chain manager**. It doesn't cook the food or serve the customers — it makes sure the right ingredients arrive at the right station. Every public page places an order, and this layer either fetches from the warehouse (Supabase) or grabs from the pantry (seed data) when the warehouse is closed.

### Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│              Data Fetching & Supabase Integration                │
│                      (The Supply Chain)                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────┐     ┌─────────────────────┐             │
│  │ isSupabaseConfigured │────▶│ createSupabaseServer │             │
│  │ ()                   │     │ Client()             │             │
│  │ The Gatekeeper       │     │ The Courier           │             │
│  └─────────┬───────────┘     └──────────┬──────────┘             │
│            │                            │                         │
│       ┌────┴────┐              ┌────────┼────────┐               │
│       │ NO      │ YES          │        │        │               │
│       ▼         ▼              ▼        ▼        ▼               │
│  ┌────────┐ ┌────────┐   ┌────────┐ ┌──────┐ ┌────────┐        │
│  │ Seed   │ │ Try    │   │getVenue│ │getHrs│ │getMenu │  ...    │
│  │ Data   │ │ DB     │   │Details │ │()    │ │Cats()  │         │
│  └────────┘ └───┬────┘   └────────┘ └──────┘ └────────┘        │
│            ┌────┴────┐                                            │
│            │Success   │Error                                      │
│            ▼          ▼                                           │
│       ┌────────┐  ┌────────┐                                     │
│       │ Live   │  │ Seed   │                                     │
│       │ Data   │  │ Data   │                                     │
│       └────────┘  └────────┘                                     │
│                                                                   │
│  Called by:                                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ HomePage │ │ MenuPage │ │VisitPage │ │ContactPg │  ...       │
│  │ ()       │ │ ()       │ │ ()       │ │ ()       │            │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
└──────────────────────────────────────────────────────────────────┘
```

### What It Does

This community contains **8 data-fetching functions** and the Supabase server client infrastructure. It's the single point of contact between public pages and the database. Every public page (Home, Menu, Visit, Contact, Gallery) calls into `fetchers.ts` to get its data.

The key insight: **every fetcher has the same shape**. Check if Supabase is configured → try the query → catch errors → return seed data. This means the site degrades gracefully — no database, no problem.

### Key Nodes

| Node | Role | Connections |
|------|------|-------------|
| `isSupabaseConfigured()` | Gatekeeper — returns false if env vars missing | 9 |
| `createSupabaseServerClient()` | Creates SSR-safe Supabase client with cookie auth | 9 |
| `fetchers.ts` | The file containing all 8 get* functions | 8 |
| `HomePage()` | Largest consumer — fetches 6 datasets in parallel | 7 |
| `getVenueDetails()` | Fetches restaurant address/phone/social | 5 |
| `getBookingOverlayImage()` | Fetches the image shown in booking modal | 5 |
| `getSignatureBowls()` | Fetches featured bowls with gallery image JOIN | 4 |
| `getOpeningHours()` | Fetches weekly schedule | 4 |
| `getHomepageSections()` | Fetches hero/story/CTA section content | 4 |
| `getHeroImage()` | Fetches the hero (is_hero=true) gallery image | 4 |

### Bridge Analysis

This community is **self-contained** — no cross-community edges in the graph. But conceptually, it's the bridge between:
- **Public pages** (C1) that consume the fetched data
- **Auth layer** (C8) that provides the server client
- **API routes** (C2) that write the data being read

### Cohesion Explained

**0.23** — Moderate. The 8 fetcher functions are structurally identical (same try/catch/fallback pattern) which creates internal similarity, but they don't call each other. The Supabase client setup is separate from the fetcher functions. This is characteristic of a **utility module** — cohesive by convention, not by call graph.

## For LLMs

### Data

- **ID:** 0
- **Label:** Data Fetching & Supabase Integration
- **Size:** 19 nodes
- **Cohesion:** 0.23
- **Character:** code
- **Primary files:** src/lib/data/fetchers.ts, src/lib/supabase-server.ts
- **Primary source files:** src/app/(public)/page.tsx, src/app/(public)/layout.tsx, src/app/(public)/menu/page.tsx, src/app/(public)/visit/page.tsx, src/app/(public)/contact/page.tsx, src/app/(public)/gallery/page.tsx

### Top Nodes by Connectivity

- **isSupabaseConfigured()** -- 9 connections [code] — env var check that gates all DB operations
- **createSupabaseServerClient()** -- 9 connections [code] — factory for cookie-based SSR Supabase client
- **fetchers.ts** -- 8 connections [code] — module containing 8 async data functions
- **HomePage()** -- 7 connections [code] — main page component, calls 6 fetchers in parallel
- **getVenueDetails()** -- 5 connections [code] — fetches venue_details singleton from Supabase
- **getBookingOverlayImage()** -- 5 connections [code] — fetches site_settings KV + gallery_images join
- **getSignatureBowls()** -- 4 connections [code] — fetches signature_bowls with gallery_images LEFT JOIN
- **getOpeningHours()** -- 4 connections [code] — fetches opening_hours ordered by day_of_week
- **getHomepageSections()** -- 4 connections [code] — fetches visible homepage_sections ordered by sort_order
- **getHeroImage()** -- 4 connections [code] — fetches gallery_images where is_hero=true

### Cross-Community Connections
**No cross-community edges — this community is self-contained.**

### Pattern: Seed Data Fallback in Every Fetcher

Every function in fetchers.ts follows this pattern:
1. Check `isSupabaseConfigured()` — if false, return seed data immediately
2. Create server client via `createSupabaseServerClient()`
3. Query Supabase table
4. If query succeeds and returns data, return it
5. If query fails or returns empty, return seed data

This means the site works 100% without Supabase configured — it displays hardcoded menu, hours, venue, gallery, and homepage content from `src/lib/data/seed-data.ts`.
