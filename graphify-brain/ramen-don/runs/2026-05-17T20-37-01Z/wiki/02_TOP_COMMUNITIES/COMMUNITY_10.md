---
type: community/narrative
community_id: 10
label: "API Fallback Pattern"
size: 7
cohesion: 0.29
character: code
---

# Community 10: API Fallback Pattern

> **7 nodes** | **Cohesion: 0.29** (moderate) | **Character: code**

## For Humans

### What It's Like

This community is **the restaurant's emergency backup menu**. When the kitchen database (Supabase) is unavailable, every API route has a printed backup menu (seed data) ready to go. This means the admin panel still works — it shows last-known-good data — even when the database is down. The chef can still see what's on the menu even if the ordering system crashed.

### Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                      API Fallback Pattern                         │
│                  (The Emergency Backup Menu)                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Every GET route follows the same pattern:                        │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  export async function GET() {                              │ │
│  │    try {                                                    │ │
│  │      const supabase = createSupabaseAdminClient();          │ │
│  │      const { data, error } = await supabase                │ │
│  │        .from("table_name")                                  │ │
│  │        .select("*");                                        │ │
│  │      if (error) return NextResponse.json(                   │ │
│  │        { data: SEED_DATA });     ◀── FALLBACK               │ │
│  │      return NextResponse.json(                              │ │
│  │        { data: data || SEED_DATA }); ◀── FALLBACK (empty)   │ │
│  │    } catch {                                                │ │
│  │      return NextResponse.json(                              │ │
│  │        { data: SEED_DATA });     ◀── FALLBACK (error)       │ │
│  │    }                                                        │ │
│  │  }                                                          │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Six API routes implement this pattern:                            │
│                                                                   │
│  ┌─────────────────────┬──────────────────────────────────────┐  │
│  │ Route               │ Seed Data Source                     │  │
│  ├─────────────────────┼──────────────────────────────────────┤  │
│  │ /api/admin/gallery  │ GALLERY_IMAGES (7 sample photos)     │  │
│  ├─────────────────────┼──────────────────────────────────────┤  │
│  │ /api/admin/homepage │ HOMEPAGE_SECTIONS (4 sections)       │  │
│  ├─────────────────────┼──────────────────────────────────────┤  │
│  │ /api/admin/hours    │ OPENING_HOURS (7 days, Tue-Sun open) │  │
│  ├─────────────────────┼──────────────────────────────────────┤  │
│  │ /api/admin/menu/    │ MENU_CATEGORIES (7 cats)             │  │
│  │ categories          │ + MENU_ITEMS                         │  │
│  ├─────────────────────┼──────────────────────────────────────┤  │
│  │ /api/admin/menu/    │ MENU_ITEMS (30 items across 7 cats)  │  │
│  │ items               │                                      │  │
│  ├─────────────────────┼──────────────────────────────────────┤  │
│  │ /api/admin/venue    │ VENUE_DETAILS (Ramen Don, B1 2DS)    │  │
│  ├─────────────────────┼──────────────────────────────────────┤  │
│  │ /api/admin/sig-     │ SIGNATURE_BOWLS (4 bowls)            │  │
│  │ nature-bowls        │                                      │  │
│  └─────────────────────┴──────────────────────────────────────┘  │
│                                                                   │
│  Dual-layer resilience:                                           │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Layer 1: API routes fall back to seed data                  │ │
│  │ Layer 2: fetchers.ts ALSO falls back to seed data           │ │
│  │ → Public pages survive even if BOTH Supabase AND            │ │
│  │   API routes are down (fetchers catch errors too)           │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### What It Does

This community documents the pattern used by every admin API route: when Supabase is unavailable (connection error, missing env vars, empty result), return hardcoded seed data instead of throwing an error. This is the API-tier mirror of the fetchers.ts pattern. Together they create **dual-layer resilience**: the admin panel works without Supabase, and public pages work without either Supabase or the API routes.

### Key Nodes

| Node | Role | Connections |
|------|------|-------------|
| Seed Data Fallback in Every API Route | The rationale describing this pattern | 7 |
| Venue API (Singleton Upsert) | Implements the pattern — returns VENUE_DETAILS on fail | 1 |
| Menu Items API | Implements the pattern — returns MENU_ITEMS on fail | 1 |
| Menu Categories API | Implements the pattern — returns MENU_CATEGORIES on fail | 1 |
| Hours API | Implements the pattern — returns OPENING_HOURS on fail | 1 |
| Homepage API | Implements the pattern — returns HOMEPAGE_SECTIONS on fail | 1 |
| Gallery API | Implements the pattern — returns GALLERY_IMAGES on fail | 1 |

### Bridge Analysis

- **→ C0 (Data Fetching)**: Mirror pattern — fetchers.ts implements the same fallback strategy at the SSR layer
- **→ C2 (API Routes)**: All 6 routes in this community ARE the API routes that implement the pattern
- **→ C3 (Admin CMS)**: Signature Bowls API connects to the seed fallback pattern

### Cohesion Explained

**0.29** — Moderate. Six API routes share the identical `try { query } catch { seed }` pattern. They don't call each other, but they're structurally identical. This is **convention-based cohesion** — the value is in the pattern, not in coupling.

## For LLMs

### Data

- **ID:** 10
- **Label:** API Fallback Pattern
- **Size:** 7 nodes
- **Cohesion:** 0.29
- **Character:** code
- **Primary files:** src/app/api/admin/*/route.ts (6 routes)

### Cross-Community Connections
- **Admin CMS Panel & ISR** (C3) -- 1 edge(s)
  - Signature Bowls API (GET with Gallery JOIN) → Seed Data Fallback in Every API Route (implements)
