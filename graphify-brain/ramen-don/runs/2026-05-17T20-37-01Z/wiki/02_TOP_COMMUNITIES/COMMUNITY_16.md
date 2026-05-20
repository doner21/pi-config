---
type: community/narrative
community_id: 16
label: "PublicLayout Domain"
size: 3
cohesion: 0.00
character: concept
---

# Community 16: PublicLayout Domain

> **3 nodes** | **Cohesion: 0.00** (loose) | **Character: concept**

## For Humans

### What It's Like

A **session note** documenting the two data dependencies of `PublicLayout()`: venue details (for address/phone in the footer) and the booking overlay image (for the booking modal that Header and Footer both use).

```
┌──────────────────────────────────────────────────────────────────┐
│                      PublicLayout Domain                          │
│                (The Wrapper's Data Needs)                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────┐                                         │
│  │  PublicLayout()     │── Wraps ALL public pages                │
│  │                     │   with Header + Footer                  │
│  └─────────┬───────────┘                                         │
│            │                                                      │
│       ┌────┴────┐                                                │
│       ▼         ▼                                                │
│  ┌────────┐  ┌──────────────┐                                    │
│  │getVenue│  │getBooking    │                                    │
│  │Details │  │OverlayImage  │                                    │
│  │()      │  │()            │                                    │
│  └────────┘  └──────────────┘                                    │
│                                                                   │
│  Both fetched in parallel via Promise.all:                       │
│  const [venue, overlayImage] = await Promise.all([               │
│    getVenueDetails(),                                            │
│    getBookingOverlayImage(),                                     │
│  ]);                                                             │
│                                                                   │
│  Passed to:                                                      │
│  <Header  openTableUrl={venue.opentable_url}                     │
│           overlayImage={overlayImage} />                         │
│  <Footer  overlayImage={overlayImage} />                         │
└──────────────────────────────────────────────────────────────────┘
```

### What It Does

Documents the PublicLayout component's data-fetching responsibility: it pre-fetches venue and overlay image data once, then passes it down to Header and Footer, avoiding duplicate fetches in child components. This is a session artifact from a previous graphify run.

## For LLMs

- **ID:** 16 | **Size:** 3 | **Character:** concept | **Source:** session document
- **Component:** `PublicLayout()` in src/app/(public)/layout.tsx
