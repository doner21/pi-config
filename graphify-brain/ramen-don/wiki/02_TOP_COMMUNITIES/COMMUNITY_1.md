---
type: community/narrative
community_id: 1
label: "route Module (36 functions)"
size: 36
cohesion: 0.14
character: code
---

# Community 1: route Module (36 functions)

> **36 nodes** | **Cohesion: 0.14** (loosely connected) | **Character: code**

## For Humans

### Analogy: The Kitchen Pass

This community is like **the kitchen pass in a restaurant** — the counter where orders come in, get validated, and are sent to the right station. Every API request hits a `route.ts` file first. That file checks "is the chef (admin) authorized?", "is the database configured?", and then delegates to the right handler.

The three most connected functions — `bookingDbConfigured()`, `requireAdminUser()`, and `createSupabaseAdminClient()` — are the **three checks every order goes through**: is the kitchen open? is this person allowed to order? and do we have the keys to the pantry?

### Architecture

```
                    ┌──────────────────────────┐
                    │    Incoming HTTP Request   │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │    route.ts (API Route)   │
                    │   POST / GET / PATCH /    │
                    │   DELETE handlers         │
                    └────────────┬─────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
     ┌────────▼────────┐ ┌──────▼──────┐ ┌────────▼────────┐
     │ requireAdminUser│ │bookingDbCon-│ │createSupabase   │
     │  (Auth Guard)   │ │ figured()   │ │ AdminClient()   │
     │                 │ │ (DB Check)  │ │ (Service Role)  │
     └────────┬────────┘ └──────┬──────┘ └────────┬────────┘
              │                 │                  │
              └─────────────────┼──────────────────┘
                                │
              ┌─────────────────┼──────────────────┐
              │                 │                  │
     ┌────────▼────────┐ ┌──────▼──────┐ ┌────────▼────────┐
     │  GET() handlers │ │PATCH()      │ │ POST() handlers │
     │  (Read routes)  │ │(Update)     │ │ (Create routes) │
     │  menu, gallery, │ │ hours, venue│ │ holds, confirm, │
     │  bowls, venue   │ │ homepage    │ │ bookings, blocks│
     └─────────────────┘ └─────────────┘ └─────────────────┘
                                │
              ┌─────────────────┴──────────────────┐
              │                                    │
     ┌────────▼────────┐                 ┌────────▼────────┐
     │ DELETE() routes │                 │ To Community 2  │
     │ (menu items,    │                 │ (server-data,   │
     │  gallery images)│                 │  availability)  │
     └─────────────────┘                 └─────────────────┘
```

### What It Does

This is the **second-largest community** (36 nodes, cohesion 0.14). It contains every API route handler in the app — admin CRUD for menu, gallery, hours, venue, homepage sections, booking resources, peak rules, blocked periods, and the public booking flow (holds, confirm, availability, confirmation lookup).

Every route follows the same pattern:
1. Check auth (`requireAdminUser`)
2. Check database (`bookingDbConfigured`)
3. Get a client (`createSupabaseAdminClient`)
4. Execute the operation
5. Call `revalidate()` to refresh cached pages

**Key nodes:**
- **bookingDbConfigured()** (23 edges) — The most connected node in the entire codebase. Every booking route asks this first. When Supabase credentials exist but tables are missing, this returns `true` and routes fail closed with 503.
- **requireAdminUser()** (20 edges) — Authenticates every admin API call. Returns 401 for unauthenticated requests before any data operation begins.
- **createSupabaseAdminClient()** (20 edges) — Creates a Supabase client with the service_role key (bypasses RLS). Every write operation uses this.
- **GET()** (10 edges) — Powers all admin read routes across every content type.

### Bridges to Other Communities

- **To Community 2** (server-data): `bookingDbConfigured()` calls `hasAdminCredentials()`. Booking routes import `parseHoldPayload()` and `BookingPersistenceError`.
- **To Community 4** (fetchers): `requireAdminUser()` calls `isSupabaseConfigured()` and `createSupabaseServerClient()`.
- **To Community 5** (availability): Booking routes import `calculateAvailability()`.
- **To Community 7** (image management): Gallery/bowls routes call `revalidate()`.

### Why Cohesion is Low (0.14)

Like Community 0, this group contains many independent route handlers that share common guards and patterns but don't call each other directly. A menu GET route doesn't call a gallery POST route. The cohesion score reflects the shared imports (auth, client, revalidation) rather than tight inter-calling.

## For LLMs

### Data

- **ID:** 1
- **Label:** route Module (36 functions)
- **Size:** 36 nodes
- **Cohesion:** 0.14
- **Character:** code
- **Primary file:** route.ts

### Top Nodes by Connectivity

- **bookingDbConfigured()** -- 23 connections [code]
- **requireAdminUser()** -- 20 connections [code]
- **createSupabaseAdminClient()** -- 20 connections [code]
- **GET()** -- 10 connections [code]
- **PATCH()** -- 9 connections [code]
- **POST()** -- 8 connections [code]
- **DELETE()** -- 5 connections [code]
- **route.ts** -- 4 connections [code]
- **route.ts** -- 4 connections [code]
- **route.ts** -- 4 connections [code]

### Cross-Community Connections
- **fetchers Module (19 functions)** (C4) -- 2 edge(s)
  - requireAdminUser() -> isSupabaseConfigured() (calls)
  - requireAdminUser() -> createSupabaseServerClient() (calls)
- **server-data Module (31 functions)** (C2) -- 1 edge(s)
  - bookingDbConfigured() -> hasAdminCredentials() (calls)
