import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { chromium } from 'playwright-core';

const executablePath = process.env.JURE_CHROME_EXECUTABLE;
if (!executablePath) throw new Error('JURE_CHROME_EXECUTABLE is required.');
const sourcePath = process.env.JURE_REAL_SOURCE_PATH;
if (!sourcePath) throw new Error('JURE_REAL_SOURCE_PATH is required for construction-frame authoring smoke.');
const baseUrl = process.env.JURE_BROWSER_URL ?? 'http://127.0.0.1:4173/';
const sourceBytes = readFileSync(sourcePath);
const sourceFileName = basename(sourcePath);
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
  await page.evaluate(({ payload, name }) => {
    const binary = Uint8Array.from(atob(payload), (character) => character.charCodeAt(0));
    const file = new File([binary], name, { type: 'model/gltf+json' });
    window.showOpenFilePicker = async () => [{ kind: 'file', name: file.name, getFile: async () => file }];
  }, { payload: sourceBytes.toString('base64'), name: sourceFileName });
}

async function selectOptionContaining(select, requiredParts) {
  const options = await select.locator('option').allTextContents();
  const label = options.find((candidate) => requiredParts.every((part) => candidate.includes(part)));
  if (!label) throw new Error(`Could not find option containing ${requiredParts.join(' + ')}.`);
  await select.selectOption({ label });
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

try {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.getByText('DEMO · fixture.synthetic-linkage', { exact: false }).waitFor();
  await assertHealthy('initial load');

  const chassisName = 'Browser Chassis Reference';
  const chassisBranch = await createFreeElement(chassisName);

  await installMockPicker();
  await page.getByRole('button', { name: 'Open Source' }).click();
  await page.getByText('PROJECT INSTANCE · PLACEMENT EDITABLE', { exact: true }).waitFor();
  await assertHealthy('real SOURCE open');

  // Ground the moving wishbone body directly from the exact rigid Chassis_Bottom datum.
  const chassisBottomRow = page.locator('.source-row').filter({ hasText: 'Chassis_Bottom' }).first();
  await chassisBottomRow.click();
  await page.getByRole('button', { name: 'Create element at datum', exact: true }).click();
  const sourceElementName = page.getByLabel('SOURCE-derived element name');
  const lowerArmName = 'Browser Lower Arm';
  await sourceElementName.fill(lowerArmName);
  await page.getByRole('button', { name: 'Create element', exact: true }).click();
  const lowerArmBranch = page.locator('.element-branch').filter({ hasText: lowerArmName });
  await lowerArmBranch.waitFor();
  await lowerArmBranch.locator('.element-row.selected-auth').waitFor();

  const builder = page.locator('[data-construction-frame-builder]');
  await builder.waitFor();
  if (await builder.getAttribute('open') !== null) throw new Error('Construction builder should start collapsed.');
  await builder.locator('summary').first().click();

  const origin = page.getByLabel('Construction origin point');
  const radial = page.getByLabel('Construction radial endpoint');
  const upStart = page.getByLabel('Construction up span start');
  const upEnd = page.getByLabel('Construction up span end');
  const frameNameInput = page.getByLabel('Constructed frame name');
  await origin.waitFor();

  await selectOptionContaining(origin, ['Chassis_Bottom', 'X max']);
  await selectOptionContaining(radial, ['Chassis_Bottom', 'X max']);
  await selectOptionContaining(upStart, ['Axis_SuspensionTravel_Bottom']);
  await selectOptionContaining(upEnd, ['Axis_SuspensionTravel_Top']);

  const constructionError = builder.locator('.construction-error');
  await constructionError.waitFor();
  const errorText = (await constructionError.textContent()) ?? '';
  if (!/non-zero length|radial direction/i.test(errorText)) throw new Error(`Unexpected degenerate recipe error: ${errorText}`);
  let previewButton = builder.getByRole('button', { name: new RegExp(`^Preview on ${lowerArmName}$`) });
  if (!(await previewButton.isDisabled())) throw new Error('Degenerate recipe incorrectly enabled Preview.');
  console.log('CONSTRUCTION_FRAME_INVALID_RECIPE_FAIL_CLOSED_PASS');

  await selectOptionContaining(radial, ['Chassis_Bottom', 'X min']);
  await frameNameInput.fill('Lower Wishbone Hinge');
  const result = builder.locator('.construction-result');
  await result.waitFor();
  const resultText = (await result.textContent()) ?? '';
  if (!resultText.includes('[0.5, 0.03125, 0]')) throw new Error(`Unexpected construction origin: ${resultText}`);
  if (!resultText.includes('[0, 0, 1]')) throw new Error(`Unexpected construction primary axis: ${resultText}`);
  const locator = await result.getAttribute('data-construction-locator');
  if (!locator?.startsWith('source.derived-frame:orthogonal-cross-axis-v1:')) throw new Error(`Unexpected construction locator: ${locator}`);
  if (await previewButton.isDisabled()) throw new Error('Valid recipe did not enable Preview.');
  console.log('CONSTRUCTION_FRAME_RECIPE_PREVIEW_READOUT_PASS', locator);

  // First authored side: exact SOURCE-derived lower arm.
  await previewButton.click();
  await page.getByText('Frame adoption preview', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Commit frame', exact: true }).click();
  const armFrameRow = lowerArmBranch.locator('.nav-row').filter({ hasText: 'Lower Wishbone Hinge' });
  await armFrameRow.waitFor();
  await armFrameRow.click();
  await page.locator('.inspector-name').filter({ hasText: 'Lower Wishbone Hinge' }).waitFor();
  const armInspectorMeta = (await page.locator('.authored-context .compact-meta').textContent()) ?? '';
  if (!armInspectorMeta.includes('Measured from') || !armInspectorMeta.includes('source.derived-frame:orthogonal-cross-axis-v1:')) {
    throw new Error(`Committed lower-arm frame does not expose construction provenance in Inspector: ${armInspectorMeta}`);
  }
  await assertHealthy('lower-arm hinge commit');

  // The builder must remain mounted/open with the same disposable recipe after Commit.
  if (await builder.getAttribute('open') === null) throw new Error('Construction recipe collapsed/unmounted after first Commit.');
  if ((await result.getAttribute('data-construction-locator')) !== locator) throw new Error('Construction recipe locator changed after first Commit.');
  console.log('CONSTRUCTION_FRAME_RECIPE_PRESERVED_AFTER_COMMIT_PASS');

  // Second authored side: explicit Owner chassis reference. Same physical hinge evidence,
  // different owner-local frame. Selecting the second body must not require re-entering recipe data.
  await chassisBranch.locator('.element-row').click();
  await chassisBranch.locator('.element-row.selected-auth').waitFor();
  previewButton = builder.getByRole('button', { name: new RegExp(`^Preview on ${chassisName}$`) });
  await previewButton.waitFor();
  if (await previewButton.isDisabled()) throw new Error('Preserved valid recipe did not enable Preview on the second authored body.');
  if ((await origin.inputValue()) === '' || (await radial.inputValue()) === '' || (await upStart.inputValue()) === '' || (await upEnd.inputValue()) === '') {
    throw new Error('Construction recipe selections were lost before adopting to the second body.');
  }

  await previewButton.click();
  await page.getByText('Frame adoption preview', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Commit frame', exact: true }).click();
  const chassisFrameRow = chassisBranch.locator('.nav-row').filter({ hasText: 'Lower Wishbone Hinge' });
  await chassisFrameRow.waitFor();
  await chassisFrameRow.click();
  const chassisInspectorMeta = (await page.locator('.authored-context .compact-meta').textContent()) ?? '';
  if (!chassisInspectorMeta.includes(locator)) throw new Error('Second authored hinge side did not preserve the same physical construction locator.');
  await assertHealthy('chassis hinge commit');

  // Undo/Redo only the second side; the lower-arm side must remain authored.
  await page.getByRole('button', { name: 'Undo' }).click();
  await page.waitForTimeout(100);
  if (await chassisBranch.locator('.nav-row').filter({ hasText: 'Lower Wishbone Hinge' }).count() !== 0) throw new Error('Undo did not remove the second authored hinge side.');
  if (await lowerArmBranch.locator('.nav-row').filter({ hasText: 'Lower Wishbone Hinge' }).count() !== 1) throw new Error('Undo of second hinge side incorrectly removed the first side.');
  await page.getByRole('button', { name: 'Redo' }).click();
  await chassisBranch.locator('.nav-row').filter({ hasText: 'Lower Wishbone Hinge' }).waitFor();
  await assertHealthy('two-body hinge Undo/Redo');

  console.log('BROWSER_REAL_TWO_BODY_HINGE_AUTHORING_PASS', JSON.stringify({ locator, lowerArmName, chassisName }));
} finally {
  await browser.close();
}
