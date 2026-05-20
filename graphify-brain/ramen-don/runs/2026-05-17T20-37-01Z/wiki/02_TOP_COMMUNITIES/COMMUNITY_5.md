---
type: community/narrative
community_id: 5
label: "Admin Image Management (Gallery/Overlay/Bowls)"
size: 12
cohesion: 0.30
character: code
---

# Community 5: Admin Image Management

> **12 nodes** | **Cohesion: 0.30** (coherent) | **Character: code**

## For Humans

### What It's Like

This community is **the restaurant's photo studio**. It handles everything image-related: uploading new photos, choosing which one appears on the homepage hero, selecting the booking overlay image, and attaching gallery photos to signature bowls. Every image operation goes through the same process — upload to Supabase Storage, store metadata in the database, then revalidate the cache so the public site sees the change.

### Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                  Admin Image Management                           │
│                    (The Photo Studio)                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Three admin pages share image operations:                        │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              Gallery Admin Page                              │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │ │
│  │  │Upload    │  │toggleHero│  │updateAlt │  │handleDel │   │ │
│  │  │Photo     │  │()        │  │Text()    │  │ete()     │   │ │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │ │
│  │       │             │             │             │          │ │
│  │       ▼             ▼             ▼             ▼          │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │              revalidate()                             │  │ │
│  │  │         POST /api/admin/revalidate                    │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │           Overlay Image Admin Page                           │ │
│  │  ┌──────────┐  ┌──────────┐                                 │ │
│  │  │handleSel │  │handleUse │                                 │ │
│  │  │ect()     │  │Default() │                                 │ │
│  │  └────┬─────┘  └────┬─────┘                                 │ │
│  │       │             │                                        │ │
│  │       ▼             ▼                                        │ │
│  │  PATCH /api/admin/overlay-image                              │ │
│  │  {gallery_image_id: "..."} or {gallery_image_id: null}       │ │
│  │  → site_settings table (KV: booking_overlay_image_id)        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │         Signature Bowls Admin Page                           │ │
│  │  Bowl modal includes gallery image picker:                   │ │
│  │  ┌──────────────────────────────────────────────────────┐   │ │
│  │  │ [None] [Img1] [Img2] [Img3] ... ← gallery_images     │   │ │
│  │  │ Selected image set as bowl.gallery_image_id           │   │ │
│  │  │ Also supports uploading new photo inline              │   │ │
│  │  └──────────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Data flow for an upload:                                         │
│  ┌──────┐    ┌────────┐    ┌──────────┐    ┌──────────┐         │
│  │ File │───▶│ Storage│───▶│ gallery_ │───▶│revalidate│         │
│  │input │    │ Bucket │    │ images   │    │ Path     │         │
│  └──────┘    └────────┘    └──────────┘    └──────────┘         │
│                                                                   │
│  Known quirk: only ONE image can be hero at a time.              │
│  toggleHero(true) first clears all other is_hero flags.          │
└──────────────────────────────────────────────────────────────────┘
```

### What It Does

This community manages all visual content on the site. The Gallery page handles upload/delete/alt-text/hero-status for photos stored in Supabase Storage's "gallery" bucket. The Overlay Image page lets the admin pick which gallery photo appears in the booking modal (stored in a site_settings KV pair). The Signature Bowls admin lets the admin attach gallery images to featured bowls — including uploading new photos inline.

Every write operation is followed by `revalidate()` — a POST to the revalidate API — ensuring the public site reflects changes immediately.

### Key Nodes

| Node | Role | Connections |
|------|------|-------------|
| `revalidate()` | Called after every mutation — posts to /api/admin/revalidate | 9 |
| Gallery Admin (page.tsx) | Main gallery management page with all CRUD operations | 6 |
| Overlay Image Admin (page.tsx) | Photo picker for booking overlay image | 4 |
| Signature Bowls Admin (page.tsx) | Bowl editor with inline gallery picker | 3 |
| `handleUpload()` | FormData upload to Supabase Storage + DB insert | 3 |
| `handleDelete()` | Delete DB record + remove from storage bucket | 3 |
| `updateAltText()` | Inline alt text editing on gallery images | 2 |
| `toggleHero()` | Sets/un-sets is_hero flag (only one hero at a time) | 2 |
| `handleUseDefault()` | Clears overlay image setting → falls back to hero_ramen.png | 2 |
| `handleSelect()` | Sets a gallery image as the booking overlay image | 2 |

### Bridge Analysis

**Self-contained** in the graph. But conceptually, this community:
- Writes to **Supabase Storage** (gallery bucket — created by setup API in C2)
- Triggers **ISR revalidation** (C3) after every mutation
- Provides images consumed by **public pages** (C1) and **booking overlay** (C4)

### Cohesion Explained

**0.30** — Coherent. This is the tightest code community in the system. Three admin pages share the same Supabase gallery table, the same revalidation pattern, the same upload→insert→refresh flow. They don't call each other directly, but they operate on the same data model and follow identical patterns.

## For LLMs

### Data

- **ID:** 5
- **Label:** Admin Image Management (Gallery/Overlay/Bowls)
- **Size:** 12 nodes
- **Cohesion:** 0.30
- **Character:** code
- **Primary files:** src/app/admin/gallery/page.tsx, src/app/admin/overlay-image/page.tsx, src/app/admin/signature-bowls/page.tsx

### Cross-Community Connections
**No cross-community edges — this community is self-contained.**

### Shared Data Model

All three pages operate on `gallery_images` table:
- Gallery page: full CRUD on gallery_images
- Overlay image page: reads gallery_images, writes selected ID to site_settings
- Signature bowls page: reads gallery_images for image picker, writes gallery_image_id to signature_bowls
