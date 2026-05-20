# Graph Report - C:\Users\doner\capati-memory-system  (2026-04-23)

## Corpus Check
- Large corpus: 432 files · ~442,764 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 54 nodes · 96 edges · 11 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]

## God Nodes (most connected - your core abstractions)
1. `publishGraphifyMirror()` - 15 edges
2. `wikiLink()` - 9 edges
3. `build_graph()` - 8 edges
4. `safeRead()` - 6 edges
5. `updateWikiFile()` - 5 edges
6. `execute()` - 5 edges
7. `buildGraphSummaryBlock()` - 4 edges
8. `ensureWikiScaffold()` - 4 edges
9. `upsertMarkerBlock()` - 3 edges
10. `resolveProject()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `updateWikiFile()` --calls--> `safeRead()`  [EXTRACTED]
  C:\Users\doner\capati-memory-system\pi-package\extensions\capati-memory\index.ts → C:\Users\doner\capati-memory-system\pi-package\extensions\capati-memory\index.ts  _Bridges community 1 → community 5_
- `buildGraphSummaryBlock()` --calls--> `wikiLink()`  [EXTRACTED]
  C:\Users\doner\capati-memory-system\pi-package\extensions\capati-memory\index.ts → C:\Users\doner\capati-memory-system\pi-package\extensions\capati-memory\index.ts  _Bridges community 3 → community 7_
- `buildGraphArchitectureBlock()` --calls--> `wikiLink()`  [EXTRACTED]
  C:\Users\doner\capati-memory-system\pi-package\extensions\capati-memory\index.ts → C:\Users\doner\capati-memory-system\pi-package\extensions\capati-memory\index.ts  _Bridges community 3 → community 2_
- `publishGraphifyMirror()` --calls--> `buildGraphifySessionNote()`  [EXTRACTED]
  C:\Users\doner\capati-memory-system\pi-package\extensions\capati-memory\index.ts → C:\Users\doner\capati-memory-system\pi-package\extensions\capati-memory\index.ts  _Bridges community 6 → community 1_
- `publishGraphifyMirror()` --calls--> `projectGraphifyDir()`  [EXTRACTED]
  C:\Users\doner\capati-memory-system\pi-package\extensions\capati-memory\index.ts → C:\Users\doner\capati-memory-system\pi-package\extensions\capati-memory\index.ts  _Bridges community 4 → community 1_

## Communities

### Community 0 - "Community 0"
Cohesion: 0.38
Nodes (9): build_graph(), _code_paths(), _empty_extraction(), _ensure_dirs(), _load_existing_graph(), main(), _normalize_file_path(), _remove_nodes_for_files() (+1 more)

### Community 1 - "Community 1"
Cohesion: 0.28
Nodes (9): appendLogEntry(), buildResumeSummary(), ensureWikiScaffold(), listRecentSessionFiles(), parseGraphifyPublishScope(), publishGraphifyMirror(), safeRead(), scaffoldLinkedProject() (+1 more)

### Community 2 - "Community 2"
Cohesion: 0.29
Nodes (3): buildGraphArchitectureBlock(), inferProjectRecord(), slugifyProjectName()

### Community 3 - "Community 3"
Cohesion: 0.29
Nodes (7): buildCurrentStateBlock(), buildDashboardBlock(), buildGraphCommunitiesBlock(), buildGraphHubsBlock(), buildGraphIndexBlock(), buildOverviewBlock(), wikiLink()

### Community 4 - "Community 4"
Cohesion: 0.4
Nodes (5): execute(), loadProjects(), normalizePath(), projectGraphifyDir(), resolveProject()

### Community 5 - "Community 5"
Cohesion: 0.5
Nodes (4): escapeRegExp(), updateFrontmatterDate(), updateWikiFile(), upsertMarkerBlock()

### Community 6 - "Community 6"
Cohesion: 0.67
Nodes (3): buildGraphifySessionNote(), buildSessionNote(), extractRecentConversation()

### Community 7 - "Community 7"
Cohesion: 1.0
Nodes (2): buildGraphMetrics(), buildGraphSummaryBlock()

### Community 8 - "Community 8"
Cohesion: 1.0
Nodes (0): 

### Community 9 - "Community 9"
Cohesion: 1.0
Nodes (0): 

### Community 10 - "Community 10"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 7`** (2 nodes): `buildGraphMetrics()`, `buildGraphSummaryBlock()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (2 nodes): `graphify-sync.ts`, `graphifySyncPlaceholder()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (2 nodes): `ingest-chat.ts`, `ingestChatPlaceholder()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (2 nodes): `hello()`, `a.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `publishGraphifyMirror()` connect `Community 1` to `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `wikiLink()` connect `Community 3` to `Community 2`, `Community 7`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._