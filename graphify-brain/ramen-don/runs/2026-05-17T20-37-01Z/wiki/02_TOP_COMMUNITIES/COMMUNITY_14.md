---
type: community/narrative
community_id: 14
label: "BookingOverlay Core Logic"
size: 3
cohesion: 0.00
character: code
---

# Community 14: BookingOverlay Core Logic

> **3 nodes** | **Cohesion: 0.00** (loose) | **Character: code**

## For Humans

### What It's Like

These are **the two security guards inside the booking overlay** — one watches for the Escape key (to close the overlay), the other watches for navigation hijacking attempts from the OpenTable iframe (to keep users on the Ramen Don site).

### Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                  BookingOverlay Core Logic                        │
│                 (The Security Guards)                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  onKey() — The Escape Key Handler                           │ │
│  │  ┌──────────────────────────────────────────────────────┐   │ │
│  │  │ window.addEventListener("keydown", (e) => {          │   │ │
│  │  │   if (e.key === "Escape") close();                  │   │ │
│  │  │ })                                                   │   │ │
│  │  └──────────────────────────────────────────────────────┘   │ │
│  │  → Closes the overlay without clicking the X button        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  handleNavigate() — The Navigation Hijack Guard             │ │
│  │  ┌──────────────────────────────────────────────────────┐   │ │
│  │  │ window.navigation.addEventListener("navigate", e => {│   │ │
│  │  │   if (!e.destination.url.startsWith(origin))         │   │ │
│  │  │     e.preventDefault(); // BLOCK redirect            │   │ │
│  │  │ })                                                   │   │ │
│  │  └──────────────────────────────────────────────────────┘   │ │
│  │  → Prevents OpenTable from redirecting parent window       │ │
│  │  → Layer 2 of sandbox protection                            │ │
│  │  → Layer 1 = iframe sandbox attribute                       │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### What It Does

Two event handlers extracted from `BookingOverlay.tsx`. `onKey` provides keyboard accessibility (Escape to close). `handleNavigate` is the Navigation API guard — it intercepts `postMessage`-triggered navigation from the OpenTable loader script and prevents it from redirecting the parent page away from ramen-don.

### Cohesion Explained

**0.00** — Both functions are useEffect callbacks in the same component file, but they handle different concerns (keyboard vs navigation). Low edge count in the graph doesn't reflect their structural co-location.

## For LLMs

- **ID:** 14 | **Size:** 3 | **Character:** code | **Primary file:** src/components/opentable/BookingOverlay.tsx
- **Functions:** `onKey()`, `handleNavigate()`
- **Note:** These are part of C4 (Booking Overlay & Navigation UI) but clustered separately due to internal function boundaries
