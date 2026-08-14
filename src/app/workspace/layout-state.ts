export interface WorkspaceLayoutState {
  leftWidth: number;
  rightWidth: number;
  rigPaneRatio: number;
  leftCollapsed: boolean;
  rightCollapsed: boolean;
}

export const WORKSPACE_COLLAPSED_WIDTH = 28;
export const WORKSPACE_MIN_VIEWPORT_WIDTH = 360;
export const WORKSPACE_LEFT_MIN_WIDTH = 190;
export const WORKSPACE_RIGHT_MIN_WIDTH = 220;
export const WORKSPACE_STORED_MAX_WIDTH = 2048;
export const WORKSPACE_RIG_PANE_MIN_RATIO = 0.1;
export const WORKSPACE_RIG_PANE_MAX_RATIO = 0.9;

export const DEFAULT_WORKSPACE_LAYOUT: WorkspaceLayoutState = {
  leftWidth: 268,
  rightWidth: 324,
  rigPaneRatio: 0.48,
  leftCollapsed: false,
  rightCollapsed: false,
};

export function clampWorkspaceValue(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function finiteOr(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function sanitizeWorkspaceLayout(raw: Partial<WorkspaceLayoutState> | null | undefined): WorkspaceLayoutState {
  const source = raw ?? {};
  return {
    leftWidth: clampWorkspaceValue(finiteOr(source.leftWidth, DEFAULT_WORKSPACE_LAYOUT.leftWidth), WORKSPACE_LEFT_MIN_WIDTH, WORKSPACE_STORED_MAX_WIDTH),
    rightWidth: clampWorkspaceValue(finiteOr(source.rightWidth, DEFAULT_WORKSPACE_LAYOUT.rightWidth), WORKSPACE_RIGHT_MIN_WIDTH, WORKSPACE_STORED_MAX_WIDTH),
    rigPaneRatio: clampWorkspaceValue(finiteOr(source.rigPaneRatio, DEFAULT_WORKSPACE_LAYOUT.rigPaneRatio), WORKSPACE_RIG_PANE_MIN_RATIO, WORKSPACE_RIG_PANE_MAX_RATIO),
    leftCollapsed: typeof source.leftCollapsed === 'boolean' ? source.leftCollapsed : DEFAULT_WORKSPACE_LAYOUT.leftCollapsed,
    rightCollapsed: typeof source.rightCollapsed === 'boolean' ? source.rightCollapsed : DEFAULT_WORKSPACE_LAYOUT.rightCollapsed,
  };
}

export function normalizeWorkspaceLayoutForViewport(layout: WorkspaceLayoutState, viewportWidth: number): WorkspaceLayoutState {
  const next = sanitizeWorkspaceLayout(layout);
  const width = Math.max(1, finiteOr(viewportWidth, WORKSPACE_MIN_VIEWPORT_WIDTH));

  const leftBase = next.leftCollapsed ? WORKSPACE_COLLAPSED_WIDTH : WORKSPACE_LEFT_MIN_WIDTH;
  const rightBase = next.rightCollapsed ? WORKSPACE_COLLAPSED_WIDTH : WORKSPACE_RIGHT_MIN_WIDTH;
  const sideBudget = width - WORKSPACE_MIN_VIEWPORT_WIDTH;
  const minimumSideTotal = leftBase + rightBase;

  // On normal desktop-sized windows, preserve the viewport-first invariant by
  // shrinking effective panel widths proportionally before the canvas is squeezed.
  // The persisted preference is kept separately by WorkspaceShell, so a temporary
  // narrow window does not destroy the user's wider-screen layout.
  // Very narrow windows are intentionally outside the desktop workbench target;
  // keep usable panel minima instead of silently changing collapse state.
  if (sideBudget < minimumSideTotal) return next;

  const leftExtra = next.leftCollapsed ? 0 : Math.max(0, next.leftWidth - WORKSPACE_LEFT_MIN_WIDTH);
  const rightExtra = next.rightCollapsed ? 0 : Math.max(0, next.rightWidth - WORKSPACE_RIGHT_MIN_WIDTH);
  const desiredExtra = leftExtra + rightExtra;
  const extraBudget = sideBudget - minimumSideTotal;

  if (desiredExtra <= extraBudget || desiredExtra <= 0) return next;

  const scale = extraBudget / desiredExtra;
  return {
    ...next,
    leftWidth: next.leftCollapsed ? next.leftWidth : WORKSPACE_LEFT_MIN_WIDTH + leftExtra * scale,
    rightWidth: next.rightCollapsed ? next.rightWidth : WORKSPACE_RIGHT_MIN_WIDTH + rightExtra * scale,
  };
}

export function resizeWorkspaceSide(
  layout: WorkspaceLayoutState,
  side: 'left' | 'right',
  requestedWidth: number,
  viewportWidth: number,
): WorkspaceLayoutState {
  const current = normalizeWorkspaceLayoutForViewport(layout, viewportWidth);
  const minWidth = side === 'left' ? WORKSPACE_LEFT_MIN_WIDTH : WORKSPACE_RIGHT_MIN_WIDTH;
  const otherWidth = side === 'left'
    ? (current.rightCollapsed ? WORKSPACE_COLLAPSED_WIDTH : current.rightWidth)
    : (current.leftCollapsed ? WORKSPACE_COLLAPSED_WIDTH : current.leftWidth);
  const viewportSafeMax = Math.max(minWidth, viewportWidth - otherWidth - WORKSPACE_MIN_VIEWPORT_WIDTH);

  return {
    ...current,
    [side === 'left' ? 'leftWidth' : 'rightWidth']: clampWorkspaceValue(requestedWidth, minWidth, Math.min(WORKSPACE_STORED_MAX_WIDTH, viewportSafeMax)),
  };
}
