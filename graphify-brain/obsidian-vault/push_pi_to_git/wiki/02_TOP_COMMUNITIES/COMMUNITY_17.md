---
type: community/narrative
community_id: 17
label: "test_cache (16 functions + 13 concepts)"
size: 29
cohesion: 0.10
character: mixed
---

# Community 17: test_cache (16 functions + 13 concepts)

> **29 nodes** | **Cohesion: 0.10** (loosely connected — these functions share a file but do different things) | **Character: mixed**

## For Humans

Community 17 is the **test suite for graphify's caching layer** — the module that avoids re-processing files that haven't changed. Living in `test_cache.py`, this mixed community of 16 functions and 13 concepts tests every aspect of the file hash cache: consistency, sensitivity to content changes, frontmatter awareness, and cache lifecycle management. Think of it as the quality assurance team for a smart inventory system — making sure the warehouse knows when stock has actually changed versus when the box just got a new label.

The hub is `test_cache.py` (15 connections). The tests cluster around three concerns. **Hash consistency**: `test_file_hash_consistent()` and `test_file_hash_changes()` verify that the same file always produces the same hash, and that different files produce different hashes. These are the fundamental invariants of any caching system — if the hash changes for the same file, caching is broken.

**Frontmatter-aware hashing**: This is the most interesting and subtle set of tests. `test_md_frontmatter_only_change_same_hash()` checks that editing only the YAML frontmatter of a markdown file (like updating a "last reviewed" date) does NOT change the cache key — because the frontmatter is metadata, not content. `test_md_body_change_different_hash()` verifies that changing the actual body text DOES produce a new hash. `test_md_no_frontmatter_hashed_normally()` ensures that a markdown file without frontmatter is hashed in the normal way. This frontmatter-awareness is critical: without it, every time you update a file's metadata, graphify would re-process the entire file for no benefit.

**File type awareness**: `test_non_md_file_hashed_fully()` checks that non-markdown files (like source code) are hashed completely without any frontmatter special-casing. `test_cached_files()` and `test_clear_cache()` (3 connections each) test the cache lifecycle — storing results, retrieving them, and clearing the cache when needed.

The concept nodes capture the design thinking: "Tests for graphify/cache.py" and "Same file gives same hash on repeated calls" document the rationale behind the test suite.

With cohesion 0.10, these tests are loosely connected — each tests an independent caching scenario. No cross-community connections, which is ideal: cache tests should depend only on the cache module itself.

**Why it matters:** Caching is what makes graphify practical on large codebases. Without it, every single run would re-parse every file from scratch. This test suite ensures the caching layer is correct and doesn't have edge-case bugs that could silently return stale results. 

## For LLMs

### Data

- **ID:** 17
- **Label:** test_cache (16 functions + 13 concepts)
- **Size:** 29 nodes
- **Cohesion:** 0.10
- **Character:** mixed
- **Primary file:** test_cache.py

### Top Nodes by Connectivity

- **test_cache.py** — 15 connections [code]
- **test_cache.py** — 15 connections [code]
- **test_non_md_file_hashed_fully()** — 3 connections [code]
- **test_md_no_frontmatter_hashed_normally()** — 3 connections [code]
- **test_md_frontmatter_only_change_same_hash()** — 3 connections [code]
- **test_md_body_change_different_hash()** — 3 connections [code]
- **test_file_hash_consistent()** — 3 connections [code]
- **test_file_hash_changes()** — 3 connections [code]
- **test_clear_cache()** — 3 connections [code]
- **test_cached_files()** — 3 connections [code]

**No cross-community edges found — this community is self-contained.**
