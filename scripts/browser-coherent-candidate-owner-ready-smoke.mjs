import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { chromium } from 'playwright-core';

const executablePath = process.env.JURE_CHROME_EXECUTABLE;
if (!executablePath) throw new Error('JURE_CHROME_EXECUTABLE is required.');
const candidatePath = process.env.JURE_CANDIDATE_PROJECT_PATH;
if (!candidatePath) throw new Error('JURE_CANDIDATE_PROJECT_PATH is required.');
const sourcePath = process.env.JURE_REAL_SOURCE_PATH;
if (!sourcePath) throw new Error('JURE_REAL_SOURCE_PATH is required.');
const baseUrl = process.env.JURE_BROWSER_URL ?? 'http://127.0.0.1:4173/';

const candidateText = readFileSync(candidatePath, 'utf8');
const sourceBytes = readFileSync(sourcePath);
const candidateFileName = basename(candidatePath);
const sourceFileName = basename(sourcePath);

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

async function runtimeFaultText() {
  const heading = page.getByText('JURE runtime fault — workbench stopped safely', { exact: true });
  if (await heading.count() === 0 || !(await heading.isVisible().catch(() => false))) return null;
  return await page.locator('main pre').textContent();
}

async function assertBrowserHealthy(context) {
  const fault = await runtimeFaultText();
  if (fault) throw new Error(`${context}: workbench runtime fault:\n${fault}`);
  if (pageErrors.length > 0) throw new Error(`${context}: browser pageerror:\n${pageErrors.join('\n---\n')}`);
  if (consoleErrors.length > 0) throw new Error(`${context}: browser console.error:\n${consoleErrors.join('\n---\n')}`);
}

async function installMockPickers() {
  await page.evaluate(({ projectText, projectName, sourcePayload, sourceName }) => {
    const sourceBinary = Uint8Array.from(atob(sourcePayload), (character) => character.charCodeAt(0));
    const projectFile = new File([projectText], projectName, { type: 'application/json' });
    const sourceFile = new File([sourceBinary], sourceName, { type: 'model/gltf+json' });
    window.__jureCandidatePickerCalls = [];
    window.showOpenFilePicker = async (options = {}) => {
      const description = options?.types?.[0]?.description ?? '';
      window.__jureCandidatePickerCalls.push(description);
      const file = description === 'JURE logical project JSON'
        ? projectFile
        : description === 'glTF / GLB source'
          ? sourceFile
          : null;
      if (!file) throw new Error(`Unexpected JURE browser picker request: ${description}`);
      return [{ kind: 'file', name: file.name, getFile: async () => file }];
    };
  }, {
    projectText: candidateText,
    projectName: candidateFileName,
    sourcePayload: sourceBytes.toString('base64'),
    sourceName: sourceFileName,
  });
}

async function warningCountText(expected) {
  const label = `${expected} relation warning${expected === 1 ? '' : 's'}`;
  await page.getByText(label, { exact: true }).waitFor();
  return label;
}

async function selectUpperOutboardSphericalPair() {
  await page.getByLabel('Spherical frame A').selectOption('frame.upper-arm.outboard');
  await page.getByLabel('Spherical frame B').selectOption('frame.carrier.upper-outboard');
  const diagnostic = page.locator('[data-spherical-diagnostic]');
  await diagnostic.waitFor();
  await diagnostic.getByText('Already connected by relation.upper-outboard-spherical', { exact: true }).waitFor();
  return diagnostic;
}

try {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await assertBrowserHealthy('initial app load');
  await page.getByText('DEMO · fixture.synthetic-linkage', { exact: false }).waitFor();
  await installMockPickers();

  const undoButton = page.getByRole('button', { name: 'Undo', exact: true });
  const redoButton = page.getByRole('button', { name: 'Redo', exact: true });

  await page.getByRole('button', { name: 'Open Project', exact: true }).click();
  await page.locator('.document-chip').getByText('rig.real-jv-coherent-wishbone', { exact: true }).waitFor();
  await page.getByText('4 el · 8 fr', { exact: true }).waitFor();
  await page.getByText(`Opened ${candidateFileName} · SOURCE instances restored; exact bytes require relink`, { exact: true }).waitFor();
  await warningCountText(0);
  if ((await page.locator('.nav-row.readonly').count()) !== 4) throw new Error('Opened candidate does not expose exactly four authored relations in Rig Navigator.');
  if (!(await undoButton.isDisabled())) throw new Error('Opening the candidate unexpectedly created durable Undo history.');
  const revisionBeforeRelink = await page.locator('.document-chip small').textContent();
  await assertBrowserHealthy('candidate Open Project');

  await page.getByRole('button', { name: 'Open Source', exact: true }).click();
  await page.getByText('Relinked exact SOURCE bytes for Real JV front-left SOURCE · project truth unchanged', { exact: true }).waitFor();
  await page.getByText('PROJECT INSTANCE · PLACEMENT EDITABLE', { exact: true }).waitFor();
  const revisionAfterRelink = await page.locator('.document-chip small').textContent();
  if (revisionAfterRelink !== revisionBeforeRelink) throw new Error(`Exact SOURCE relink changed authored revision: ${revisionBeforeRelink} -> ${revisionAfterRelink}.`);
  if (!(await undoButton.isDisabled())) throw new Error('Exact SOURCE relink unexpectedly created durable Undo history.');
  await warningCountText(0);
  await assertBrowserHealthy('candidate exact SOURCE relink');

  const carrierBranch = page.locator('.element-branch').filter({ hasText: 'Suspension-side carrier reference' }).first();
  await carrierBranch.waitFor();
  const upperCarrierFrameRow = carrierBranch.locator('button.nav-row.indent').filter({ hasText: 'Upper outboard · carrier side' }).first();
  await upperCarrierFrameRow.waitFor();
  await upperCarrierFrameRow.click();
  await page.locator('.authored-context .inspector-name').filter({ hasText: 'Upper outboard · carrier side' }).waitFor();

  const positionX = page.locator('.authored-context .transform-group').first().locator('.axis-x input');
  const initialX = Number(await positionX.inputValue());
  if (!Number.isFinite(initialX)) throw new Error(`Candidate carrier-side upper outboard local X is not finite: ${initialX}.`);
  const disturbedX = initialX + 0.01;
  await positionX.fill(String(disturbedX));
  await positionX.press('Enter');
  await page.waitForTimeout(100);
  await warningCountText(1);
  if (await undoButton.isDisabled()) throw new Error('Owner numeric frame correction did not enter durable ProjectSession history.');
  await assertBrowserHealthy('candidate carrier-side outboard perturbation');

  await page.getByRole('button', { name: '+ Spherical', exact: true }).click();
  let diagnostic = await selectUpperOutboardSphericalPair();
  const disturbedResidual = Number(await diagnostic.getAttribute('data-origin-residual-m'));
  if (!Number.isFinite(disturbedResidual) || disturbedResidual <= 1e-6) {
    throw new Error(`Perturbed upper outboard spherical did not expose a meaningful residual: ${disturbedResidual}.`);
  }
  await page.locator('[data-spherical-builder]').getByRole('button', { name: 'Cancel', exact: true }).click();

  await undoButton.click();
  await page.waitForTimeout(100);
  await warningCountText(0);
  const restoredX = Number(await positionX.inputValue());
  if (!Number.isFinite(restoredX) || Math.abs(restoredX - initialX) > 1e-10) {
    throw new Error(`Undo did not restore exact candidate frame local X: ${initialX} -> ${restoredX}.`);
  }
  if (await redoButton.isDisabled()) throw new Error('Undo did not expose the expected Redo branch for the Owner correction.');

  await page.getByRole('button', { name: '+ Spherical', exact: true }).click();
  diagnostic = await selectUpperOutboardSphericalPair();
  const restoredResidual = Number(await diagnostic.getAttribute('data-origin-residual-m'));
  if (!Number.isFinite(restoredResidual) || restoredResidual > 1e-10) {
    throw new Error(`Undo did not restore neutral upper outboard spherical residual: ${restoredResidual}.`);
  }
  await page.locator('[data-spherical-builder]').getByRole('button', { name: 'Cancel', exact: true }).click();

  const pickerCalls = await page.evaluate(() => window.__jureCandidatePickerCalls ?? []);
  if (JSON.stringify(pickerCalls) !== JSON.stringify(['JURE logical project JSON', 'glTF / GLB source'])) {
    throw new Error(`Unexpected File System Access flow: ${JSON.stringify(pickerCalls)}.`);
  }

  await assertBrowserHealthy('final candidate Owner-ready state');
  console.log('BROWSER_COHERENT_CANDIDATE_OPEN_RELINK_CORRECT_UNDO_PASS', JSON.stringify({
    candidateFileName,
    sourceFileName,
    initialX,
    disturbedX,
    disturbedResidual,
    restoredResidual,
    pickerCalls,
    semanticStatus: 'owner-correction-path-proven-candidate-mating-still-not-owner-accepted-authority',
  }));
} finally {
  await browser.close();
}
