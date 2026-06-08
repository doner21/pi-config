---
type: community/narrative
community_id: 12
label: "sample.swift Module (35 functions)"
size: 35
cohesion: 0.09
character: code
---

# Community 12: sample.swift Module (35 functions)

> **35 nodes** | **Cohesion: 0.09** (loosely connected — these functions share a file but do different things) | **Character: code**

## For Humans

Community 12 is a **multilingual code sample** used as a test fixture — a carefully crafted collection of Swift, PowerShell, and C# snippets designed to stress-test graphify's extraction engine across different language paradigms. Think of it as a translation exercise: the same concepts (data processing, error handling, protocols) expressed in three different programming languages.

The standout node is **DataProcessor** (22 connections) — a Swift class that likely demonstrates complex object-oriented patterns: properties, methods, generics, and error handling. It's the most connected node in this community, serving as the central example that exercises graphify's ability to extract class hierarchies. Supporting it are **Processor** (6 connections) and **IProcessor** (4 connections) — probably a protocol (Swift's version of an interface) and its concrete implementation, forming a clean test case for protocol conformance edge detection.

**NetworkError** (6 connections) represents Swift's error handling pattern (enums conforming to the Error protocol). This tests whether graphify can correctly identify enum types that have special semantic meaning (like error types) versus regular enums. The `sample.swift` file itself (7 connections) is the container.

What makes this community interesting is its cross-community connection to Community 3 (sample.jl Module). The connection is through **Config** — a configuration class or struct that appears in both the Swift sample and the Julia sample (Community 3). This single shared node with 2 edges means that when graphify analyzed `sample.swift`, it found a reference to a `Config` type that also exists in `sample.jl`. This could be a cross-file reference (one sample file imports from another) or simply two files that define a class with the same name.

With cohesion 0.09, this community is loosely connected. The `DataProcessor` class has many internal methods, but they're all related to the same data-processing theme. The additional languages (PowerShell's `sample.ps1` and C#'s `sample.cs`) add nodes that are largely independent of the Swift core — like language appendices in a compare-and-contrast essay.

## For LLMs

### Data

- **ID:** 12
- **Label:** sample.swift Module (35 functions)
- **Size:** 35 nodes
- **Cohesion:** 0.09
- **Character:** code
- **Primary file:** sample.swift

### Top Nodes by Connectivity

- **DataProcessor** — 22 connections [code]
- **sample.swift** — 7 connections [code]
- **sample.swift** — 7 connections [code]
- **Processor** — 6 connections [code]
- **NetworkError** — 6 connections [code]
- **IProcessor** — 4 connections [code]
- **sample.ps1** — 3 connections [code]
- **sample.ps1** — 3 connections [code]
- **sample.cs** — 3 connections [code]
- **sample.cs** — 3 connections [code]

### Cross-Community Connections

- **sample.jl Module (56 functions)** (C3) — 2 edge(s)
  - sample.swift → Config (contains)
  - sample.swift → Config (contains)
