---
type: community/narrative
community_id: 6
label: "validator Module (12 functions)"
size: 12
cohesion: 0.36
character: code
---

# Community 6: validator Module (12 functions)

> **12 nodes** | **Cohesion: 0.36** (coherent and well-connected) | **Character: code**

## For Humans

### Analogy: The Health Inspector

This community is like **the health inspector who visits the restaurant** — an independent entity that checks whether everything meets standards. It doesn't cook, serve, or manage. It validates.

The NenFlow validator reads artifacts (intake specs, plans, execution reports, verifier briefs), checks their frontmatter, validates their structure, and monitors context saturation. If anything is out of spec, it fails loudly with precise error messages.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   NENFLOW V3 VALIDATOR                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────┐       │
│  │                 main()                            │       │
│  │              (Entry Point — 10 edges)             │       │
│  │   Reads CLI args, loads artifact file,           │       │
│  │   parses frontmatter, routes to role validator,  │       │
│  │   returns PASS or FAIL with exit code             │       │
│  └──────────────────────┬───────────────────────────┘       │
│                         │                                    │
│     ┌───────────────────┼───────────────────┐                │
│     │                   │                   │                │
│  ┌──▼──────────┐  ┌─────▼──────┐  ┌────────▼────────┐      │
│  │ Pre-Flight  │  │Role        │  │Context          │      │
│  │ Checks      │  │Validators  │  │Monitoring       │      │
│  │             │  │            │  │                 │      │
│  │┌──────────┐│  │┌──────────┐│  │┌───────────────┐│      │
│  ││parse     ││  ││validate  ││  ││checkContext   ││      │
│  ││Frontmat- ││  ││Orchestr- ││  ││Saturation()   ││      │
│  ││ter()     ││  ││ator()    ││  ││(5 edges)      ││      │
│  │└──────────┘│  │└──────────┘│  ││Checks if an   ││      │
│  │┌──────────┐│  │┌──────────┐│  ││agent's self-  ││      │
│  ││readFm()  ││  ││validate  ││  ││estimate       ││      │
│  ││(read     ││  ││Intake()  ││  ││exceeds        ││      │
│  ││ front-   ││  │└──────────┘│  ││threshold      ││      │
│  ││ matter)  ││  │┌──────────┐│  │└───────────────┘│      │
│  │└──────────┘│  ││validate  ││  └─────────────────┘      │
│  └────────────┘  ││Planner() ││                             │
│                  │└──────────┘│                             │
│                  │┌──────────┐│                             │
│                  ││validate  ││                             │
│                  ││Executor()││                             │
│                  │└──────────┘│                             │
│                  │┌──────────┐│                             │
│                  ││validate  ││                             │
│                  ││Resear-   ││                             │
│                  ││cher()    ││                             │
│                  │└──────────┘│                             │
│                  │┌──────────┐│                             │
│                  ││validate  ││                             │
│                  ││Verifier()││                             │
│                  │└──────────┘│                             │
│                  └────────────┘                             │
│                                                              │
│  ┌──────────────────────────────────────────────────┐       │
│  │  pass() — exits 0 with PASS message               │       │
│  │  fail() — exits 1 with FAIL message + reason      │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### What It Does

This is the **NenFlow v3 Validator** (12 nodes, cohesion 0.36 — the highest among larger communities). It validates NenFlow artifacts to ensure they meet the schema contracts expected by downstream agents:

- **Intake validation** — Checks task summary, task type, invariants, success criteria, routing decision
- **Plan validation** — Verifies task statement, staged tasks, file areas, test plans
- **Execution report validation** — Checks summary, files changed, evidence, verifier instructions
- **Verification report validation** — Validates PASS/FAIL, criteria assessment, invariants check
- **Researcher validation** — Checks research summary, codebase findings, recommendations
- **Context saturation monitoring** — `checkContextSaturation()` reads an agent's self-estimate and flags if it exceeds the configured threshold

**Key nodes:**
- **main()** (10 edges) — The CLI entry point. Parses arguments, loads the artifact, validates, exits.
- **checkContextSaturation()** (5 edges) — Compares `context_saturation_estimate` against `context_handoff_threshold_percent`.
- **Role validators** (3 edges each) — Each role has its own validation function with role-specific checks.

### Why Cohesion is High (0.36)

This is the most tightly-knit code community in the top 20 (only Community 12's MenuNav at 0.60 is tighter). Every function feeds into `main()`, every validator follows the same pattern (parse frontmatter → check required fields → check role identity → PASS/FAIL), and `checkContextSaturation()` is called from the main validation flow. The functions are a true pipeline, not just co-located files.

## For LLMs

### Data

- **ID:** 6
- **Label:** validator Module (12 functions)
- **Size:** 12 nodes
- **Cohesion:** 0.36
- **Character:** code
- **Primary file:** validator.js

### Top Nodes by Connectivity

- **validator.js** -- 11 connections [code]
- **main()** -- 10 connections [code]
- **checkContextSaturation()** -- 5 connections [code]
- **validateVerifier()** -- 3 connections [code]
- **validateResearcher()** -- 3 connections [code]
- **validatePlanner()** -- 3 connections [code]
- **validateExecutor()** -- 3 connections [code]
- **validateOrchestrator()** -- 2 connections [code]
- **validateIntake()** -- 2 connections [code]
- **pass()** -- 2 connections [code]

**No cross-community edges -- this community is self-contained.**
