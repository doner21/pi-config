---
type: community/narrative
community_id: 2
label: "Admin API Route Handlers"
size: 16
cohesion: 0.27
character: code
---

# Community 2: Admin API Route Handlers

> **16 nodes** | **Cohesion: 0.27** (moderate) | **Character: code**

## For Humans

### What It's Like

This community is **the kitchen's ordering system**. It translates requests from the waitstaff (admin pages) into database operations. Every admin action — uploading a photo, changing hours, editing menu items — goes through these API routes. They all speak the same language (REST verbs: GET/POST/PATCH/DELETE) and follow the same recipe (Supabase admin client → query → respond).

### Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                   Admin API Route Handlers                        │
│                 (The Kitchen Ordering System)                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Every route follows the same pattern:                            │
│                                                                   │
│  ┌──────────┐    ┌──────────────────┐    ┌──────────┐            │
│  │ Admin    │───▶│ createSupabase   │───▶│ Supabase │            │
│  │ Page     │    │ AdminClient()    │    │ (no RLS) │            │
│  │ fetch()  │    │ service_role key │    └──────────┘            │
│  └──────────┘    └──────────────────┘                            │
│                                                                   │
│  Ten route files serve seven content domains:                     │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ VERB    │ /api/admin/...         │ Table / Action            │ │
│  ├─────────┼───────────────────────┼───────────────────────────┤ │
│  │ GET     │ /gallery              │ gallery_images             │ │
│  │ POST    │ /gallery              │ Upload file → storage      │ │
│  │ PATCH   │ /gallery              │ Update is_hero, alt_text   │ │
│  │ DELETE  │ /gallery              │ Delete record + file       │ │
│  ├─────────┼───────────────────────┼───────────────────────────┤ │
│  │ GET     │ /homepage             │ homepage_sections          │ │
│  │ PATCH   │ /homepage             │ Upsert all sections        │ │
│  ├─────────┼───────────────────────┼───────────────────────────┤ │
│  │ GET     │ /hours                │ opening_hours              │ │
│  │ PATCH   │ /hours                │ Upsert by day_of_week      │ │
│  ├─────────┼───────────────────────┼───────────────────────────┤ │
│  │ GET     │ /menu/categories      │ menu_categories            │ │
│  │ POST    │ /menu/categories      │ Create category            │ │
│  │ PATCH   │ /menu/categories      │ Update category by id      │ │
│  │ DELETE  │ /menu/categories      │ Delete category by id      │ │
│  ├─────────┼───────────────────────┼───────────────────────────┤ │
│  │ GET     │ /menu/items           │ menu_items                 │ │
│  │ POST    │ /menu/items           │ Create item                │ │
│  │ PATCH   │ /menu/items           │ Update item by id          │ │
│  │ DELETE  │ /menu/items           │ Delete item by id          │ │
│  ├─────────┼───────────────────────┼───────────────────────────┤ │
│  │ GET     │ /overlay-image        │ site_settings (KV)         │ │
│  │ PATCH   │ /overlay-image        │ Set/clear gallery_image_id │ │
│  ├─────────┼───────────────────────┼───────────────────────────┤ │
│  │ POST    │ /revalidate           │ revalidatePath (all pages) │ │
│  ├─────────┼───────────────────────┼───────────────────────────┤ │
│  │ POST    │ /setup                │ Create bucket, check tables│ │
│  ├─────────┼───────────────────────┼───────────────────────────┤ │
│  │ GET     │ /signature-bowls      │ signature_bowls + JOIN     │ │
│  │ POST    │ /signature-bowls      │ Create bowl                │ │
│  │ PATCH   │ /signature-bowls      │ Update bowl by id          │ │
│  │ DELETE  │ /signature-bowls      │ Delete bowl by id          │ │
│  ├─────────┼───────────────────────┼───────────────────────────┤ │
│  │ GET     │ /venue                │ venue_details (singleton)  │ │
│  │ PATCH   │ /venue                │ Upsert venue               │ │
│  └─────────┴───────────────────────┴───────────────────────────┘ │
│                                                                   │
│  God nodes (most-connected HTTP verbs):                           │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐   │
│  │ GET()    │    │ PATCH()  │    │ POST()   │    │ DELETE() │   │
│  │ 10 edges │    │ 9 edges  │    │ 8 edges  │    │ 5 edges  │   │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### What It Does

This community is the REST API that powers the admin CMS. Each route file handles CRUD for one Supabase table. The routes share a common architecture: use `createSupabaseAdminClient()` (service role key, bypasses RLS), perform the operation, return JSON. On read, if Supabase fails, fall back to seed data — mirroring the fetchers.ts pattern.

### Key Nodes

| Node | Role | Connections |
|------|------|-------------|
| `GET()` | Every read endpoint — 10 routes implement it | 10 |
| `PATCH()` | Every update endpoint — 9 routes implement it | 9 |
| `POST()` | Every create endpoint — 8 routes implement it | 8 |
| `createSupabaseAdminClient()` | Factory for service-role client used by all routes | 5 |
| `DELETE()` | Every delete endpoint — 5 routes implement it | 5 |

### Bridge Analysis

**Self-contained** in the graph, but conceptually bridges:
- **Admin pages** (C3, C5, C7) that call these routes via `fetch()`
- **Supabase** — the database all routes write to
- **ISR** (C3) — the revalidate route busts ISR caches after writes

### Cohesion Explained

**0.27** — Moderate. All route files share the same structure (export async function GET/POST/PATCH/DELETE, call createSupabaseAdminClient, return NextResponse.json). They don't call each other, but they're identical in form and share the admin client. The cohesion comes from **convention, not coupling**.

## For LLMs

### Data

- **ID:** 2
- **Label:** Admin API Route Handlers
- **Size:** 16 nodes
- **Cohesion:** 0.27
- **Character:** code
- **Primary files:** src/app/api/admin/*/route.ts
- **Source files:** gallery/route.ts, homepage/route.ts, hours/route.ts, menu/categories/route.ts, menu/items/route.ts, overlay-image/route.ts, revalidate/route.ts, setup/route.ts, signature-bowls/route.ts, venue/route.ts

### Cross-Community Connections
**No cross-community edges — this community is self-contained.**

### Pattern: Every GET route falls back to seed data

When a GET query fails or returns empty, the route returns hardcoded seed data from `src/lib/data/seed-data.ts` instead of an error. This mirrors the fetchers.ts pattern. Examples:
- `/api/admin/venue` GET → on error, returns `VENUE_DETAILS`
- `/api/admin/hours` GET → on error, returns `OPENING_HOURS`
- `/api/admin/menu/categories` GET → on error, returns `MENU_CATEGORIES`

This dual-layer resilience means admin pages work with seed data even when Supabase is down.
