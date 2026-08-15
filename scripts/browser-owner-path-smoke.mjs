import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { chromium } from 'playwright-core';
import * as THREE from 'three';

const executablePath = process.env.JURE_CHROME_EXECUTABLE;
if (!executablePath) throw new Error('JURE_CHROME_EXECUTABLE is required.');

const baseUrl = process.env.JURE_BROWSER_URL ?? 'http://127.0.0.1:4173/';
const realSourcePath = process.env.JURE_REAL_SOURCE_PATH ?? null;
const sourceDatumName = process.env.JURE_SOURCE_DATUM_NAME ?? (realSourcePath ? 'Chassis_Top' : 'CI_Datum');
const sourceBytes = realSourcePath
  ? readFileSync(realSourcePath)
  : Buffer.from(JSON.stringify({
      asset: { version: '2.0', generator: 'JURE browser owner-path smoke' },
      scene: 0,
      scenes: [{ nodes: [0] }],
      nodes: [{ name: 'CI_Datum' }],
    }));
const sourceFileName = realSourcePath ? basename(realSourcePath) : 'CI_Source.gltf';

const browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
const pageErrors = [];
const consoleErrors = [];

page.on('pageerror', (error) => {
  pageErrors.push(error.stack ?? error.message);
  console.error('[pageerror]', error.stack ?? error.message);
});
page.on('console', (message) => {
  if (message.type() === 'error') {
    consoleErrors.push(message.text());
    console.error('[console.error]', message.text());
  }
});

function cameraForViewport(box) {
  const camera = new THREE.PerspectiveCamera(46, box.width / box.height, 0.01, 1000);
  camera.position.set(1.7, 1.25, 2.0);
  camera.lookAt(new THREE.Vector3(0.25, 0.15, 0));
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
  return camera;
}

function projectedScreenPoint(box, point) {
  const projected = point.clone().project(cameraForViewport(box));
  return {
    x: box.x + ((projected.x + 1) / 2) * box.width,
    y: box.y + ((1 - projected.y) / 2) * box.height,
  };
}

async function runtimeFaultText() {
  const heading = page.getByText('JURE runtime fault — workbench stopped safely', { exact: true });
  if (await heading.count() === 0 || !(await heading.isVisible().catch(() => false))) return null;
  return await page.locator('main pre').textContent();
}

async function assertNoRuntimeFault(context) {
  const fault = await runtimeFaultText();
  if (fault) throw new Error(`${context}: workbench runtime fault:\n${fault}`);
  if (pageErrors.length > 0) throw new Error(`${context}: browser pageerror:\n${pageErrors.join('\n---\n')}`);
}

async function sourceWorldPosition() {
  const values = page.locator('.source-position-group .source-pose-readout code');
  if (await values.count() !== 3) throw new Error('Expected three SOURCE world-position readouts.');
  const numbers = [];
  for (let i = 0; i < 3; i += 1) numbers.push(Number(await values.nth(i).textContent()));
  if (!numbers.every(Number.isFinite)) throw new Error(`SOURCE world position is not finite: ${numbers.join(', ')}`);
  return new THREE.Vector3(numbers[0], numbers[1], numbers[2]);
}

function distanceBetween(a, b) {
  return a.distanceTo(b);
}

async function dragWorldXAxisAt(worldPoint, didMove, label) {
  const canvas = page.locator('.viewport canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Viewport canvas has no bounding box.');

  const origin = projectedScreenPoint(box, worldPoint);
  const plusX = projectedScreenPoint(box, worldPoint.clone().add(new THREE.Vector3(1, 0, 0)));
  const dx = plusX.x - origin.x;
  const dy = plusX.y - origin.y;
  const length = Math.hypot(dx, dy);
  if (!Number.isFinite(length) || length < 1) throw new Error(`Could not project world X axis for ${label}.`);
  const ux = dx / length;
  const uy = dy / length;

  console.log(`${label} viewport`, box);
  console.log(`${label} projected origin`, origin, 'screen +X direction', { ux, uy });

  for (const handleDistance of [28, 38, 48, 58, 68, 78]) {
    const startX = origin.x + ux * handleDistance;
    const startY = origin.y + uy * handleDistance;
    await page.mouse.move(startX, startY);
    await page.waitForTimeout(60);
    await page.mouse.down();
    await page.mouse.move(startX + ux * 75, startY + uy * 75, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(110);
    await assertNoRuntimeFault(`${label} drag at handle distance ${handleDistance}`);
    if (await didMove()) {
      console.log(`${label} transform succeeded with handle distance ${handleDistance}`);
      return;
    }
  }

  throw new Error(`Browser probe could not move ${label} world-X gizmo.`);
}

async function dragAnyTranslateHandleAt(worldPoint, reselect, didMove, label) {
  const canvas = page.locator('.viewport canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Viewport canvas has no bounding box.');
  const origin = projectedScreenPoint(box, worldPoint);
  console.log(`${label} viewport`, box);
  console.log(`${label} projected origin`, origin);

  const directions = [];
  const camera = cameraForViewport(box);
  for (const axis of [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)]) {
    const axisPoint = worldPoint.clone().add(axis).project(camera);
    const centerPoint = worldPoint.clone().project(camera);
    let dx = axisPoint.x - centerPoint.x;
    let dy = -(axisPoint.y - centerPoint.y);
    const length = Math.hypot(dx, dy);
    if (length > 1e-9) directions.push({ ux: dx / length, uy: dy / length });
  }
  // Add a dense radial fallback so this probe does not depend on exact Three gizmo hit geometry.
  for (let degrees = 0; degrees < 360; degrees += 15) {
    const angle = THREE.MathUtils.degToRad(degrees);
    directions.push({ ux: Math.cos(angle), uy: Math.sin(angle) });
  }

  for (const radius of [18, 24, 30, 38, 46, 56, 68, 80]) {
    for (const direction of directions) {
      await reselect();
      const startX = origin.x + direction.ux * radius;
      const startY = origin.y + direction.uy * radius;
      if (startX < box.x + 2 || startX > box.x + box.width - 2 || startY < box.y + 2 || startY > box.y + box.height - 2) continue;
      await page.mouse.move(startX, startY);
      await page.waitForTimeout(12);
      await page.mouse.down();
      await page.mouse.move(startX + direction.ux * 55, startY + direction.uy * 55, { steps: 4 });
      await page.mouse.up();
      await page.waitForTimeout(45);
      await assertNoRuntimeFault(`${label} handle scan radius ${radius}`);
      if (await didMove()) {
        console.log(`${label} transform succeeded at radius ${radius}`, direction);
        return;
      }
    }
  }

  throw new Error(`Browser probe could not engage any ${label} translate handle around ${JSON.stringify(origin)}.`);
}

async function installMockPicker(bytes, fileName) {
  await page.evaluate(({ payload, name }) => {
    const binary = Uint8Array.from(atob(payload), (character) => character.charCodeAt(0));
    const file = new File([binary], name, { type: 'model/gltf+json' });
    window.showOpenFilePicker = async () => [{
      kind: 'file',
      name: file.name,
      getFile: async () => file,
    }];
  }, { payload: bytes.toString('base64'), name: fileName });
}

try {
  console.log(`browser probe source: ${sourceFileName}; datum: ${sourceDatumName}; real=${Boolean(realSourcePath)}`);
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.getByText('DEMO · fixture.synthetic-linkage', { exact: false }).waitFor();
  await installMockPicker(sourceBytes, sourceFileName);

  await page.getByRole('button', { name: 'Open Source' }).click();
  await page.getByText('PROJECT INSTANCE · PLACEMENT EDITABLE', { exact: true }).waitFor();

  const sourceDatumRow = page.locator('.source-row').filter({ hasText: sourceDatumName }).first();
  await sourceDatumRow.waitFor();
  await sourceDatumRow.click();
  const sourceBefore = await sourceWorldPosition();
  console.log('SOURCE datum before placement', sourceBefore.toArray());

  await page.getByRole('button', { name: 'Edit placement' }).click();
  let sourceMoved = sourceBefore;
  await dragWorldXAxisAt(new THREE.Vector3(0, 0, 0), async () => {
    sourceMoved = await sourceWorldPosition();
    return distanceBetween(sourceBefore, sourceMoved) > 1e-4;
  }, 'SOURCE placement');
  await page.getByRole('button', { name: 'Finish placement' }).click();
  console.log('SOURCE datum after placement', sourceMoved.toArray());

  await page.getByRole('button', { name: 'Undo' }).click();
  await page.waitForTimeout(100);
  await assertNoRuntimeFault('SOURCE placement Undo');
  const sourceUndone = await sourceWorldPosition();
  if (distanceBetween(sourceUndone, sourceBefore) > 2e-4) {
    throw new Error(`SOURCE Undo mismatch. Before=${sourceBefore.toArray()} undone=${sourceUndone.toArray()}`);
  }

  await page.getByRole('button', { name: 'Redo' }).click();
  await page.waitForTimeout(100);
  await assertNoRuntimeFault('SOURCE placement Redo');
  const sourceRedone = await sourceWorldPosition();
  if (distanceBetween(sourceRedone, sourceMoved) > 2e-4) {
    throw new Error(`SOURCE Redo mismatch. Moved=${sourceMoved.toArray()} redone=${sourceRedone.toArray()}`);
  }
  console.log('SOURCE placement Undo/Redo PASS');

  const linkBranch = page.locator('.element-branch').filter({ hasText: 'Link' });
  await linkBranch.locator('.row-main').click();
  await sourceDatumRow.click();
  const adoptedWorldBefore = await sourceWorldPosition();

  await page.getByRole('button', { name: 'Preview adopted frame' }).click();
  await assertNoRuntimeFault('adoption preview');
  await page.getByRole('button', { name: 'Commit frame' }).click();
  await assertNoRuntimeFault('adoption commit');

  const adoptedFrameRow = linkBranch.locator('.nav-row.indent').filter({ hasText: sourceDatumName }).first();
  const selectAdoptedFrame = async () => {
    await adoptedFrameRow.waitFor();
    await adoptedFrameRow.click();
    await page.locator('.authored-context .inspector-name').filter({ hasText: sourceDatumName }).waitFor();
  };
  await selectAdoptedFrame();

  const positionX = page.locator('.authored-context .transform-group').first().locator('.axis-x input');
  const positionY = page.locator('.authored-context .transform-group').first().locator('.axis-y input');
  const positionZ = page.locator('.authored-context .transform-group').first().locator('.axis-z input');
  const readFrameLocalPosition = async () => new THREE.Vector3(
    Number(await positionX.inputValue()),
    Number(await positionY.inputValue()),
    Number(await positionZ.inputValue()),
  );
  const frameBefore = await readFrameLocalPosition();
  if (![frameBefore.x, frameBefore.y, frameBefore.z].every(Number.isFinite)) throw new Error(`Adopted frame initial local pose is not finite: ${frameBefore.toArray()}`);

  let frameAfter = frameBefore;
  await dragAnyTranslateHandleAt(adoptedWorldBefore, selectAdoptedFrame, async () => {
    if (await positionX.count() === 0) return false;
    frameAfter = await readFrameLocalPosition();
    return distanceBetween(frameBefore, frameAfter) > 1e-5;
  }, 'freshly adopted frame');
  console.log(`adopted frame local position ${frameBefore.toArray()} -> ${frameAfter.toArray()}`);

  await page.getByRole('button', { name: 'Undo' }).click();
  await page.waitForTimeout(100);
  await assertNoRuntimeFault('adopted frame move Undo');
  const frameUndone = await readFrameLocalPosition();
  if (distanceBetween(frameUndone, frameBefore) > 1e-5) {
    throw new Error(`Undo did not restore adopted frame transform: expected ${frameBefore.toArray()}, got ${frameUndone.toArray()}.`);
  }

  console.log('BROWSER_REAL_OWNER_PATH_SMOKE_PASS');
  if (consoleErrors.length > 0) console.log('non-fatal console errors observed:', consoleErrors);
} finally {
  await browser.close();
}
