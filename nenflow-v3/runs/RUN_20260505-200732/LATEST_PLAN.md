---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260505-200732
context_saturation_estimate: "~4%"
---

## Task Statement
Safely replace the currently empty/nonworking workspace at `C:/Users/doner/memory reaserch` with the contents of `https://github.com/doner21/memory_research`. Because research found the current directory is empty, not a git repo, and has no Graphify artifacts, the preferred execution is to clone the remote repository into the current workspace after one final preflight check; if any files appear, quarantine them instead of deleting them.

## Invariants
- Preserve recoverability: do not irreversibly delete any local file, hidden file, `.git` directory, Graphify artifact, or config that appears before execution.
- Do not run `graphify update .` automatically; the human decides when to invoke Graphify updates.
- Keep the final populated workspace aligned with `https://github.com/doner21/memory_research`.
- Quote the workspace path in all commands because it contains a space and is misspelled: `C:/Users/doner/memory reaserch`.
- Do not replace or remove files outside the current workspace except for creating a timestamped sibling quarantine directory when needed.
- If clone/preflight fails, stop and report evidence rather than attempting destructive cleanup.

## Success Criteria
1. Final preflight confirms the workspace state immediately before clone, including whether files unexpectedly appeared.
2. If preflight finds existing workspace contents, those contents are moved to a timestamped sibling quarantine path such as `C:/Users/doner/memory reaserch.quarantine.RUN_20260505-200732.<timestamp>` and are not deleted.
3. `C:/Users/doner/memory reaserch` becomes a git worktree cloned from `https://github.com/doner21/memory_research`.
4. `git remote get-url origin` in the workspace returns `https://github.com/doner21/memory_research`.
5. The checked-out branch is the repository default branch observed just before execution, expected to be `main` based on research.
6. Local `HEAD` matches the freshly observed remote default branch commit after clone.
7. Verification provides direct filesystem/git evidence: top-level file listing, git branch/status, origin URL, local HEAD, and remote HEAD.
8. No `graphify update .` command is run during execution.

## Implementation Steps
1. Establish constants and enter the workspace:
   ```bash
   set -euo pipefail
   RUN_ID="RUN_20260505-200732"
   WORKSPACE="/c/Users/doner/memory reaserch"
   REPO_URL="https://github.com/doner21/memory_research"
   cd "$WORKSPACE"
   pwd
   ```

2. Run final just-before-execution preflight and capture direct evidence:
   ```bash
   echo "== workspace children before clone =="
   find "$WORKSPACE" -mindepth 1 -maxdepth 1 -print | sort || true

   echo "== git state before clone =="
   git -C "$WORKSPACE" rev-parse --show-toplevel || true
   git -C "$WORKSPACE" status --porcelain=v2 --branch || true

   echo "== remote default branch before clone =="
   git ls-remote --symref "$REPO_URL" HEAD
   DEFAULT_REF="$(git ls-remote --symref "$REPO_URL" HEAD | awk '/^ref:/ {print $2}')"
   DEFAULT_BRANCH="${DEFAULT_REF#refs/heads/}"
   test -n "$DEFAULT_BRANCH"
   echo "DEFAULT_BRANCH=$DEFAULT_BRANCH"
   ```

3. If the workspace is no longer empty, quarantine all current contents instead of deleting them:
   ```bash
   CHILD_COUNT="$(find "$WORKSPACE" -mindepth 1 -maxdepth 1 -print | wc -l | tr -d ' ')"
   if [ "$CHILD_COUNT" != "0" ]; then
     TS="$(date +%Y%m%d-%H%M%S)"
     QUARANTINE="/c/Users/doner/memory reaserch.quarantine.${RUN_ID}.${TS}"
     mkdir -p "$QUARANTINE"
     find "$WORKSPACE" -mindepth 1 -maxdepth 1 -exec mv -t "$QUARANTINE" {} +
     echo "Quarantined $CHILD_COUNT item(s) to: $QUARANTINE"
   else
     echo "Workspace empty; no quarantine needed."
   fi
   ```

4. Clone the requested repository into the current workspace path:
   ```bash
   git clone "$REPO_URL" "$WORKSPACE"
   cd "$WORKSPACE"
   ```

5. Verify the clone against the freshly observed remote default branch:
   ```bash
   git rev-parse --is-inside-work-tree
   git remote get-url origin
   git branch --show-current
   git status --porcelain=v2 --branch

   LOCAL_HEAD="$(git rev-parse HEAD)"
   REMOTE_HEAD="$(git ls-remote "$REPO_URL" "refs/heads/$DEFAULT_BRANCH" | awk '{print $1}')"
   echo "LOCAL_HEAD=$LOCAL_HEAD"
   echo "REMOTE_HEAD=$REMOTE_HEAD"
   test "$LOCAL_HEAD" = "$REMOTE_HEAD"
   test "$(git remote get-url origin)" = "$REPO_URL"
   ```

6. Provide filesystem evidence of the final workspace without invoking Graphify:
   ```bash
   echo "== final top-level files =="
   find "$WORKSPACE" -mindepth 1 -maxdepth 2 -print | sort | head -200

   echo "== graphify-related paths present after clone, if any =="
   find "$WORKSPACE" -maxdepth 5 \( -iname 'graphify-out' -o -iname '*graphify*' -o -iname 'GRAPH_REPORT.md' -o -iname '.graphify*' \) -print | sort || true
   ```

7. If any command fails, stop execution and report the failed command, stdout/stderr evidence, whether a quarantine path was created, and the current workspace state. Do not attempt automatic deletion or `graphify update .` recovery.

## Verification Commands
Run these after implementation from any directory:
```bash
WORKSPACE="/c/Users/doner/memory reaserch"
REPO_URL="https://github.com/doner21/memory_research"
cd "$WORKSPACE"

git rev-parse --is-inside-work-tree
git remote get-url origin
git branch --show-current
git status --porcelain=v2 --branch

DEFAULT_REF="$(git ls-remote --symref "$REPO_URL" HEAD | awk '/^ref:/ {print $2}')"
DEFAULT_BRANCH="${DEFAULT_REF#refs/heads/}"
LOCAL_HEAD="$(git rev-parse HEAD)"
REMOTE_HEAD="$(git ls-remote "$REPO_URL" "refs/heads/$DEFAULT_BRANCH" | awk '{print $1}')"
echo "DEFAULT_BRANCH=$DEFAULT_BRANCH"
echo "LOCAL_HEAD=$LOCAL_HEAD"
echo "REMOTE_HEAD=$REMOTE_HEAD"
test "$LOCAL_HEAD" = "$REMOTE_HEAD"
test "$(git remote get-url origin)" = "$REPO_URL"
find "$WORKSPACE" -mindepth 1 -maxdepth 2 -print | sort | head -200
```

## Handoff Notes
- Intake path: `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260505-200732/ATT_0_INTAKE.md`.
- Research path: `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260505-200732/ATT_1_RESEARCH.md`.
- Research evidence: `C:/Users/doner/memory reaserch` existed, was empty, was not a git repository, and contained no Graphify artifacts/config.
- Remote evidence from research: `https://github.com/doner21/memory_research` was reachable; default branch was `main`; observed commit was `d97a09a979af82c408674a41b98820bfbe5cc8c6` at research time.
- Current project memory registry was checked; the current workspace is not a linked Capati project, so no project-specific memory context was available.
- The final path intentionally remains the current visible workspace `C:/Users/doner/memory reaserch` rather than creating canonical sibling `C:/Users/doner/memory_research`, because the objective says to update the current workspace and research recommends cloning into it.
- If files appear before execution, quarantine them wholesale. Do not selectively delete only Graphify paths, because preserving recoverability is a hard invariant.
- Do not run `graphify update .` during execution or verification.
