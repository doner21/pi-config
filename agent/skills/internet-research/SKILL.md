---
name: "internet-research"
description: "PROCEDURE: Search the internet using DuckDuckGo/browser-backed search. Use this to find current information, documentation, or solutions to coding problems."
---

# Internet Research Procedure

> [!IMPORTANT]
> **This is a PROCEDURE, not a tool.** You do **not** have a tool named `web-search` or `internet-research`.
> Prefer the Pi tool **`browser_web_search`** when it is available. It is provided by this config's `browser-picture-search` extension, uses DuckDuckGo Lite/direct HTTP with a Playwright fallback, and does **not** require Ollama, Llama, or a local model.

## How to Search

1. **Formulate a Query**: Determine the search terms you want to use.
2. **Preferred tool path**: Call `browser_web_search` with `query` and `max_results`. Use `browser_navigate`/`browser_snapshot` on promising result URLs when you need full-page evidence.
3. **Fallback CLI path**: If `browser_web_search` is unavailable, use `bash` to run the DuckDuckGo CLI tool (`ddgr`) with `--json` for structured output.

**Fallback Search Command:**
```bash
ddgr --json -n 5 "your search query here"
```

4. **Synthesize**: Use result titles, URLs, snippets, and opened pages to answer the user's question. Cite URLs for current or externally sourced claims.

## Notes

- `web_search` / `web_fetch` are legacy Ollama-backed tools only when `npm:@ollama/pi-web-search` is installed and a local Ollama instance has web search/fetch enabled.
- If a DeepSeek-backed subagent such as `browser-agent` performs the search, DeepSeek is the reasoning model interpreting results; the search backend is still DuckDuckGo/browser automation.

## Example

If the user asks about Gemma 4, call `browser_web_search` with:

```json
{ "query": "Google Gemma 4 models latest details", "max_results": 5 }
```

Then inspect authoritative result pages as needed.
