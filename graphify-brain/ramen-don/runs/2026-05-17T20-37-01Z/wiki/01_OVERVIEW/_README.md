---
type: overview
---

# What This Graph Represents

## In Plain Language

This knowledge graph maps **how the Ramen Don codebase is structured** — not just what files exist, but how concepts connect, where patterns repeat, and which parts of the system depend on each other.

Think of it as an **architectural MRI** of the project. Instead of reading 56 files line by line, you can see:

- **219 concepts** organized into **55 communities** (neighborhoods of related ideas)
- Which functions are "god nodes" (the hubs everything connects through)
- Where inferred connections exist that no import statement would show you
- Which parts of the system are tightly coupled and which are loosely assembled

## How to Navigate

1. Start with [[ARCHITECTURE_AT_A_GLANCE|Architecture at a Glance]] — the big-picture system diagram
2. Browse the [[../02_TOP_COMMUNITIES/_README|Top Communities]] — pick one that interests you
3. Read its "For Humans" section for a plain-language explanation with diagrams
4. Check its "For LLMs" section for structured data about connections and structure
5. Use the [[GLOSSARY|Glossary]] to understand terms like "cohesion", "god node", and "community"

## What This Graph Reveals

- **The seed data fallback pattern** appears in both `fetchers.ts` (public pages) and every API route (admin) — dual-layer resilience
- **The OpenTable RID (`325722`)** is copy-pasted across 5 separate components — a consistency risk
- **MenuNav** is the most cohesive module (0.60) — a textbook single-responsibility component
- **The admin pages** follow identical patterns (load → edit → save → revalidate → "Saved") but don't share code
- **Three Supabase client tiers** serve different privilege levels: browser (anon, auth), server (anon, SSR), admin (service_role, no RLS)
