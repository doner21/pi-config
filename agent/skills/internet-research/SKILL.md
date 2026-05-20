---
name: "internet-research"
description: "PROCEDURE: Search the internet using DuckDuckGo. Use this to find current information, documentation, or solutions to coding problems."
---

# Internet Research Procedure

> [!IMPORTANT]
> **This is a PROCEDURE, not a tool.** You do **not** have a tool named `web-search` or `internet-research`. 
> To perform an internet search, you must manually use your **`bash`** tool to run the following commands.

## How to Search

1.  **Formulate a Query**: Determine the search terms you want to use.
2.  **Execute via Bash**: Run the DuckDuckGo CLI tool (`ddgr`) using the `bash` tool. Always use the `--json` flag for structured output.

**Search Command:**
```bash
ddgr --json -n 5 "your search query here"
```

3.  **Process Results**: The `bash` tool will return a JSON list of results (titles, URLs, and abstracts).
4.  **Synthesize**: Read the abstracts and titles to answer the user's question. If you need more detail, you can use the `bash` tool to `curl` a specific URL from the results.

## Example
If the user asks about Gemma 4, run:
`ddgr --json -n 5 "Google Gemma 4 models latest details"`
Then parse the list of results provided by the `bash` output.
