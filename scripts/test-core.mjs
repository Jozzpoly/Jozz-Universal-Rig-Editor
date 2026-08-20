import { spawnSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const tscCli = fileURLToPath(new URL('../node_modules/typescript/bin/tsc', import.meta.url));

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

runNode([tscCli, '-p', 'tests/core/tsconfig.json', '--pretty', 'false']);
runNode([
  '--test',
  'tests/core/core.test.mjs',
  'tests/core/representation-binding.test.mjs',
  'tests/core/map-document.test.mjs',
  'tests/core/map-resize.test.mjs',
  'tests/core/map-face-resize.test.mjs',
  'tests/core/map-face-resize-mode-switch.test.mjs',
  'tests/core/map-transform-space.test.mjs',
  'tests/core/map-entity-lifecycle.test.mjs',
  'tests/core/workspace-navigation.test.mjs',
]);
