import { readdirSync, existsSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const tscCli = fileURLToPath(new URL('../node_modules/typescript/bin/tsc', import.meta.url));
const coreTestsDir = fileURLToPath(new URL('../tests/core/', import.meta.url));
const filters = process.argv.slice(2).map((value) => value.toLowerCase());

if (!existsSync(tscCli)) {
  console.error('Local TypeScript compiler is missing. Run npm install first.');
  process.exit(1);
}

rmSync(fileURLToPath(new URL('../.core-dist/', import.meta.url)), { recursive: true, force: true });

function runNode(args) {
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    stdio: 'inherit',
    windowsHide: true,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const discoveredCoreTests = readdirSync(coreTestsDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.test.mjs'))
  .map((entry) => join('tests', 'core', entry.name))
  .sort((a, b) => a.localeCompare(b));

if (discoveredCoreTests.length === 0) {
  console.error('No tests/core/*.test.mjs files were found.');
  process.exit(1);
}

const coreTests = filters.length === 0
  ? discoveredCoreTests
  : discoveredCoreTests.filter((testPath) => {
      const normalizedPath = testPath.toLowerCase();
      return filters.some((filter) => normalizedPath.includes(filter));
    });

if (coreTests.length === 0) {
  console.error(`No core tests matched: ${filters.join(', ')}`);
  console.error('Available core tests:');
  for (const testPath of discoveredCoreTests) console.error(`  ${testPath}`);
  process.exit(1);
}

const filterNote = filters.length === 0 ? '' : ` matching [${filters.join(', ')}]`;
console.log(`Running ${coreTests.length} core test file(s)${filterNote}.`);
runNode([tscCli, '-p', 'tests/core/tsconfig.json', '--pretty', 'false']);
runNode(['--test', ...coreTests]);
