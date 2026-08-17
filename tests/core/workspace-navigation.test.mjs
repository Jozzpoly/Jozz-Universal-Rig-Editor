import assert from 'node:assert/strict';
import test from 'node:test';

const { resolveWorkspaceKind, workspaceSearch } = await import('../../.core-dist/app/workspace/workspace-navigation.js');

test('workspace routing defaults to Rig and selects Map only explicitly', () => {
  assert.equal(resolveWorkspaceKind(''), 'rig');
  assert.equal(resolveWorkspaceKind('?foo=bar'), 'rig');
  assert.equal(resolveWorkspaceKind('?workspace=map'), 'map');
  assert.equal(resolveWorkspaceKind('?workspace=rig'), 'rig');
  assert.equal(resolveWorkspaceKind('?workspace=unknown'), 'rig');
});

test('workspace navigation is symmetric and preserves unrelated query parameters', () => {
  const mapSearch = workspaceSearch('?evidence=owner&mode=debug', 'map');
  const mapParams = new URLSearchParams(mapSearch);
  assert.equal(mapParams.get('workspace'), 'map');
  assert.equal(mapParams.get('evidence'), 'owner');
  assert.equal(mapParams.get('mode'), 'debug');

  const rigSearch = workspaceSearch(mapSearch, 'rig');
  const rigParams = new URLSearchParams(rigSearch);
  assert.equal(rigParams.has('workspace'), false);
  assert.equal(rigParams.get('evidence'), 'owner');
  assert.equal(rigParams.get('mode'), 'debug');
  assert.equal(resolveWorkspaceKind(rigSearch), 'rig');
});

test('clean Rig to Map to Rig round trip returns to the default empty query', () => {
  const mapSearch = workspaceSearch('', 'map');
  assert.equal(mapSearch, '?workspace=map');
  assert.equal(workspaceSearch(mapSearch, 'rig'), '');
});
