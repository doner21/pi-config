---
type: community/narrative
community_id: 7
label: "pagex Module (12 functions)"
size: 12
cohesion: 0.30
character: code
---

# Community 7: pagex Module (12 functions)

> **12 nodes** | **Cohesion: 0.30** (coherent and well-connected) | **Character: code**

## For Humans

### Analogy: The Photo Studio

This community is like **the restaurant's photo studio and image librarian**. Staff can upload photos, select which one appears as the hero banner, pick which gallery image shows on the booking overlay, and manage the signature bowls' featured photos. Every change triggers a `revalidate()` to refresh the public pages.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  IMAGE MANAGEMENT LAYER                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────┐       │
│  │              fetchData() / fetchImages()          │       │
│  │         Load current state from API routes        │       │
│  └──────────────────────┬───────────────────────────┘       │
│                         │                                    │
│     ┌───────────────────┼───────────────────┐                │
│     │                   │                   │                │
│  ┌──▼──────────┐  ┌─────▼──────┐  ┌────────▼────────┐      │
│  │handleUpload │  │handleSelect│  │handleUseDefault │      │
│  │()           │  │()          │  │()               │      │
│  │Upload new   │  │Pick an     │  │Reset to         │      │
│  │image to     │  │existing    │  │system default   │      │
│  │Supabase     │  │image for   │  │image (for      │      │
│  │Storage      │  │bowl/overlay│  │overlay)        │      │
│  └──────┬──────┘  └──────┬─────┘  └───────┬─────────┘      │
│         │                │                 │                 │
│  ┌──────▼────────────────▼─────────────────▼─────────┐      │
│  │                  handleDelete()                    │      │
│  │          Remove image from gallery/bowl            │      │
│  └──────────────────────┬────────────────────────────┘      │
│                         │                                    │
│  ┌──────────────────────▼────────────────────────────┐      │
│  │                  toggleHero()                      │      │
│  │       Toggle whether an image appears as the       │      │
│  │       full-screen hero banner on the homepage      │      │
│  └──────────────────────┬────────────────────────────┘      │
│                         │                                    │
│  ┌──────────────────────▼────────────────────────────┐      │
│  │                revalidate()                        │      │
│  │    (9 edges — triggers ISR page regeneration       │      │
│  │     after every image operation)                   │      │
│  └────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### What It Does

This is the **Image Management community** (12 nodes, cohesion 0.30 — solidly coherent). It handles all admin image operations:

- **Upload** — Stores new images in Supabase Storage
- **Select** — Associates an existing gallery image with a signature bowl or the booking overlay
- **Delete** — Removes images from the gallery
- **Toggle hero** — Marks/unmarks images as the homepage hero banner
- **Use default** — Resets the overlay image to a system default
- **Revalidate** — Fires ISR cache invalidation after every change

**Key nodes:**
- **revalidate()** (9 edges) — The universal cache-buster. Called after every image mutation.
- **fetchData()** / **fetchImages()** — Load current state from the gallery/bowls API routes.
- **handleUpload()**, **handleDelete()**, **handleSelect()**, **toggleHero()**, **handleUseDefault()** — The CRUD operations.

### Bridges to Other Communities

- **To Community 3** (admin CMS pages): Gallery page and bowls page import these handlers.
- **To Community 1** (API routes): Each handler calls the corresponding admin API route.

### Why Cohesion is Coherent (0.30)

All these functions operate on the same data model (images), share the same lifecycle (fetch → mutate → revalidate), and call each other through the page component. They're a cohesive unit — you can't modify images without touching multiple functions in this set.

## For LLMs

### Data

- **ID:** 7
- **Label:** pagex Module (12 functions)
- **Size:** 12 nodes
- **Cohesion:** 0.30
- **Character:** code
- **Primary file:** page.tsx

### Top Nodes by Connectivity

- **revalidate()** -- 9 connections [code]
- **page.tsx** -- 6 connections [code]
- **page.tsx** -- 4 connections [code]
- **page.tsx** -- 3 connections [code]
- **handleUpload()** -- 3 connections [code]
- **handleDelete()** -- 3 connections [code]
- **updateAltText()** -- 2 connections [code]
- **toggleHero()** -- 2 connections [code]
- **handleUseDefault()** -- 2 connections [code]
- **handleSelect()** -- 2 connections [code]

**No cross-community edges -- this community is self-contained.**
