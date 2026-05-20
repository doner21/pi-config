---
type: community/narrative
community_id: 1
label: "Public Page Composition & Fallback Architecture"
size: 18
cohesion: 0.14
character: code
---

# Community 1: Public Page Composition & Fallback Architecture

> **18 nodes** | **Cohesion: 0.14** (loose) | **Character: code**

## For Humans

### What It's Like

This community is **the dining room of the restaurant**. It's where everything comes together into a coherent experience for the customer. The tables (pages) are arranged by purpose — one for the menu, one for reservations, one for contact — but they all share the same tablecloth (dark theme), the same menu holder (navigation), and order from the same kitchen (fetchers).

### Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│           Public Page Composition & Fallback Architecture          │
│                     (The Dining Room)                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │                    PublicLayout                            │   │
│  │  ┌──────────┐              ┌──────────┐                   │   │
│  │  │  Header  │──────────────│  Footer  │                   │   │
│  │  │ scroll   │              │  4-col   │                   │   │
│  │  │ sticky   │              │  grid    │                   │   │
│  │  └──────────┘              └──────────┘                   │   │
│  │  Both receive overlayImage from getBookingOverlayImage()  │   │
│  └───────────────────────────────────────────────────────────┘   │
│                            │                                      │
│         ┌──────────────────┼──────────────────┐                  │
│         ▼                  ▼                  ▼                   │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐            │
│  │  HomePage   │   │  MenuPage   │   │  VisitPage  │            │
│  │             │   │             │   │             │            │
│  │ ┌─────────┐ │   │ ┌─────────┐ │   │ ┌─────────┐ │            │
│  │ │ Hero    │ │   │ │ MenuNav │ │   │ │ Address │ │            │
│  │ ├─────────┤ │   │ │scroll-spy│ │   │ │ + Hours │ │            │
│  │ │Highlights│ │   │ ├─────────┤ │   │ │ + Reserve│ │            │
│  │ ├─────────┤ │   │ │Category │ │   │ └─────────┘ │            │
│  │ │ Story   │ │   │ │ list    │ │   │              │            │
│  │ ├─────────┤ │   │ ├─────────┤ │   │              │            │
│  │ │BookingCTA│ │   │ │BookingCTA│ │   │              │            │
│  │ ├─────────┤ │   │ └─────────┘ │   │              │            │
│  │ │VisitInfo│ │   │             │   │              │            │
│  │ └─────────┘ │   │             │   │              │            │
│  └─────────────┘   └─────────────┘   └─────────────┘            │
│                                                                   │
│  All pages share:                                                 │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │ 🎨 Dark Theme (#1A1714 / #F0EBE3 / #C8892A amber gold)     │   │
│  │ 🔄 Server Component Data Fetching Pattern (async RSC)       │   │
│  │ 🛡️ Seed Data Fallback (site works without Supabase)         │   │
│  │ 📅 BookingCTA at section bottom                             │   │
│  └───────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### What It Does

This community is the assembly layer for public-facing pages. It contains the 6 public page components (Home, Menu, Gallery, Reservations, Contact, Visit), the shared PublicLayout that wraps them with Header+Footer, and the architectural patterns that make them all work: Server Component data fetching, seed data fallback, and the consistent dark theme.

### Key Nodes

| Node | Role | Connections |
|------|------|-------------|
| Homepage Multi-Section Composer | Orchestrates 6 parallel data fetches, assembles 5 sections (Hero, Highlights, Story, CTA, VisitInfo) | 6 |
| Server Component Data Fetching | The async RSC pattern all pages use | 5 |
| Seed Data (Full Menu, Venue, Hours...) | The 300-line fallback dataset in seed-data.ts | 4 |
| Data Fetchers (Supabase with Seed Fallback) | The fetchers.ts module — every page's data source | 4 |
| Seed Data Fallback Architecture | The pattern: check config → try DB → catch → return seed | 3 |
| Dark Theme | Consistent amber/gold color palette applied globally | 3 |
| PublicLayout | Wraps every public page with Header + Footer + overlayImage prefetch | 3 |
| Hero | Full-screen image + wordmark logo + scroll indicator | 3 |
| Footer | 4-column grid: Logo, Nav, Contact, Hours — with its own data fetch | 3 |
| TypeScript Data Models | 7 interfaces defining all data shapes | 2 |

### Bridge Analysis

This community connects to:
- **C4 (Booking Overlay)** — via `Hero → HeroBookingButton` (the hero's "Book a Table" button opens the overlay)
- **C8 (Auth Architecture)** — via `Data Fetchers → Supabase Server Client` (the fetchers use the server client)
- **C0 (Data Fetching)** — conceptually, every page calls into fetchers.ts

### Cohesion Explained

**0.14** — Loose. This is expected for a page-composition community. Pages don't call each other — they share patterns (theme, data fetching, fallback) but are structurally independent. The low cohesion reflects that these are parallel consumers of the same services, not a tightly coupled module. Think of it as 6 separate tables in a restaurant sharing the same menu and decor.

## For LLMs

### Data

- **ID:** 1
- **Label:** Public Page Composition & Fallback Architecture
- **Size:** 18 nodes
- **Cohesion:** 0.14
- **Character:** code
- **Primary files:** src/app/(public)/*.tsx, src/components/sections/*.tsx, src/lib/data/seed-data.ts

### Cross-Community Connections
- **Booking Overlay & Navigation UI** (C4) -- 1 edge(s)
  - Hero (Full-Screen Image + Wordmark + Scroll Indicator) → HeroBookingButton (Overlay Wrapper in Hero) (references)
- **Auth & Supabase Client Architecture** (C8) -- 1 edge(s)
  - Data Fetchers (Supabase with Seed Fallback) → Supabase Server Client (Cookie-Based SSR) (references)
