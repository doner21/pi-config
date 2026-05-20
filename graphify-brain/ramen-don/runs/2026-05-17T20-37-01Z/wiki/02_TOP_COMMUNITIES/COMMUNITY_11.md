---
type: community/narrative
community_id: 11
label: "Menu Scroll Navigation Logic"
size: 6
cohesion: 0.60
character: code
---

# Community 11: Menu Scroll Navigation Logic

> **6 nodes** | **Cohesion: 0.60** (tight) | **Character: code**

## For Humans

### What It's Like

This community is **the menu page's table of contents with a highlighter**. As you scroll through the menu (past Ramen Bowls, into Plates, then Drinks...), a sticky navigation bar at the top tracks which section you're in and highlights the corresponding tab. Clicking a tab smooth-scrolls to that section. It's the same pattern you see on documentation sites — a scroll-spy nav.

### Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                  Menu Scroll Navigation Logic                     │
│               (The Table-of-Contents Highlighter)                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  MenuNav component lifecycle:                                     │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  1. Mount                                                    │ │
│  │     └─▶ measure() — records nav bar height (for offset)      │ │
│  │         └─▶ resize listener for responsive recalculation     │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                            │                                      │
│                            ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  2. Scroll listener (passive)                                │ │
│  │     └─▶ updateActive() runs on every scroll event            │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                            │                                      │
│                            ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  3. updateActive() logic                                     │ │
│  │     For each category slug:                                  │ │
│  │       el = document.getElementById(`cat-${slug}`)            │ │
│  │       elTop = el.getBoundingClientRect().top + scrollY       │ │
│  │       if (scrollY >= elTop - offset) → this is the active    │ │
│  │     Set active = last matching category                      │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                            │                                      │
│                            ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  4. Render                                                   │ │
│  │     ┌──────────┬──────────┬──────────┬──────────┐           │ │
│  │     │  Plates  │  Bowls   │  Drinks  │  Beers   │  ...      │ │
│  │     │          │ [ACTIVE] │          │          │           │ │
│  │     └──────────┴──────────┴──────────┴──────────┘           │ │
│  │     Active tab: bg-[#C8892A] text-[#1A1714] (amber pill)    │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  5. Click handler                                            │ │
│  │     scrollTo(slug):                                          │ │
│  │       el = document.getElementById(`cat-${slug}`)            │ │
│  │       top = el.getBoundingClientRect().top + scrollY         │ │
│  │             - getScrollOffset()                              │ │
│  │       document.scrollingElement.scrollTo({top, smooth})      │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Key implementation details:                                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ getScrollEl() → document.scrollingElement (iOS Safari fix)  │ │
│  │   • window.scrollY doesn't work when html{height:100%}      │ │
│  │   • scrollingElement handles iOS body-as-scroll-container   │ │
│  │                                                             │ │
│  │ getScrollOffset() → headerHeight + navHeight + 8px buffer   │ │
│  │   • Desktop: 80px header + nav height                       │ │
│  │   • Mobile: 64px header + nav height                        │ │
│  │   • matchMedia("(min-width: 1024px)") for breakpoint        │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### What It Does

A self-contained scroll-spy navigation system for the menu page. `MenuNav` renders a sticky bar of category tabs. As the user scrolls, `updateActive()` determines which section is currently visible and highlights the corresponding tab. `scrollTo()` provides smooth scrolling to a section when a tab is clicked. The implementation accounts for sticky header height (dynamic via `getScrollOffset()`), iOS Safari scrolling quirks (`document.scrollingElement` instead of `window`), and responsive breakpoints.

### Key Nodes

| Node | Role | Connections |
|------|------|-------------|
| MenuNav.tsx | The component file — all functions live here | 5 |
| `updateActive()` | Core scroll-spy logic — determines active section from scroll position | 3 |
| `scrollTo()` | Smooth-scrolls to a category section on tab click | 3 |
| `getScrollOffset()` | Calculates scroll offset accounting for sticky header + nav height | 3 |
| `getScrollEl()` | Returns document.scrollingElement (iOS Safari compatibility) | 3 |
| `measure()` | Records nav bar height on mount and window resize | 1 |

### Bridge Analysis

**Self-contained** in the graph. But this component is used by the **Menu Page** (C1) and renders category tabs generated from **menu data** fetched via C0.

### Cohesion Explained

**0.60** — Tight. This is the most cohesive community in the entire graph. All 6 nodes are functions within a single file (`MenuNav.tsx`). They form a clear call chain: `measure()` sets up the offset → `updateActive()` reads it on scroll → `scrollTo()` uses it on click → both use `getScrollEl()` and `getScrollOffset()`. This is a **well-encapsulated, single-responsibility module** — the gold standard for cohesion.

## For LLMs

### Data

- **ID:** 11
- **Label:** Menu Scroll Navigation Logic
- **Size:** 6 nodes
- **Cohesion:** 0.60
- **Character:** code
- **Primary file:** src/components/menu/MenuNav.tsx

### Cross-Community Connections
**No cross-community edges — this community is self-contained.**

### Implementation Notes

- Uses `document.scrollingElement` for iOS Safari where `html { height: 100% }` makes body the scroll container
- Scroll listener is `{ passive: true }` for performance
- Nav height is measured once on mount and on resize — not recalculated on every scroll
- Touch targets use `touchAction: "manipulation"` for mobile responsiveness
