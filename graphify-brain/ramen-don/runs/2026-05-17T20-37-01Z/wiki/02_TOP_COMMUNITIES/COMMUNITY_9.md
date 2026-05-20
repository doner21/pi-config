---
type: community/narrative
community_id: 9
label: "Admin Auth & Menu Management"
size: 7
cohesion: 0.00
character: code
---

# Community 9: Admin Auth & Menu Management

> **7 nodes** | **Cohesion: 0.00** (loose) | **Character: code**

## For Humans

### What It's Like

This community is **a mixed bag from the admin pantry** — it contains the login form, the menu management page, and the browser Supabase client that both depend on. These ended up in the same community because they share `createSupabaseBrowserClient()` as a dependency, but functionally the login form and menu editor have nothing to do with each other.

### Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                  Admin Auth & Menu Management                     │
│                  (The Admin Pantry)                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Two separate admin pages sharing a client:                       │
│                                                                   │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐│
│  │  Login Page                 │  │  Menu Admin Page            ││
│  │  (admin/login/page.tsx)     │  │  (admin/menu/page.tsx)      ││
│  │                             │  │                             ││
│  │  ┌─────────────────────┐    │  │  ┌─────────────────────┐    ││
│  │  │ Email input         │    │  │  │ Category tabs       │    ││
│  │  │ Password input      │    │  │  │ (Plates/Bowls/...) │    ││
│  │  │ Sign In button      │    │  │  │ Item list per cat   │    ││
│  │  │ handleSubmit()      │    │  │  │ ItemModal (create/  │    ││
│  │  └────────┬────────────┘    │  │  │  edit item)        │    ││
│  │           │                 │  │  │ CategoryModal       │    ││
│  │           ▼                 │  │  │ handleSubmit()      │    ││
│  │  ┌─────────────────────┐    │  │  └────────┬────────────┘    ││
│  │  │ signInWithPassword  │    │  │           │                 ││
│  │  │ → router.push(      │    │  │           ▼                 ││
│  │  │   "/admin")         │    │  │  ┌─────────────────────┐    ││
│  │  └─────────────────────┘    │  │  │ POST /api/admin/    │    ││
│  │                             │  │  │ menu/items          │    ││
│  └──────────────┬──────────────┘  │  └─────────────────────┘    ││
│                 │                 └──────────────┬──────────────┘│
│                 │                                │               │
│                 ▼                                ▼               │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │          createSupabaseBrowserClient()                      │ │
│  │          (src/lib/supabase.ts)                              │ │
│  │          • anon key                                         │ │
│  │          • cookie-based auth                                │ │
│  │          • NOT cached at module level                       │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### What It Does

Two loosely related admin concerns. The Login page handles Supabase email/password authentication via `signInWithPassword()`, with Suspense wrapping the form for `useSearchParams`. The Menu Admin page is the most complex admin editor — it manages menu categories and items with inline modals, tag management, price variant support, and availability toggles. Both pages are `"use client"` components that use `createSupabaseBrowserClient()`.

### Key Nodes

| Node | Role | Connections |
|------|------|-------------|
| Login Page (page.tsx) | Email/password auth form with Suspense boundary | 3 |
| `handleSubmit()` | Login form submit → signInWithPassword → redirect | 3 |
| `createSupabaseBrowserClient()` | Factory for anon-key cookie-auth client | 2 |
| supabase.ts | Source file for browser client | 1 |
| Menu Admin Page (page.tsx) | Category tabs + item CRUD with ItemModal/CategoryModal | 1 |
| `if()` | Conditional rendering in menu admin | 1 |
| `MenuAdminPage()` | Main menu admin component | 1 |

### Bridge Analysis

**Self-contained** in the graph. But conceptually:
- Login page feeds into **Admin Layout** (C8) via auth state
- Menu Admin page calls **menu API routes** (C2) for CRUD

### Cohesion Explained

**0.00** — Loose. This is a clustering artifact — the login page and menu admin share the browser client dependency, which pulled them into the same community. They have no functional relationship (login ≠ menu editing). This is the data's way of saying "these both use `createSupabaseBrowserClient()`" rather than describing a coherent module.

## For LLMs

### Data

- **ID:** 9
- **Label:** Admin Auth & Menu Management
- **Size:** 7 nodes
- **Cohesion:** 0.00
- **Character:** code
- **Primary files:** src/app/admin/login/page.tsx, src/app/admin/menu/page.tsx, src/lib/supabase.ts

### Cross-Community Connections
**No cross-community edges — this community is self-contained.**

### Menu Admin Architecture

The Menu Admin page uses a pattern of:
1. Left sidebar with category tabs
2. Right panel showing items for the selected category
3. ItemModal component for create/edit (name, description, price, category, tags, availability)
4. CategoryModal component for create/edit (name, description, sort order)
5. Tags system with inline add/remove
6. Price variants support (label + price pairs for sake/wine)
