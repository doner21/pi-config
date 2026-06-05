---
type: community/narrative
community_id: 15
label: "export (20 functions + 12 concepts)"
size: 32
cohesion: 0.11
character: mixed
---

# Community 15: export (20 functions + 12 concepts)

> **32 nodes** | **Cohesion: 0.11** (loosely connected — these functions share a file but do different things) | **Character: mixed**

## For Humans

Community 15 is graphify's **publishing department** — the module that transforms a raw knowledge graph into usable formats. Living in `export.py`, this community of 20 functions and 12 concepts is responsible for taking the graph data structure and turning it into HTML visualizations, Obsidian wikis, JSON dumps, SVG diagrams, Cypher queries, and GraphML files. Think of it as a printing press that can output the same book in hardcover, paperback, ebook, and audiobook simultaneously.

The hub is `export.py` (18 connections). **to_html()** (7 connections) is the flagship — it generates self-contained HTML files with interactive graph visualizations (using D3.js or similar), complete with node coloring, community labels, and zoom controls. **to_obsidian()** (4 connections) generates a wiki-compatible folder structure with markdown files, ready to be dropped into an Obsidian vault. **to_json()** (4 connections) produces raw JSON for programmatic consumption — the "machine-readable" format.

Supporting functions handle the details. **_viz_node_limit()** (4 connections) determines how many nodes to render in the visualization (very large graphs need capping to remain usable). **_obsidian_tag()** (4 connections) sanitizes community names into valid Obsidian tags — "C++ Code" becomes "Cpp-Code" or similar. **_git_head()** (4 connections) tags each export with the current git commit hash for traceability. **_cypher_escape()** (4 connections) ensures graph data is safely embedded in Neo4j Cypher queries. **to_svg()** (3 connections) generates static SVG diagrams.

The concept nodes capture the design rules: "Sanitize a community name for use as an Obsidian tag" and "Return the effective viz node limit" encode the heuristics that make exports reliable across different tools.

With cohesion 0.11, this community is somewhat tighter than average — the export functions share formatting utilities and configuration. No cross-community connections, which makes sense for an output module that should be a consumer, not a dependency.

**Why it matters:** Without this community, the knowledge graph would be an invisible data structure. Export is how humans and tools actually interact with the graph.

## For LLMs

### Data

- **ID:** 15
- **Label:** export (20 functions + 12 concepts)
- **Size:** 32 nodes
- **Cohesion:** 0.11
- **Character:** mixed
- **Primary file:** export.py

### Top Nodes by Connectivity

- **export.py** — 18 connections [code]
- **export.py** — 18 connections [code]
- **to_html()** — 7 connections [code]
- **to_obsidian()** — 4 connections [code]
- **to_json()** — 4 connections [code]
- **_viz_node_limit()** — 4 connections [code]
- **_obsidian_tag()** — 4 connections [code]
- **_git_head()** — 4 connections [code]
- **_cypher_escape()** — 4 connections [code]
- **to_svg()** — 3 connections [code]

**No cross-community edges found — this community is self-contained.**
