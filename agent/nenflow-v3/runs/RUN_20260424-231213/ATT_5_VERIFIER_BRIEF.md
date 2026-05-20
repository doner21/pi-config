---
artifact_type: VERIFIER_BRIEF
role: EXECUTOR
run_id: RUN_20260424-231213
context_saturation_estimate: "~15%"
---

## Verifier Brief

This retry should be verified against current runtime evidence, not just source inspection. The key additions are:
- `window.__heroDebug.getState()` in `C:/Users/doner/html_cloth/src/main.js:650-663`
- point-cloud `getDebugState()` in `C:/Users/doner/html_cloth/src/main.js:471-492`
- `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260424-231213/playwright-evidence/verification-states.json`

### Success Criterion 1
**Criterion:** `C:/Users/doner/html_cloth/src/main.js` implements a point-cloud redesign grounded in the current scene lifecycle (`rebuildActiveEffect()`, `changeSlide()`, `updateDisplayedPlaneSize()`) rather than a separate app architecture.

**Direct evidence:**
- `setEffectMode()` at `src/main.js:114-123`
- `createPointCloudHero()` at `src/main.js:286-501`
- `updateDisplayedPlaneSize()` at `src/main.js:504-523`
- `changeSlide()` at `src/main.js:611-636`
- point-cloud effect returns `object: group` at `src/main.js:366-379`

**Verifier check:**
```bash
cd C:/Users/doner/html_cloth
nl -ba src/main.js | sed -n '114,123p;286,523p;611,636p'
```

### Success Criterion 2
**Criterion:** Point-cloud mode shows the current slide as a clearly readable image at rest for both `/hero-image.png` and `/hero-image-2.png`.

**Direct evidence:**
- textured underlay uses the active texture at `src/main.js:340-348`
- underlay remains fully visible at rest through `underlayMaterial.opacity = ... lerp(1, 0.04, destroyMix)` at `src/main.js:389-390`
- runtime rest metrics in `verification-states.json`:
  - `rest.effectState.destroyMix = 0`
  - `rest.effectState.meanOffset = 0`
  - `rest.effectState.maxOffset = 0`
  - `rest.effectState.underlayOpacity = 1`
- slide 2 metrics in `verification-states.json` show `slide2.currentSlideIndex = 1`
- screenshots:
  - `verification-rest.png`
  - `verification-slide-2-point-cloud.png`

**Verifier check:**
```bash
cd C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260424-231213/playwright-evidence
python - <<'PY'
import json, pathlib
state = json.loads(pathlib.Path('verification-states.json').read_text())
print(state['rest'])
print(state['slide2'])
PY
```
Then inspect the two screenshots.

### Success Criterion 3
**Criterion:** Hover interaction produces a visibly stronger breakup/destruction effect than the current tight-dispersion behavior, with larger temporary displacement and clearer particle separation.

**Direct evidence:**
- widened radius at `src/main.js:412`
- stronger swirl/turbulence/impulses at `src/main.js:417-422`
- larger displacement cap at `src/main.js:443`
- runtime hover metrics from `verification-states.json`:
  - `hover.effectState.meanOffset = 0.154136`
  - `hover.effectState.maxOffset = 0.214307`
  - `hover.effectState.destroyMix = 0.9999`
  - `hover.effectState.underlayOpacity = 0.0401`
- screenshot hash differs from rest:
  - `verification-rest.png`: `3c744201001aa8a1cfee01b5e9f3cdb1330fe31ab9a3c188c5507b5e93c419da`
  - `verification-hover-destroy.png`: `0e146b5d531a7176787b23d200ac3ba27993e9d6184a0490ddc622cf18d0ec1a`

**Verifier check:**
```bash
cd C:/Users/doner/html_cloth
nl -ba src/main.js | sed -n '408,443p'
cd C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260424-231213/playwright-evidence
python - <<'PY'
import json, pathlib
state = json.loads(pathlib.Path('verification-states.json').read_text())
print(state['rest']['effectState'])
print(state['hover']['effectState'])
PY
sha256sum verification-rest.png verification-hover-destroy.png
```

### Success Criterion 4
**Criterion:** On hover end / pointer leave, the image reintegrates quickly and convincingly, with no long drift or permanently scattered particles.

**Direct evidence:**
- stronger return tuning at `src/main.js:425-434`
- extra non-hover clamp damping at `src/main.js:445-452`
- runtime reintegration metrics from `verification-states.json`:
  - `reintegrated.effectState.meanOffset = 0.002836`
  - `reintegrated.effectState.maxOffset = 0.004197`
  - `reintegrated.effectState.destroyMix = 0`
  - `reintegrated.effectState.underlayOpacity = 1`
- these are materially lower than hover metrics (`0.154136` / `0.214307`)
- screenshot hash differs from hover:
  - `verification-hover-destroy.png`: `0e146b5d531a7176787b23d200ac3ba27993e9d6184a0490ddc622cf18d0ec1a`
  - `verification-reintegrated.png`: `a6f6eebb86851ea7b3b4e690a0732a084e8d9820b95a154c2503cf85c64ce35b`

**Verifier check:**
```bash
cd C:/Users/doner/html_cloth
nl -ba src/main.js | sed -n '425,452p;471,492p;650,663p'
cd C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260424-231213/playwright-evidence
python - <<'PY'
import json, pathlib
state = json.loads(pathlib.Path('verification-states.json').read_text())
print('hover', state['hover']['effectState'])
print('reintegrated', state['reintegrated']['effectState'])
assert state['reintegrated']['effectState']['meanOffset'] < state['hover']['effectState']['meanOffset']
assert state['reintegrated']['effectState']['maxOffset'] < state['hover']['effectState']['maxOffset']
PY
sha256sum verification-hover-destroy.png verification-reintegrated.png
```

### Success Criterion 5
**Criterion:** Ripple mode still behaves as before: hover ripples and click impulses still work after the point-cloud redesign.

**Direct evidence:**
- ripple path preserved in `createRippleHero()`
- mode switching preserved in `setEffectMode()` at `src/main.js:114-123`
- Playwright spec switches to ripple, moves pointer, and dispatches pointerdown in `playwright-verify-pointcloud.spec.js`
- runtime metric in `verification-states.json`: `ripple.effectMode = 'ripple'`
- screenshot: `verification-ripple.png`

**Verifier check:**
```bash
cd C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260424-231213/playwright-evidence
python - <<'PY'
import json, pathlib
state = json.loads(pathlib.Path('verification-states.json').read_text())
print(state['ripple'])
print(pathlib.Path('playwright-verify-pointcloud.spec.js').read_text())
PY
```

### Success Criterion 6
**Criterion:** Slide switching still rebuilds/fades correctly for both modes without broken opacity transitions or stale geometry.

**Direct evidence:**
- `changeSlide()` still fades out, rebuilds, and fades in at `src/main.js:611-636`
- coordinated opacity handling in `setOpacity()` at `src/main.js:466-470`
- runtime metric in `verification-states.json`: `slide2.currentSlideIndex = 1`
- screenshot: `verification-slide-2-point-cloud.png`

**Verifier check:**
```bash
cd C:/Users/doner/html_cloth
nl -ba src/main.js | sed -n '466,470p;611,636p'
cd C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260424-231213/playwright-evidence
python - <<'PY'
import json, pathlib
state = json.loads(pathlib.Path('verification-states.json').read_text())
print(state['slide2'])
PY
```

### Success Criterion 7
**Criterion:** `npm run build` succeeds.

**Direct evidence:**
```text
> html-cloth-standalone-demo@0.1.0 build
> vite build

vite v7.3.2 building client environment for production...
transforming...
✓ 6 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                 5.08 kB │ gzip:   1.81 kB
dist/assets/index-zjvtyy1d.css  5.79 kB │ gzip:   1.84 kB
dist/assets/index-DBSdcMJ2.js 482.42 kB │ gzip: 123.29 kB
✓ built in 704ms
```

**Verifier check:**
```bash
cd C:/Users/doner/html_cloth
npm run build
```

### Success Criterion 8
**Criterion:** Browser verification is attempted against `vite preview` on a fixed port and documented with evidence that the production bundle loads and the redesigned hover/reassembly effect is observable.

**Direct evidence:**
- `C:/Users/doner/html_cloth/preview.log` shows `vite preview --host 127.0.0.1 --strictPort --port 4173`
- current `curl -I http://127.0.0.1:4173/` returned `HTTP/1.1 200 OK`
- `playwright-verify-pointcloud.spec.js` targets `http://127.0.0.1:4173/`
- `playwright-verify.log` shows `1 passed (9.4s)`
- `verification-states.json` provides direct runtime evidence of rest → hover destruction → reintegration
- evidence directory contains all screenshots plus the JSON state dump

**Verifier check:**
```bash
cd C:/Users/doner/html_cloth
python - <<'PY'
from pathlib import Path
print(Path('preview.log').read_text())
PY
curl -I http://127.0.0.1:4173/
cd C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260424-231213/playwright-evidence
python - <<'PY'
from pathlib import Path
print(Path('playwright-verify.log').read_text())
print(Path('verification-states.json').read_text())
PY
ls -la
```
