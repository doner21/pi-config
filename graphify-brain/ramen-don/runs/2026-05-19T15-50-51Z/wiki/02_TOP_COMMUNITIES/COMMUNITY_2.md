---
type: community/narrative
community_id: 2
label: "server-data Module (31 functions)"
size: 31
cohesion: 0.12
character: code
---

# Community 2: server-data Module (31 functions)

> **31 nodes** | **Cohesion: 0.12** (loosely connected) | **Character: code**

## For Humans

### Analogy: The Restaurant's Booking Manager

This community is like **the head waiter with the reservation book** — the person who knows every table's status, every upcoming booking, every block on the calendar, and can tell you instantly whether a 4-top is free at 7 PM on Friday.

`getAvailabilityData()` is the master ledger — it pulls together tables, rules, existing bookings, active holds, blocked periods, and opening hours into one complete picture. `canConfirmHold()` checks whether a held table can be turned into a confirmed booking. `createConfirmationCode()` generates the unique RD-XXXXXX-XXXX code every customer receives.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   BOOKING SERVER DATA LAYER                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────┐       │
│  │            getAvailabilityData()                  │       │
│  │         (The Master Ledger — 11 edges)            │       │
│  │                                                   │       │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐       │       │
│  │  │Resources │  │  Rules   │  │ Bookings │        │       │
│  │  │(tables)  │  │(defaults │  │(confirmed│        │       │
│  │  │          │  │ + peak)  │  │  ones)   │        │       │
│  │  └──────────┘  └──────────┘  └──────────┘       │       │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐       │       │
│  │  │  Holds   │  │ Blocked  │  │ Opening  │       │       │
│  │  │ (active) │  │ Periods  │  │  Hours   │       │       │
│  │  └──────────┘  └──────────┘  └──────────┘       │       │
│  └──────────────────────┬───────────────────────────┘       │
│                         │                                    │
│         ┌───────────────┼───────────────┐                    │
│         │               │               │                    │
│  ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐           │
│  │canConfirm   │ │lookupConfi- │ │formatQuery  │           │
│  │Hold()       │ │rmedBooking()│ │Error()      │           │
│  │(409 if      │ │(9 edges)    │ │(error       │           │
│  │ conflict)   │ │looks up by  │ │ formatting) │           │
│  └─────────────┘ │conf.code    │ └─────────────┘           │
│                  └─────────────┘                             │
│                                                              │
│  ┌──────────────────────────────────────────────────┐       │
│  │         BookingPersistenceError                   │       │
│  │   (Custom error class — thrown when durable       │       │
│  │    storage write fails; caught by routes to       │       │
│  │    return 503 with fail-closed behavior)          │       │
│  └──────────────────────────────────────────────────┘       │
│                                                              │
│  ┌──────────────────────────────────────────────────┐       │
│  │  Dev/Demo Fallback Path                           │       │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │       │
│  │  │getDemoAvai-│  │lookupDev   │  │devBooking  │ │       │
│  │  │labilityData│  │Booking()   │  │Store       │ │       │
│  │  └────────────┘  └────────────┘  └────────────┘ │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### What It Does

This is the **booking system's data backbone** (31 nodes, cohesion 0.12). It handles:

- **Gathering all availability inputs** — `getAvailabilityData()` is called by every booking API route to get the current state of tables, rules, bookings, holds, blocks, and hours
- **Hold validation** — `canConfirmHold()` checks if a hold is still active and the table is still available before confirming
- **Confirmation lookup** — `lookupConfirmedBooking()` finds a booking by its confirmation code (RD-XXXXXX-XXXX)
- **Fail-closed behavior** — When Supabase is configured but tables are missing, `BookingPersistenceError` is thrown and routes return 503 instead of falling through to in-memory demo data
- **Dev fallback** — When Supabase is NOT configured, the `devBookingStore` provides an in-memory demo booking experience

**Key nodes:**
- **getAvailabilityData()** (11 edges) — The central data aggregator. Every booking operation depends on this.
- **lookupConfirmedBooking()** (9 edges) — Powers the confirmation page. Refuses to return bookings when durable storage is configured but inaccessible.
- **POST()** (7 edges) — The booking confirm route handler that calls `canConfirmHold()` and creates the booking record.
- **parseHoldPayload()** / **parseConfirmPayload()** (5 edges each) — Input validation functions from Community 5's `validation.ts`.

### Bridges to Other Communities

- **To Community 1** (API routes): 6 edges — `route.ts` files import from here. `POST()` calls `bookingDbConfigured()`.
- **To Community 5** (availability engine): 4 edges — Imports `calculateAvailability()` from `availability.ts`.
- **To Community 4** (fetchers): `hasAdminCredentials()` calls `isSupabaseConfigured()`.

### Why Cohesion is Low (0.12)

The graph algorithm groups server-side data handling functions together, but they serve different booking operations (hold creation, confirmation, lookup, error formatting). They share imports from `server-data.ts` and `validation.ts` but serve distinct API endpoints.

## For LLMs

### Data

- **ID:** 2
- **Label:** server-data Module (31 functions)
- **Size:** 31 nodes
- **Cohesion:** 0.12
- **Character:** code
- **Primary file:** server-data.ts

### Top Nodes by Connectivity

- **getAvailabilityData()** -- 11 connections [code]
- **lookupConfirmedBooking()** -- 9 connections [code]
- **server-data.ts** -- 8 connections [code]
- **route.ts** -- 7 connections [code]
- **POST()** -- 7 connections [code]
- **BookingPersistenceError** -- 6 connections [code]
- **validation.ts** -- 5 connections [code]
- **route.ts** -- 5 connections [code]
- **parseHoldPayload()** -- 5 connections [code]
- **parseConfirmPayload()** -- 5 connections [code]

### Cross-Community Connections
- **route Module (36 functions)** (C1) -- 6 edge(s)
  - route.ts -> bookingDbConfigured() (imports)
  - POST() -> bookingDbConfigured() (calls)
- **time Module (18 functions)** (C5) -- 4 edge(s)
  - route.ts -> calculateAvailability() (imports)
  - POST() -> calculateAvailability() (calls)
- **fetchers Module (19 functions)** (C4) -- 1 edge(s)
  - hasAdminCredentials() -> isSupabaseConfigured() (calls)
