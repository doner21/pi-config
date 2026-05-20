---
type: community/narrative
community_id: 4
label: "fetchers Module (19 functions)"
size: 19
cohesion: 0.23
character: code
---

# Community 4: fetchers Module (19 functions)

> **19 nodes** | **Cohesion: 0.23** (moderately connected) | **Character: code**

## For Humans

### Analogy: The Waitstaff

This community is like **the waitstaff who go between the dining room and the kitchen** — they take requests from the public pages ("show me the menu"), check whether the kitchen is open (`isSupabaseConfigured()`), go to the pantry (`createSupabaseServerClient()`), fetch what's needed, and if the pantry is empty, they serve from the backup stash (seed data).

Every public page — Home, Menu, Gallery, Visit — asks a fetcher for its content. The fetchers are the **single source of truth for public data retrieval**.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     DATA FETCHER LAYER                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────┐       │
│  │           isSupabaseConfigured()                  │       │
│  │              (The Pre-Flight Check)               │       │
│  │         11 edges — called by EVERY fetcher        │       │
│  └──────────────────────┬───────────────────────────┘       │
│                         │                                    │
│              ┌──────────┴──────────┐                        │
│              │ YES                 │ NO                     │
│     ┌────────▼────────┐  ┌────────▼────────┐               │
│     │ createSupabase  │  │   Seed Data     │               │
│     │ ServerClient()  │  │   Fallback      │               │
│     │ (anon/service   │  │   (hardcoded    │               │
│     │  role client)   │  │   demo content) │               │
│     └────────┬────────┘  └────────┬────────┘               │
│              │                    │                          │
│     ┌────────▼────────────────────▼──────────┐              │
│     │                                        │              │
│     │         Data Fetcher Functions          │              │
│     │                                        │              │
│     │  ┌──────────────┐  ┌──────────────┐   │              │
│     │  │getVenue      │  │getOpening    │   │              │
│     │  │Details()     │  │Hours()       │   │              │
│     │  │(address,     │  │(lunch/dinner │   │              │
│     │  │ phone, etc.) │  │ per day)     │   │              │
│     │  └──────────────┘  └──────────────┘   │              │
│     │  ┌──────────────┐  ┌──────────────┐   │              │
│     │  │getGallery    │  │getHero       │   │              │
│     │  │Images()      │  │Image()       │   │              │
│     │  │(all photos)  │  │(main banner) │   │              │
│     │  └──────────────┘  └──────────────┘   │              │
│     │  ┌──────────────┐  ┌──────────────┐   │              │
│     │  │getSignature  │  │getBooking    │   │              │
│     │  │Bowls()       │  │OverlayImage()│   │              │
│     │  │(featured)    │  │(reserve CTA) │   │              │
│     │  └──────────────┘  └──────────────┘   │              │
│     │  ┌──────────────┐  ┌──────────────┐   │              │
│     │  │getHomepage   │  │getMenu       │   │              │
│     │  │Sections()    │  │Categories()  │   │              │
│     │  │(section vis) │  │(with items)  │   │              │
│     │  └──────────────┘  └──────────────┘   │              │
│     │                                        │              │
│     └────────────────┬───────────────────────┘              │
│                      │                                       │
│              ┌───────▼────────┐                              │
│              │   HomePage()   │                              │
│              │ (7 edges —     │                              │
│              │  composes      │                              │
│              │  multiple      │                              │
│              │  fetcher       │                              │
│              │  results into  │                              │
│              │  the homepage) │                              │
│              └────────────────┘                              │
└─────────────────────────────────────────────────────────────┘
```

### What It Does

This is the **Data Fetcher Layer** (19 nodes, cohesion 0.23). It provides:

- **Configuration gating** — `isSupabaseConfigured()` checks environment variables before any database call. Every fetcher gates on this.
- **Server-side Supabase client** — `createSupabaseServerClient()` uses cookies for auth context, enabling server-side rendering with proper RLS.
- **Content-specific fetchers** — Each content type has its own fetcher function: venue details, opening hours, gallery images, hero image, signature bowls, booking overlay image, homepage sections, menu categories.
- **Seed data fallback** — When Supabase is unconfigured, every fetcher returns hardcoded demo data so the app remains functional.
- **Homepage composition** — `HomePage()` is the most complex consumer, orchestrating multiple fetcher calls to assemble the homepage.

**Key nodes:**
- **isSupabaseConfigured()** (11 edges) — The gatekeeper. Every fetcher calls this first.
- **createSupabaseServerClient()** (10 edges) — The public-facing database connection factory.
- **HomePage()** (7 edges) — The homepage composer that assembles sections from multiple data sources.

### Bridges to Other Communities

The wiki reports no cross-community edges, but functionally:
- All public pages in Community 0 **import and call** these fetchers
- Admin routes in Community 1 call `requireAdminUser()` which internally calls `isSupabaseConfigured()`
- The GRAPH_REPORT identifies `isSupabaseConfigured()` as a bridge connecting Communities 4, 1, and 2

### Why Cohesion is Moderate (0.23)

Higher than Communities 0-3 because all these functions share the same pattern: check config → get client → query DB → fall back to seed. They're tightly related in structure even if they fetch different content types.

## For LLMs

### Data

- **ID:** 4
- **Label:** fetchers Module (19 functions)
- **Size:** 19 nodes
- **Cohesion:** 0.23
- **Character:** code
- **Primary file:** fetchers.ts

### Top Nodes by Connectivity

- **isSupabaseConfigured()** -- 11 connections [code]
- **createSupabaseServerClient()** -- 10 connections [code]
- **fetchers.ts** -- 8 connections [code]
- **HomePage()** -- 7 connections [code]
- **getVenueDetails()** -- 5 connections [code]
- **getBookingOverlayImage()** -- 5 connections [code]
- **getSignatureBowls()** -- 4 connections [code]
- **getOpeningHours()** -- 4 connections [code]
- **getHomepageSections()** -- 4 connections [code]
- **getHeroImage()** -- 4 connections [code]

**No cross-community edges -- this community is self-contained.**
