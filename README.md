# Pi CLI — Full Configuration

This is a complete **Pi coding-agent** configuration, ready to clone onto any machine.
It includes agents, skills, extensions, subagents, prompts, the **NenFlow v3 workflow engine**,
and the **Global Graphify Brain** persistent memory system.

> **Requires:** Pi coding-agent installed.  
> `npm install -g @earendil-works/pi-coding-agent` (or `@mariozechner/pi-coding-agent`)

---

## Quick Install

```bash
# Back up any existing config
mv ~/.pi ~/.pi.backup.$(date +%Y%m%d) 2>/dev/null

# Clone into ~/.pi
git clone https://github.com/doner21/pi-config.git ~/.pi

# Run the bootstrap script (handles npm install + Engram setup)
bash ~/.pi/agent/setup.sh

# Add your API keys (NOT in this repo — see below)
```

### Windows (PowerShell)

```powershell
# Backup
Rename-Item "$env:USERPROFILE\.pi" ".pi.backup.$(Get-Date -Format yyyyMMdd)" -ErrorAction SilentlyContinue

# Clone
git clone https://github.com/doner21/pi-config.git "$env:USERPROFILE\.pi"
Set-Location "$env:USERPROFILE\.pi"
.\agent\setup.ps1
```

---

## Configure API Keys

The `auth.json` file is **not included** (secrets). Create it manually:

**Path:** `~/.pi/agent/auth.json` (Linux/macOS) or `%USERPROFILE%\.pi\agent\auth.json` (Windows)

```json
{
  "providers": {
    "deepseek": {
      "apiKey": "sk-your-deepseek-api-key"
    }
  }
}
```

> Copy your real API keys from your original machine. Never commit this file.

---

## Web Search Setup

This config now includes browser-backed search tools by default via `agent/extensions/browser-picture-search.ts`:

- `browser_web_search` — DuckDuckGo Lite/direct HTTP search, with a Playwright-browser fallback
- `browser_image_search` — Google Images workflow helper
- `browser_reverse_image_search` — reverse-image workflow helper

These tools do **not** require Ollama, Llama, or any local model. If a DeepSeek-backed agent such as `browser-agent` uses them, DeepSeek is the reasoning model interpreting the results; the search itself is still DuckDuckGo/Playwright-backed.

Optional legacy tools:

```bash
pi install npm:@ollama/pi-web-search
```

Install that only if you specifically want the older `web_search` / `web_fetch` tools. Those require Ollama running locally with web search/fetch enabled.

---

## Verify Installation

```bash
pi
```

Pi should load all agents, skills, extensions, and the NenFlow v3 engine.  
Test with:

```
/think medium
/subagents list
/memory list
mem_context
```

If `mem_context` reports Engram is unavailable, the ENGRAM_BIN env var may not be set.
Run `agent/setup.sh` (or `.ps1`) to configure it, or set it manually:

```bash
export ENGRAM_BIN="$HOME/.pi/agent/bin/engram"
```

```powershell
$env:ENGRAM_BIN = "$env:USERPROFILE\.pi\agent\bin\engram.exe"
```

---

## What's Inside

| Directory | Contents |
|-----------|----------|
| `agent/` | Core Pi config — extensions, skills, agents, settings, nenflow runs, models |
| `agent/bin/` | Bundled binaries: engram (memory), rg (ripgrep), fd (file finder) |
| `agent/extensions/` | TypeScript extensions (subagent, graphify, playwright-mcp, thinking, todos, etc.) |
| `agent/skills/` | 40+ skills (nenflow-v3, spec-driven-ecology, supabase, docx, pdf, pptx, xlsx, canvas-design, etc.) |
| `agent/agents/` | Subagent definitions (pev-executor, pev-planner, pev-verifier, researcher, coder, reviewer, etc.) |
| `agent/nenflow-v3/` | NenFlow v3 workflow engine — templates, validator, run history |
| `graphify-brain/` | Global project memory — persistent knowledge graphs across sessions |
| `extensions/` | Root-level extensions (memory wiki generator) |

### Key Slash Commands

| Command | What it does |
|---------|-------------|
| `/graphify [folder]` | Build a knowledge graph of any folder |
| `/memory list` | List saved project knowledge graphs |
| `/memory load <project>` | Load a project graph into context |
| `/subagents list` | List available subagents |
| `/subagents spawn <agent> <task>` | Delegate a task to a subagent |
| `/nenflow_v3 <task>` | Start a structured Plan-Execute-Verify workflow |
| `/think [level]` | Set reasoning depth (off/minimal/low/medium/high/xhigh) |
| `/verbosity [level]` | Set response verbosity |
| `/todos` | Persistent task list |

### Engram Memory Tools (built-in)

| Tool | What it does |
|------|-------------|
| `mem_context` | Show all memories for the current project |
| `mem_search "query"` | Search memories across all projects |
| `mem_save` | Save a decision, bugfix, discovery, or pattern |
| `mem_session_summary` | Save session goals, findings, next steps |
| `mem_get_observation <id>` | Read a specific memory in full |
| `mem_timeline <id>` | Show context around a memory |
| `mem_stats` | Memory storage statistics |
| `mem_doctor` | Diagnose Engram connection issues |
| `mem_current_project` | Show which project Engram detected |

---

## Automated Setup Scripts

Setup scripts are included in `agent/`:

```bash
# Linux / macOS / Git Bash
bash ~/.pi/agent/setup.sh
```

```powershell
# Windows PowerShell
powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\.pi\agent\setup.ps1"
```

These will:
1. Install extension npm dependencies (`gentle-engram`, `pi-mcp-adapter`, etc.)
2. Configure the `ENGRAM_BIN` environment variable (persists to user profile on Windows)
3. Append `ENGRAM_BIN` to `~/.bashrc` / `~/.zshrc` on Linux/macOS
4. Leave browser-backed web search ready via the bundled extension

They do not install the legacy Ollama web-search package by default. Install `npm:@ollama/pi-web-search` manually only if you need the older `web_search` / `web_fetch` tools.

---

## Global Graphify Brain

This config includes a **global memory system** that persists project knowledge across Pi sessions.
Knowledge graphs are stored in `graphify-brain/` and are automatically injected as context on every turn.

See `agent/README.md` for the full feature documentation, including the subagent system,
browser automation, NenFlow v3 workflow engine, and all 40+ skills.

---

## File Layout on Disk

After cloning, your `~/.pi` should look like:

```
~/.pi/
├── README.md              ← You are here
├── .gitignore
├── agent/                 ← Core Pi configuration
│   ├── AGENTS.md
│   ├── README.md          ← Full feature documentation
│   ├── settings.json
│   ├── models.json
│   ├── bin/               ← Bundled binaries (engram, rg, fd)
│   ├── extensions/        ← TypeScript extensions
│   ├── skills/            ← 40+ skills
│   ├── agents/            ← Subagent definitions
│   ├── nenflow-v3/        ← Workflow engine
│   ├── setup.sh           ← Bootstrap script
│   └── setup.ps1          ← Bootstrap script (PowerShell)
├── extensions/            ← Root-level extensions
└── graphify-brain/        ← Global project memory
    ├── brain-meta.json
    ├── index.md
    └── <project>/         ← Per-project knowledge graphs
```

---

## Requirements

- **Node.js** 18+
- **Pi** coding agent: `npm install -g @earendil-works/pi-coding-agent`
- **Git**
- (Optional) **ripgrep** (`rg`), **fd** for bundled search
- (Optional) **Ollama** for local models or the legacy `web_search` / `web_fetch` package
