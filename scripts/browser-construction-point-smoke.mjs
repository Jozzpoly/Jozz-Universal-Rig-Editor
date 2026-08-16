import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { chromium } from 'playwright-core';

const executablePath = process.env.JURE_CHROME_EXECUTABLE;
if (!executablePath) throw new Error('JURE_CHROME_EXECUTABLE is required.');
const realSourcePath = process.env.JURE_REAL_SOURCE_PATH;
if (!realSourcePath) throw new Error('JURE_REAL_SOURCE_PATH is required.');
const baseUrl = process.env.JURE_BROWSER_URL ?? 'http://127.0.0.1:4173/';
const sourceBytes = readFileSync(realSourcePath);
const sourceFileName = basename(realSourcePath);

const browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
const pageErrors = [];
const consoleErrors = [];
page.on('pageerror', (error) => pageErrors.push(error.stack ?? error.message));
page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });

async function assertHealthy(context) {
  const fault = page.getByText('JURE runtime fault — workbench stopped safely', { exact: true });
  if (await fault.count() > 0 && await fault.isVisible().catch(() => false)) {
    throw new Error(`${context}: runtime fault: ${await page.locator('main pre').textContent()}`);
  }
  if (pageErrors.length) throw new Error(`${context}: pageerror: ${pageErrors.join('\n---\n')}`);
  if (consoleErrors.length) throw new Error(`${context}: console.error: ${consoleErrors.join('\n---\n')}`);
}

async function installMockPicker() {
  await page.evaluate(({ payload, name }) => {
    const binary = Uint8Array.from(atob(payload), (character) => character.charCodeAt(0));
    const file = new File([binary], name, { type: 'model/gltf+json' });
    window.showOpenFilePicker = async () => [{ kind: 'file', name: file.name, getFile: async () => file }];
  }, { payload: sourceBytes.toString('base64'), name: sourceFileName });
}

async function constructionEnd(nodeName, side, expectedNodeLocator) {
  const row = page.locator('.source-derived-row').filter({ hasText: `${nodeName} · X ${side}` }).first();
  await row.waitFor();
  const locator = await row.getAttribute('data-derived-locator');
  const sourceNodeLocator = await row.getAttribute('data-source-node-locator');
  const point = [
    Number(await row.getAttribute('data-x')),
    Number(await row.getAttribute('data-y')),
    Number(await row.getAttribute('data-z')),
  ];
  if (!locator?.includes(`rigid-x-end-v1`) || !locator.endsWith(`:${side}`)) throw new Error(`Unexpected construction datum locator for ${nodeName}/${side}: ${locator}`);
  if (sourceNodeLocator !== expectedNodeLocator) throw new Error(`Unexpected source node locator for ${nodeName}/${side}: ${sourceNodeLocator}`);
  if (!point.every(Number.isFinite)) throw new Error(`Non-finite construction point for ${nodeName}/${side}: ${point}`);
  if ((await row.getAttribute('title'))?.includes('no authored/mechanical orientation') !== true) throw new Error(`Construction point ${nodeName}/${side} does not expose its orientation limitation.`);
  return { locator, sourceNodeLocator, point };
}

try {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await assertHealthy('initial load');
  await installMockPicker();
  await page.getByRole('button', { name: 'Open Source' }).click();
  await page.getByText('PROJECT INSTANCE · PLACEMENT EDITABLE', { exact: true }).waitFor();
  await assertHealthy('real SOURCE open');

  const rows = page.locator('.source-derived-row');
  const count = await rows.count();
  if (count < 4) throw new Error(`Expected at least four real rigid-geometry construction points, found ${count}.`);

  const upperMin = await constructionEnd('Chassis_Top', 'min', 'gltf2.node:3');
  const upperMax = await constructionEnd('Chassis_Top', 'max', 'gltf2.node:3');
  const lowerMin = await constructionEnd('Chassis_Bottom', 'min', 'gltf2.node:5');
  const lowerMax = await constructionEnd('Chassis_Bottom', 'max', 'gltf2.node:5');

  for (const [label, min, max] of [
    ['Chassis_Top', upperMin, upperMax],
    ['Chassis_Bottom', lowerMin, lowerMax],
  ]) {
    if (!(min.point[0] < max.point[0])) throw new Error(`${label} X ends are not ordered: ${min.point[0]} !< ${max.point[0]}`);
    if (Math.abs(min.point[1] - max.point[1]) > 1e-9 || Math.abs(min.point[2] - max.point[2]) > 1e-9) {
      throw new Error(`${label} X ends do not share the same Y/Z bounds centre.`);
    }
  }

  await assertHealthy('construction point inspection');
  console.log('REAL_SOURCE_CONSTRUCTION_X_ENDS_PASS', JSON.stringify({ count, upperMin, upperMax, lowerMin, lowerMax }));
} finally {
  await browser.close();
}
