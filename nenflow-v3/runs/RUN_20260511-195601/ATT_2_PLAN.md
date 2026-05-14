---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260511-195601
context_saturation_estimate: "~22%"
---

## Task Statement

Rebuild Pi's local Gemma configuration so Pi uses the correct official local Gemma 4 26B A4B/MoE-style Ollama model instead of the slow forced-200K alias or wrong dense 31B Pi entry. Treat "delete and start again" safely: inventory/back up first, preserve `gemma4:26b` and all non-Gemma/llama assets, then hide/remove only proven-bad Gemma aliases.

## Invariants

- Never delete non-Gemma models, llama models, LM Studio assets, or Ollama blobs directly.
- Use `ollama rm <tag>` only for specifically approved Gemma tags after inventory.
- Preserve official `gemma4:26b` unless evidence shows it is not Gemma 4 26B Q4_K_M.
- Do not remove `gemma4:31b`/`gemma4:31b-it-q4_K_M` from Ollama by default; hide dense 31B from Pi config because it is not the requested experts/MoE model.
- Back up `C:/Users/doner/.pi/agent/models.json` before editing.
- Keep existing Ollama provider settings and non-Gemma Pi model entries unchanged.
- Do not force/default 128K or 200K context.
- Recommended KV cache is conservative `q8_0` with flash attention; do not jump to `q4_0` without evidence and user acceptance.
- If live evidence differs from research, stop before destructive action.

## Success Criteria

1. Inventory and backups are saved under this run directory.
2. Pi config has one Gemma entry for `gemma4:26b` with `contextWindow: 32768` and `maxTokens: 8192`.
3. Pi config no longer includes `gemma4:26b-200k` or `gemma4:31b-it-q4_K_M`.
4. Optional Ollama cleanup removes only `gemma4:26b-200k` and `gemma4-200k:latest` via `ollama rm`; no non-Gemma tags and no blobs are touched.
5. `ollama show gemma4:26b` verifies `gemma4`, about `25.8B`, `Q4_K_M`.
6. Native Ollama and OpenAI-compatible smoke tests for `gemma4:26b` succeed.
7. Executor report includes commands, files changed, tags removed/preserved, validation, and rollback status.

## Implementation Steps

### 1. Inventory and backup

```bash
RUN_DIR="C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260511-195601"
BACKUP_DIR="$RUN_DIR/backups_$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

ollama --version > "$BACKUP_DIR/ollama_version.txt" 2>&1 || true
ollama list > "$BACKUP_DIR/ollama_list.before.txt"
ollama ps > "$BACKUP_DIR/ollama_ps.before.txt" 2>&1 || true
curl -s http://localhost:11434/api/tags > "$BACKUP_DIR/ollama_api_tags.before.json" || true
cp "C:/Users/doner/.pi/agent/models.json" "$BACKUP_DIR/models.json.before"
cp "C:/Users/doner/.pi/agent/settings.json" "$BACKUP_DIR/settings.json.before" 2>/dev/null || true
printenv | grep '^OLLAMA_' > "$BACKUP_DIR/ollama_env_process.before.txt" 2>/dev/null || true
powershell.exe -NoProfile -Command "'OLLAMA_FLASH_ATTENTION=' + [Environment]::GetEnvironmentVariable('OLLAMA_FLASH_ATTENTION','User'); 'OLLAMA_KV_CACHE_TYPE=' + [Environment]::GetEnvironmentVariable('OLLAMA_KV_CACHE_TYPE','User'); 'OLLAMA_NUM_PARALLEL=' + [Environment]::GetEnvironmentVariable('OLLAMA_NUM_PARALLEL','User'); 'OLLAMA_CONTEXT_LENGTH=' + [Environment]::GetEnvironmentVariable('OLLAMA_CONTEXT_LENGTH','User')" > "$BACKUP_DIR/ollama_env_user.before.txt" 2>&1 || true

for model in 'gemma4:26b' 'gemma4:26b-200k' 'gemma4-200k:latest' 'gemma4:31b' 'gemma4:31b-it-q4_K_M'; do
  safe=$(printf '%s' "$model" | tr ':/' '__')
  ollama show "$model" > "$BACKUP_DIR/show.$safe.txt" 2>&1 || true
  ollama show --modelfile "$model" > "$BACKUP_DIR/modelfile.$safe.txt" 2>&1 || true
done
```

### 2. Decision gate before deletion

Proceed with tag deletion only if:
- `ollama list` contains `gemma4:26b`.
- `ollama show gemma4:26b` says architecture `gemma4`, parameters about `25.8B`, quantization `Q4_K_M`.
- `ollama show --modelfile gemma4:26b` does not contain `PARAMETER num_ctx 204800`.
- Removable aliases are exactly `gemma4:26b-200k` and/or `gemma4-200k:latest`, and their saved Modelfiles contain `PARAMETER num_ctx 204800`.

If `gemma4:26b` is missing, do not delete anything. First try:

```bash
ollama pull gemma4:26b
ollama show gemma4:26b
```

If pull/show fails or evidence differs, stop and report.

### 3. Update `C:/Users/doner/.pi/agent/models.json`

Edit only the Ollama provider's `models` array:
- Delete/hide entries with ids `gemma4:26b-200k` and `gemma4:31b-it-q4_K_M`.
- Insert this replacement entry:

```json
{
  "contextWindow": 32768,
  "cost": { "cacheRead": 0, "cacheWrite": 0, "input": 0, "output": 0 },
  "id": "gemma4:26b",
  "input": ["text", "image"],
  "maxTokens": 8192,
  "name": "Local Gemma 4 26B A4B Q4_K_M (Ollama, 32k)",
  "reasoning": true
}
```

Preserve current non-Gemma entries exactly: `minimax-m2.5:cloud` and `glm-5.1:cloud`. Preserve provider fields: `api`, `apiKey`, `baseUrl`, `compat`, and `type`.

Validate immediately:

```bash
python -m json.tool "C:/Users/doner/.pi/agent/models.json" > "$BACKUP_DIR/models.json.validated.pretty"
```

If validation fails:

```bash
cp "$BACKUP_DIR/models.json.before" "C:/Users/doner/.pi/agent/models.json"
```

### 4. KV cache and runtime settings

Recommended local Gemma runtime:
- Model/tag: `gemma4:26b`
- Weight quant: `Q4_K_M`
- Pi `contextWindow`: `32768`
- Pi `maxTokens`: `8192`
- `OLLAMA_FLASH_ATTENTION=1`
- `OLLAMA_KV_CACHE_TYPE=q8_0`
- `OLLAMA_NUM_PARALLEL=1`
- Clear any user-level `OLLAMA_CONTEXT_LENGTH` if it is `131072`, `200000`, `204800`, or similarly huge.

Commands:

```bash
powershell.exe -NoProfile -Command "[Environment]::SetEnvironmentVariable('OLLAMA_FLASH_ATTENTION','1','User'); [Environment]::SetEnvironmentVariable('OLLAMA_KV_CACHE_TYPE','q8_0','User'); [Environment]::SetEnvironmentVariable('OLLAMA_NUM_PARALLEL','1','User')"
powershell.exe -NoProfile -Command "[Environment]::GetEnvironmentVariable('OLLAMA_CONTEXT_LENGTH','User')"
powershell.exe -NoProfile -Command "[Environment]::SetEnvironmentVariable('OLLAMA_CONTEXT_LENGTH',$null,'User')"  # only if huge
```

Restart Ollama after env changes. Prefer tray/UI restart. If using PowerShell and no generation is active:

```bash
powershell.exe -NoProfile -Command "Get-Process ollama -ErrorAction SilentlyContinue | Stop-Process"
powershell.exe -NoProfile -Command "Start-Process '$env:LOCALAPPDATA\Programs\Ollama\ollama app'"
```

### 5. Optional safe alias cleanup

Allowed deletion scope by default:

```bash
ollama rm gemma4:26b-200k
ollama rm gemma4-200k:latest
```

Exclusions: do not run deletion for `gemma4:26b`, `gemma4:31b`, `gemma4:31b-it-q4_K_M`, any non-Gemma/llama tag, or any filesystem blob path. If either alias is absent, record and continue.

### 6. Validation

```bash
ollama list > "$BACKUP_DIR/ollama_list.after.txt"
ollama show gemma4:26b > "$BACKUP_DIR/show.gemma4_26b.after.txt"
python -m json.tool "C:/Users/doner/.pi/agent/models.json" > "$BACKUP_DIR/models.json.after.pretty"
```

Confirm all non-Gemma rows from `ollama_list.before.txt` still appear in `ollama_list.after.txt`.

Native Ollama smoke test:

```bash
curl -s http://localhost:11434/api/generate -H "Content-Type: application/json" -d '{"model":"gemma4:26b","prompt":"Reply exactly with GEMMA_OK.","stream":false,"options":{"num_ctx":32768,"num_predict":16}}' > "$BACKUP_DIR/gemma4_26b.generate.smoke.json"
```

OpenAI-compatible endpoint smoke test:

```bash
curl -s http://localhost:11434/v1/chat/completions -H "Content-Type: application/json" -d '{"model":"gemma4:26b","messages":[{"role":"user","content":"Reply exactly with GEMMA_OPENAI_OK."}],"max_tokens":16}' > "$BACKUP_DIR/gemma4_26b.openai.smoke.json"
```

If 32K fails due memory/speed, retry with 16K. If 16K succeeds, set Pi Gemma entry to `contextWindow: 16384`, `maxTokens: 4096` and report the downgrade.

### 7. Optional 32K alias fallback

Only if Pi/Ollama cannot reliably use 32K with plain `gemma4:26b` and the user accepts a new safe alias:

```bash
cat > "$BACKUP_DIR/Gemma4_26B_32k.Modelfile" <<'EOF'
FROM gemma4:26b
PARAMETER num_ctx 32768
PARAMETER temperature 1
PARAMETER top_k 64
PARAMETER top_p 0.95
EOF
ollama create gemma4:26b-pi-32k --file "$BACKUP_DIR/Gemma4_26B_32k.Modelfile"
```

Then update Pi entry `id` to `gemma4:26b-pi-32k`. Do not create another 128K/200K alias.

## Rollback Plan

1. Restore Pi config:

```bash
cp "$BACKUP_DIR/models.json.before" "C:/Users/doner/.pi/agent/models.json"
python -m json.tool "C:/Users/doner/.pi/agent/models.json" >/dev/null
```

2. Restore Ollama env values from `$BACKUP_DIR/ollama_env_user.before.txt`; clear with `$null` if previous value was blank. Restart Ollama afterward.

3. If 200K aliases were removed and must be restored:

```bash
cat > "$BACKUP_DIR/Restore_Gemma4_26B_200k.Modelfile" <<'EOF'
FROM gemma4:26b
PARAMETER num_ctx 204800
PARAMETER temperature 1
PARAMETER top_k 64
PARAMETER top_p 0.95
EOF
ollama create gemma4:26b-200k --file "$BACKUP_DIR/Restore_Gemma4_26B_200k.Modelfile"
ollama create gemma4-200k:latest --file "$BACKUP_DIR/Restore_Gemma4_26B_200k.Modelfile"
```

4. If fallback alias was created and should be removed:

```bash
ollama rm gemma4:26b-pi-32k
```

5. Re-run inventory and smoke tests, then report rollback status.

## Decision Points / Stop Conditions

- Stop before deletion if official `gemma4:26b` is missing or not Q4_K_M Gemma 4 26B.
- Stop before deletion if 200K aliases do not prove `num_ctx 204800`.
- Stop before overwriting if `models.json` has unexpected provider/model structure; make only a minimal patch.
- Stop before any deletion targeting non-Gemma, `gemma4:26b`, dense 31B tags, or blobs.
- Roll back immediately if `models.json` fails JSON validation.
- If `q8_0` KV cache with flash attention causes startup/generation errors, revert to `f16` and lower context before considering `q4_0`.

## Handoff Notes

- Research found no official Gemma 4 27B; `gemma4:26b` is the correct Gemma 4 A4B/MoE-style target. Gemma 3 has 27B, but that is not the requested Gemma 4 expert model.
- `gemma4:31b` is dense and heavier; hide from Pi, preserve in Ollama unless the user separately asks for storage cleanup.
- Current Pi config contains two undesirable Gemma entries: `gemma4:26b-200k` (`contextWindow:204800`) and `gemma4:31b-it-q4_K_M` (`contextWindow:131072`).
- Current observed Ollama tags include `gemma4:26b`, `gemma4:26b-200k`, `gemma4-200k:latest`, `gemma4:31b`, and `gemma4:31b-it-q4_K_M`.
- `settings.json` currently defaults to `deepseek-v4-pro`; do not change defaults.
- "TurboQuant" is not a supported Ollama flag here; closest production-safe setting is KV cache quantization `q8_0` plus right-sized context.
