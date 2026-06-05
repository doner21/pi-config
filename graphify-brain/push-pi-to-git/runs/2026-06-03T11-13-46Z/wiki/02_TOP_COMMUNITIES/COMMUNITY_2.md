---
type: community/narrative
community_id: 2
label: "test_install Module (60 functions)"
size: 60
cohesion: 0.07
character: code
---

# Community 2: test_install Module (60 functions)

> **60 nodes** | **Cohesion: 0.07** (loosely connected — these functions share a file but do different things) | **Character: code**

## For Humans

Picture this as the **quality assurance lab** for a software installer — the team that tests whether the "Install" button works on every operating system and editor configuration imaginable. Community 2 lives in `test_install.py` and exhaustively tests graphify's install and uninstall system across multiple platforms: Claude Code, Gemini, and OpenClaw (OpenCode agents).

The star of the show is `test_install.py` (42 connections — the hub), which organizes a suite of tests for each platform. The helper function `_install()` (13 connections) and `_agents_install()` (13 connections) are the workhorses, providing reusable install logic that individual tests call. `_agents_uninstall()` handles the reverse operation with 6 connections.

Individual tests drill into very specific scenarios. `test_opencode_agents_install_writes_plugin()` verifies that running the install command actually creates the plugin file on disk. `test_opencode_agents_install_registers_plugin_in_config()` checks that the plugin is properly registered in the configuration. `test_opencode_agents_install_merges_existing_config()` ensures that installing onto an existing configuration doesn't wipe out what's already there. `test_agents_uninstall_preserves_other_content()` — perhaps the most important test — makes sure that uninstalling graphify doesn't break other installed tools.

This community is fully self-contained with no cross-community edges. That's ideal for a test module: install/uninstall logic is an isolated concern, and you want your tests to be hermetic — no dependencies on other modules that could introduce false failures.

At cohesion 0.07, this is another loosely connected community. The tests share a file and some helper functions, but each test checks a distinct scenario. It's like a warehouse full of different tools on pegboards: they share the same room, but each tool serves a unique purpose.

## For LLMs

### Data

- **ID:** 2
- **Label:** test_install Module (60 functions)
- **Size:** 60 nodes
- **Cohesion:** 0.07
- **Character:** code
- **Primary file:** test_install.py

### Top Nodes by Connectivity

- **test_install.py** — 42 connections [code]
- **test_install.py** — 42 connections [code]
- **_install()** — 13 connections [code]
- **_agents_install()** — 13 connections [code]
- **_agents_uninstall()** — 6 connections [code]
- **test_opencode_agents_uninstall_removes_plugin()** — 5 connections [code]
- **test_agents_uninstall_preserves_other_content()** — 5 connections [code]
- **test_opencode_agents_install_writes_plugin()** — 4 connections [code]
- **test_opencode_agents_install_registers_plugin_in_config()** — 4 connections [code]
- **test_opencode_agents_install_merges_existing_config()** — 4 connections [code]

**No cross-community edges found — this community is self-contained.**
