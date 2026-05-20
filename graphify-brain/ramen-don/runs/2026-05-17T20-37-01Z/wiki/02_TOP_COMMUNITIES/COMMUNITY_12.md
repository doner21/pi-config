---
type: community/narrative
community_id: 12
label: "API Route God Nodes (Session)"
size: 4
cohesion: 0.50
character: concept
---

# Community 12: API Route God Nodes (Session)

> **4 nodes** | **Cohesion: 0.50** (tight) | **Character: concept**

## For Humans

### What It's Like

This is a **sticky note from a previous session** that identified the most important functions in the API route layer. It's a reminder that GET, PATCH, and POST are the god nodes of the admin API — they appear in 10, 9, and 8 routes respectively.

### Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                   API Route God Nodes (Session)                   │
│                     (The Architect's Notes)                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Three HTTP verbs dominate the API layer:                         │
│                                                                   │
│  ┌──────────┐                                                   │
│  │  GET()   │── Appears in 10 routes (every entity's read)       │
│  │ 10 edges │   gallery, homepage, hours, menu/cat,              │
│  │          │   menu/items, overlay-image, sig-bowls,            │
│  │          │   venue, revalidate, setup                         │
│  └──────────┘                                                   │
│                                                                   │
│  ┌──────────┐                                                   │
│  │ PATCH()  │── Appears in 9 routes (every entity's update)      │
│  │ 9 edges  │   gallery, homepage, hours, menu/cat,              │
│  │          │   menu/items, overlay-image, sig-bowls, venue       │
│  └──────────┘                                                   │
│                                                                   │
│  ┌──────────┐                                                   │
│  │ POST()   │── Appears in 8 routes (create + revalidate + setup)│
│  │ 8 edges  │   gallery, menu/cat, menu/items, sig-bowls,        │
│  │          │   revalidate, setup                                │
│  └──────────┘                                                   │
│                                                                   │
│  These three functions connect into:                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Community: API Route Handlers (27 nodes in older graph)    │ │
│  │  → The full collection of all route handler functions        │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### What It Does

Documents the god node analysis from a previous graphify run. GET(), PATCH(), and POST() were identified as the most-connected functions in the API layer, each appearing across multiple route files. These are session artifacts — documentation nodes, not code.

### Cohesion Explained

**0.50** — Tight. All 4 nodes are from the same session document discussing the same concept (API route god nodes). They form a coherent observation: these three HTTP verbs dominate the API architecture.

## For LLMs

- **ID:** 12 | **Label:** API Route God Nodes (Session) | **Size:** 4 | **Character:** concept
- **Primary file:** raw/sessions/2026-04-22-graphify-memory-system.md
- **Note:** These nodes reference a previous, larger graph (27 API nodes vs current 16). God node counts may differ from current graph.
