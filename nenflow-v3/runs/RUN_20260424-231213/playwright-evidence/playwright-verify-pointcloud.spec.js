import fs from 'node:fs';
import { test, expect } from '@playwright/test';

async function dispatchPointer(page, type, x, y) {
  await page.evaluate(({ type, x, y }) => {
    const canvas = document.querySelector('#hero-canvas');
    canvas.dispatchEvent(new PointerEvent(type, {
      bubbles: true,
      clientX: x,
      clientY: y,
      pointerType: 'mouse',
    }));
  }, { type, x, y });
}

test('verify point cloud destruction/reintegration and ripple mode', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await expect(page).toHaveTitle(/Interactive Hero Modes/);

  const rippleBtn = page.locator('#effect-ripple');
  const pointCloudBtn = page.locator('#effect-point-cloud');
  const nextBtn = page.locator('#hero-next');
  const slideIndicator = page.locator('.hero-slide-indicator');
  const canvas = page.locator('#hero-canvas');

  await expect(rippleBtn).toHaveAttribute('aria-pressed', 'true');
  await pointCloudBtn.click();
  await expect(pointCloudBtn).toHaveAttribute('aria-pressed', 'true');
  await expect(rippleBtn).toHaveAttribute('aria-pressed', 'false');

  const states = {};
  states.rest = await page.evaluate(() => window.__heroDebug?.getState?.());
  await page.screenshot({ path: 'verification-rest.png' });

  const box = await canvas.boundingBox();
  expect(box).toBeTruthy();

  await dispatchPointer(page, 'pointermove', box.x + box.width * 0.78, box.y + box.height * 0.34);
  await page.waitForTimeout(120);
  await dispatchPointer(page, 'pointermove', box.x + box.width * 0.68, box.y + box.height * 0.44);
  await page.waitForTimeout(120);
  await dispatchPointer(page, 'pointermove', box.x + box.width * 0.82, box.y + box.height * 0.58);
  await page.waitForTimeout(420);
  states.hover = await page.evaluate(() => window.__heroDebug?.getState?.());
  await page.screenshot({ path: 'verification-hover-destroy.png' });

  await dispatchPointer(page, 'pointerleave', box.x + box.width * 0.82, box.y + box.height * 0.58);
  await page.waitForTimeout(950);
  states.reintegrated = await page.evaluate(() => window.__heroDebug?.getState?.());
  await page.screenshot({ path: 'verification-reintegrated.png' });

  await nextBtn.click();
  await page.waitForTimeout(350);
  await expect(slideIndicator).toContainText('02');
  states.slide2 = await page.evaluate(() => window.__heroDebug?.getState?.());
  await page.screenshot({ path: 'verification-slide-2-point-cloud.png' });

  await rippleBtn.click();
  await expect(rippleBtn).toHaveAttribute('aria-pressed', 'true');
  await dispatchPointer(page, 'pointermove', box.x + box.width * 0.7, box.y + box.height * 0.45);
  await page.waitForTimeout(100);
  await dispatchPointer(page, 'pointerdown', box.x + box.width * 0.7, box.y + box.height * 0.45);
  await page.waitForTimeout(90);
  states.ripple = await page.evaluate(() => window.__heroDebug?.getState?.());
  await page.screenshot({ path: 'verification-ripple.png' });

  fs.writeFileSync('verification-states.json', JSON.stringify(states, null, 2));

  expect(states.hover.effectState.meanOffset).toBeGreaterThan(states.rest.effectState.meanOffset);
  expect(states.reintegrated.effectState.meanOffset).toBeLessThan(states.hover.effectState.meanOffset);
  expect(states.reintegrated.effectState.maxOffset).toBeLessThan(states.hover.effectState.maxOffset);
  expect(states.slide2.currentSlideIndex).toBe(1);
  expect(states.ripple.effectMode).toBe('ripple');
});
