---
type: community/narrative
community_id: 15
label: "Admin Booking Data Layer (Session)"
size: 3
cohesion: 0.67
character: concept
---

# Community 15: Admin Booking Data Layer (Session)

> **3 nodes** | **Cohesion: 0.67** (tight) | **Character: concept**

## For Humans

### What It's Like

A **session note** identifying that `isSupabaseConfigured()` and `createSupabaseServerClient()` are the two gatekeepers of the admin + booking data layer. These two functions control whether any data flows at all — one checks if the database is reachable, the other creates the connection.

```
┌──────────────────────────────────────────────────────────────────┐
│             Admin Booking Data Layer (Session Note)               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────┐                                         │
│  │ isSupabaseConfigured│── Gates ALL database operations          │
│  │ ()                  │   Returns false → seed data path         │
│  └─────────┬───────────┘                                         │
│            │                                                      │
│            ▼                                                      │
│  ┌─────────────────────┐                                         │
│  │ createSupabaseServer│── Creates the actual DB connection       │
│  │ Client()            │   Cookie-based, fresh per request        │
│  └─────────┬───────────┘                                         │
│            │                                                      │
│            ▼                                                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Community: Admin + Booking Data Layer (21 nodes)           │ │
│  │  → The full system of fetchers, routes, and pages           │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### Cohesion Explained

**0.67** — Tight. These are interconnected session notes describing the same architectural concept. The two god nodes together form the data access pattern.

## For LLMs

- **ID:** 15 | **Size:** 3 | **Character:** concept | **Source:** session document
- **God Nodes:** `isSupabaseConfigured()` (9 edges), `createSupabaseServerClient()` (9 edges)
