# Graph Report - ramen-don  (2026-05-18)

## Corpus Check
- 125 files · ~1,826,819 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 430 nodes · 574 edges · 93 communities (77 shown, 16 thin omitted)
- Extraction: 67% EXTRACTED · 33% INFERRED · 0% AMBIGUOUS · INFERRED: 189 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4c2d8bf9`
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
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
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
1. `bookingDbConfigured()` - 31 edges
2. `requireAdminUser()` - 28 edges
3. `createSupabaseAdminClient()` - 27 edges
4. `calculateAvailability()` - 12 edges
5. `isSupabaseConfigured()` - 11 edges
6. `getAvailabilityData()` - 11 edges
7. `main()` - 10 edges
8. `GET()` - 10 edges
9. `PATCH()` - 10 edges
10. `createSupabaseServerClient()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `confirmWithIdempotency()` --calls--> `createConfirmationCode()`  [INFERRED]
  tests/unit/booking-idempotency.test.ts → src/lib/booking/confirmation-code.ts
- `Admin Menu (Category + Item CRUD with Modals)` --semantically_similar_to--> `Admin Signature Bowls (CRUD + Gallery Image Modal)`  [INFERRED] [semantically similar]
  src/app/admin/menu/page.tsx → src/app/admin/signature-bowls/page.tsx
- `BookingConfirmationPage()` --calls--> `lookupConfirmedBooking()`  [INFERRED]
  src/app/(public)/reservations/confirmation/[code]/page.tsx → src/lib/booking/server-data.ts
- `PATCH()` --calls--> `update()`  [INFERRED]
  src/app/api/admin/venue/route.ts → src/app/admin/bookings/rules/page.tsx
- `POST()` --calls--> `sendBookingConfirmation()`  [INFERRED]
  src/app/api/admin/bookings/email-jobs/route.ts → src/lib/email.ts

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
Cohesion: 0.08
Nodes (31): POST(), calculateAvailability(), canConfirmHold(), createConfirmationCode(), getDemoAvailabilityData(), lookupDevBooking(), applyPeakRule(), peakRuleFor() (+23 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (38): AdminAuthWatcher (Sign Out Redirect Guard), Admin Layout (Auth Guard + Sidebar), Admin Login (Supabase Email/Password Auth), AdminNav (Mobile + Desktop Sidebar with Sign Out), AuthError Detection (JWT/Session Error Classifier), Duplicate OpenTable RID Across 5 Buttons, Booking Overlay Portal Pattern, BookingCTA (Reusable Booking Section) (+30 more)

### Community 2 - "Community 2"
Cohesion: 0.2
Nodes (21): DELETE(), GET(), PATCH(), POST(), requireAdminUser(), bookingDbConfigured(), DELETE(), GET() (+13 more)

### Community 3 - "Community 3"
Cohesion: 0.13
Nodes (22): Admin Dashboard (Setup Wizard + Section Grid), Admin Gallery (CRUD + File Upload + Hero Toggle), Admin Homepage (Section Editor with Visibility Toggle), Admin Hours (Lunch/Dinner Time Editor), Admin Menu (Category + Item CRUD with Modals), Admin Overlay Image (Gallery Photo Picker), Admin Signature Bowls (CRUD + Gallery Image Modal), Admin Venue (Form Editor for Contact Details) (+14 more)

### Community 4 - "Community 4"
Cohesion: 0.23
Nodes (13): getBookingOverlayImage(), getGalleryImages(), getHeroImage(), getHomepageSections(), getMenuCategories(), getOpeningHours(), getSignatureBowls(), getVenueDetails() (+5 more)

### Community 5 - "Community 5"
Cohesion: 0.19
Nodes (5): DELETE(), GET(), PATCH(), POST(), update()

### Community 6 - "Community 6"
Cohesion: 0.36
Nodes (11): checkContextSaturation(), fail(), main(), parseFrontmatter(), pass(), validateExecutor(), validateIntake(), validateOrchestrator() (+3 more)

### Community 7 - "Community 7"
Cohesion: 0.3
Nodes (9): fetchData(), fetchImages(), handleDelete(), handleSelect(), handleUpload(), handleUseDefault(), revalidate(), toggleHero() (+1 more)

### Community 8 - "Community 8"
Cohesion: 0.24
Nodes (12): CLAUDE.md as Session Bridge, Compile Knowledge Once at Ingestion Principle, graph.json (Compiled Knowledge Store), Session: Building the Graphify Memory System for Ramen Don, Graphify Package, Graphify Pipeline (56-file run on src/), Karpathy /raw Folder Workflow, Obsidian Vault (Human Navigation Layer) (+4 more)

### Community 11 - "Community 11"
Cohesion: 0.31
Nodes (4): emptyRule(), handleCreate(), persist(), saveEdit()

### Community 12 - "Community 12"
Cohesion: 0.28
Nodes (3): handleDelete(), handleSaveAll(), showMessage()

### Community 13 - "Community 13"
Cohesion: 0.43
Nodes (6): fail(), findArtifacts(), parseFrontmatter(), pass(), readFm(), testRun()

### Community 15 - "Community 15"
Cohesion: 0.38
Nodes (3): bookingCountFor(), holdCountFor(), statusFor()

### Community 17 - "Community 17"
Cohesion: 0.6
Nodes (4): getScrollEl(), getScrollOffset(), scrollTo(), updateActive()

### Community 25 - "Community 25"
Cohesion: 0.5
Nodes (4): Community: API Route Handlers (27 nodes), God Node: GET() - All Admin Read Routes, God Node: PATCH() - All Admin Update Routes, God Node: POST() - All Admin Create Routes

### Community 35 - "Community 35"
Cohesion: 0.67
Nodes (3): Community: Admin + Booking Data Layer (21 nodes), God Node: createSupabaseServerClient() - Server-Side DB Access, God Node: isSupabaseConfigured() - Gates All DB Ops

### Community 36 - "Community 36"
Cohesion: 0.67
Nodes (3): OpenTable Restaurant ID 325722, OpenTableWidget (External Link to OpenTable), Reservations Page (OpenTable Embed + What to Expect)

## Knowledge Gaps
- **39 isolated node(s):** `Karpathy /raw Folder Workflow`, `God Node: GET() - All Admin Read Routes`, `God Node: PATCH() - All Admin Update Routes`, `God Node: POST() - All Admin Create Routes`, `God Node: revalidate() - Cache Invalidation` (+34 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createSupabaseAdminClient()` connect `Community 2` to `Community 0`, `Community 5`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `bookingDbConfigured()` connect `Community 2` to `Community 0`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `isSupabaseConfigured()` connect `Community 4` to `Community 0`, `Community 2`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Are the 20 inferred relationships involving `bookingDbConfigured()` (e.g. with `GET()` and `DELETE()`) actually correct?**
  _`bookingDbConfigured()` has 20 INFERRED edges - model-reasoned connections that need verification._
- **Are the 20 inferred relationships involving `requireAdminUser()` (e.g. with `GET()` and `DELETE()`) actually correct?**
  _`requireAdminUser()` has 20 INFERRED edges - model-reasoned connections that need verification._
- **Are the 26 inferred relationships involving `createSupabaseAdminClient()` (e.g. with `GET()` and `DELETE()`) actually correct?**
  _`createSupabaseAdminClient()` has 26 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `calculateAvailability()` (e.g. with `POST()` and `POST()`) actually correct?**
  _`calculateAvailability()` has 7 INFERRED edges - model-reasoned connections that need verification._