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

# Install extension dependencies
cd ~/.pi/agent/extensions && npm install

# Add your API keys (NOT in this repo — see below)
```

### Windows (PowerShell)

```powershell
# Backup
Rename-Item "$env:USERPROFILE\.pi" ".pi.backup.$(Get-Date -Format yyyyMMdd)" -ErrorAction SilentlyContinue

# Clone
git clone https://github.com/doner21/pi-config.git "$env:USERPROFILE\.pi"
Set-Location "$env:USERPROFILE\.pi\agent\extensions"
npm install
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

## Install Web Search (Optional)

```bash
pi install npm:@ollama/pi-web-search
```

Requires Ollama running locally with web search enabled.

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
```

---

## What's Inside

| Directory | Contents |
|-----------|----------|
| `agent/` | Core Pi config — extensions, skills, agents, settings, nenflow runs, models |
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
1. Install extension npm dependencies
2. Prompt for your `auth.json` API keys
3. Install the web search package

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
│   ├── extensions/        ← TypeScript extensions
│   ├── skills/            ← 40+ skills
│   ├── agents/            ← Subagent definitions
│   ├── nenflow-v3/        ← Workflow engine
│   ├── setup.sh
│   └── setup.ps1
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
- (Optional) **Ollama** for local models and web search
