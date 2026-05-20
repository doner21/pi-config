# Graph Report - C:/Users/doner/ramen-don/src  (2026-05-15)

## Corpus Check
- Corpus is ~19,383 words - fits in a single context window. You may not need a graph.

## Summary
- 219 nodes · 248 edges · 55 communities (40 shown, 15 thin omitted)
- Extraction: 60% EXTRACTED · 40% INFERRED · 0% AMBIGUOUS · INFERRED: 100 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Data Fetching & Supabase Integration|Data Fetching & Supabase Integration]]
- [[_COMMUNITY_Public Page Composition & Fallback Architecture|Public Page Composition & Fallback Architecture]]
- [[_COMMUNITY_Admin API Route Handlers|Admin API Route Handlers]]
- [[_COMMUNITY_Admin CMS Panel & ISR|Admin CMS Panel & ISR]]
- [[_COMMUNITY_Booking Overlay & Navigation UI|Booking Overlay & Navigation UI]]
- [[_COMMUNITY_Admin Image Management (GalleryOverlayBowls)|Admin Image Management (Gallery/Overlay/Bowls)]]
- [[_COMMUNITY_Previous Session Artifacts|Previous Session Artifacts]]
- [[_COMMUNITY_Admin Content Editors (HomepageHoursVenue)|Admin Content Editors (Homepage/Hours/Venue)]]
- [[_COMMUNITY_Auth & Supabase Client Architecture|Auth & Supabase Client Architecture]]
- [[_COMMUNITY_Admin Auth & Menu Management|Admin Auth & Menu Management]]
- [[_COMMUNITY_API Fallback Pattern|API Fallback Pattern]]
- [[_COMMUNITY_Menu Scroll Navigation Logic|Menu Scroll Navigation Logic]]
- [[_COMMUNITY_API Route God Nodes (Session)|API Route God Nodes (Session)]]
- [[_COMMUNITY_Admin Booking Data Layer (Session)|Admin Booking Data Layer (Session)]]
- [[_COMMUNITY_PublicLayout Fetch Pattern (Session)|PublicLayout Fetch Pattern (Session)]]
- [[_COMMUNITY_HomePage Fetch Pattern (Session)|HomePage Fetch Pattern (Session)]]
- [[_COMMUNITY_OpenTable External Integration|OpenTable External Integration]]
- [[_COMMUNITY_App Icon & Root Layout|App Icon & Root Layout]]
- [[_COMMUNITY_Menu Item Display Components|Menu Item Display Components]]
- [[_COMMUNITY_GalleryGrid Component|GalleryGrid Component]]
- [[_COMMUNITY_Revalidate God Node|Revalidate God Node]]
- [[_COMMUNITY_Public Pages Data Pattern|Public Pages Data Pattern]]
- [[_COMMUNITY_HoursSections Fetch Pattern|Hours/Sections Fetch Pattern]]
- [[_COMMUNITY_Menu Supabase Client|Menu Supabase Client]]
- [[_COMMUNITY_Menu Scroll Nav Pattern|Menu Scroll Nav Pattern]]
- [[_COMMUNITY_Gallery Page Masonry|Gallery Page Masonry]]
- [[_COMMUNITY_Supabase Storage Gallery Bucket|Supabase Storage Gallery Bucket]]
- [[_COMMUNITY_Site Settings KV Store|Site Settings KV Store]]

## God Nodes (most connected - your core abstractions)
1. `GET()` - 10 edges
2. `revalidate()` - 9 edges
3. `PATCH()` - 9 edges
4. `isSupabaseConfigured()` - 9 edges
5. `createSupabaseServerClient()` - 9 edges
6. `ISR On-Demand Revalidation Pattern` - 9 edges
7. `POST()` - 8 edges
8. `HomePage()` - 7 edges
9. `Supabase Three-Tier Client Architecture` - 7 edges
10. `Seed Data Fallback in Every API Route` - 7 edges

## Surprising Connections (you probably didn't know these)
- `VisitInfo (Address + Hours + Reserve Three-Column)` --conceptually_related_to--> `Homepage Multi-Section Composer`  [INFERRED]
  src/components/sections/VisitInfo.tsx → src/app/(public)/page.tsx
- `Admin Menu (Category + Item CRUD with Modals)` --semantically_similar_to--> `Admin Signature Bowls (CRUD + Gallery Image Modal)`  [INFERRED] [semantically similar]
  src/app/admin/menu/page.tsx → src/app/admin/signature-bowls/page.tsx
- `Signature Bowls API (GET with Gallery JOIN)` --implements--> `Seed Data Fallback in Every API Route`  [INFERRED]
  src/app/api/admin/signature-bowls/route.ts → src/app/api/admin/venue/route.ts
- `Header (Sticky Scroll-Aware + Mobile Drawer + Booking)` --semantically_similar_to--> `Footer (Logo + Nav + Contact + Hours in 4 Columns)`  [INFERRED] [semantically similar]
  src/components/layout/Header.tsx → src/components/layout/Footer.tsx
- `Ramen Don App Icon (icon.png)` --conceptually_related_to--> `Root Layout (Fonts, Metadata, Body)`  [EXTRACTED]
  src/app/icon.png → src/app/layout.tsx

## Hyperedges (group relationships)
- **God Nodes - Highest Change Risk in Ramen Don** — session_god_node_GET, session_god_node_PATCH, session_god_node_POST, session_god_node_revalidate, session_god_node_isSupabaseConfigured, session_god_node_createSupabaseServerClient [EXTRACTED 1.00]
- **Graphify Memory System Stack** — session_graphify_package, session_graphify_pipeline, session_graph_json, session_claude_md_bridge, session_obsidian_vault [EXTRACTED 1.00]
- **PublicLayout Per-Render Data Fetch Performance Surface** — session_PublicLayout, session_getVenueDetails, session_getBookingOverlayImage [EXTRACTED 1.00]
- **Ramen Don Community Clusters** — session_community_api_route_handlers, session_community_admin_booking_data_layer, session_community_public_pages_data_fetching, session_community_hours_sections_fetch, session_community_menu_supabase_client, session_community_menu_scroll_navigation [EXTRACTED 1.00]
- **CMS-Managed Content Types** — admingallery_crud_upload, adminhomepage_sectioneditor, adminhours_timeeditor, adminmenu_category_item_crud, adminoverlayimage_gallery_picker, adminsigbowls_gallery_modal, adminvenue_formeditor [INFERRED 0.90]
- **Booking Button Family (5 Components, Same RID)** — bookingcta_section, booking_buttons_rid_duplication [INFERRED 0.90]
- **Menu Display Pipeline (Nav â†’ Category â†’ Item)** — menunav_scrollspy_sticky, menucategory_section_divider, menuitem_tags_pricevariants [EXTRACTED 1.00]
- **In-Page Booking Button Family (All Route Through BookingOverlay)** — herobookingbutton, footerbookingbutton, visitinfobookingbutton, bookingoverlay_createlportal_iframe [EXTRACTED 1.00]

## Communities (55 total, 15 thin omitted)

### Community 0 - "Data Fetching & Supabase Integration"
Cohesion: 0.23
Nodes (13): getBookingOverlayImage(), getGalleryImages(), getHeroImage(), getHomepageSections(), getMenuCategories(), getOpeningHours(), getSignatureBowls(), getVenueDetails() (+5 more)

### Community 1 - "Public Page Composition & Fallback Architecture"
Cohesion: 0.14
Nodes (18): Client/Server Component Boundary, Contact Page (Details + Hours Dual Panel), Data Fetchers (Supabase with Seed Fallback), Footer (Logo + Nav + Contact + Hours in 4 Columns), Hero (Full-Screen Image + Wordmark + Scroll Indicator), Homepage Multi-Section Composer, MenuHighlights (Signature Bowl Grid with Gallery Images), MenuNav (ScrollSpy Active Tracking + Smooth Scroll) (+10 more)

### Community 2 - "Admin API Route Handlers"
Cohesion: 0.27
Nodes (5): DELETE(), GET(), PATCH(), POST(), createSupabaseAdminClient()

### Community 3 - "Admin CMS Panel & ISR"
Cohesion: 0.21
Nodes (15): Admin Dashboard (Setup Wizard + Section Grid), Admin Gallery (CRUD + File Upload + Hero Toggle), Admin Homepage (Section Editor with Visibility Toggle), Admin Hours (Lunch/Dinner Time Editor), Admin Menu (Category + Item CRUD with Modals), Admin Overlay Image (Gallery Photo Picker), Admin Signature Bowls (CRUD + Gallery Image Modal), Admin Venue (Form Editor for Contact Details) (+7 more)

### Community 4 - "Booking Overlay & Navigation UI"
Cohesion: 0.18
Nodes (11): Duplicate OpenTable RID Across 5 Buttons, Booking Overlay Portal Pattern, BookingCTA (Reusable Booking Section), BookingOverlay (createPortal + Iframe Injection + Scroll Lock), Booking Overlay Fallback Constants, FooterBookingButton (Booking Overlay Wrapper), Header (Sticky Scroll-Aware + Mobile Drawer + Booking), HeroBookingButton (Overlay Wrapper in Hero) (+3 more)

### Community 5 - "Admin Image Management (Gallery/Overlay/Bowls)"
Cohesion: 0.3
Nodes (9): fetchData(), fetchImages(), handleDelete(), handleSelect(), handleUpload(), handleUseDefault(), revalidate(), toggleHero() (+1 more)

### Community 6 - "Previous Session Artifacts"
Cohesion: 0.24
Nodes (12): CLAUDE.md as Session Bridge, Compile Knowledge Once at Ingestion Principle, graph.json (Compiled Knowledge Store), Session: Building the Graphify Memory System for Ramen Don, Graphify Package, Graphify Pipeline (56-file run on src/), Karpathy /raw Folder Workflow, Obsidian Vault (Human Navigation Layer) (+4 more)

### Community 8 - "Auth & Supabase Client Architecture"
Cohesion: 0.28
Nodes (9): AdminAuthWatcher (Sign Out Redirect Guard), Admin Layout (Auth Guard + Sidebar), Admin Login (Supabase Email/Password Auth), AdminNav (Mobile + Desktop Sidebar with Sign Out), AuthError Detection (JWT/Session Error Classifier), Supabase Admin Client (Service Role, No RLS), Supabase Browser Client (No Module Cache), Supabase Three-Tier Client Architecture (+1 more)

### Community 10 - "API Fallback Pattern"
Cohesion: 0.29
Nodes (7): Gallery API (GET/POST/PATCH/DELETE with Storage Upload), Homepage API (GET/PATCH Upsert Sections), Hours API (GET/PATCH Day-of-Week Upsert), Menu Categories API (GET/POST/PATCH/DELETE), Menu Items API (GET/POST/PATCH/DELETE), Seed Data Fallback in Every API Route, Venue API (Singleton Upsert)

### Community 11 - "Menu Scroll Navigation Logic"
Cohesion: 0.6
Nodes (4): getScrollEl(), getScrollOffset(), scrollTo(), updateActive()

### Community 12 - "API Route God Nodes (Session)"
Cohesion: 0.5
Nodes (4): Community: API Route Handlers (27 nodes), God Node: GET() - All Admin Read Routes, God Node: PATCH() - All Admin Update Routes, God Node: POST() - All Admin Create Routes

### Community 15 - "Admin Booking Data Layer (Session)"
Cohesion: 0.67
Nodes (3): Community: Admin + Booking Data Layer (21 nodes), God Node: createSupabaseServerClient() - Server-Side DB Access, God Node: isSupabaseConfigured() - Gates All DB Ops

### Community 18 - "OpenTable External Integration"
Cohesion: 0.67
Nodes (3): OpenTable Restaurant ID 325722, OpenTableWidget (External Link to OpenTable), Reservations Page (OpenTable Embed + What to Expect)

## Knowledge Gaps
- **39 isolated node(s):** `Karpathy /raw Folder Workflow`, `God Node: GET() - All Admin Read Routes`, `God Node: PATCH() - All Admin Update Routes`, `God Node: POST() - All Admin Create Routes`, `God Node: revalidate() - Cache Invalidation` (+34 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Supabase Three-Tier Client Architecture` connect `Auth & Supabase Client Architecture` to `Admin CMS Panel & ISR`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `Admin Dashboard (Setup Wizard + Section Grid)` connect `Admin CMS Panel & ISR` to `Auth & Supabase Client Architecture`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Are the 8 inferred relationships involving `isSupabaseConfigured()` (e.g. with `getVenueDetails()` and `getOpeningHours()`) actually correct?**
  _`isSupabaseConfigured()` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Are the 8 inferred relationships involving `createSupabaseServerClient()` (e.g. with `getVenueDetails()` and `getOpeningHours()`) actually correct?**
  _`createSupabaseServerClient()` has 8 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Karpathy /raw Folder Workflow`, `God Node: GET() - All Admin Read Routes`, `God Node: PATCH() - All Admin Update Routes` to the rest of the system?**
  _39 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Public Page Composition & Fallback Architecture` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._