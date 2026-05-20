---
type: community/narrative
community_id: 7
label: "Admin Content Editors (Homepage/Hours/Venue)"
size: 10
cohesion: 0.00
character: code
---

# Community 7: Admin Content Editors

> **10 nodes** | **Cohesion: 0.00** (loose) | **Character: code**

## For Humans

### What It's Like

This community is **the restaurant manager's clipboard**. It's the forms and editors for three specific content types: homepage sections (hero text, story, CTAs), opening hours (which days are open, lunch/dinner times), and venue details (address, phone, social links). Each editor is a self-contained form with a "Save All Changes" button that saves to Supabase and revalidates the cache.

### Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    Admin Content Editors                          │
│                 (The Manager's Clipboard)                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Three independent form editors:                                  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Homepage Editor (homepage/page.tsx)                        │ │
│  │  ┌──────────────────────────────────────────────────────┐   │ │
│  │  │ For each section (hero, story, dishes, visit-cta):   │   │ │
│  │  │ • Heading text input                                  │   │ │
│  │  │ • Subheading text input                               │   │ │
│  │  │ • Body textarea                                       │   │ │
│  │  │ • CTA text + URL inputs                               │   │ │
│  │  │ • Visibility toggle (on/off)                          │   │ │
│  │  └──────────────────────────────────────────────────────┘   │ │
│  │  Functions: fetchSections(), updateSection(), handleSave()   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Hours Editor (hours/page.tsx)                               │ │
│  │  ┌──────────────────────────────────────────────────────┐   │ │
│  │  │ For each day of week (Mon-Sun):                       │   │ │
│  │  │ • Open/Closed toggle                                  │   │ │
│  │  │ • Lunch: open time → close time                       │   │ │
│  │  │ • Dinner: open time → close time                      │   │ │
│  │  │ • Special note field                                  │   │ │
│  │  └──────────────────────────────────────────────────────┘   │ │
│  │  Functions: fetchHours(), updateHour(), handleSave()         │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Venue Editor (venue/page.tsx)                               │ │
│  │  ┌──────────────────────────────────────────────────────┐   │ │
│  │  │ Single-page form with 11 fields:                      │   │ │
│  │  │ Name, Tagline, Address L1/L2, City, County, Postcode  │   │ │
│  │  │ Phone, Email, Instagram URL, OpenTable URL            │   │ │
│  │  └──────────────────────────────────────────────────────┘   │ │
│  │  Functions: fetchVenue(), updateField(), handleSave()        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  All three share the same save pattern:                           │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                   │
│  │ handleSave│───▶│ PATCH    │───▶│revalidate│                   │
│  │ ()        │    │ API route│    │ ()       │                   │
│  └──────────┘    └──────────┘    └──────────┘                   │
│                                                                   │
│  All three show a "Saved ✓" indicator for 3 seconds              │
└──────────────────────────────────────────────────────────────────┘
```

### What It Does

Three admin pages for editing text-based content. The Homepage editor manages up to 4 sections (hero, story, signature dishes, visit CTA) with visibility toggles. The Hours editor manages the 7-day schedule with separate lunch/dinner time inputs and special notes. The Venue editor is a flat form with 11 fields covering all restaurant contact information. All three follow the same pattern: load → edit → save (PATCH) → revalidate → show "Saved".

### Key Nodes

| Node | Role | Connections |
|------|------|-------------|
| Homepage Editor (page.tsx) | Section content editor | 3 |
| Hours Editor (page.tsx) | Weekly schedule editor | 3 |
| Venue Editor (page.tsx) | Contact info form | 3 |
| `handleSave()` | Save → PATCH API → revalidate → show "Saved" | 3 |
| `updateSection()` | Update a single section field in state | 1 |
| `updateHour()` | Update a single day's time/status | 1 |
| `updateField()` | Update a single venue field in state | 1 |
| `fetchVenue()` | Load venue data on mount | 1 |
| `fetchSections()` | Load homepage sections on mount | 1 |
| `fetchHours()` | Load opening hours on mount | 1 |

### Bridge Analysis

**Self-contained** in the graph. But conceptually, these editors write to the same API routes in C2 (hours → /api/admin/hours, venue → /api/admin/venue, homepage → /api/admin/homepage) and trigger the same ISR pattern in C3.

### Cohesion Explained

**0.00** — Loose. The three editors are in the same community by clustering, but they don't share code, don't call each other, and operate on different Supabase tables. They share only the *pattern* (fetch → edit → save → revalidate → "Saved" toast). This is a clustering artifact — they're together because they're structurally similar, not because they're coupled. Consider them three independent clipboards on the same desk.

## For LLMs

### Data

- **ID:** 7
- **Label:** Admin Content Editors (Homepage/Hours/Venue)
- **Size:** 10 nodes
- **Cohesion:** 0.00
- **Character:** code
- **Primary files:** src/app/admin/homepage/page.tsx, src/app/admin/hours/page.tsx, src/app/admin/venue/page.tsx

### Cross-Community Connections
**No cross-community edges — this community is self-contained.**
