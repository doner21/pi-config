# Pi Agent Configuration

This repo contains a complete Pi coding-agent configuration — agents, skills, extensions, subagents, prompts, and NenFlow v3 setup — ready to deploy on a new machine.

## Prerequisites

- **Node.js** 18+ installed
- **Pi** coding agent installed globally:
  ```bash
  npm install -g @mariozechner/pi-coding-agent
  ```
- **Git** installed
- (Optional) **ripgrep** (`rg`) and **fd** if you want the bundled search tools

## Installation on a New Machine

### 1. Clone into the Pi agent directory

Pi stores its configuration in `~/.pi/agent/` (or `%USERPROFILE%\.pi\agent\` on Windows).

```bash
# Back up any existing config first (optional)
mv ~/.pi/agent ~/.pi/agent.backup.$(date +%Y%m%d) 2>/dev/null

# Create the directory and clone
mkdir -p ~/.pi/agent
git clone https://github.com/doner21/pi-config.git ~/.pi/agent
```

On **Windows PowerShell**:
```powershell
# Backup
Rename-Item "$env:USERPROFILE\.pi\agent" ".pi\agent.backup.$(Get-Date -Format yyyyMMdd)" -ErrorAction SilentlyContinue

# Clone
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.pi\agent"
git clone https://github.com/doner21/pi-config.git "$env:USERPROFILE\.pi\agent"
```

### 2. Install extension dependencies

The extensions use TypeScript and have npm dependencies that are gitignored. Restore them:

```bash
cd ~/.pi/agent/extensions
npm install
```

### 3. Configure your API keys

The `auth.json` file is **not** in this repo (it contains secrets). Create it manually:

```bash
# Create auth.json with your API keys
cat > ~/.pi/agent/auth.json << 'EOF'
{
  "providers": {
    "deepseek": {
      "apiKey": "sk-your-deepseek-api-key"
    }
  }
}
EOF
```

> **Note:** Copy your real API keys from your original machine's `~/.pi/agent/auth.json`. Never commit this file.

### 4. Verify the installation

```bash
# Start Pi
pi

# Pi should load all agents, skills, extensions, and NenFlow v3
# Check that your models appear and skills are listed
```

### 5. (Optional) Install binary tools

Pi uses `rg` (ripgrep) and `fd` for search. These live in `~/.pi/agent/bin/`:

```bash
# ripgrep
# Download from: https://github.com/BurntSushi/ripgrep/releases
# Extract rg.exe to ~/.pi/agent/bin/

# fd
# Download from: https://github.com/sharkdp/fd/releases  
# Extract fd.exe to ~/.pi/agent/bin/
```

Or install via package manager:
```bash
# macOS
brew install ripgrep fd

# Linux
sudo apt install ripgrep fd-find
```

## What's Included

### Agents
| Agent | Purpose |
|-------|---------|
| `pev-executor` | NenFlow v3 execution agent |
| `pev-planner` | NenFlow v3 planning agent |
| `pev-researcher` | NenFlow v3 research/discovery agent |
| `pev-verifier` | NenFlow v3 verification agent |
| `coder` | General coding tasks |
| `browser-agent` | Browser automation tasks |
| `api-test-reader` | API testing |
| `planner`, `researcher`, `reviewer` | General-purpose agents |

### Skills
| Skill | Description |
|-------|-------------|
| `nenflow-v3` | NenFlow v3 orchestration loop |
| `nenflow-pev-executor` | PEV Executor role |
| `nenflow-pev-planner` | PEV Planner role |
| `nenflow-pev-researcher` | PEV Researcher role |
| `nenflow-pev-verifier` | PEV Verifier role |
| `internet-research` | Web search via DuckDuckGo |

### Extensions
| Extension | Purpose |
|-----------|---------|
| `nenflow-v3` | NenFlow v3 workflow engine |
| `playwright-mcp` | Browser automation via Playwright |
| `git-checkpoint` | Auto git checkpoints |
| `subagent` | Subagent delegation |
| `thinking` | Extended thinking mode |
| `todos` | Task tracking |
| `verbosity` | Verbosity control |
| `mcp-status` | MCP connection monitoring |
| `confirm-destructive` | Destructive action confirmation |
| `agents` | Agent management |

### NenFlow v3
Complete NenFlow v3 configuration including:
- `templates/CONTINUATION.md` — Continuation template
- `validator.js` — Run validation logic
- `runs/` — Historical run records (intake, plans, executions, verifications)

### Configuration Files
| File | Purpose |
|------|---------|
| `settings.json` | Pi settings (model, provider, packages) |
| `models.json` | Model definitions |
| `mcp-registry.json` | MCP server registry |
| `AGENTS.md` | Global agent policy |

## Keeping Config in Sync

After making changes on any machine, commit and push:

```bash
cd ~/.pi/agent
git add -A
git commit -m "Update Pi config: <description>"
git push
```

On other machines, pull to sync:

```bash
cd ~/.pi/agent
git pull
```

## Security Notes

- **Never commit `auth.json`** — it contains API keys and is gitignored
- **Session history** is also gitignored (stored in `sessions/`)
- The repo is **private** — keep it that way if it contains personal config
- Rotate API keys periodically and update `auth.json` on all machines
