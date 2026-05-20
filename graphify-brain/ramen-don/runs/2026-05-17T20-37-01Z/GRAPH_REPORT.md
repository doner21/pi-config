# Graph Report - ramen-don  (2026-05-17)

## Corpus Check
- 121 files · ~1,814,153 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 384 nodes · 496 edges · 93 communities (77 shown, 16 thin omitted)
- Extraction: 67% EXTRACTED · 33% INFERRED · 0% AMBIGUOUS · INFERRED: 165 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `241a3e50`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 92|Community 92]]

## God Nodes (most connected - your core abstractions)
1. `bookingDbConfigured()` - 23 edges
2. `createSupabaseAdminClient()` - 20 edges
3. `requireAdminUser()` - 20 edges
4. `calculateAvailability()` - 12 edges
5. `isSupabaseConfigured()` - 11 edges
6. `getAvailabilityData()` - 11 edges
7. `main()` - 10 edges
8. `GET()` - 10 edges
9. `createSupabaseServerClient()` - 10 edges
10. `revalidate()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `confirmWithIdempotency()` --calls--> `createConfirmationCode()`  [INFERRED]
  tests/unit/booking-idempotency.test.ts → src/lib/booking/confirmation-code.ts
- `Admin Menu (Category + Item CRUD with Modals)` --semantically_similar_to--> `Admin Signature Bowls (CRUD + Gallery Image Modal)`  [INFERRED] [semantically similar]
  src/app/admin/menu/page.tsx → src/app/admin/signature-bowls/page.tsx
- `BookingConfirmationPage()` --calls--> `lookupConfirmedBooking()`  [INFERRED]
  src/app/(public)/reservations/confirmation/[code]/page.tsx → src/lib/booking/server-data.ts
- `POST()` --calls--> `calculateAvailability()`  [INFERRED]
  src/app/api/booking/availability/route.ts → src/lib/booking/availability.ts
- `POST()` --calls--> `bookingDbConfigured()`  [INFERRED]
  src/app/api/booking/confirm/route.ts → src/lib/booking/server-data.ts

## Hyperedges (group relationships)
- **God Nodes - Highest Change Risk in Ramen Don** — session_god_node_GET, session_god_node_PATCH, session_god_node_POST, session_god_node_revalidate, session_god_node_isSupabaseConfigured, session_god_node_createSupabaseServerClient [EXTRACTED 1.00]
- **Graphify Memory System Stack** — session_graphify_package, session_graphify_pipeline, session_graph_json, session_claude_md_bridge, session_obsidian_vault [EXTRACTED 1.00]
- **PublicLayout Per-Render Data Fetch Performance Surface** — session_PublicLayout, session_getVenueDetails, session_getBookingOverlayImage [EXTRACTED 1.00]
- **Ramen Don Community Clusters** — session_community_api_route_handlers, session_community_admin_booking_data_layer, session_community_public_pages_data_fetching, session_community_hours_sections_fetch, session_community_menu_supabase_client, session_community_menu_scroll_navigation [EXTRACTED 1.00]
- **CMS-Managed Content Types** — admingallery_crud_upload, adminhomepage_sectioneditor, adminhours_timeeditor, adminmenu_category_item_crud, adminoverlayimage_gallery_picker, adminsigbowls_gallery_modal, adminvenue_formeditor [INFERRED 0.90]
- **Booking Button Family (5 Components, Same RID)** — bookingcta_section, booking_buttons_rid_duplication [INFERRED 0.90]
- **Menu Display Pipeline (Nav â†’ Category â†’ Item)** — menunav_scrollspy_sticky, menucategory_section_divider, menuitem_tags_pricevariants [EXTRACTED 1.00]
- **In-Page Booking Button Family (All Route Through BookingOverlay)** — herobookingbutton, footerbookingbutton, visitinfobookingbutton, bookingoverlay_createlportal_iframe [EXTRACTED 1.00]

## Communities (93 total, 16 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (38): AdminAuthWatcher (Sign Out Redirect Guard), Admin Layout (Auth Guard + Sidebar), Admin Login (Supabase Email/Password Auth), AdminNav (Mobile + Desktop Sidebar with Sign Out), AuthError Detection (JWT/Session Error Classifier), Duplicate OpenTable RID Across 5 Buttons, Booking Overlay Portal Pattern, BookingCTA (Reusable Booking Section) (+30 more)

### Community 1 - "Community 1"
Cohesion: 0.14
Nodes (18): GET(), POST(), requireAdminUser(), bookingDbConfigured(), GET(), GET(), POST(), GET() (+10 more)

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (19): POST(), canConfirmHold(), createConfirmationCode(), getDemoAvailabilityData(), lookupDevBooking(), BookingPersistenceError, formatQueryError(), getAvailabilityData() (+11 more)

### Community 3 - "Community 3"
Cohesion: 0.13
Nodes (22): Admin Dashboard (Setup Wizard + Section Grid), Admin Gallery (CRUD + File Upload + Hero Toggle), Admin Homepage (Section Editor with Visibility Toggle), Admin Hours (Lunch/Dinner Time Editor), Admin Menu (Category + Item CRUD with Modals), Admin Overlay Image (Gallery Photo Picker), Admin Signature Bowls (CRUD + Gallery Image Modal), Admin Venue (Form Editor for Contact Details) (+14 more)

### Community 4 - "Community 4"
Cohesion: 0.23
Nodes (13): getBookingOverlayImage(), getGalleryImages(), getHeroImage(), getHomepageSections(), getMenuCategories(), getOpeningHours(), getSignatureBowls(), getVenueDetails() (+5 more)

### Community 5 - "Community 5"
Cohesion: 0.24
Nodes (11): calculateAvailability(), applyPeakRule(), peakRuleFor(), addMinutes(), dayOfWeekUtc(), makeSlots(), minutesFromTime(), overlaps() (+3 more)

### Community 6 - "Community 6"
Cohesion: 0.36
Nodes (11): checkContextSaturation(), fail(), main(), parseFrontmatter(), pass(), validateExecutor(), validateIntake(), validateOrchestrator() (+3 more)

### Community 7 - "Community 7"
Cohesion: 0.3
Nodes (9): fetchData(), fetchImages(), handleDelete(), handleSelect(), handleUpload(), handleUseDefault(), revalidate(), toggleHero() (+1 more)

### Community 8 - "Community 8"
Cohesion: 0.24
Nodes (12): CLAUDE.md as Session Bridge, Compile Knowledge Once at Ingestion Principle, graph.json (Compiled Knowledge Store), Session: Building the Graphify Memory System for Ramen Don, Graphify Package, Graphify Pipeline (56-file run on src/), Karpathy /raw Folder Workflow, Obsidian Vault (Human Navigation Layer) (+4 more)

### Community 10 - "Community 10"
Cohesion: 0.43
Nodes (6): fail(), findArtifacts(), parseFrontmatter(), pass(), readFm(), testRun()

### Community 12 - "Community 12"
Cohesion: 0.6
Nodes (4): getScrollEl(), getScrollOffset(), scrollTo(), updateActive()

### Community 21 - "Community 21"
Cohesion: 0.5
Nodes (4): Community: API Route Handlers (27 nodes), God Node: GET() - All Admin Read Routes, God Node: PATCH() - All Admin Update Routes, God Node: POST() - All Admin Create Routes

### Community 30 - "Community 30"
Cohesion: 0.67
Nodes (3): Community: Admin + Booking Data Layer (21 nodes), God Node: createSupabaseServerClient() - Server-Side DB Access, God Node: isSupabaseConfigured() - Gates All DB Ops

### Community 31 - "Community 31"
Cohesion: 0.67
Nodes (3): OpenTable Restaurant ID 325722, OpenTableWidget (External Link to OpenTable), Reservations Page (OpenTable Embed + What to Expect)

## Knowledge Gaps
- **39 isolated node(s):** `Karpathy /raw Folder Workflow`, `God Node: GET() - All Admin Read Routes`, `God Node: PATCH() - All Admin Update Routes`, `God Node: POST() - All Admin Create Routes`, `God Node: revalidate() - Cache Invalidation` (+34 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createSupabaseAdminClient()` connect `Community 1` to `Community 2`, `Community 5`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `isSupabaseConfigured()` connect `Community 4` to `Community 1`, `Community 2`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `Supabase Three-Tier Client Architecture` connect `Community 0` to `Community 3`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Are the 13 inferred relationships involving `bookingDbConfigured()` (e.g. with `GET()` and `GET()`) actually correct?**
  _`bookingDbConfigured()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 19 inferred relationships involving `createSupabaseAdminClient()` (e.g. with `GET()` and `GET()`) actually correct?**
  _`createSupabaseAdminClient()` has 19 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `requireAdminUser()` (e.g. with `GET()` and `GET()`) actually correct?**
  _`requireAdminUser()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `calculateAvailability()` (e.g. with `POST()` and `POST()`) actually correct?**
  _`calculateAvailability()` has 7 INFERRED edges - model-reasoned connections that need verification._