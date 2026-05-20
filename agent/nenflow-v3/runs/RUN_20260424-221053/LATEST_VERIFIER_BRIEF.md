## Verifier Brief — RUN_20260424-221053

### 1. `C:/Users/doner/html_cloth/index.html` exposes a visible hero control that lets the user select at least `Ripple` and `Point Cloud` modes.
- Direct evidence:
  - `C:\Users\doner\html_cloth\index.html` contains `.hero-effect-toggle` with buttons `#effect-ripple` and `#effect-point-cloud`.
  - `C:\Users\doner\html_cloth\src\style.css` contains `.hero-effect-toggle` and `.hero-effect-button` styling.
- Verify with:
  - `rg -n "effect-ripple|effect-point-cloud|hero-effect-toggle" C:/Users/doner/html_cloth/index.html C:/Users/doner/html_cloth/src/style.css`

### 2. In ripple mode, the current hover and click wave behavior from `src/main.js` still works on both hero slides.
- Direct evidence:
  - `setEffectMode(EFFECT_MODES.RIPPLE)` rebuilds ripple mode.
  - `onPointerMove()` still calls `spawnRippleImpulse(...)` when `activeEffect.type === EFFECT_MODES.RIPPLE`.
  - `onPointerDown()` still spawns two ripple impulses in ripple mode.
  - `changeSlide(direction)` rebuilds the active effect using the new current texture.
- Verify with:
  - `rg -n "spawnRippleImpulse|onPointerDown|onPointerMove|changeSlide|EFFECT_MODES\.RIPPLE" C:/Users/doner/html_cloth/src/main.js`
  - Then run `npm run dev` and confirm hover/click ripples on both slides.

### 3. In point-cloud mode, the current hero image is rendered as a particle/point representation derived from the active slide image, not a generic placeholder effect.
- Direct evidence:
  - `createPointCloudHero(texture)` draws `texture.image` into an offscreen canvas.
  - Particle positions/colors are sampled from `ctx.getImageData(...)` pixel data.
  - A `THREE.Points` object is created from those sampled values.
- Verify with:
  - `rg -n "createPointCloudHero|drawImage\(|getImageData|new THREE\.Points|vertexColors" C:/Users/doner/html_cloth/src/main.js`
  - In browser, switch to Point Cloud and confirm the slide image remains recognizable before hover.

### 4. While point-cloud mode is active, pointer movement over `#hero-canvas` causes observable particle dispersion around the hover location.
- Direct evidence:
  - Shared pointer tracking updates `hoverTargetUv` and `hoverMotion` in `onPointerMove()`.
  - Point-cloud `update()` computes force from hover position and applies velocity away from the hover zone.
- Verify with:
  - `rg -n "hoverMotion|hoverTargetUv|isHovering|force = Math\.exp|vx \+=|vy \+=" C:/Users/doner/html_cloth/src/main.js`
  - In browser, switch to Point Cloud and move the pointer across the image.

### 5. When the pointer leaves `#hero-canvas` in point-cloud mode, particles animate back into the original image arrangement and settle reliably.
- Direct evidence:
  - `onPointerLeave()` calls `resetInteractionState()`.
  - Point-cloud `update()` always applies spring forces toward `basePositions` and damping, so particles return after hover ends.
- Verify with:
  - `rg -n "onPointerLeave|resetInteractionState|basePositions|damping|baseX - x|baseY - y|baseZ - z" C:/Users/doner/html_cloth/src/main.js`
  - In browser, move out of the canvas and observe full reintegration.

### 6. Changing slides with `#hero-prev`, `#hero-next`, or keyboard arrows updates the currently selected effect with the new slide image.
- Direct evidence:
  - `prevBtn`, `nextBtn`, and keyboard arrow listeners all call `changeSlide(...)`.
  - `changeSlide(...)` updates `currentSlideIndex`, then rebuilds the active effect using `getCurrentTexture()`.
- Verify with:
  - `rg -n "hero-prev|hero-next|ArrowLeft|ArrowRight|changeSlide|getCurrentTexture|rebuildActiveEffect" C:/Users/doner/html_cloth/src/main.js C:/Users/doner/html_cloth/index.html`
  - In browser, test slide changes in both modes.

### 7. The selected hero mode is visually reflected in the UI and actually changes the rendered interaction behavior.
- Direct evidence:
  - `updateModeButtons()` toggles `.is-active` and `aria-pressed` between the two buttons.
  - `.hero-effect-button.is-active` is styled in `src/style.css`.
  - `setEffectMode(nextMode)` rebuilds the active effect, so the rendering path changes.
- Verify with:
  - `rg -n "updateModeButtons|is-active|aria-pressed|setEffectMode" C:/Users/doner/html_cloth/src/main.js C:/Users/doner/html_cloth/src/style.css`
  - In browser, click each mode button and confirm both the button state and interaction behavior change.

### 8. `npm run build` succeeds in `C:/Users/doner/html_cloth` after the change.
- Direct evidence:
  - Command run: `cd /c/Users/doner/html_cloth && npm run build`
  - Output ended with `✓ built in 718ms`.
- Verify with:
  - `cd /c/Users/doner/html_cloth && npm run build`

## Additional guardrail check
- Displacement search outside `node_modules` and `dist` returned no matches:
  - `cd /c/Users/doner/html_cloth && rg -n --glob '!node_modules/**' --glob '!dist/**' "displacement" .`
