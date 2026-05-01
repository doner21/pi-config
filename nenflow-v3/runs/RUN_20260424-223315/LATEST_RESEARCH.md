---
artifact_type: RESEARCH
role: RESEARCHER
run_id: RUN_20260424-223315
context_saturation_estimate: "~28%"
---

## Investigation Scope
Investigated the current Three.js hero implementation in `src/main.js`, supporting UI/layout in `index.html` and `src/style.css`, and repo dependencies in `package.json`, with focus on the existing `createPointCloudHero()` path and how to validate refinements in a browser. Per INTAKE, `graphify-out/` is absent in this repo.

## Key Findings

### 1) The repo already samples full per-pixel color; the grayscale/negative look is likely perceptual/compositing, not missing color data
Evidence in `src/main.js:286-333`:
- `createPointCloudHero()` downsamples the image to a 2D canvas, reads pixel RGBA, and pushes RGB into a `color` buffer attribute.
- `srgbColor.setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace)` is used before writing vertex colors.
- Renderer and textures are also configured for sRGB (`src/main.js:14`, `src/main.js:69`).

So the current point cloud is not literally converting the image to black-and-white. The “negative” read is more likely from how the colored points are composited and how much of the original image coverage is lost.

### 2) Several current choices make the point cloud lose image fidelity
Evidence in `src/main.js:286-344` and `src/style.css:52-69`:
- Dark pixels are culled: `if (a < 0.03 || luminance < 0.03) continue;`
  - This removes very dark image areas entirely, so shadows/details disappear.
  - On a dark hero background/scrim, that can make the remaining brighter pixels look like a photographic negative or a sparse highlight map.
- The material uses `THREE.AdditiveBlending` (`src/main.js:344`).
  - Additive blending adds particle light on top of the dark hero background rather than reconstructing the source image’s opaque color relationships.
  - Overlaps brighten and wash out; darker colors cannot “hold” their original tone.
- The hero has a dark base and dark scrim overlay (`src/style.css:56`, `src/style.css:65-69`).
  - Sparse particles + dark gaps + additive brightening strongly bias the result toward a glowing, deconstructed image rather than a faithful image.
- The point cloud is still a set of independent points, not a filled image plane.
  - Even with correct particle colors, there is unavoidable coverage loss between particles unless density/point size/blending are tuned, or an underlay plane is retained.

### 3) Additive blending is very likely the main cause of the washed look
In Three.js, `AdditiveBlending` is usually better for glow/fire/light accumulation than for preserving the appearance of a source photograph.

Why it causes the reported look here:
- Particle colors are summed instead of alpha-composited.
- Areas of overlap become brighter than the source image.
- Dark image regions are already partly removed by the luminance filter, so the image becomes mostly “lights over dark background.”
- With the scrim on top, the eye reads the result as desaturated/solarized/negative even if vertex colors are technically correct.

### 4) Better material settings exist and fit the current implementation style
Most practical alternatives for `src/main.js`:
- Use default/normal alpha compositing instead of additive blending.
  - `blending: THREE.NormalBlending` or omit `blending` entirely.
- Keep `vertexColors: true`, `transparent: true`, `depthWrite: false`, `toneMapped: false`.
- Consider keeping `opacity` near `1` for image fidelity.
- If square point edges become objectionable after leaving additive blending, add a small circular alpha sprite/`alphaMap`, or move to a tiny custom `ShaderMaterial` only if needed.

For the stated goal, the least invasive first change is material compositing, not a full shader rewrite.

### 5) The current dispersion force is local, but strong enough to carve a visible hole
Evidence in `src/main.js:359-406`:
- Hover influence uses `force = Math.exp(-dist2 / radius) * hoverStrength` with `radius = 0.028` and `hoverStrength` clamped between `0.58` and `1.55` (`src/main.js:367`, `src/main.js:387-388`).
- Velocity injection is relatively strong:
  - `vx/vy += ... * force * dt * 14 * spread`
  - `vz += ... * force * dt * 7.5`
- Re-centering exists, but only as a spring back to base:
  - `vx += (baseX - x) * dt * 13.5`
  - `vy += (baseY - y) * dt * 13.5`

Why the hole appears large:
- Particles are pushed radially outward from the hover center each frame while hovering.
- There is no explicit max displacement clamp in x/y from base position.
- Because the original image is made only of particles, moving particles away immediately creates visible empty space.

### 6) A hybrid “image underlay + disturbed particles overlay” is feasible in the current architecture
The active effect abstraction already returns an object with:
- `object`
- `update()`
- `setOpacity()`
- `dispose()`

That means `createPointCloudHero()` can return a `THREE.Group` instead of just `THREE.Points`, containing:
- a subtle base `Mesh`/plane with the original texture, and
- the particle system on top.

This is a strong fit for the current architecture because:
- `rebuildActiveEffect()`, `changeSlide()`, `updateDisplayedPlaneSize()`, and `disposeActiveEffect()` already work with a generic `object` (`src/main.js:114-122`, `src/main.js:124-131`, `src/main.js:432-449`).
- It preserves mode-toggle and slide behavior without changing the surrounding control flow.
- It is the most robust way to avoid a “massive hole” while still showing local particle motion.

## Constraints Identified
- This is a Vite + Three.js app with all hero logic concentrated in `src/main.js`; there is no existing shader pipeline or component split.
- `package.json` only includes `three` and `vite`; no Playwright dependency is in the repo.
- Ripple mode and point-cloud mode share common slide/mode/opacity infrastructure, so point-cloud changes should remain localized to `createPointCloudHero()` and point-cloud-specific sizing/update logic.
- The current hero visual stack includes a dark scrim overlay in HTML/CSS, which materially affects how the point cloud reads.
- Build baseline is healthy: `npm run build` succeeds in the current repo.

## Existing Patterns
- Single-file runtime orchestration in `src/main.js`.
- Effect polymorphism via returned object contracts from `createRippleHero()` and `createPointCloudHero()`.
- Pointer interaction is normalized through a hidden hit plane and raycaster (`src/main.js:44-53`, `src/main.js:461-492`).
- Slide transitions rely on `setOpacity()` and effect replacement rather than in-place texture mutation (`src/main.js:500-522`).
- Point-cloud-specific resize behavior is already centralized in `updateDisplayedPlaneSize()` (`src/main.js:448`).

## Recommendations

### Recommended direction: minimal-change refinement inside `createPointCloudHero()`
Best first-pass approach:
1. Replace additive blending with normal blending.
2. Stop discarding dark pixels solely by luminance, or reduce that threshold sharply.
3. Reduce hover force/radius and cap x/y displacement from base.
4. If fidelity is still not sufficient, add a very subtle textured underlay plane beneath the particles within point-cloud mode.

This matches the repo’s current architecture and avoids introducing shader complexity unless needed.

### Practical options, from least invasive to more robust

#### Option A — Material/compositing fix first
Good for minimal code change.
- Switch from `THREE.AdditiveBlending` to normal/default blending.
- Keep per-particle colors.
- Lower opacity only if needed aesthetically, but prefer near-opaque particles to preserve the image.
- Reduce/remove `luminance < 0.03` culling so dark hair/shadows/fabric survive.

Expected effect:
- Colors should read closer to the source image.
- Washed/glow/negative impression should reduce significantly.

#### Option B — Make dispersion truly subtle/local
Good for solving the “massive hole.”
- Shrink hover radius and hover strength.
- Reduce radial push multipliers.
- Add a hard cap on particle displacement from base in x/y.
- Optionally bi
