# Global Pi Agent Policy

## Engram Persistent Memory

This Pi installation uses Engram for persistent memory. The binary ships at `agent/bin/engram.exe`
and the `gentle-engram` npm package provides Pi-native `mem_*` tools.

### If Engram tools are unavailable

1. Check `$env:ENGRAM_BIN` (Windows) or `$ENGRAM_BIN` (Linux/macOS) is set to the binary path
2. Run `agent/setup.sh` or `agent/setup.ps1` to reconfigure
3. Verify the binary exists: `agent/bin/engram.exe` (Windows) or `agent/bin/engram` (Linux/macOS)
4. Run `mem_doctor` to diagnose connection issues
5. The MCP server config at `agent/mcp.json` uses `ENGRAM_BIN || 'engram'` — if the env var is missing
   and 'engram' isn't on PATH, the MCP server won't start

### Quick fix (per-session)

```powershell
# Windows PowerShell
$env:ENGRAM_BIN = "$env:USERPROFILE\.pi\agent\bin\engram.exe"
```

```bash
# Linux / macOS
export ENGRAM_BIN="$HOME/.pi/agent/bin/engram"
```

## Graphify Brain is first-class project memory context

This Pi installation uses the Graphify Brain at `C:\Users\doner\.pi\graphify-brain` as its global project memory system.
Treat the graphify-brain and its knowledge graphs as persistent context that should be consulted in every substantive session.

## Startup behavior

At the beginning of meaningful work:

1. Determine whether the current working directory belongs to a known or linked project.
2. If the task is project-specific, prefer resuming project memory from the graphify-brain before broad repo exploration.
3. Consult graphify-brain artifacts (GRAPH_REPORT.md, wiki/index.md) before re-deriving context from scratch.
4. If graph/codebase structure matters and Graphify artifacts exist, prefer those artifacts before broad manual file reading.

## Memory-first working rules

When starting work in or around a project:
- Prefer the graphify-brain for project context.
- Reuse existing project memory, knowledge graphs, graph reports, and wiki pages when available.
- Avoid asking the user to restate project context if the graphify-brain can provide it.

When solving problems:
- Check whether a related solution, decision, session note, or graph artifact already exists in the graphify-brain.
- Treat the graphify-brain as durable project memory and the current session as temporary working memory.

When finishing meaningful work:
- If the session produced decisions, implementation progress, architecture insight, or reusable solutions, consider whether a graphify-brain update would be valuable.

## Graphify preference

If a project is linked and Graphify artifacts are available:
- Prefer `GRAPH_REPORT.md` and `wiki/index.md` before broad manual codebase summarization.
- Use graph outputs to answer architecture and dependency questions when possible.

## Scope and honesty

- Do not pretend project memory was consulted if it was not.
- If a project is not in the graphify-brain or artifacts are unavailable, say so clearly.
- Use project memory to reduce repetition, not to fabricate certainty.

## Practical default

For new project sessions, the preferred sequence is:
1. Check the graphify-brain for existing project memory
2. Inspect relevant GRAPH_REPORT.md and wiki artifacts
3. Do the requested work
4. Save durable updates to the graphify-brain when appropriate
