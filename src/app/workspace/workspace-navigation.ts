export type WorkspaceKind = 'rig' | 'map';

export function resolveWorkspaceKind(search: string): WorkspaceKind {
  const requested = new URLSearchParams(search).get('workspace');
  return requested === 'map' ? 'map' : 'rig';
}

export function workspaceSearch(search: string, target: WorkspaceKind): string {
  const params = new URLSearchParams(search);
  if (target === 'map') params.set('workspace', 'map');
  else params.delete('workspace');
  const query = params.toString();
  return query.length > 0 ? `?${query}` : '';
}
