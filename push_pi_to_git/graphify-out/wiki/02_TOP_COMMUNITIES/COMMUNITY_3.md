---
type: community/narrative
community_id: 3
label: "sample.jl Module (56 functions)"
size: 56
cohesion: 0.06
character: code
---

# Community 3: sample.jl Module (56 functions)

> **56 nodes** | **Cohesion: 0.06** (loosely connected — these functions share a file but do different things) | **Character: code**

## For Humans

Community 3 is a **multilingual zoo** — a collection of sample code files in different programming languages, designed as test fixtures for graphify's extraction engine. Think of it as the museum exhibit where each diorama shows a different language's syntax in action. The primary file is `sample.jl` (a Julia sample), but it also holds Zig, and the community is connected to sample files in other languages.

The most connected node is **main()** (17 connections), which likely serves as the entry point orchestrating various sample operations. The **Geometry** module (16 connections) defines spatial types and operations — probably containing Shape, Point, and related geometric abstractions. **HttpClient** (14 connections) is a mock HTTP client used to test how graphify handles classes with complex method signatures, networking patterns, and error handling. **Config** (10 connections) represents a configuration class — perfect for testing property/field extraction in Julia.

Interesting details: **Shape** (5 connections) and **Point** (5 connections) form a class hierarchy that tests graphify's ability to detect inheritance relationships. The `sample.zig` file (6 connections, appearing twice in the top nodes — probably from the AST splitting the same file into two node entries) brings Zig language constructs into the mix. **process()** and **createClient()** (4 connections each) are utility functions that exercise graphify's call-graph detection.

This community has no cross-community connections, which is exactly what you want from test fixture files. They're self-contained samples that graphify parses; they don't depend on the rest of the system.

At cohesion 0.06, this is one of the loosest communities — these are deliberately unrelated code snippets in one file, testing that graphify can handle many patterns without getting confused. It's like a junk drawer of syntax features, and that's precisely the point.

## For LLMs

### Data

- **ID:** 3
- **Label:** sample.jl Module (56 functions)
- **Size:** 56 nodes
- **Cohesion:** 0.06
- **Character:** code
- **Primary file:** sample.jl

### Top Nodes by Connectivity

- **main()** — 17 connections [code]
- **Geometry** — 16 connections [code]
- **HttpClient** — 14 connections [code]
- **Config** — 10 connections [code]
- **sample.zig** — 6 connections [code]
- **sample.zig** — 6 connections [code]
- **Shape** — 5 connections [code]
- **Point** — 5 connections [code]
- **process()** — 4 connections [code]
- **createClient()** — 4 connections [code]

**No cross-community edges found — this community is self-contained.**
