---
source_file: "nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/graphify/security.py"
type: "rationale"
community: "Community 50"
location: "L72"
tags:
  - graphify/rationale
  - graphify/EXTRACTED
  - community/Community_50
---

# Patch socket.getaddrinfo for the duration of a fetch to catch DNS rebinding.

## Connections
- [[_ssrf_guarded_socket()]] - `rationale_for` [EXTRACTED]

#graphify/rationale #graphify/EXTRACTED #community/Community_50