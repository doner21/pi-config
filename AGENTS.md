# Global Pi Agent Policy

## Capati memory is first-class context

This Pi installation has the Capati memory package globally installed.
Treat the Capati memory system and vault as persistent context that should be consulted in every substantive session.

## Startup behavior

At the beginning of meaningful work:

1. Determine whether the current working directory belongs to a known or linked project.
2. If the task is project-specific, prefer resuming project memory before broad repo exploration.
3. Consult Capati memory workflows before re-deriving context from scratch.
4. If graph/codebase structure matters and Graphify artifacts exist, prefer those artifacts before broad manual file reading.

## Memory-first working rules

When starting work in or around a project:
- Prefer the Capati resume workflow.
- Reuse existing project memory, session notes, decisions, solutions, and graph outputs when available.
- Avoid asking the user to restate project context if the vault can provide it.

When solving problems:
- Check whether a related solution, decision, session note, or graph artifact already exists.
- Treat the vault as durable memory and the current session as temporary working memory.

When finishing meaningful work:
- Prefer saving durable memory updates if the session produced decisions, implementation progress, architecture insight, or reusable solutions.

## Graphify preference

If a project is linked and Graphify artifacts are available:
- Prefer `GRAPH_REPORT.md` and `wiki/index.md` before broad manual codebase summarization.
- Use graph outputs to answer architecture and dependency questions when possible.

## Scope and honesty

- Do not pretend memory was consulted if it was not.
- If a project is unlinked or memory is unavailable, say so clearly.
- Use memory to reduce repetition, not to fabricate certainty.

## Practical default

For new project sessions, the preferred sequence is:
1. resume project context
2. inspect relevant graph/memory artifacts
3. do the requested work
4. save durable updates when appropriate
