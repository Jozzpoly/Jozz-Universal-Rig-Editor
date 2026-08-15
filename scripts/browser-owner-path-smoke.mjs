import { chromium } from 'playwright-core';
import * as THREE from 'three';

const executablePath = process.env.JURE_CHROME_EXECUTABLE;
if (!executablePath) throw new Error('JURE_CHROME_EXECUTABLE is required.');

const baseUrl = process.env.JURE_BROWSER_URL ?? 'http://127.0.0.1:4173/';
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

function projectedScreenPoint(box, point) {
  const camera = new THREE.PerspectiveCamera(46, box.width / box.height, 0.01, 1000);
  camera.position.set(1.7, 1.25, 2.0);
  camera.lookAt(new THREE.Vector3(0.25, 0.15, 0));
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
  const projected = point.clone().project(camera);
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

try {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.getByText('DEMO · fixture.synthetic-linkage', { exact: false }).waitFor();

  const sourceText = JSON.stringify({
    asset: { version: '2.0', generator: 'JURE browser owner-path smoke' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ name: 'CI_Datum' }],
  });

  await page.evaluate((text) => {
    const file = new File([text], 'CI_Source.gltf', { type: 'model/gltf+json' });
    window.showOpenFilePicker = async () => [{
      kind: 'file',
      name: file.name,
      getFile: async () => file,
    }];
  }, sourceText);

  await page.getByRole('button', { name: 'Open Source' }).click();
  await page.getByText('PROJECT INSTANCE · PLACEMENT EDITABLE', { exact: true }).waitFor();

  const linkBranch = page.locator('.element-branch').filter({ hasText: 'Link' });
  await linkBranch.locator('.row-main').click();
  const sourceDatumRow = page.locator('.source-row').filter({ hasText: 'CI_Datum' });
  await sourceDatumRow.click();

  await page.getByRole('button', { name: 'Preview adopted frame' }).click();
  await page.getByRole('button', { name: 'Commit frame' }).click();

  const adoptedFrameRow = linkBranch.locator('.nav-row.indent').filter({ hasText: 'CI_Datum' });
  await adoptedFrameRow.waitFor();
  await adoptedFrameRow.click();
  await page.locator('.authored-context .inspector-name').filter({ hasText: 'CI_Datum' }).waitFor();

  const positionX = page.locator('.authored-context .transform-group').first().locator('.axis-x input');
  const before = Number(await positionX.inputValue());
  if (!Number.isFinite(before)) throw new Error(`Adopted frame initial X is not finite: ${await positionX.inputValue()}`);

  const canvas = page.locator('.viewport canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Viewport canvas has no bounding box.');

  const origin = projectedScreenPoint(box, new THREE.Vector3(0, 0, 0));
  const plusX = projectedScreenPoint(box, new THREE.Vector3(1, 0, 0));
  const dx = plusX.x - origin.x;
  const dy = plusX.y - origin.y;
  const length = Math.hypot(dx, dy);
  if (!Number.isFinite(length) || length < 1) throw new Error('Could not project the world X transform axis.');
  const ux = dx / length;
  const uy = dy / length;

  console.log('viewport', box);
  console.log('projected frame origin', origin, 'screen +X direction', { ux, uy });

  let moved = false;
  let after = before;
  for (const handleDistance of [28, 38, 48, 58, 68, 78]) {
    await adoptedFrameRow.click();
    const startX = origin.x + ux * handleDistance;
    const startY = origin.y + uy * handleDistance;
    await page.mouse.move(startX, startY);
    await page.waitForTimeout(80);
    await page.mouse.down();
    await page.mouse.move(startX + ux * 75, startY + uy * 75, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(120);

    const fault = await runtimeFaultText();
    if (fault) throw new Error(`Workbench runtime fault while dragging freshly adopted frame:\n${fault}`);
    if (pageErrors.length > 0) throw new Error(`Browser pageerror while dragging freshly adopted frame:\n${pageErrors.join('\n---\n')}`);

    if (await positionX.count() > 0) {
      after = Number(await positionX.inputValue());
      if (Number.isFinite(after) && Math.abs(after - before) > 1e-5) {
        moved = true;
        console.log(`adopted frame transform succeeded with handle distance ${handleDistance}: ${before} -> ${after}`);
        break;
      }
    }
  }

  if (!moved) {
    throw new Error(`Browser probe could not move the adopted frame gizmo. Initial X=${before}, final X=${after}. This may mean the transform handle coordinates need calibration.`);
  }

  await page.getByRole('button', { name: 'Undo' }).click();
  await page.waitForTimeout(100);
  const undone = Number(await positionX.inputValue());
  if (!Number.isFinite(undone) || Math.abs(undone - before) > 1e-5) {
    throw new Error(`Undo did not restore the adopted frame transform: expected ${before}, got ${undone}.`);
  }

  console.log('BROWSER_OWNER_PATH_SMOKE_PASS');
  if (consoleErrors.length > 0) console.log('non-fatal console errors observed:', consoleErrors);
} finally {
  await browser.close();
}
