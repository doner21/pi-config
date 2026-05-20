---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260505-205658
context_saturation_estimate: "~7%"
---

## Task Statement
Disable the active Capati Pi package hook, update the local `memory_research` checkout to the latest GitHub `origin/main` with a recoverable backup ref, install the upstream `safishamsi/graphify` Pi skill, and copy only the README-directed memory_research extension source into `.pi/agent/extensions`. No further user clarification is required after the supplied clarification.

## Invariants
- Back up `C:/Users/doner/.pi/agent/settings.json` before editing it.
- Remove only the exact Capati package entry `..\..\capati-memory-system\pi-package` from `settings.json`; preserve all other settings and package entries such as `npm:@ollama/pi-web-search`.
- Do not delete, quarantine, rename, or otherwise modify `C:/Users/doner/capati-memory-system`.
- Do not delete `.pi/agent` broadly and do not run broad recursive deletes under `.pi`.
- Before resetting `C:/Users/doner/memory reaserch`, create a backup Git ref pointing at the pre-reset HEAD.
- Update the local `C:/Users/doner/memory reaserch` tracked files to `origin/main` via hard reset; do not rely on the diverged local commit as the install source.
- Use upstream `https://github.com/safishamsi/graphify` / package `graphifyy` for the Pi Graphify skill via `graphify install --platform pi`.
- Do not install/copy `C:/Users/doner/memory reaserch/skills/graphify/SKILL.md`; the memory_research bundled skill must not override the safishamsi Graphify skill.
- Copy memory_research extension/test/package source only if the README still instructs those destination paths after the reset.
- Run dependency install only inside `C:/Users/doner/.pi/agent/extensions`, and only if `package.json` or `package-lock.json` is copied/changed.
- Do not run `graphify update .`.

## Success Criteria
1. `settings.json` has a timestamped backup and valid JSON after edit; its `packages` array no longer contains the Capati package entry and still contains all non-Capati entries.
2. `C:/Users/doner/capati-memory-system` still exists unchanged enough to prove it was not deleted/quarantined.
3. `C:/Users/doner/memory reaserch` has a backup ref under `refs/heads/backup/RUN_20260505-205658-pre-reset-*` resolving to the old HEAD, and `HEAD` equals `origin/main` after `git reset --hard origin/main`.
4. The installed `graphify` CLI supports `install --platform pi`, and `C:/Users/doner/.pi/agent/skills/graphify/SKILL.md` plus `.graphify_version` are installed from upstream safishamsi/graphify, not from memory_research.
5. README-directed memory_research extension files are present in `.pi/agent/extensions`/`.pi/agent` and match the refreshed local repo source: `extensions/graphify.ts`, `extensions/git-checkpoint.ts`, `extensions/package.json`, `extensions/package-lock.json`, and `test/graphify-test-bundle.js` if still listed by README.
6. `npm install` in `.pi/agent/extensions` is run only if the extension package files changed; otherwise it is skipped and the skip is recorded.
7. Verification evidence includes commands/output for settings diff, Git backup/reset, Graphify version/source/install, file comparisons, dependency-install decision, and confirmation that no `graphify update .` was run.

## Implementation Steps
1. **Set run variables and create backup area.**
   - Use these paths exactly:
     - `RUN_ID=RUN_20260505-205658`
     - `SETTINGS=C:/Users/doner/.pi/agent/settings.json`
     - `MEMORY_REPO=C:/Users/doner/memory reaserch` (note the local folder spelling/space)
     - `PI_AGENT=C:/Users/doner/.pi/agent`
     - `EXT_DIR=C:/Users/doner/.pi/agent/extensions`
     - `GRAPHIFY_SKILL_DIR=C:/Users/doner/.pi/agent/skills/graphify`
     - `BACKUP_DIR=C:/Users/doner/.pi/agent/backups/RUN_20260505-205658`
   - Create `BACKUP_DIR` if missing. Do not create/delete anything under `C:/Users/doner/capati-memory-system`.

2. **Back up and edit `settings.json` safely.**
   - Copy `C:/Users/doner/.pi/agent/settings.json` to `C:/Users/doner/.pi/agent/backups/RUN_20260505-205658/settings.json.<timestamp>.bak` before any edit.
   - Edit using a JSON parser, not regex. Remove only package entries whose normalized string equals `..\..\capati-memory-system\pi-package`.
   - If the target entry is absent, stop and report that the expected Capati package hook was already absent; do not make unrelated settings changes.
   - Validate with a JSON parse after writing.

3. **Refresh local `memory_research` from GitHub with a backup ref.**
   - In `C:/Users/doner/memory reaserch`, run `git fetch --prune origin`.
   - Record `OLD_HEAD=$(git rev-parse HEAD)` and create a unique backup ref, e.g. `refs/heads/backup/RUN_20260505-205658-pre-reset-<timestamp>`, pointing at `OLD_HEAD` using `git update-ref` or `git branch`.
   - Verify the backup ref resolves to `OLD_HEAD` before resetting.
   - Run `git reset --hard origin/main`.
   - Do not run `git clean` unless a later verifier-only comparison proves untracked files are interfering; the copy steps below use explicit tracked paths, so untracked files should be ignored.
   - Verify `git rev-parse HEAD` equals `git rev-parse origin/main`.

4. **Re-read the refreshed `memory_research` README before copying.**
   - Read `C:/Users/doner/memory reaserch/README.md` after the reset.
   - Proceed with extension copy only if it still maps:
     - `extensions/graphify.ts` -> `C:/Users/doner/.pi/agent/extensions/graphify.ts`
     - `extensions/git-checkpoint.ts` -> `C:/Users/doner/.pi/agent/extensions/git-checkpoint.ts`
     - `extensions/package.json` -> `C:/Users/doner/.pi/agent/extensions/package.json`
     - `extensions/package-lock.json` -> `C:/Users/doner/.pi/agent/extensions/package-lock.json`
     - `test/graphify-test-bundle.js` -> `C:/Users/doner/.pi/agent/graphify-test-bundle.js`
   - Ignore any README instruction to copy `skills/graphify/SKILL.md`; the user clarified that safishamsi/graphify wins for Graphify skill installation.

5. **Back up and copy memory_research extension files only.**
   - For each destination file listed in step 4, if it exists and differs from the refreshed source, copy the old destination to `BACKUP_DIR/extensions/...` before overwriting.
   - Copy only missing/different files. Preserve destination directories.
   - Track whether `extensions/package.json` or `extensions/package-lock.json` changed.
   - Do not copy `skills/graphify/*` from memory_research.

6. **Run extension dependency install only if package files changed.**
   - If either `C:/Users/doner/.pi/agent/extensions/package.json` or `package-lock.json` changed in step 5, run exactly in `C:/Users/doner/.pi/agent/extensions`:
     - `npm install`
   - If neither package file changed, skip `npm install` and record that it was skipped because package files were unchanged.
   - Do not run npm install at `C:/Users/doner/.pi/agent`, under `capati-memory-system`, or in the repo root.

7. **Install/update upstream safishamsi Graphify safely.**
   - Prepare a source clone from the requested repository, e.g. under `BACKUP_DIR/sources/graphify` or the NenFlow run temp directory:
     - `git clone --depth 1 --branch v7 https://github.com/safishamsi/graphify <GRAPHIFY_SRC>` if absent, otherwise fetch and hard reset that source clone to `origin/v7`.
   - Confirm `<GRAPHIFY_SRC>/pyproject.toml` has `name = "graphifyy"` and a current upstream version (research found `0.7.7`).
   - Upgrade/install using safe Python tooling from that safishamsi source clone. Prefer, in order:
     1. `uv tool install --force <GRAPHIFY_SRC>` if `uv` is available.
     2. `python -m pipx install --force <GRAPHIFY_SRC>` if `pipx` is available.
     3. `python -m pip install --user --upgrade <GRAPHIFY_SRC>` only as a fallback.
   - Ensure the newly installed executable directory is first on `PATH` for the current session so the old `graphifyy 0.4.23` CLI is not used.
   - Verify `graphify --help` lists `install [--platform P]` with `pi` before installing the Pi skill. If not, stop; do not copy the memory_research bundled skill as a fallback.
   - Run exactly:
     - `graphify install --platform pi`
   - This should create/update `C:/Users/doner/.pi/agent/skills/graphify/SKILL.md` and `C:/Users/doner/.pi/agent/skills/graphify/.graphify_version` from safishamsi/graphify.

8. **Collect verification evidence.**
   - Settings:
     - Show backup path exists.
     - Parse `settings.json` and print `packages`; confirm Capati entry removed and `npm:@ollama/pi-web-search` preserved.
     - Show a diff between backup and current proving only the package entry changed.
   - Capati folder preservation:
     - Confirm `C:/Users/doner/capati-memory-system` still exists.
   - Git reset:
     - Print old HEAD, backup ref, `git rev-parse <backup-ref>`, current `HEAD`, `origin/main`, and `git status -sb`.
   - Graphify:
     - Print `which graphify`/`where graphify` equivalent and `graphify --help` excerpt containing `pi`.
     - Print installed `.graphify_version`.
     - Compare installed `C:/Users/doner/.pi/agent/skills/graphify/SKILL.md` against `<GRAPHIFY_SRC>/graphify/skill-pi.md` by hash or byte comparison.
   - Extension files:
     - Compare each copied destination to its refreshed `memory_research` source by hash.
     - Report whether package files changed and whether `npm install` ran or was skipped.
   - Negative verification:
     - State explicitly in the execution report that `C:/Users/doner/capati-memory-system` was not deleted/quarantined, `.pi/agent` was not broadly deleted, memory_research bundled Graphify skill was not copied, and `graphify update .` was not run.

## Handoff Notes
- User clarification resolves the research ambiguities; no additional clarification is required unless a required command/tool is unavailable and all safe fallbacks fail.
- Current `settings.json` research/read evidence showed `packages` contained `..\..\capati-memory-system\pi-package` and `npm:@ollama/pi-web-search`; preserve the latter.
- The local repo path is spelled `C:/Users/doner/memory reaserch` in this environment even though the project is conceptually `memory_research`.
- Research found local `memory reaserch` was ahead 1/behind 2; the backup ref is mandatory before reset.
- Research found old installed `graphifyy` around `0.4.23` and lacking Pi platform support; executor must ensure the new safishamsi CLI shadows or replaces the old one before running `graphify install --platform pi`.
- The memory_research README's instruction to copy its bundled Graphify skill is intentionally superseded by the user clarification; install only the extension/test/package files from memory_research and the Graphify skill from safishamsi/graphify.
