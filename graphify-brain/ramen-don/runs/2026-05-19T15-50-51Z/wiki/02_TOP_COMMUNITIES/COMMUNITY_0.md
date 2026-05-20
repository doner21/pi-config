---
type: community/narrative
community_id: 0
label: "Herox Module (42 functions)"
size: 42
cohesion: 0.07
character: code
---

# Community 0: Herox Module (42 functions)

> **42 nodes** | **Cohesion: 0.07** (loosely connected) | **Character: code**

## For Humans

### Analogy: The Restaurant's Public Face

This community is like **the dining room, the front door, the menu boards, and the reservation desk** of a restaurant. It's everything the customer sees and touches — the hero banner that greets you, the header that helps you navigate, the booking button that says "Reserve a Table," and the overlay that appears when you click it.

It also includes the **security cameras and employee entrance** — the admin login page, the auth watcher that redirects logged-out staff, and the admin sidebar navigation.

### Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    PUBLIC WEBSITE UI                          │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Header     │  │    Hero      │  │   Footer     │       │
│  │ (Sticky      │  │ (Full-Screen │  │ (Logo + Nav  │       │
│  │  Scroll-     │  │  Image +     │  │  + Contact   │       │
│  │  Aware)      │  │  Wordmark)   │  │  + Hours)    │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                 │                │
│         └─────────┬───────┴─────────┬───────┘                │
│                   │                 │                         │
│         ┌─────────▼─────────────────▼─────────┐              │
│         │        Booking Button Family         │              │
│         │  (HeroBtn, FooterBtn, VisitInfoBtn)  │              │
│         │  ALL share same OpenTable RID 325722 │              │
│         └──────────────────┬───────────────────┘              │
│                            │                                  │
│              ┌─────────────▼─────────────┐                    │
│              │      BookingOverlay       │                    │
│              │   (createPortal + Iframe  │                    │
│              │   + Scroll Lock)          │                    │
│              └───────────────────────────┘                    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                      ADMIN UI ENTRY                           │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │ Admin Login  │───▶│ Admin Layout │───▶│  AdminNav    │   │
│  │ (Supabase    │    │ (Auth Guard  │    │ (Mobile +    │   │
│  │  Email/PW)   │    │  + Sidebar)  │    │  Desktop)    │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│                                                                  │
│  ┌──────────────────────┐                                       │
│  │ AdminAuthWatcher     │  (Sign Out Redirect Guard)            │
│  └──────────────────────┘                                       │
└──────────────────────────────────────────────────────────────┘
```

### What It Does

This is the **largest and loosest** community (42 nodes, cohesion 0.07). It's loose because it contains many independent UI components that happen to share the same rendering layer — a hero banner doesn't call a footer, and a mobile nav drawer doesn't import a booking overlay. They coexist in the same "public face" layer.

**Key nodes:**
- **Supabase Three-Tier Client Architecture** (7 edges) — The concept that the app uses three separate Supabase clients: browser (for auth), server (for public data), and admin (for CMS writes). This pattern threads through every UI component.
- **HeroBookingButton** (6 edges) — The booking CTA embedded in the hero section. One of five identical booking buttons across the site.
- **BookingOverlay** (6 edges) — Uses `createPortal` to render an OpenTable iframe above the page, with scroll-lock to prevent background scrolling.
- **Header** — Sticky, scroll-aware navigation with a mobile drawer menu.
- **AuthError Detection** — Classifies JWT/session errors so the app can respond appropriately to expired tokens.

### Bridges to Other Communities

- Most pages here **call data fetchers** (Community 4) for their content
- Booking buttons **route through the BookingOverlay** pattern (Community 4's `getBookingOverlayImage`)
- Admin pages **depend on admin auth** (Community 1's `requireAdminUser`)
- The Supabase Three-Tier pattern **connects conceptually** to Community 3's admin CMS

### Why Cohesion is Low (0.07)

Cohesion measures how much nodes within a community call each other. At 0.07, this is the loosest community — because the graph algorithm grouped 42 disparate UI components together by their shared imports (React, Next.js, Supabase client) rather than by direct function calls. A `Header` doesn't need a `Footer` to work. They're neighbors in the graph space, not collaborators.

## For LLMs

### Data

- **ID:** 0
- **Label:** Herox Module (42 functions)
- **Size:** 42 nodes
- **Cohesion:** 0.07
- **Character:** code
- **Primary file:** Hero.tsx

### Top Nodes by Connectivity

- **Supabase Three-Tier Client Architecture** -- 7 connections [rationale]
- **Homepage Multi-Section Composer** -- 6 connections [code]
- **HeroBookingButton (Overlay Wrapper in Hero)** -- 6 connections [code]
- **BookingOverlay (createPortal + Iframe Injection + Scroll Lock)** -- 6 connections [code]
- **VisitInfoBookingButton (Overlay Wrapper in Visit)** -- 5 connections [code]
- **Server Component Data Fetching Pattern** -- 5 connections [rationale]
- **Seed Data (Full Menu, Venue, Hours, Gallery, Bowls)** -- 4 connections [code]
- **FooterBookingButton (Booking Overlay Wrapper)** -- 4 connections [code]
- **Duplicate OpenTable RID Across 5 Buttons** -- 4 connections [rationale]
- **Data Fetchers (Supabase with Seed Fallback)** -- 4 connections [code]

**No cross-community edges -- this community is self-contained.**
