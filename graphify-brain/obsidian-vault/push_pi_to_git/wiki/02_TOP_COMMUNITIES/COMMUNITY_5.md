---
type: community/narrative
community_id: 5
label: "detect (28 functions + 20 concepts)"
size: 48
cohesion: 0.09
character: mixed
---

# Community 5: detect (28 functions + 20 concepts)

> **48 nodes** | **Cohesion: 0.09** (loosely connected — these functions share a file but do different things) | **Character: mixed**

## For Humans

Community 5 is graphify's **triage nurse** — the module that looks at every file in a project and decides what it is, what language it speaks, and whether it's safe to read. Living in `detect.py`, this mixed community of 28 functions and 20 concepts is the first thing that runs when you point graphify at a directory.

The lead role goes to **detect.py** (25 connections), the file that organizes everything. The **detect()** function (14 connections) is the main diagnostician: given a file path, it determines the file's type (source code, document, image, binary, secret), language family, and whether it should be included in the graph. **detect_incremental()** (6 connections) is the re-triage specialist — it figures out what's changed since the last scan and only re-processes what's necessary.

Supporting specialists handle edge cases. **convert_office_file()** (7 connections) translates .docx and .xlsx files into markdown so graphify can read them — like a translator for proprietary formats. **xlsx_to_markdown()** and **docx_to_markdown()** (6 connections each) are the format-specific converters. **count_words()** (6 connections) estimates document size for chunking decisions. **_load_graphifyinclude()** (6 connections) reads `.graphifyinclude` files that let users override what gets scanned.

The conceptual nodes capture detection heuristics: "Return True if this file likely contains secrets and should be skipped" (avoiding accidentally indexing API keys), and "Heuristic: does this text file read like" (determining whether a text file is prose or data).

Self-contained like a good triage station should be. With cohesion 0.09, the detection routines share a file but handle very different formats and rules — PDF processing, Office documents, source code recognition, secret scanning, all under one roof for organizational convenience.

## For LLMs

### Data

- **ID:** 5
- **Label:** detect (28 functions + 20 concepts)
- **Size:** 48 nodes
- **Cohesion:** 0.09
- **Character:** mixed
- **Primary file:** detect.py

### Top Nodes by Connectivity

- **detect.py** — 25 connections [code]
- **detect.py** — 25 connections [code]
- **detect()** — 14 connections [code]
- **str** — 10 connections [code]
- **convert_office_file()** — 7 connections [code]
- **xlsx_to_markdown()** — 6 connections [code]
- **docx_to_markdown()** — 6 connections [code]
- **detect_incremental()** — 6 connections [code]
- **count_words()** — 6 connections [code]
- **_load_graphifyinclude()** — 6 connections [code]

**No cross-community edges found — this community is self-contained.**
