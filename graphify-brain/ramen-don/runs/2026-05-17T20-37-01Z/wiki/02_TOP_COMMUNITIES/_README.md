---
type: community/index
---

# Top Communities

> 20 communities from the Ramen Don knowledge graph. Each page has a "For Humans" narrative and a "For LLMs" data section.

## Community Mindmap

```mermaid
mindmap
  root((Ramen Don<br/>219 nodes, 55 communities))
    Public Pages
      C0: Data Fetching & Supabase
      C1: Page Composition & Fallback
      C16: PublicLayout Domain
      C17: HomePage Domain
    Admin & CMS
      C2: API Route Handlers
      C3: Admin CMS Panel & ISR
      C5: Image Management
      C7: Content Editors
      C9: Auth & Menu
      C13: Dashboard Setup
    Booking
      C4: Booking Overlay & Nav
      C14: Overlay Core Logic
      C18: OpenTable Integration
    Auth & Infra
      C8: Auth & Client Architecture
      C10: API Fallback Pattern
    Navigation
      C11: Menu Scroll Logic
    Session Artifacts
      C6: Previous Sessions
      C12: API God Nodes
      C15: Booking Data Layer
    Single-File
      C19: Root Layout
```

## Community Flow: How Data Moves Through the System

```mermaid
graph LR
    subgraph Read["📖 Reading Data (Public)"]
        C0["C0: Data Fetching<br/>19 nodes"] --> C1["C1: Page Composition<br/>18 nodes"]
        C1 --> C16["C16: PublicLayout"]
        C1 --> C17["C17: HomePage"]
        C0 --> C8["C8: Auth & Clients"]
    end

    subgraph Write["✏️ Writing Data (Admin)"]
        C8 --> C13["C13: Dashboard Setup"]
        C13 --> C3["C3: Admin CMS Panel<br/>15 nodes"]
        C3 --> C2["C2: API Routes<br/>16 nodes"]
        C3 --> C5["C5: Image Mgmt<br/>12 nodes"]
        C7["C7: Content Editors<br/>10 nodes"] --> C3
        C9["C9: Auth & Menu<br/>7 nodes"] --> C3
    end

    subgraph Book["📅 Booking Flow"]
        C4["C4: Booking Overlay<br/>15 nodes"] --> C14["C14: Overlay Logic"]
        C4 --> C18["C18: OpenTable"]
    end

    C2 --> C10["C10: API Fallback<br/>7 nodes"]
    C2 -->|revalidate| C0

    style Read fill:#1a1714,stroke:#c8892a,color:#f0ebe3
    style Write fill:#2c231d,stroke:#c8892a,color:#f0ebe3
    style Book fill:#1a1714,stroke:#d9992f,color:#f0ebe3
```

## Community Listing

| # | Community | Nodes | Character | Cohesion | Key Concepts |
|---|-----------|-------|-----------|----------|-------------|
| 0 | [[COMMUNITY_0|Data Fetching & Supabase Integration]] | 19 | code | 0.23 | isSupabaseConfigured(), createSupabaseServerClient(), fetchers.ts, 8 get* functions |
| 1 | [[COMMUNITY_1|Public Page Composition & Fallback Architecture]] | 18 | code | 0.14 | Homepage Composer, Server Component Pattern, Seed Data, Dark Theme |
| 2 | [[COMMUNITY_2|Admin API Route Handlers]] | 16 | code | 0.27 | GET(), PATCH(), POST(), DELETE(), createSupabaseAdminClient() |
| 3 | [[COMMUNITY_3|Admin CMS Panel & ISR]] | 15 | code | 0.21 | ISR Revalidation, 7 admin CRUD pages, Button component, CMS Pattern |
| 4 | [[COMMUNITY_4|Booking Overlay & Navigation UI]] | 15 | code | 0.18 | BookingOverlay, 5 booking buttons, OpenTable RID, Portal Pattern |
| 5 | [[COMMUNITY_5|Admin Image Management]] | 12 | code | 0.30 | revalidate(), gallery CRUD, hero toggle, upload |
| 6 | [[COMMUNITY_6|Previous Session Artifacts]] | 12 | concept | 0.24 | Graphify memory system, /raw workflow, Obsidian vault |
| 7 | [[COMMUNITY_7|Admin Content Editors]] | 10 | code | 0.00 | Homepage editor, Hours editor, Venue editor, handleSave() |
| 8 | [[COMMUNITY_8|Auth & Supabase Client Architecture]] | 9 | code | 0.28 | Three-tier clients, AdminAuthWatcher, Login, AdminNav |
| 9 | [[COMMUNITY_9|Admin Auth & Menu Management]] | 7 | code | 0.00 | MenuAdminPage, handleSubmit(), createSupabaseBrowserClient() |
| 10 | [[COMMUNITY_10|API Fallback Pattern]] | 7 | code | 0.29 | Seed fallback in every route, 6 API route implementations |
| 11 | [[COMMUNITY_11|Menu Scroll Navigation Logic]] | 6 | code | 0.60 | MenuNav, scrollTo(), updateActive(), getScrollOffset() |
| 12 | [[COMMUNITY_12|API Route God Nodes (Session)]] | 4 | concept | 0.50 | GET/PATCH/POST god node documentation |
| 13 | [[COMMUNITY_13|Admin Dashboard Setup Wizard]] | 3 | code | 0.00 | page.tsx, runSetup(), checkConfiguration() |
| 14 | [[COMMUNITY_14|BookingOverlay Core Logic]] | 3 | code | 0.00 | BookingOverlay.tsx, onKey(), handleNavigate() |
| 15 | [[COMMUNITY_15|Admin Booking Data Layer (Session)]] | 3 | concept | 0.67 | isSupabaseConfigured, createSupabaseServerClient |
| 16 | [[COMMUNITY_16|PublicLayout Domain]] | 3 | concept | 0.00 | PublicLayout(), getVenueDetails(), getBookingOverlayImage() |
| 17 | [[COMMUNITY_17|HomePage Domain]] | 3 | concept | 0.00 | HomePage(), getHomepageSections(), getOpeningHours() |
| 18 | [[COMMUNITY_18|OpenTable External Integration]] | 3 | mixed | 0.67 | RID 325722, Reservations Page, OpenTableWidget |
| 19 | [[COMMUNITY_19|Root Layout]] | 2 | code | 0.00 | layout.tsx, RootLayout() |

---

**Cohesion guide:** 0.00-0.15 loose / 0.15-0.30 moderate / 0.30-0.50 coherent / 0.50+ tight
