import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { chromium } from 'playwright-core';

const executablePath = process.env.JURE_CHROME_EXECUTABLE;
const sourcePath = process.env.JURE_REAL_SOURCE_PATH;
if (!executablePath) throw new Error('JURE_CHROME_EXECUTABLE is required.');
if (!sourcePath) throw new Error('JURE_REAL_SOURCE_PATH is required.');

const browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
const pageErrors = [];
const consoleErrors = [];
page.on('pageerror', (error) => pageErrors.push(error.stack ?? error.message));
page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });

async function assertHealthy(context) {
  const fault = page.getByText('JURE runtime fault — workbench stopped safely', { exact: true });
  if (await fault.count() > 0 && await fault.isVisible().catch(() => false)) throw new Error(`${context}: JURE runtime fault is visible.`);
  if (pageErrors.length > 0) throw new Error(`${context}: pageerror: ${pageErrors.join(' | ')}`);
  if (consoleErrors.length > 0) throw new Error(`${context}: console.error: ${consoleErrors.join(' | ')}`);
}

async function installMockPicker() {
  const bytes = readFileSync(sourcePath);
  await page.evaluate(({ payload, name }) => {
    const binary = Uint8Array.from(atob(payload), (character) => character.charCodeAt(0));
    const file = new File([binary], name, { type: 'model/gltf+json' });
    window.showOpenFilePicker = async () => [{ kind: 'file', name: file.name, getFile: async () => file }];
  }, { payload: bytes.toString('base64'), name: basename(sourcePath) });
}

async function createFreeElement(name) {
  await page.getByRole('button', { name: '+ Element', exact: true }).click();
  const input = page.getByLabel('New element name');
  await input.fill(name);
  await page.locator('form').filter({ has: input }).getByRole('button', { name: 'Create', exact: true }).click();
  const branch = page.locator('.element-branch').filter({ hasText: name });
  await branch.waitFor();
  await branch.locator('.element-row.selected-auth').waitFor();
  return branch;
}

async function selectOptionContaining(select, requiredParts) {
  const options = await select.locator('option').allTextContents();
  const label = options.find((candidate) => requiredParts.every((part) => candidate.includes(part)));
  if (!label) throw new Error(`Could not find option containing ${requiredParts.join(' + ')}.`);
  await select.selectOption({ label });
}

try {
  await page.goto(process.env.JURE_BROWSER_URL ?? 'http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await page.getByText('DEMO · fixture.synthetic-linkage', { exact: false }).waitFor();
  await assertHealthy('initial load');

  const elementAName = 'Spherical Control A';
  const elementBName = 'Spherical Control B';
  const elementA = await createFreeElement(elementAName);
  const elementB = await createFreeElement(elementBName);

  await installMockPicker();
  await page.getByRole('button', { name: 'Open Source' }).click();
  await page.getByText('PROJECT INSTANCE · PLACEMENT EDITABLE', { exact: true }).waitFor();
  const wheelCenterRow = page.locator('.source-row').filter({ hasText: 'Socket_WheelCenter' }).first();
  await wheelCenterRow.waitFor();
  await assertHealthy('exact SOURCE open');

  // Use one exact SOURCE point only as a stable coincidence control. This is
  // deliberately not a claim that Socket_WheelCenter is a wishbone ball joint.
  await elementA.locator('.row-main').click();
  await wheelCenterRow.click();
  await page.getByRole('button', { name: 'Preview adopted frame', exact: true }).click();
  await page.getByText('Frame adoption preview', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Commit frame', exact: true }).click();
  const frameA = elementA.locator('.nav-row').filter({ hasText: 'Socket_WheelCenter' });
  await frameA.waitFor();

  await elementB.locator('.row-main').click();
  await wheelCenterRow.click();
  await page.getByRole('button', { name: 'Preview adopted frame', exact: true }).click();
  await page.getByText('Frame adoption preview', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Commit frame', exact: true }).click();
  const frameB = elementB.locator('.nav-row').filter({ hasText: 'Socket_WheelCenter' });
  await frameB.waitFor();
  await assertHealthy('two-body coincidence control authored');

  const sphericalRows = page.locator('.nav-row.readonly').filter({ hasText: 'spherical' });
  const sphericalCountBefore = await sphericalRows.count();
  await page.getByRole('button', { name: '+ Spherical', exact: true }).click();
  const builder = page.locator('[data-spherical-builder]');
  await builder.waitFor();

  const frameASelect = builder.getByLabel('Spherical frame A');
  const frameBSelect = builder.getByLabel('Spherical frame B');
  await selectOptionContaining(frameASelect, ['Socket_WheelCenter', elementAName]);
  await selectOptionContaining(frameBSelect, ['Socket_WheelCenter', elementBName]);

  const diagnostic = builder.locator('[data-spherical-diagnostic]');
  await diagnostic.waitFor();
  const originResidualM = Number(await diagnostic.getAttribute('data-origin-residual-m'));
  if (!Number.isFinite(originResidualM) || originResidualM > 1e-9) {
    throw new Error(`Unexpected Owner spherical coincidence residual: ${originResidualM}`);
  }
  const diagnosticText = (await diagnostic.textContent()) ?? '';
  if (!diagnosticText.includes('Origin residual')) throw new Error(`Spherical diagnostic omitted origin residual: ${diagnosticText}`);
  if (!diagnosticText.includes('frame orientation remains authored and unconstrained')) {
    throw new Error(`Spherical diagnostic omitted orientation boundary: ${diagnosticText}`);
  }

  await builder.getByRole('button', { name: 'Create spherical', exact: true }).click();
  await page.waitForTimeout(100);
  if (await sphericalRows.count() !== sphericalCountBefore + 1) throw new Error('Owner spherical Commit did not add exactly one authored relation.');
  const createdRow = sphericalRows.nth(sphericalCountBefore);
  const createdId = ((await createdRow.locator('.row-name').textContent()) ?? '').trim();
  const createdKind = ((await createdRow.locator('.row-kind').textContent()) ?? '').trim();
  if (!createdId || createdKind !== 'spherical') throw new Error(`Owner spherical row is incomplete: id=${createdId} kind=${createdKind}`);
  await assertHealthy('Owner spherical create');

  await page.getByRole('button', { name: 'Undo' }).click();
  await page.waitForTimeout(100);
  if (await sphericalRows.count() !== sphericalCountBefore) throw new Error('Owner spherical Undo did not remove exactly the new relation.');
  if (await elementA.locator('.nav-row').filter({ hasText: 'Socket_WheelCenter' }).count() !== 1) throw new Error('Owner spherical Undo damaged frame A.');
  if (await elementB.locator('.nav-row').filter({ hasText: 'Socket_WheelCenter' }).count() !== 1) throw new Error('Owner spherical Undo damaged frame B.');

  await page.getByRole('button', { name: 'Redo' }).click();
  await page.waitForTimeout(100);
  if (await sphericalRows.count() !== sphericalCountBefore + 1) throw new Error('Owner spherical Redo did not restore exactly the new relation.');
  await assertHealthy('Owner spherical Undo/Redo');

  console.log('BROWSER_SPHERICAL_AUTHORING_CONTROL_PASS', JSON.stringify({
    originResidualM,
    createdId,
    sourceDatum: 'Socket_WheelCenter',
    semanticScope: 'ui-control-only-not-real-outboard',
  }));
} finally {
  await browser.close();
}
