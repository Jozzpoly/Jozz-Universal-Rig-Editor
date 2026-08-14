import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import {
  DEFAULT_WORKSPACE_LAYOUT,
  WORKSPACE_COLLAPSED_WIDTH,
  WORKSPACE_RIG_PANE_MAX_RATIO,
  WORKSPACE_RIG_PANE_MIN_RATIO,
  clampWorkspaceValue,
  normalizeWorkspaceLayoutForViewport,
  resizeWorkspaceSide,
  sanitizeWorkspaceLayout,
  type WorkspaceLayoutState,
} from './layout-state.js';

const STORAGE_KEY = 'jure.workspace.v1';

function loadLayout(): WorkspaceLayoutState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) as Partial<WorkspaceLayoutState> : DEFAULT_WORKSPACE_LAYOUT;
    return sanitizeWorkspaceLayout(parsed);
  } catch {
    return sanitizeWorkspaceLayout(DEFAULT_WORKSPACE_LAYOUT);
  }
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d={direction === 'left' ? 'M10 3.5 5.5 8 10 12.5' : 'M6 3.5 10.5 8 6 12.5'} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export interface WorkspaceShellProps {
  topbar: ReactNode;
  rigPane: ReactNode;
  sourcePane: ReactNode;
  viewport: ReactNode;
  inspector: ReactNode;
  statusbar: ReactNode;
}

export function WorkspaceShell({ topbar, rigPane, sourcePane, viewport, inspector, statusbar }: WorkspaceShellProps) {
  const [layout, setLayout] = useState<WorkspaceLayoutState>(loadLayout);
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const leftRef = useRef<HTMLElement>(null);
  const activeDragCleanupRef = useRef<(() => void) | null>(null);
  const effectiveLayout = useMemo(
    () => normalizeWorkspaceLayoutForViewport(layout, viewportWidth),
    [layout, viewportWidth],
  );

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(layout)); } catch { /* local preference only */ }
  }, [layout]);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => () => activeDragCleanupRef.current?.(), []);

  const installPointerDrag = useCallback((onMove: (event: PointerEvent) => void, onEnd?: () => void) => {
    activeDragCleanupRef.current?.();

    const cleanup = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', cleanup);
      window.removeEventListener('pointercancel', cleanup);
      window.removeEventListener('blur', cleanup);
      if (activeDragCleanupRef.current === cleanup) activeDragCleanupRef.current = null;
      onEnd?.();
    };

    activeDragCleanupRef.current = cleanup;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', cleanup, { once: true });
    window.addEventListener('pointercancel', cleanup, { once: true });
    window.addEventListener('blur', cleanup, { once: true });
  }, []);

  const beginHorizontalResize = useCallback((side: 'left' | 'right', event: ReactPointerEvent<HTMLDivElement>) => {
    if ((side === 'left' && effectiveLayout.leftCollapsed) || (side === 'right' && effectiveLayout.rightCollapsed)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const startX = event.clientX;
    const startWidth = side === 'left' ? effectiveLayout.leftWidth : effectiveLayout.rightWidth;
    const captureTarget = event.currentTarget;
    const pointerId = event.pointerId;

    installPointerDrag((moveEvent: PointerEvent) => {
      const delta = moveEvent.clientX - startX;
      const requestedWidth = side === 'left' ? startWidth + delta : startWidth - delta;
      setLayout((current) => resizeWorkspaceSide(current, side, requestedWidth, window.innerWidth));
    }, () => {
      if (captureTarget.hasPointerCapture(pointerId)) captureTarget.releasePointerCapture(pointerId);
    });
  }, [effectiveLayout.leftCollapsed, effectiveLayout.leftWidth, effectiveLayout.rightCollapsed, effectiveLayout.rightWidth, installPointerDrag]);

  const beginVerticalResize = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (effectiveLayout.leftCollapsed || !leftRef.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = leftRef.current.getBoundingClientRect();
    const captureTarget = event.currentTarget;
    const pointerId = event.pointerId;

    installPointerDrag((moveEvent: PointerEvent) => {
      const ratio = clampWorkspaceValue(
        (moveEvent.clientY - rect.top) / Math.max(rect.height, 1),
        WORKSPACE_RIG_PANE_MIN_RATIO,
        WORKSPACE_RIG_PANE_MAX_RATIO,
      );
      setLayout((current) => ({ ...current, rigPaneRatio: ratio }));
    }, () => {
      if (captureTarget.hasPointerCapture(pointerId)) captureTarget.releasePointerCapture(pointerId);
    });
  }, [effectiveLayout.leftCollapsed, installPointerDrag]);

  const gridStyle = useMemo(() => ({
    '--jure-left-width': `${effectiveLayout.leftCollapsed ? WORKSPACE_COLLAPSED_WIDTH : effectiveLayout.leftWidth}px`,
    '--jure-right-width': `${effectiveLayout.rightCollapsed ? WORKSPACE_COLLAPSED_WIDTH : effectiveLayout.rightWidth}px`,
    '--jure-rig-pane-ratio': `${effectiveLayout.rigPaneRatio * 100}%`,
  }) as CSSProperties, [effectiveLayout]);

  return (
    <div className="app-shell workspace-shell" style={gridStyle}>
      <header className="topbar workspace-topbar">{topbar}</header>

      <aside ref={leftRef} className={`workspace-side left-panel ${layout.leftCollapsed ? 'collapsed' : ''}`}>
        {layout.leftCollapsed ? (
          <button className="collapsed-rail left" title="Show navigator" aria-label="Show navigator" onClick={() => setLayout((current) => ({ ...current, leftCollapsed: false }))}>
            <ChevronIcon direction="right" />
            <span>Navigator</span>
          </button>
        ) : (
          <>
            <div className="workspace-left-stack">
              <div className="workspace-pane rig-pane">{rigPane}</div>
              <div className="workspace-splitter horizontal" role="separator" aria-orientation="horizontal" aria-label="Resize Rig and Source panes" onPointerDown={beginVerticalResize}><span /></div>
              <div className="workspace-pane source-pane">{sourcePane}</div>
            </div>
            <button className="panel-dock-toggle left" title="Hide navigator" aria-label="Hide navigator" onClick={() => setLayout((current) => ({ ...current, leftCollapsed: true }))}>
              <ChevronIcon direction="left" />
            </button>
            <div className="workspace-splitter vertical left" role="separator" aria-orientation="vertical" aria-label="Resize navigator" onPointerDown={(event) => beginHorizontalResize('left', event)} />
          </>
        )}
      </aside>

      <main className="canvas-region">{viewport}</main>

      <aside className={`workspace-side right-panel ${layout.rightCollapsed ? 'collapsed' : ''}`}>
        {layout.rightCollapsed ? (
          <button className="collapsed-rail right" title="Show inspector" aria-label="Show inspector" onClick={() => setLayout((current) => ({ ...current, rightCollapsed: false }))}>
            <ChevronIcon direction="left" />
            <span>Inspector</span>
          </button>
        ) : (
          <>
            <div className="workspace-splitter vertical right" role="separator" aria-orientation="vertical" aria-label="Resize inspector" onPointerDown={(event) => beginHorizontalResize('right', event)} />
            <button className="panel-dock-toggle right" title="Hide inspector" aria-label="Hide inspector" onClick={() => setLayout((current) => ({ ...current, rightCollapsed: true }))}>
              <ChevronIcon direction="right" />
            </button>
            {inspector}
          </>
        )}
      </aside>

      <footer className="statusbar">{statusbar}</footer>
    </div>
  );
}
