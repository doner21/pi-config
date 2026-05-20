---
type: community/narrative
community_id: 3
label: "pagex Module (22 functions)"
size: 22
cohesion: 0.13
character: code
---

# Community 3: pagex Module (22 functions)

> **22 nodes** | **Cohesion: 0.13** (loosely connected) | **Character: code**

## For Humans

### Analogy: The Manager's Office

This community is like **the restaurant manager's office** — the place where staff configure everything the customers see. Want to change the menu? Update hours? Add a photo to the gallery? Feature a signature bowl? Toggle a homepage section on or off? All done here.

Every change triggers **ISR On-Demand Revalidation** — the moment a manager saves, Next.js rebuilds the affected public pages so customers see the update immediately. No deploy needed.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN CMS DASHBOARD                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────┐       │
│  │   Admin Dashboard (Setup Wizard + Section Grid) │       │
│  │   Checks Supabase config, shows status of each   │       │
│  │   CMS section, offers setup wizard if needed     │       │
│  └──────────────────────┬───────────────────────────┘       │
│                         │                                    │
│     ┌───────┬───────────┼───────────┬───────────┬───────┐   │
│     │       │           │           │           │       │   │
│  ┌──▼──┐ ┌──▼──┐   ┌───▼────┐  ┌───▼────┐  ┌───▼──┐ ┌─▼──┐│
│  │Menu │ │Hours│   │Gallery │  │Overlay │  │Bowls │ │Ven-││
│  │CRUD │ │Edit │   │CRUD +  │  │Image   │  │CRUD +│ │ue  ││
│  │with │ │     │   │Upload +│  │Picker  │  │Gal-  │ │Edit││
│  │Mod- │ │     │   │Hero    │  │        │  │lery  │ │or  ││
│  │als  │ │     │   │Toggle  │  │        │  │Modal │ │    ││
│  └──┬──┘ └──┬──┘   └───┬────┘  └───┬────┘  └───┬──┘ └─┬──┘│
│     │       │           │           │           │       │   │
│     └───────┴───────────┴─────┬─────┴───────────┴───────┘   │
│                               │                              │
│               ┌───────────────▼───────────────┐              │
│               │   ISR On-Demand Revalidation  │              │
│               │   (9 edges — triggers after   │              │
│               │    every save to rebuild       │              │
│               │    public pages)               │              │
│               └───────────────────────────────┘              │
│                                                              │
│  ┌──────────────────────────────────────────────────┐       │
│  │         Seed Data Fallback (7 edges)              │       │
│  │   Every API route includes inline seed data.     │       │
│  │   When Supabase is unconfigured, the app still    │       │
│  │   works with demo content (menu, hours, etc.)     │       │
│  └──────────────────────────────────────────────────┘       │
│                                                              │
│  ┌──────────────────────────────────────────────────┐       │
│  │   Polymorphic Button Component (5 edges)          │       │
│  │   Renders as <a>, <button>, or Next.js <Link>    │       │
│  │   with 3 visual variants. Used across admin.      │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### What It Does

This is the **Admin CMS Pages** community (22 nodes, cohesion 0.13). It contains page-level components that staff use to manage content:

- **Admin Dashboard** — Shows configuration status, acts as the CMS hub
- **Menu Editor** — CRUD for categories and items with modal dialogs
- **Hours Editor** — Sets lunch and dinner hours per day of week
- **Gallery Manager** — Upload images, toggle hero status, delete photos
- **Overlay Image Picker** — Selects which photo appears in the booking overlay
- **Signature Bowls CRUD** — Featured bowls with gallery image association
- **Venue Editor** — Address, phone, contact details form

**Key nodes:**
- **ISR On-Demand Revalidation** (9 edges) — The pattern that makes CMS changes visible immediately. `revalidate()` is called after every save operation.
- **Seed Data Fallback** (7 edges) — Every API route can fall back to hardcoded demo data when Supabase isn't configured.
- **Polymorphic Button** (5 edges) — A reusable component that adapts its rendered element and style.

### Bridges to Other Communities

- **To Community 0** (public UI): The admin dashboard is conceptually related to the Supabase Three-Tier Client Architecture.
- **To Community 7** (image management): Every CRUD page that handles images calls `handleUpload()`, `handleDelete()`, `revalidate()`.
- **To Community 1** (API routes): Each admin page makes fetch calls to its corresponding API route handler.

### Why Cohesion is Low (0.13)

Like Communities 0 and 1, these are independent page components that share patterns (ISR, seed data, the button component) but don't call each other. The Menu editor doesn't import the Gallery manager.

## For LLMs

### Data

- **ID:** 3
- **Label:** pagex Module (22 functions)
- **Size:** 22 nodes
- **Cohesion:** 0.13
- **Character:** code
- **Primary file:** page.tsx

### Top Nodes by Connectivity

- **ISR On-Demand Revalidation Pattern** -- 9 connections [rationale]
- **Seed Data Fallback in Every API Route** -- 7 connections [rationale]
- **Button (Polymorphic: Link or Button, 3 Variants)** -- 5 connections [code]
- **Admin Signature Bowls (CRUD + Gallery Image Modal)** -- 5 connections [code]
- **Admin Overlay Image (Gallery Photo Picker)** -- 4 connections [code]
- **Admin Dashboard (Setup Wizard + Section Grid)** -- 4 connections [code]
- **Admin Gallery (CRUD + File Upload + Hero Toggle)** -- 3 connections [code]
- **Signature Bowls API (GET with Gallery JOIN)** -- 2 connections [code]
- **Overlay Image API (Site Settings KV Store)** -- 2 connections [code]
- **CMS-Driven Static Site with Admin Panel** -- 2 connections [rationale]

### Cross-Community Connections
- **Herox Module (42 functions)** (C0) -- 1 edge(s)
  - Admin Dashboard (Setup Wizard + Section Grid) -> Supabase Three-Tier Client Architecture (conceptually_related_to)
