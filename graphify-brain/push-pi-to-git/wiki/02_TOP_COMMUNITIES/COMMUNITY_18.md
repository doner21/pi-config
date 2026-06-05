---
type: community/narrative
community_id: 18
label: "client Module (29 functions)"
size: 29
cohesion: 0.11
character: code
---

# Community 18: client Module (29 functions)

> **29 nodes** | **Cohesion: 0.11** (loosely connected — these functions share a file but do different things) | **Character: code**

## For Humans

Community 18 is graphify's **HTTP communication layer** — a full httpx-compatible HTTP client implementation with both synchronous and asynchronous support. Living in `client.py`, this community of 29 functions is a standalone HTTP library that graphify uses to make API calls (to LLM providers, git hosts, or any external service). Think of it as the mail room of the system — every outbound request passes through here.

The two central figures are **Client** (28 connections) and **AsyncClient** (27 connections) — the synchronous and asynchronous HTTP client classes. They share the same interface but one runs with `async/await` and the other with blocking calls. **Client** is slightly more connected, likely because it's the primary reference implementation and AsyncClient delegates to it.

The request methods form the second tier. **.request()** (14 connections on one variant, 5 on another — likely the public interface vs. internal dispatch) is the universal request builder. **.get()** (4 connections), **.put()** (2 connections on two variants) are HTTP method-specific shortcuts. **_build_request()** (4 connections) constructs the raw HTTP request object from parameters. **_merge_cookies()** (3 connections) handles cookie jar merging across requests. **.send()** (2 connections) dispatches the constructed request over the wire.

What makes Community 18 remarkable is its **extensive cross-community bridge network** — it connects to five other communities:

- **Community 26 (models Module)** — 10 edges: `Client` and `AsyncClient` both inherit from `BaseClient`, connecting to the models layer
- **Community 21 (auth)** — 6 edges: The clients use `Auth` objects to handle authentication
- **Community 46 (Response/Headers)** — 4 edges: Clients produce `Response` objects and consume `Headers`
- **Community 30 (transport)** — 4 edges: Clients use `BaseTransport` and `AsyncHTTPTransport` for the low-level communication
- **Community 68 (transport)** — 2 edges: Additional transport dependencies through `HTTPTransport`

This makes Community 18 the most well-connected community in the graph — a true network hub. When the transport layer changes, the client adapts. When auth changes, clients are affected. This centrality is normal for an HTTP client: everything builds on it, and it builds on everything beneath.

With cohesion 0.11, this community is moderately tight — the client, async client, and request methods form a coherent API surface, but the internal plumbing (cookies, URL building, response handling) creates enough separation to keep cohesion moderate.

## For LLMs

### Data

- **ID:** 18
- **Label:** client Module (29 functions)
- **Size:** 29 nodes
- **Cohesion:** 0.11
- **Character:** code
- **Primary file:** client.py

### Top Nodes by Connectivity

- **Client** — 28 connections [code]
- **AsyncClient** — 27 connections [code]
- **.request()** — 14 connections [code]
- **.request()** — 5 connections [code]
- **.get()** — 4 connections [code]
- **._build_request()** — 4 connections [code]
- **._merge_cookies()** — 3 connections [code]
- **.send()** — 2 connections [code]
- **.put()** — 2 connections [code]
- **.put()** — 2 connections [code]

### Cross-Community Connections

- **models Module (26 functions)** (C26) — 10 edge(s)
  - Client → BaseClient (inherits)
  - AsyncClient → BaseClient (inherits)
- **auth (19 functions + 9 concepts)** (C21) — 6 edge(s)
  - Client → Auth (uses)
  - AsyncClient → Auth (uses)
- **models Module (19 functions)** (C46) — 4 edge(s)
  - Client → Response (uses)
  - Client → Headers (uses)
- **transport Module (24 functions)** (C30) — 4 edge(s)
  - Client → BaseTransport (uses)
  - Client → AsyncHTTPTransport (uses)
- **transport Module (14 functions)** (C68) — 2 edge(s)
  - Client → HTTPTransport (uses)
  - AsyncClient → HTTPTransport (uses)
