---
type: community/narrative
community_id: 6
label: "test_detect (31 functions + 14 concepts)"
size: 45
cohesion: 0.07
character: mixed
---

# Community 6: test_detect (31 functions + 14 concepts)

> **45 nodes** | **Cohesion: 0.07** (loosely connected — these functions share a file but do different things) | **Character: mixed**

## For Humans

Community 6 is the **test harness for the file triage system** — the quality assurance team that makes sure Community 5 (the detection module) correctly identifies every file it encounters. Living in `test_detect.py`, this community of 31 functions and 14 concepts pokes and prods the detection logic to make sure edge cases are handled.

The hub is `test_detect.py` (29 connections), organizing a collection of focused tests. Many of the most connected tests revolve around **graphifyignore** — graphify's equivalent of `.gitignore`. `test_graphifyignore_stops_at_git_boundary()` verifies that the ignore rules don't leak beyond the current repository. `test_graphifyignore_hermetic_without_vcs()` checks that the system works even when there's no git repository at all. `test_graphifyignore_excludes_file()` and `test_graphifyignore_comments_ignored()` test specific features of the ignore file format. `test_graphifyignore_at_git_root_is_included()` and `test_graphifyignore_discovered_from_parent_in_vcs()` round out the VCS boundary tests.

Beyond graphifyignore, `test_detect_video_not_in_words()` tests a subtle edge case: making sure video files aren't accidentally treated as word-countable text. Each test has exactly 3 connections — just enough to express the test itself and its relationship to the file.

The conceptual nodes document classification rules like "A .md file with enough paper signals should classify as PAPER" — graphify can distinguish between a README.md (which is just documentation) and a research paper written in markdown (which should be classified as academic content). This is a surprisingly nuanced piece of AI: detecting semantic intent from file structure alone.

With cohesion 0.07, these tests are loosely connected — each tests a different facet of detection, but they all live in one file for organizational convenience. No cross-community connections, which is ideal: detection tests should be hermetic.

## For LLMs

### Data

- **ID:** 6
- **Label:** test_detect (31 functions + 14 concepts)
- **Size:** 45 nodes
- **Cohesion:** 0.07
- **Character:** mixed
- **Primary file:** test_detect.py

### Top Nodes by Connectivity

- **test_detect.py** — 29 connections [code]
- **test_detect.py** — 29 connections [code]
- **test_graphifyignore_stops_at_git_boundary()** — 3 connections [code]
- **test_graphifyignore_missing_is_fine()** — 3 connections [code]
- **test_graphifyignore_hermetic_without_vcs()** — 3 connections [code]
- **test_graphifyignore_excludes_file()** — 3 connections [code]
- **test_graphifyignore_discovered_from_parent_in_vcs()** — 3 connections [code]
- **test_graphifyignore_comments_ignored()** — 3 connections [code]
- **test_graphifyignore_at_git_root_is_included()** — 3 connections [code]
- **test_detect_video_not_in_words()** — 3 connections [code]

**No cross-community edges found — this community is self-contained.**
