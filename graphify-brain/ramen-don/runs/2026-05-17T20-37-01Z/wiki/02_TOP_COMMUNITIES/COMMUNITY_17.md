---
type: community/narrative
community_id: 17
label: "HomePage Domain"
size: 3
cohesion: 0.00
character: concept
---

# Community 17: HomePage Domain

> **3 nodes** | **Cohesion: 0.00** (loose) | **Character: concept**

## For Humans

### What It's Like

A **session note** documenting the HomePage component and its two key data dependencies. `HomePage()` is the heaviest data consumer — it fetches 6 datasets in parallel to build the landing page.

```
┌──────────────────────────────────────────────────────────────────┐
│                        HomePage Domain                            │
│               (The Landing Page's Data Needs)                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────┐                                         │
│  │  HomePage()         │── Largest data consumer                 │
│  │                     │   6 parallel fetches:                   │
│  └─────────┬───────────┘                                         │
│            │                                                      │
│    ┌───────┼───────┬───────────┬──────────┬──────────┐          │
│    ▼       ▼       ▼           ▼          ▼          ▼          │
│  ┌──────┐┌──────┐┌──────┐┌────────┐┌────────┐┌──────────┐     │
│  │sect- ││hours ││hero  ││venue   ││bowls   ││overlay   │     │
│  │ions  ││()    ││Image ││()      ││()      ││Image()   │     │
│  │()    ││      ││()    ││        ││        ││          │     │
│  └──────┘└──────┘└──────┘└────────┘└────────┘└──────────┘     │
│                                                                   │
│  Assembled into 5 sections:                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ Hero     │ │Menu      │ │ Story    │ │Booking   │ │Visit   │ │
│  │ image+   │ │Highlights│ │ 2-col    │ │CTA       │ │Info    │ │
│  │ wordmark │ │bowl grid │ │ layout   │ │ section  │ │3-col   │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### What It Does

Documents the HomePage's role as the central data orchestrator. It fetches homepage sections, opening hours, hero image, venue details, signature bowls, and booking overlay image — all in parallel via `Promise.all`. These are then distributed to child section components. Session artifact.

## For LLMs

- **ID:** 17 | **Size:** 3 | **Character:** concept | **Source:** session document
- **Functions:** `getHomepageSections()`, `getOpeningHours()` (plus 4 others not captured in this community)
