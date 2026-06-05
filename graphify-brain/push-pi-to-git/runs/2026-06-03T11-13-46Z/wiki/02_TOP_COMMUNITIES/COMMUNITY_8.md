---
type: community/narrative
community_id: 8
label: "exceptions (23 functions + 18 concepts)"
size: 41
cohesion: 0.09
character: mixed
---

# Community 8: exceptions (23 functions + 18 concepts)

> **41 nodes** | **Cohesion: 0.09** (loosely connected — these functions share a file but do different things) | **Character: mixed**

## For Humans

Community 8 is graphify's **emergency room** — the complete taxonomy of things that can go wrong when making HTTP requests. Living in `exceptions.py`, this tree of 23 functions and 18 concepts defines every possible failure mode, inspired by the httpx library's exception hierarchy. Think of it as a diagnostic manual: when something breaks, the exception type tells you exactly what happened and where to look.

At the root of the tree sits **HTTPError** (7 connections) — the grandparent exception that everything else inherits from. Its children include **TransportError** (15 connections, the most connected), representing problems with the underlying network transport layer. Below TransportError sit specific failures: **TimeoutException** (14 connections) for requests that took too long, **ConnectError** (11 connections) for when the remote server can't be reached at all, **NetworkError** (8 connections) for general network unreliability, and **WriteTimeout** (4 connections) for when the server stopped accepting data mid-request.

On another branch, **RequestError** (7 connections) covers problems with the request itself — malformed URLs, unsupported methods, or headers that violate HTTP protocol. **HTTPStatusError** (10 connections) is the most "normal" error: it fires when the server responds with an HTTP error status (4xx or 5xx). This is the bridge between low-level transport issues and application-level error handling.

This community is special because it has cross-community connections to Community 26 (models Module) through `TooManyRedirects` and `InvalidURL` — exceptions that are shared between the exceptions hierarchy and the models package. These two nodes serve as bridges, meaning changes to redirect behavior or URL validation affect both communities.

With cohesion 0.09, these exception classes form a real hierarchy (which is tighter than a flat collection of unrelated functions) but aren't tightly integrated — each exception is a standalone class with its own purpose, like different medical specialties in the same hospital.

## For LLMs

### Data

- **ID:** 8
- **Label:** exceptions (23 functions + 18 concepts)
- **Size:** 41 nodes
- **Cohesion:** 0.09
- **Character:** mixed
- **Primary file:** exceptions.py

### Top Nodes by Connectivity

- **exceptions.py** — 21 connections [code]
- **exceptions.py** — 21 connections [code]
- **TransportError** — 15 connections [code]
- **TimeoutException** — 14 connections [code]
- **ConnectError** — 11 connections [code]
- **HTTPStatusError** — 10 connections [code]
- **NetworkError** — 8 connections [code]
- **RequestError** — 7 connections [code]
- **HTTPError** — 7 connections [code]
- **WriteTimeout** — 4 connections [code]

### Cross-Community Connections

- **models Module (26 functions)** (C26) — 4 edge(s)
  - exceptions.py → TooManyRedirects (contains)
  - exceptions.py → InvalidURL (contains)
