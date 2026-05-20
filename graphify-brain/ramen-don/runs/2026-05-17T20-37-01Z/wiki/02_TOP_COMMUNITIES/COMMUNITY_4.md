---
type: community/narrative
community_id: 4
label: "Booking Overlay & Navigation UI"
size: 15
cohesion: 0.18
character: code
---

# Community 4: Booking Overlay & Navigation UI

> **15 nodes** | **Cohesion: 0.18** (moderate) | **Character: code**

## For Humans

### What It's Like

This community is **the restaurant's reservation desk**. It appears in multiple places — by the front door (hero), at the bar (footer), on the way out (visit info), in the dining room (booking CTA) — but it's the same desk every time. When a customer clicks "Book a Table," a curtain pulls back (the portal overlay) revealing a self-contained reservation terminal (the OpenTable iframe). The desk staff ensures the customer stays in the restaurant and doesn't get redirected to OpenTable's website.

### Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                  Booking Overlay & Navigation UI                  │
│                    (The Reservation Desk)                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Five booking buttons scattered across the site:                  │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │HeroBooking  │  │FooterBooking│  │VisitInfo    │              │
│  │Button       │  │Button       │  │BookingButton│              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                       │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐              │
│  │Header Nav   │  │BookingCTA   │  │Reservations │              │
│  │Book Button  │  │Section Btn  │  │Page CTA     │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                       │
│         └────────────────┼────────────────┘                       │
│                          │                                        │
│                ALL pass the same:                                 │
│                • widgetUrl (OT loader URL)                        │
│                • overlayImage (from CMS)                          │
│                          │                                        │
│                          ▼                                        │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │                  BookingOverlay                            │   │
│  │                                                           │   │
│  │  1. User clicks button → open()                           │   │
│  │  2. Body scroll locked (position:fixed, top:-scrollY)     │   │
│  │  3. React createPortal → fixed full-screen overlay        │   │
│  │  4. Background: overlayImage (or fallback hero_ramen.png) │   │
│  │  5. Monkey-patch document.createElement                   │   │
│  │     → add sandbox attr to OT iframe                       │   │
│  │  6. Inject OT loader script → renders widget              │   │
│  │  7. Navigation API guard → blocks parent redirect          │   │
│  │  8. Escape key → close() → restore scroll                 │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ⚠️ Known issue: OpenTable RID=325722 duplicated 5 times          │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  const OPENTABLE_WIDGET_URL = "...rid=325722..."           │   │
│  │  Copy-pasted in: BookingCTA.tsx, Header.tsx,               │   │
│  │  FooterBookingButton.tsx, HeroBookingButton.tsx,           │   │
│  │  VisitInfoBookingButton.tsx                                │   │
│  │  → Any RID change requires editing 5 files                │   │
│  └───────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### What It Does

This community manages the OpenTable booking experience. The centerpiece is `BookingOverlay` — a React component that renders a full-screen modal via `createPortal`. It loads the OpenTable reservation widget inside a sandboxed iframe to prevent navigation hijacking. Two defense layers protect against unwanted redirects: (1) iframe sandbox attributes blocking `window.top` navigation, and (2) a Navigation API guard that intercepts `postMessage`-triggered redirects.

Every booking button on the site (hero, footer, visit info, booking CTA section, header) wraps its trigger element in a BookingOverlay, passing the same overlay image from the CMS. This means changing the booking widget URL requires editing 5 separate files — a consistency risk.

### Key Nodes

| Node | Role | Connections |
|------|------|-------------|
| HeroBookingButton | Hero's "Book a Table" button wrapping overlay | 6 |
| BookingOverlay | Core overlay with portal, iframe injection, scroll lock | 6 |
| VisitInfoBookingButton | Visit section booking button | 5 |
| FooterBookingButton | Footer booking button (inside hours column) | 4 |
| Duplicate OpenTable RID | Rationale flagging 5-file copy-paste of RID=325722 | 4 |
| Booking Overlay Portal Pattern | Rationale describing portal + sandbox architecture | 3 |
| VisitInfo | Three-column section: Address, Hours, Reserve | 2 |
| Header | Sticky header with scroll-aware background + mobile drawer | 2 |
| BookingCTA | Reusable booking section with heading, body, CTA button | 2 |

### Bridge Analysis

- **→ C1 (Public Page Composition)**: VisitInfo connects to Homepage Composer (both are sections on the homepage); Header connects to Footer (both share navigation links and overlayImage prop)
- **→ C18 (OpenTable Integration)**: The RID 325722 connects booking buttons to the external OpenTable system
- **→ C14 (Overlay Core Logic)**: BookingOverlay.tsx hosts the onKey and handleNavigate functions

### Cohesion Explained

**0.18** — Moderate. Five booking button components are structurally identical (each wraps a button in BookingOverlay with the same widget URL). They don't call each other but share the exact same pattern. The low cohesion reflects that these are parallel wrappers, not a composed system. Consolidating the RID constant into a shared module would increase cohesion while reducing maintenance risk.

## For LLMs

### Data

- **ID:** 4
- **Label:** Booking Overlay & Navigation UI
- **Size:** 15 nodes
- **Cohesion:** 0.18
- **Character:** code
- **Primary files:** src/components/opentable/BookingOverlay.tsx, BookingCTA.tsx, FooterBookingButton.tsx, OpenTableWidget.tsx, HeroBookingButton.tsx, VisitInfoBookingButton.tsx

### Cross-Community Connections
- **Public Page Composition & Fallback Architecture** (C1) -- 2 edge(s)
  - VisitInfo → Homepage Multi-Section Composer (conceptually_related_to)
  - Header → Footer (semantically_similar_to)
