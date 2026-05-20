---
type: community/narrative
community_id: 18
label: "OpenTable External Integration"
size: 3
cohesion: 0.67
character: mixed
---

# Community 18: OpenTable External Integration

> **3 nodes** | **Cohesion: 0.67** (tight) | **Character: mixed**

## For Humans

### What It's Like

This is **the restaurant's partnership with OpenTable** — the external reservation system. It centers on a single magic number (`RID=325722`) that identifies Ramen Don in OpenTable's system. This RID appears in the inline booking widget used by the overlay AND on the standalone Reservations page that links out to OpenTable's website.

### Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                 OpenTable External Integration                    │
│               (The OpenTable Partnership)                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  OpenTable Restaurant ID 325722                              │ │
│  │  ┌──────────────────────────────────────────────────────┐   │ │
│  │  │ Confirmed via Playwright browser inspection           │   │ │
│  │  │ on 2026-04-16                                        │   │ │
│  │  │                                                      │   │ │
│  │  │ Used in TWO ways:                                    │   │ │
│  │  └──────────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                            │                                      │
│               ┌────────────┴────────────┐                        │
│               ▼                         ▼                        │
│  ┌────────────────────────┐  ┌────────────────────────┐         │
│  │ Inline Widget (Overlay) │  │ External Link           │         │
│  │                         │  │                         │         │
│  │ URL: ...rid=325722...   │  │ Reservations Page CTA   │         │
│  │ Injected as iframe      │  │ → opentable.co.uk/r/    │         │
│  │ inside BookingOverlay   │  │   ramen-don-birmingham  │         │
│  │                         │  │                         │         │
│  │ Used by:                │  │ Used by:                │         │
│  │ • BookingCTA            │  │ • Reservations page     │         │
│  │ • HeroBookingButton     │  │ • OpenTableWidget       │         │
│  │ • FooterBookingButton   │  │                         │         │
│  │ • VisitInfoBookingBtn   │  │                         │         │
│  │ • Header book button    │  │                         │         │
│  └────────────────────────┘  └────────────────────────┘         │
│                                                                   │
│  ⚠️ RID consistency risk: the widget URL is                      │
│     copy-pasted across 5 files. See C4 for details.              │
└──────────────────────────────────────────────────────────────────┘
```

### What It Does

Ties together the two OpenTable integration points: the inline widget (loaded in the BookingOverlay portal via an iframe) and the external link (on the standalone Reservations page). Both reference the same restaurant (RID 325722) but through different mechanisms — embedded widget vs external URL.

### Key Nodes

| Node | Role |
|------|------|
| OpenTable Restaurant ID 325722 | The magic number identifying Ramen Don in OpenTable's system |
| Reservations Page | Full reservations landing page with OpenTable embed + "What to Expect" |
| OpenTableWidget | Simple external link component for standalone reservations |

### Cohesion Explained

**0.67** — Tight. All three nodes are about the same external integration. The RID is the unifying concept connecting the two OpenTable consumption points.

## For LLMs

- **ID:** 18 | **Size:** 3 | **Cohesion:** 0.67 | **Character:** mixed
- **RID:** 325722 (confirmed 2026-04-16)
- **Widget URL pattern:** `https://www.opentable.co.uk/widget/reservation/loader?rid=325722&type=standard&theme=standard&color=1&dark=false&iframe=true&domain=co.uk&lang=en-GB&newtab=false&ot_source=Restaurant%20website`
- **External URL:** `https://www.opentable.co.uk/r/ramen-don-birmingham`
