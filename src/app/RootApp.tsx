import { App as RigWorkspace } from './App.js';
import { MapWorkspace } from './map/MapWorkspace.js';

export type WorkspaceKind = 'rig' | 'map';

export function resolveWorkspaceKind(location: Pick<Location, 'search'> = window.location): WorkspaceKind {
  const requested = new URLSearchParams(location.search).get('workspace');
  return requested === 'map' ? 'map' : 'rig';
}

export function RootApp() {
  const workspace = resolveWorkspaceKind();
  return workspace === 'map' ? <MapWorkspace /> : <RigWorkspace />;
}
