---
type: community/narrative
community_id: 13
label: "Admin Dashboard Setup Wizard"
size: 3
cohesion: 0.00
character: code
---

# Community 13: Admin Dashboard Setup Wizard

> **3 nodes** | **Cohesion: 0.00** (loose) | **Character: code**

## For Humans

### What It's Like

This is **the restaurant's onboarding checklist** — the first thing the manager sees when they walk into the admin panel. It checks if the environment is configured, shows missing variables, and offers a one-click setup wizard to create the gallery storage bucket and verify database tables.

### Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                  Admin Dashboard Setup Wizard                     │
│                 (The Onboarding Checklist)                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  checkConfiguration()                                       │ │
│  │  → Checks NEXT_PUBLIC_SUPABASE_URL                          │ │
│  │  → Checks NEXT_PUBLIC_SUPABASE_ANON_KEY                     │ │
│  │  → If missing: shows red warning with .env.local template   │ │
│  │  → If present: does GET /api/admin/menu/items to verify DB  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                            │                                      │
│                            ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  runSetup()                                                 │ │
│  │  → POST /api/admin/setup                                    │ │
│  │  → Creates gallery storage bucket (if missing)              │ │
│  │  → Verifies menu_items table exists                         │ │
│  │  → Returns success/failure message                          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  States:                                                          │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────┐           │
│  │ Missing  │───▶│ Not          │───▶│ Configured   │           │
│  │ Env Vars │    │ Configured   │    │ ✓            │           │
│  │ (red)    │    │ (run setup)  │    │ (dashboard)  │           │
│  └──────────┘    └──────────────┘    └──────────────┘           │
└──────────────────────────────────────────────────────────────────┘
```

### What It Does

The admin dashboard's entry-point logic: detect whether Supabase is configured, show helpful error messages with copy-pasteable `.env.local` templates if not, and offer a setup wizard that creates the gallery bucket and checks table existence. This is the first experience an admin has — it either guides them through setup or presents the dashboard.

### Cohesion Explained

**0.00** — The clustering isolated the dashboard page's two setup functions into their own community. They're tightly related to each other (both are setup operations in the same file), but the cohesion score reflects the lack of internal edges captured by the graph.

## For LLMs

- **ID:** 13 | **Size:** 3 | **Character:** code | **Primary file:** src/app/admin/page.tsx
- **Functions:** `checkConfiguration()`, `runSetup()`
