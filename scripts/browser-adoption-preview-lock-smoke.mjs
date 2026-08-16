import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { chromium } from 'playwright-core';
import * as THREE from 'three';

const executablePath = process.env.JURE_CHROME_EXECUTABLE;
const sourcePath = process.env.JURE_REAL_SOURCE_PATH;
if (!executablePath) throw new Error('JURE_CHROME_EXECUTABLE is required.');
if (!sourcePath) throw new Error('JURE_REAL_SOURCE_PATH is required.');

const browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
const pageErrors = [];
const consoleErrors = [];
page.on('pageerror', (error) => pageErrors.push(error.stack ?? error.message));
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});

function cameraForViewport(box) {
  const camera = new THREE.PerspectiveCamera(46, box.width / box.height, 0.01, 1000);
  camera.position.set(1.7, 1.25, 2.0);
  camera.lookAt(new THREE.Vector3(0.25, 0.15, 0));
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
  return camera;
}

function project(box, point) {
  const projected = point.clone().project(cameraForViewport(box));
  return {
    x: box.x + ((projected.x + 1) / 2) * box.width,
    y: box.y + ((1 - projected.y) / 2) * box.height,
  };
}

async function runtimeFault() {
  const heading = page.getByText('JURE runtime fault — workbench stopped safely', { exact: true });
  if (await heading.count() === 0 || !(await heading.isVisible().catch(() => false))) return null;
  return await page.locator('main pre').textContent();
}

try {
  const bytes = readFileSync(sourcePath);
  await page.goto(process.env.JURE_BROWSER_URL ?? 'http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await page.evaluate(({ payload, name }) => {
    const binary = Uint8Array.from(atob(payload), (character) => character.charCodeAt(0));
    const file = new File([binary], name, { type: 'model/gltf+json' });
    window.showOpenFilePicker = async () => [{ kind: 'file', name: file.name, getFile: async () => file }];
  }, { payload: bytes.toString('base64'), name: basename(sourcePath) });

  await page.getByRole('button', { name: 'Open Source' }).click();
  await page.getByText('PROJECT INSTANCE · PLACEMENT EDITABLE', { exact: true }).waitFor();

  const linkBranch = page.locator('.element-branch').filter({ hasText: 'Link' });
  await linkBranch.locator('.row-main').click();
  await page.locator('.source-row').filter({ hasText: 'Chassis_Top' }).first().click();
  await page.getByRole('button', { name: 'Preview adopted frame' }).click();
  await page.getByRole('button', { name: 'Commit frame' }).waitFor();

  // This reproduces the owner's accidental action: drag the still-visible authored gizmo
  // while the SOURCE->frame adoption preview is already the active operation.
  const canvas = page.locator('.viewport canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Viewport canvas has no bounding box.');
  const linkWorld = new THREE.Vector3(0.55, 0.12, 0);
  const origin = project(box, linkWorld);
  const plusX = project(box, linkWorld.clone().add(new THREE.Vector3(1, 0, 0)));
  const dx = plusX.x - origin.x;
  const dy = plusX.y - origin.y;
  const length = Math.hypot(dx, dy);
  const ux = dx / length;
  const uy = dy / length;

  const startX = origin.x + ux * 28;
  const startY = origin.y + uy * 28;
  await page.mouse.move(startX, startY);
  await page.waitForTimeout(80);
  await page.mouse.down();
  await page.mouse.move(startX + ux * 70, startY + uy * 70, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(150);

  const fault = await runtimeFault();
  if (fault) throw new Error(`Adoption preview transform attempt crashed the workbench:\n${fault}`);
  if (pageErrors.length > 0) throw new Error(`Adoption preview transform attempt emitted pageerror:\n${pageErrors.join('\n---\n')}`);
  if (consoleErrors.length > 0) throw new Error(`Adoption preview transform attempt emitted console.error:\n${consoleErrors.join('\n---\n')}`);
  if (!(await page.getByRole('button', { name: 'Commit frame' }).isVisible().catch(() => false))) {
    throw new Error('Adoption preview disappeared after a transform attempt; expected preview to remain safely active.');
  }

  console.log('ADOPTION_PREVIEW_TRANSFORM_LOCK_PASS');
} finally {
  await browser.close();
}
