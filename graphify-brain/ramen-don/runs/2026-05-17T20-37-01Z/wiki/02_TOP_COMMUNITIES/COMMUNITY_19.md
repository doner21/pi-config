---
type: community/narrative
community_id: 19
label: "Root Layout"
size: 2
cohesion: 0.00
character: code
---

# Community 19: Root Layout

> **2 nodes** | **Cohesion: 0.00** (loose) | **Character: code**

## For Humans

### What It's Like

This is **the restaurant's foundation** — the HTML shell that every page sits inside. It loads the custom fonts (Cormorant Garamond for display, DM Sans for body), sets the metadata (page title, description, favicon), and applies the dark theme to the `<body>`. Everything else builds on top of this.

```
┌──────────────────────────────────────────────────────────────────┐
│                        Root Layout                                │
│                   (The Foundation)                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  layout.tsx → RootLayout()                                  │ │
│  │                                                             │ │
│  │  ┌──────────────────────────────────────────────────────┐   │ │
│  │  │ Fonts:                                               │   │ │
│  │  │ • Cormorant Garamond (--font-cormorant)              │   │ │
│  │  │   → Display text, headings, wordmark                 │   │ │
│  │  │   → Variable font, 300-700 weight, italic            │   │ │
│  │  │ • DM Sans (--font-dm-sans)                           │   │ │
│  │  │   → Body text, navigation, buttons                   │   │ │
│  │  │   → Variable font, 300-700 weight                    │   │ │
│  │  └──────────────────────────────────────────────────────┘   │ │
│  │                                                             │ │
│  │  ┌──────────────────────────────────────────────────────┐   │ │
│  │  │ Metadata:                                            │   │ │
│  │  │ • title: "Ramen Don — Birmingham"                     │   │ │
│  │  │ • description: "Authentic ramen in the heart of..."   │   │ │
│  │  │ • icons: Ramen_Don_Logo_Cirlce.png (favicon + apple)  │   │ │
│  │  └──────────────────────────────────────────────────────┘   │ │
│  │                                                             │ │
│  │  ┌──────────────────────────────────────────────────────┐   │ │
│  │  │ Theme:                                               │   │ │
│  │  │ • <html className="[font-vars] h-full">               │   │ │
│  │  │ • <body className="min-h-full flex flex-col           │   │ │
│  │  │        bg-[#1A1714] text-[#F0EBE3]">                 │   │ │
│  │  │ • suppressHydrationWarning (for theme extension)      │   │ │
│  │  └──────────────────────────────────────────────────────┘   │ │
│  │                                                             │ │
│  │  ┌──────────────────────────────────────────────────────┐   │ │
│  │  │ Children slot: {children}                            │   │ │
│  │  │ → All pages, all layouts, everything                 │   │ │
│  │  └──────────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### What It Does

The root layout is the outermost component in the Next.js App Router tree. It sets up:
- **Typography**: Cormorant Garamond (serif display) + DM Sans (clean sans-serif) via `next/font/google`
- **Metadata**: SEO title, description, favicon/apple-touch-icon
- **Theme**: Dark background (#1A1714 espresso), warm cream text (#F0EBE3), full-height flex column layout
- **Hydration safety**: `suppressHydrationWarning` to prevent mismatches from browser extensions

### Cohesion Explained

**0.00** — This is a single-file community. The two nodes are the file itself and its default export function. No internal edges between them in the graph.

## For LLMs

- **ID:** 19 | **Size:** 2 | **Character:** code | **Primary file:** src/app/layout.tsx
- **Export:** `RootLayout()` — the top-level layout wrapping all pages
- **Fonts:** Cormorant_Garamond (display), DM_Sans (body) — both variable, both from Google Fonts
- **Icon:** `src/app/icon.png` (served as favicon by Next.js convention)
