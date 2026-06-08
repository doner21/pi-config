---
type: community/narrative
community_id: 4
label: "__main__ (30 functions + 25 concepts)"
size: 55
cohesion: 0.08
character: mixed
---

# Community 4: __main__ (30 functions + 25 concepts)

> **55 nodes** | **Cohesion: 0.08** (loosely connected — these functions share a file but do different things) | **Character: mixed**

## For Humans

This is the **command center** — the cockpit where every graphify command begins. Community 4 lives in `__main__.py`, graphify's CLI entry point. It's a mixed community with 30 functions and 25 conceptual nodes (design notes, decisions, and documentation fragments). Think of it as a spaceship's bridge: a handful of officers (functions) run the ship, while dozens of displays and manuals (concepts) describe procedures.

The central node is `__main__.py` (29 connections) which acts as the dispatcher. The **main()** function (20 connections) is the commander: it parses command-line arguments and routes to the right sub-command. **install()** (8 connections) handles the `graphify install` command — setting up integrations with Claude Code. **gemini_install()** (6 connections) and **claude_install()** (5 connections) are the platform-specific installers, while **gemini_uninstall()** (5 connections) and **claude_uninstall()** (5 connections) do the reverse. **_agents_install()** (6 connections) handles OpenClaw/OpenCode agents installation. **_install_opencode_plugin()** (5 connections) deals with the lower-level plugin wiring.

The conceptual nodes capture design rationale — things like "graphify CLI - `graphify install` sets up the Claude Code skill" and warnings about skill source provenance. These concepts aren't executable code; they're the embedded design memory that makes this code navigable.

This community is self-contained. The CLI is a thin entry point that delegates to other modules, but the entry logic itself doesn't cross community boundaries. With cohesion 0.08, the functions and concepts share a home but handle very different sub-commands (install vs. run vs. uninstall vs. update) — like a hotel lobby with separate desks for check-in, concierge, and baggage.

## For LLMs

### Data

- **ID:** 4
- **Label:** __main__ (30 functions + 25 concepts)
- **Size:** 55 nodes
- **Cohesion:** 0.08
- **Character:** mixed
- **Primary file:** __main__.py

### Top Nodes by Connectivity

- **__main__.py** — 29 connections [code]
- **__main__.py** — 29 connections [code]
- **main()** — 20 connections [code]
- **install()** — 8 connections [code]
- **gemini_install()** — 6 connections [code]
- **_agents_install()** — 6 connections [code]
- **gemini_uninstall()** — 5 connections [code]
- **claude_uninstall()** — 5 connections [code]
- **claude_install()** — 5 connections [code]
- **_install_opencode_plugin()** — 5 connections [code]

**No cross-community edges found — this community is self-contained.**
