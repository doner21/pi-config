---
type: community/narrative
community_id: 1
label: "test_languages Module (62 functions)"
size: 62
cohesion: 0.06
character: code
---

# Community 1: test_languages Module (62 functions)

> **62 nodes** | **Cohesion: 0.06** (loosely connected — these functions share a file but do different things) | **Character: code**

## For Humans

Imagine a **language lab** where linguists test whether their translation software works for twenty different human languages at once. That's Community 1: the multi-language testing hub for graphify's AST (Abstract Syntax Tree) extraction engine. Every function here lives in `test_languages.py` — a single file that serves as the gateway (132 connections!) to testing whether graphify can correctly parse and extract meaning from C++, C#, Java, JavaScript, TypeScript, Swift, Kotlin, Ruby, PHP, Scala, and more.

At its core, `test_languages.py` is a massive test harness that runs the same extraction pipeline against code samples in every supported language. Individual test functions like `test_csharp_field_type_references_have_field_context()` verify that when graphify encounters a C# field declaration like `public string Name { get; set; }`, it correctly understands that `string` is a type reference belonging to the `Name` field — not a dangling loose node. Similarly, `test_ts_dynamic_import_no_error()` ensures TypeScript's `import()` expressions don't crash the parser.

The file uses a few key helper functions like `_references()` (which extracts reference edges between nodes) to keep the tests DRY. Each individual test is simple — typically just 2-3 connections — but together they form a comprehensive safety net that catches regressions when the extraction engine changes.

This community has extensive cross-community connections to smaller sibling communities (C14, C57, C78, and several single-test communities like C103 through C117). Think of this as a parent document that spawned offspring as tests grew too large for one file. The connections flow through `test_languages.py` → specific test functions in the sibling files. This is a natural pattern in growing codebases: a monolithic test file gets split, but the "contains" relationships persist in the graph.

With a cohesion of just 0.06 (the loosest on the chart), this community is the definition of a co-located collection — functions that share a file but test completely independent things. It's like an airport terminal with gates going to every continent: they're in the same building, but each gate serves a different destination.

## For LLMs

### Data

- **ID:** 1
- **Label:** test_languages Module (62 functions)
- **Size:** 62 nodes
- **Cohesion:** 0.06
- **Character:** code
- **Primary file:** test_languages.py

### Top Nodes by Connectivity

- **test_languages.py** — 132 connections [code]
- **test_languages.py** — 132 connections [code]
- **test_csharp_field_type_references_have_field_context()** — 3 connections [code]
- **_references()** — 3 connections [code]
- **test_ts_dynamic_import_no_error()** — 2 connections [code]
- **test_swift_no_error()** — 2 connections [code]
- **test_swift_no_dangling_edges()** — 2 connections [code]
- **test_swift_extension_methods_attach_to_type()** — 2 connections [code]
- **test_swift_extension_does_not_duplicate_type_node()** — 2 connections [code]
- **test_swift_extension_conformance_edge()** — 2 connections [code]

### Cross-Community Connections

- **test_languages Module (34 functions)** (C14) — 68 edge(s)
  - test_languages.py → _labels() (contains)
  - test_languages.py → test_java_finds_class() (contains)
- **test_languages Module (16 functions)** (C57) — 32 edge(s)
  - test_languages.py → _edges_with_relation() (contains)
  - test_languages.py → test_java_import_edges_have_import_context() (contains)
- **test_languages Module (11 functions)** (C78) — 22 edge(s)
  - test_languages.py → _relations() (contains)
  - test_languages.py → test_java_finds_imports() (contains)
- **test_languages Module (4 functions)** (C103) — 6 edge(s)
  - test_languages.py → _calls() (contains)
  - test_languages.py → test_kotlin_emits_in_file_calls() (contains)
- **test_languages (1 functions + 1 concepts)** (C111) — 2 edge(s)
  - test_languages.py → test_go_receiver_methods_share_type_node() (contains)
  - test_languages.py → test_go_receiver_methods_share_type_node() (contains)
- **test_languages (1 functions + 1 concepts)** (C112) — 2 edge(s)
  - test_languages.py → test_go_receiver_uses_pkg_scope() (contains)
  - test_languages.py → test_go_receiver_uses_pkg_scope() (contains)
- **test_languages (1 functions + 1 concepts)** (C115) — 2 edge(s)
  - test_languages.py → test_ts_dynamic_import_extracts_edges() (contains)
  - test_languages.py → test_ts_dynamic_import_extracts_edges() (contains)
- **test_languages (1 functions + 1 concepts)** (C113) — 2 edge(s)
  - test_languages.py → test_ts_dynamic_import_confidence() (contains)
  - test_languages.py → test_ts_dynamic_import_confidence() (contains)
- **test_languages (1 functions + 1 concepts)** (C114) — 2 edge(s)
  - test_languages.py → test_ts_dynamic_import_source_is_function() (contains)
  - test_languages.py → test_ts_dynamic_import_source_is_function() (contains)
- **test_languages (1 functions + 1 concepts)** (C110) — 2 edge(s)
  - test_languages.py → test_ts_no_dynamic_import_in_sync_fn() (contains)
  - test_languages.py → test_ts_no_dynamic_import_in_sync_fn() (contains)
- **test_languages (1 functions + 1 concepts)** (C117) — 2 edge(s)
  - test_languages.py → test_ts_dynamic_template_literal_skipped() (contains)
  - test_languages.py → test_ts_dynamic_template_literal_skipped() (contains)
- **test_languages (1 functions + 1 concepts)** (C116) — 2 edge(s)
  - test_languages.py → test_ts_static_template_literal_resolved() (contains)
  - test_languages.py → test_ts_static_template_literal_resolved() (contains)
