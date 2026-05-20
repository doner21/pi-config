# Graph Report - C:\Users\doner\html_cloth  (2026-04-25)

## Corpus Check
- Large corpus: 14 files · ~1,602,731 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 82 nodes · 185 edges · 13 communities detected
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]

## God Nodes (most connected - your core abstractions)
1. `HtmlCloth` - 52 edges
2. `pushLog()` - 10 edges
3. `updateTelemetryUI()` - 9 edges
4. `setEffectMode()` - 8 edges
5. `rebuildActiveEffect()` - 7 edges
6. `changeSlide()` - 7 edges
7. `onPointerMove()` - 5 edges
8. `spawnRippleImpulse()` - 5 edges
9. `formatModeLabel()` - 4 edges
10. `resetInteractionState()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `onPointerMove()` --calls--> `formatModeLabel()`  [EXTRACTED]
  C:\Users\doner\html_cloth\src\main.js → C:\Users\doner\html_cloth\src\main.js  _Bridges community 3 → community 6_
- `changeSlide()` --calls--> `pushLog()`  [EXTRACTED]
  C:\Users\doner\html_cloth\src\main.js → C:\Users\doner\html_cloth\src\main.js  _Bridges community 6 → community 10_
- `setEffectMode()` --calls--> `rebuildActiveEffect()`  [EXTRACTED]
  C:\Users\doner\html_cloth\src\main.js → C:\Users\doner\html_cloth\src\main.js  _Bridges community 3 → community 4_
- `changeSlide()` --calls--> `resetInteractionState()`  [EXTRACTED]
  C:\Users\doner\html_cloth\src\main.js → C:\Users\doner\html_cloth\src\main.js  _Bridges community 3 → community 10_

## Communities

### Community 0 - "Community 0"
Cohesion: 0.24
Nodes (1): HtmlCloth

### Community 1 - "Community 1"
Cohesion: 0.33
Nodes (0): 

### Community 2 - "Community 2"
Cohesion: 0.25
Nodes (0): 

### Community 3 - "Community 3"
Cohesion: 0.32
Nodes (8): animate(), formatModeLabel(), onPointerLeave(), resetInteractionState(), setEffectMode(), timestampLabel(), updateModeButtons(), updateTelemetryUI()

### Community 4 - "Community 4"
Cohesion: 0.43
Nodes (6): createPointCloudHero(), createRippleHero(), disposeActiveEffect(), rebuildActiveEffect(), resize(), updateDisplayedPlaneSize()

### Community 5 - "Community 5"
Cohesion: 0.33
Nodes (0): 

### Community 6 - "Community 6"
Cohesion: 0.38
Nodes (7): onPointerDown(), onPointerMove(), pushLog(), renderLogFeed(), resolveHoverFromPointer(), seedInitialLogs(), spawnRippleImpulse()

### Community 7 - "Community 7"
Cohesion: 0.4
Nodes (0): 

### Community 8 - "Community 8"
Cohesion: 0.4
Nodes (0): 

### Community 9 - "Community 9"
Cohesion: 0.5
Nodes (0): 

### Community 10 - "Community 10"
Cohesion: 0.5
Nodes (4): animateEffectOpacity(), changeSlide(), getCurrentTexture(), updateSlideIndicator()

### Community 11 - "Community 11"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "Community 12"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 11`** (1 nodes): `playwright-verify-pointcloud.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (1 nodes): `playwright-verify-pointcloud.spec.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `HtmlCloth` connect `Community 0` to `Community 1`, `Community 2`, `Community 5`, `Community 7`, `Community 8`, `Community 9`?**
  _High betweenness centrality (0.603) - this node is a cross-community bridge._
- **Why does `animate()` connect `Community 3` to `Community 8`, `Community 4`?**
  _High betweenness centrality (0.425) - this node is a cross-community bridge._
- **Why does `updateTelemetryUI()` connect `Community 3` to `Community 10`, `Community 4`, `Community 6`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._