---
type: overview
---

# What This Graph Represents

## In Plain Language

This knowledge graph is a **map of how concepts connect** in the **pi-config** project (`doner21/pi-config`). It has **2,138 concepts** organized into **130 neighborhoods** (communities).

Think of it as a subway map: each station (node) is a function, class, file, or concept. The lines between stations (edges) are relationships like "imports", "calls", "inherits from", or "uses". The neighborhoods (communities) are clusters of stations that are more connected to each other than to the rest of the city.

### What the graph covers

The data comes from **two sources**:
1. **Pi config code** — TypeScript extensions (`subagent.ts`, `graphify.ts`, `playwright-mcp.ts`, etc.), agent definitions, skills, prompts — about 11 custom extensions and 7 skills
2. **Graphify library** (from research_tmp) — the full graphify Python toolkit that powers the knowledge graph pipeline itself, including its test suite across 10+ programming languages

### What to explore

- **Community 0** — Your Pi extension for the Global Graphify Brain memory system. This is the most directly relevant community to your pi-config modifications.
- **Community 18** — The HTTP client module, a networking hub that connects to 5 other communities
- **Community 4** — The CLI entry point (`__main__.py`), graphify's command center
- **Community 15** — The export pipeline (HTML, Obsidian, JSON, SVG, Neo4j outputs)

### How to use this wiki

1. Browse the [[../02_TOP_COMMUNITIES/_README|Top Communities]] section — each has a "For Humans" narrative with analogies and explanations
2. Read the "For LLMs" section for structured connection data
3. Paths in the graph are relative to `C:\Users\doner\.pi\agent`
