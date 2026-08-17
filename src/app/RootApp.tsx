import { App as RigWorkspace } from './App.js';
import { MapWorkspace } from './map/MapWorkspace.js';
import { resolveWorkspaceKind } from './workspace/workspace-navigation.js';

export function RootApp() {
  const workspace = resolveWorkspaceKind(window.location.search);
  return workspace === 'map' ? <MapWorkspace /> : <RigWorkspace />;
}
