---
type: community/narrative
community_id: 3
label: "Admin CMS Panel & ISR"
size: 15
cohesion: 0.21
character: code
---

# Community 3: Admin CMS Panel & ISR

> **15 nodes** | **Cohesion: 0.21** (moderate) | **Character: code**

## For Humans

### What It's Like

This community is **the restaurant manager's office**. Behind the scenes, away from customers, this is where all content decisions are made. The manager can change the menu, update hours, swap photos, rewrite the homepage story, and pick which image shows in the booking overlay — all from a dashboard. And when changes are saved, a runner goes out to refresh every public-facing display.

### Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    Admin CMS Panel & ISR                          │
│                 (The Manager's Office)                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │                   Admin Dashboard                        │     │
│  │  ┌──────────────────────────────────────────────────┐   │     │
│  │  │  Setup Wizard → checks env vars + Supabase tables │   │     │
│  │  └──────────────────────────────────────────────────┘   │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │     │
│  │  │  Hours   │ │  Venue   │ │   Menu   │ │ Gallery  │   │     │
│  │  │  Editor  │ │  Editor  │ │  Editor  │ │  Editor  │   │     │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                │     │
│  │  │ Homepage │ │Signature │ │ Overlay  │                │     │
│  │  │  Editor  │ │  Bowls   │ │  Image   │                │     │
│  │  └──────────┘ └──────────┘ └──────────┘                │     │
│  └─────────────────────────────────────────────────────────┘     │
│                            │                                      │
│               After every save:                                   │
│                            ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │              POST /api/admin/revalidate                  │     │
│  │  ┌──────────────────────────────────────────────────┐   │     │
│  │  │ revalidatePath("/", "layout") ← busts Header/     │   │     │
│  │  │                                  Footer cache     │   │     │
│  │  │ revalidatePath("/", "page")                       │   │     │
│  │  │ revalidatePath("/menu", "page")                   │   │     │
│  │  │ revalidatePath("/visit", "page")                  │   │     │
│  │  │ ... (all public + admin paths)                    │   │     │
│  │  └──────────────────────────────────────────────────┘   │     │
│  └─────────────────────────────────────────────────────────┘     │
│                            │                                      │
│                            ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │  Next visitor gets fresh SSR page with new content      │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                   │
│  Shared dependency:                                               │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │  Button (Polymorphic)                                    │     │
│  │  • 3 variants: primary/secondary/ghost                   │     │
│  │  • 3 sizes: sm/md/lg                                     │     │
│  │  • Can render as <Link> or <button>                      │     │
│  │  • Used by ALL admin pages                               │     │
│  └─────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
```

### What It Does

This is the content management heart of the application. Seven admin page components provide CRUD interfaces for every content type. After any save, the ISR On-Demand Revalidation pattern kicks in: a POST to `/api/admin/revalidate` calls `revalidatePath()` on the root layout (to refresh Header/Footer overlay image) and every page path. The key architectural decision is **layout-level revalidation** — without it, Header and Footer would keep showing the old booking overlay image after a change.

### Key Nodes

| Node | Role | Connections |
|------|------|-------------|
| ISR On-Demand Revalidation | The pattern linking saves to cache busting | 9 |
| Button (Polymorphic) | Shared UI primitive used by all admin pages | 5 |
| Admin Signature Bowls | CRUD page with gallery image modal picker | 5 |
| Admin Overlay Image | Gallery photo picker for booking modal image | 4 |
| Admin Dashboard | Setup wizard + 7-section navigation grid | 4 |
| Admin Gallery | CRUD + file upload + hero image toggle | 3 |
| Signature Bowls API | Read endpoint with gallery JOIN | 2 |
| Overlay Image API | Site settings KV store for booking image | 2 |
| CMS-Driven Static Site | The rationale for the entire admin panel | 2 |
| Admin Venue | Form-based editor for all venue fields | 2 |

### Bridge Analysis

- **→ C8 (Auth Architecture)**: Admin Dashboard conceptually connects to Supabase Three-Tier Client Architecture — the admin client is how all these pages write data
- **→ C10 (API Fallback Pattern)**: Signature Bowls API implements the seed data fallback pattern used across all routes
- **→ C2 (API Routes)**: Every admin page calls API routes — the ISR pattern calls the revalidate route

### Cohesion Explained

**0.21** — Moderate. Seven independent admin pages tied together by a shared ISR revalidation pattern and a shared Button component. They don't call each other, but they all follow the same UX pattern (load → edit → save → revalidate → show "Saved" indicator). The cohesion comes from **shared convention and shared dependency**, not direct coupling.

## For LLMs

### Data

- **ID:** 3
- **Label:** Admin CMS Panel & ISR
- **Size:** 15 nodes
- **Cohesion:** 0.21
- **Character:** code
- **Primary files:** src/app/admin/*/page.tsx (7 pages), src/app/api/admin/revalidate/route.ts

### Cross-Community Connections
- **Auth & Supabase Client Architecture** (C8) -- 1 edge(s)
  - Admin Dashboard (Setup Wizard + Section Grid) → Supabase Three-Tier Client Architecture (conceptually_related_to)
- **API Fallback Pattern** (C10) -- 1 edge(s)
  - Signature Bowls API (GET with Gallery JOIN) → Seed Data Fallback in Every API Route (implements)
