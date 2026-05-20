---
type: community/narrative
community_id: 12
label: "Archive System"
size: 6
cohesion: 0.33
character: concept
---

# Community 12: Archive System

> **6 nodes** | **Cohesion: 0.33** (coherent — highest cohesion in the codebase) | **Character: concept**

## For Humans

### The Off-Site Storage

Every office has a storage room for old files. You don't need the 2019 tax returns anymore, but
you're not quite ready to shred them. So you box them up, label the box, and move it off-site.
If you need them within 30 days, you can call and have them sent back. After 30 days, the
shredder gets them.

The Archive System is exactly this. When `/memory gc` identifies runs that should be cleaned up,
it doesn't delete them — it moves them to `.archive/`. There's a **30-day grace period**. During
those 30 days, `/memory keep` can restore any archived run to active storage. After 30 days,
the run is permanently deleted.

This is the **most cohesive community** in the codebase (0.33) — all 6 nodes are about one thing:
safe, reversible garbage collection.

### Internal Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             ARCHIVE SYSTEM                                  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                                                                       │ │
│  │   /memory gc ──────▶ ┌──────────────────────┐                         │ │
│  │                       │  Garbage Collection  │                         │ │
│  │                       │  (Archive/Restore)   │                         │ │
│  │                       │                      │                         │ │
│  │                       │  1. Find GC candidates (from C5 prune scores) │ │
│  │                       │  2. Check pin status (pinned = skip)          │ │
│  │                       │  3. Move to .archive/ Directory              │ │
│  │                       │  4. Write archive-meta.json                  │ │
│  │                       │  5. Record 30-Day Archive Grace Period       │ │
│  │                       └──────────┬───────────┘                        │ │
│  │                                  │                                    │ │
│  │                                  ▼                                    │ │
│  │                       ┌──────────────────────┐                        │ │
│  │                       │  .archive/ Directory │                        │ │
│  │                       │                      │                        │ │
│  │                       │  Run archives live   │                        │ │
│  │                       │  here for 30 days    │                        │ │
│  │                       └──────────┬───────────┘                        │ │
│  │                                  │                                    │ │
│  │                    ┌─────────────┴─────────────┐                      │ │
│  │                    ▼                           ▼                      │ │
│  │   /memory keep ──▶ RESTORE          After 30 days: DELETE             │ │
│  │                    │                                                │ │
│  │                    ▼                                                │ │
│  │              Run returns to                                          │ │
│  │              active storage                                          │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### What It Does and Why It Matters

The Archive System is the **safety net** for the pruning system. Without it, a bad prune score
or a misconfigured GC policy could permanently delete valuable runs. The 30-day grace period
provides:

- **Reversibility**: No run is ever deleted directly. It's always archived first. This means you can recover from mistakes — accidentally pruning a run is fixable.

- **Grace period**: 30 days is long enough to notice that something is missing and short enough that disk space doesn't accumulate indefinitely. It aligns with the Ebbinghaus Forgetting Curve concept (C1) — if you haven't accessed a run in 30 days, you've probably truly forgotten it.

- **Archive metadata**: `archive-meta.json` tracks when each run was archived, why it was selected (which prune signals triggered it), and its original location — making restore straightforward.

- **Manual override**: `handleKeep()` (in C5) wraps the restore operation. Users can also manually pin runs (`/memory pin`) to prevent them from ever reaching the archive.

### Key Nodes

- **Garbage Collection (Archive/Restore)** (3 connections): The conceptual model that ties it all together. Documents the policy: archive first, delete later, allow restore.

- **.archive/ Directory (Grace Period)** (3 connections): The physical storage location. Resolved by `archiveRunDirFor()` in C9, this is where archived runs live during their 30-day countdown.

- **30-Day Archive Grace Period** (2 connections): The time window. Referenced by both the GC policy and the Non-Negotiable Invariants (C1). This was a deliberate design decision — see Decision: 30-Day Archive Grace Period.

- **/memory gc Command** (2 connections): The user-facing trigger. Documents the command that initiates garbage collection. The actual implementation is `handleGc()` in C9.

- **/memory keep Command** (1 connection): The restore trigger. Documents the command to recover an archived run. Handled by `handleKeep()` in C5.

- **archive-meta.json** (1 connection): The metadata file stored alongside archived runs. Tracks archive date, original location, prune reason, and expiration date.

### Bridge Analysis

The Archive System bridges to two concept communities:

- **Pruning Theory & Signals (C1)** — 1 edge. The 30-Day Archive Grace Period is referenced by the Non-Negotiable Invariants document. The archive policy is a first-class design invariant.

- **Graphify-Brain Architecture (C3)** — 1 edge. The `/memory gc` and `/memory keep` commands are documented in the architecture overview and tutorial.

Notable: despite being a "concept" community, the Archive System has no direct code bridges. Its implementation lives across C9 (`handleGc`, `archiveRunDirFor`, `findArchivedRun`) and C5 (`handleKeep`). The concepts here define the *policy*; the code communities execute it.

### Cohesion Explained

At **0.33 cohesion**, this is the tightest community in the entire graph. Every node is directly
about the archive workflow: the directory, the grace period, the metadata file, and the two user
commands. There are no tangents. The 5 internal edges connect the 6 nodes in a natural narrative:
GC produces archives → archives live in .archive/ → archives have a 30-day grace period →
archives can be restored via /memory keep → everything is tracked in archive-meta.json.

This high cohesion is a good sign — it means the archive concept is **well-bounded** and doesn't
leak into other concerns. If you need to change the archive policy (e.g., extend the grace period
to 60 days), you know to update exactly these 6 nodes.

## For LLMs

### Data

- **ID:** 12
- **Label:** Archive System
- **Size:** 6 nodes
- **Cohesion:** 0.33
- **Character:** concept
- **Primary file:** 03-unified-plan.md, TUTORIAL.md

### Top Nodes by Connectivity

- **Garbage Collection (Archive/Restore)** -- 3 connections [rationale]
- **.archive/ Directory (Grace Period)** -- 3 connections [rationale]
- **30-Day Archive Grace Period** -- 2 connections [rationale]
- **/memory gc Command** -- 2 connections [document]
- **/memory keep Command** -- 1 connection [document]
- **archive-meta.json** -- 1 connection [rationale]

### Cross-Community Connections

- **Pruning Theory & Signals** (C1) -- 1 edge(s)
  - 30-Day Archive Grace Period -> Non-Negotiable Invariants (references)
- **Graphify-Brain Architecture** (C3) -- 1 edge(s)
  - /memory gc Command -> graphify-brain Memory System (references)
