---
artifact_type: VERIFIER_BRIEF
role: EXECUTOR
run_id: RUN_20260511-195601
context_saturation_estimate: "~14%"
---

# Verifier Brief

Backup/inventory directory: `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260511-195601/backups_20260511-201649`

## Success Criteria Checks

### 1. Inventory and backups are saved under this run directory.

Evidence:

- Backup directory exists: `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260511-195601/backups_20260511-201649`
- Contains `models.json.before`, `settings.json.before`, `ollama_list.before.txt`, `ollama_api_tags.before.json`, `show.*`, and `modelfile.*` files.

Verifier command:

```bash
ls -la "C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260511-195601/backups_20260511-201649"
```

### 2. Pi config has one Gemma entry for `gemma4:26b` with `contextWindow: 32768` and `maxTokens: 8192`.

Evidence from validation:

```text
all ids: ['gemma4:26b', 'minimax-m2.5:cloud', 'glm-5.1:cloud']
```

Verifier command:

```bash
python - <<'PY'
import json
p='C:/Users/doner/.pi/agent/models.json'
data=json.load(open(p))
models=data['providers']['ollama']['models']
gemmas=[m for m in models if 'gemma' in m.get('id','').lower()]
print(gemmas)
assert len(gemmas)==1
assert gemmas[0]['id']=='gemma4:26b'
assert gemmas[0]['contextWindow']==32768
assert gemmas[0]['maxTokens']==8192
PY
```

### 3. Pi config no longer includes `gemma4:26b-200k` or `gemma4:31b-it-q4_K_M`.

Evidence: final `models.json` IDs are `['gemma4:26b', 'minimax-m2.5:cloud', 'glm-5.1:cloud']`.

Verifier command:

```bash
python - <<'PY'
import json
ids=[m.get('id') for m in json.load(open('C:/Users/doner/.pi/agent/models.json'))['providers']['ollama']['models']]
print(ids)
assert 'gemma4:26b-200k' not in ids
assert 'gemma4:31b-it-q4_K_M' not in ids
PY
```

### 4. Optional Ollama cleanup removes only `gemma4:26b-200k` and `gemma4-200k:latest`; no non-Gemma tags/blobs touched.

Evidence:

```text
removed aliases absent= True
preserved gemma4:26b= True
preserved dense tags= True True
```

Final `ollama list` preserved only:

```text
gemma4:31b
gemma4:31b-it-q4_K_M
gemma4:26b
```

Verifier command:

```bash
ollama list
```

Expected: `gemma4:26b-200k` and `gemma4-200k:latest` are absent; `gemma4:26b`, `gemma4:31b`, and `gemma4:31b-it-q4_K_M` remain.

### 5. `ollama show gemma4:26b` verifies `gemma4`, about `25.8B`, `Q4_K_M`.

Evidence:

```text
architecture        gemma4
parameters          25.8B
context length      262144
quantization        Q4_K_M
```

Verifier command:

```bash
ollama show gemma4:26b | grep -Ei 'architecture|parameters|quantization|context length'
ollama show --modelfile gemma4:26b | grep 'PARAMETER num_ctx' || echo 'no forced num_ctx found'
```

Expected: architecture `gemma4`, parameters `25.8B`, quantization `Q4_K_M`, and no forced `PARAMETER num_ctx 204800` in the base tag Modelfile.

### 6. Native Ollama and OpenAI-compatible smoke tests for `gemma4:26b` succeed.

Evidence:

Native Ollama with thinking disabled for exact short response:

```text
exit_code=0
response_repr= 'GEMMA_OK'
done_reason= stop
```

OpenAI-compatible endpoint with enough tokens for reasoning plus answer:

```text
exit_code=0
content_repr= 'GEMMA_OPENAI_OK'
finish_reason= stop
usage= {'prompt_tokens': 27, 'completion_tokens': 118, 'total_tokens': 145}
```

Verifier commands:

```bash
curl -sS --max-time 180 http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"gemma4:26b","prompt":"Reply exactly with GEMMA_OK.","stream":false,"think":false,"options":{"num_ctx":32768,"num_predict":32}}'

curl -sS --max-time 180 http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"gemma4:26b","messages":[{"role":"user","content":"Reply exactly with GEMMA_OPENAI_OK."}],"max_tokens":512}'
```

Expected: native response contains `"response":"GEMMA_OK"`; OpenAI-compatible response contains assistant `content` of `GEMMA_OPENAI_OK`.

### 7. Executor report includes commands, files changed, tags removed/preserved, validation, and rollback status.

Evidence: `ATT_3_EXECUTION.md` exists and includes those sections.

Verifier command:

```bash
grep -E "Files Changed|Tags Removed|Rollback Status|Validation" "C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260511-195601/ATT_3_EXECUTION.md"
```

## Additional Expected-Result Checks

### User-level Ollama env vars

Evidence:

```text
OLLAMA_FLASH_ATTENTION=1
OLLAMA_KV_CACHE_TYPE=q8_0
OLLAMA_NUM_PARALLEL=1
OLLAMA_CONTEXT_LENGTH=
```

Verifier command:

```bash
powershell.exe -NoProfile -Command "'OLLAMA_FLASH_ATTENTION=' + [Environment]::GetEnvironmentVariable('OLLAMA_FLASH_ATTENTION','User'); 'OLLAMA_KV_CACHE_TYPE=' + [Environment]::GetEnvironmentVariable('OLLAMA_KV_CACHE_TYPE','User'); 'OLLAMA_NUM_PARALLEL=' + [Environment]::GetEnvironmentVariable('OLLAMA_NUM_PARALLEL','User'); 'OLLAMA_CONTEXT_LENGTH=' + [Environment]::GetEnvironmentVariable('OLLAMA_CONTEXT_LENGTH','User')"
```

### Non-Gemma Pi entries and provider settings preserved

Evidence:

```text
minimax-m2.5:cloud preserved_exact= True
glm-5.1:cloud preserved_exact= True
api preserved_exact= True
apiKey preserved_exact= True
baseUrl preserved_exact= True
compat preserved_exact= True
type preserved_exact= True
```

Verifier command:

```bash
python - <<'PY'
import json, pathlib
bd=pathlib.Path('C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260511-195601/backups_20260511-201649')
before=json.load(open(bd/'models.json.before'))
after=json.load(open('C:/Users/doner/.pi/agent/models.json'))
for id_ in ['minimax-m2.5:cloud','glm-5.1:cloud']:
    b=next(m for m in before['providers']['ollama']['models'] if m.get('id')==id_)
    a=next(m for m in after['providers']['ollama']['models'] if m.get('id')==id_)
    print(id_, b==a)
for k in ['api','apiKey','baseUrl','compat','type']:
    print(k, before['providers']['ollama'][k]==after['providers']['ollama'][k])
PY
```
