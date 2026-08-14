import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';

interface WorkspaceLayoutState {
  leftWidth: number;
  rightWidth: number;
  rigPaneRatio: number;
  leftCollapsed: boolean;
  rightCollapsed: boolean;
}

const STORAGE_KEY = 'jure.workspace.v1';
const MIN_VIEWPORT_WIDTH = 360;
const DEFAULT_LAYOUT: WorkspaceLayoutState = {
  leftWidth: 268,
  rightWidth: 324,
  rigPaneRatio: 0.48,
  leftCollapsed: false,
  rightCollapsed: false,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function loadLayout(): WorkspaceLayoutState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LAYOUT;
    const parsed = JSON.parse(raw) as Partial<WorkspaceLayoutState>;
    return {
      leftWidth: Number.isFinite(parsed.leftWidth) ? clamp(Number(parsed.leftWidth), 190, 560) : DEFAULT_LAYOUT.leftWidth,
      rightWidth: Number.isFinite(parsed.rightWidth) ? clamp(Number(parsed.rightWidth), 220, 620) : DEFAULT_LAYOUT.rightWidth,
      rigPaneRatio: Number.isFinite(parsed.rigPaneRatio) ? clamp(Number(parsed.rigPaneRatio), 0.2, 0.8) : DEFAULT_LAYOUT.rigPaneRatio,
      leftCollapsed: Boolean(parsed.leftCollapsed),
      rightCollapsed: Boolean(parsed.rightCollapsed),
    };
  } catch {
    return DEFAULT_LAYOUT;
  }
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
  const leftRef = useRef<HTMLElement>(null);

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(layout)); } catch { /* local preference only */ }
  }, [layout]);


  const beginHorizontalResize = useCallback((side: 'left' | 'right', event: ReactPointerEvent<HTMLDivElement>) => {
    if ((side === 'left' && layout.leftCollapsed) || (side === 'right' && layout.rightCollapsed)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const startX = event.clientX;
    const startWidth = side === 'left' ? layout.leftWidth : layout.rightWidth;

    const onMove = (moveEvent: PointerEvent) => {
      const delta = moveEvent.clientX - startX;
      const next = side === 'left' ? startWidth + delta : startWidth - delta;
      setLayout((current) => {
        const minWidth = side === 'left' ? 190 : 220;
        const otherWidth = side === 'left'
          ? (current.rightCollapsed ? 28 : current.rightWidth)
          : (current.leftCollapsed ? 28 : current.leftWidth);
        const viewportSafeMax = Math.max(minWidth, window.innerWidth - otherWidth - MIN_VIEWPORT_WIDTH);
        const preferredMax = Math.max(minWidth, window.innerWidth * 0.55);
        return {
          ...current,
          [side === 'left' ? 'leftWidth' : 'rightWidth']: clamp(next, minWidth, Math.min(viewportSafeMax, preferredMax)),
        };
      });
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
    window.addEventListener('pointercancel', onUp, { once: true });
  }, [layout.leftCollapsed, layout.leftWidth, layout.rightCollapsed, layout.rightWidth]);

  const beginVerticalResize = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (layout.leftCollapsed || !leftRef.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = leftRef.current.getBoundingClientRect();
    const onMove = (moveEvent: PointerEvent) => {
      const ratio = clamp((moveEvent.clientY - rect.top) / Math.max(rect.height, 1), 0.2, 0.8);
      setLayout((current) => ({ ...current, rigPaneRatio: ratio }));
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
    window.addEventListener('pointercancel', onUp, { once: true });
  }, [layout.leftCollapsed]);

  const gridStyle = useMemo(() => ({
    '--jure-left-width': `${layout.leftCollapsed ? 28 : layout.leftWidth}px`,
    '--jure-right-width': `${layout.rightCollapsed ? 28 : layout.rightWidth}px`,
    '--jure-rig-pane-ratio': `${layout.rigPaneRatio * 100}%`,
  }) as CSSProperties, [layout]);

  return (
    <div className="app-shell workspace-shell" style={gridStyle}>
      <header className="topbar workspace-topbar">{topbar}</header>

      <aside ref={leftRef} className={`workspace-side left-panel ${layout.leftCollapsed ? 'collapsed' : ''}`}>
        {layout.leftCollapsed ? (
          <button className="panel-reopen left" title="Show navigator" onClick={() => setLayout((current) => ({ ...current, leftCollapsed: false }))}>›</button>
        ) : (
          <>
            <div className="workspace-left-stack">
              <div className="workspace-pane rig-pane">{rigPane}</div>
              <div className="workspace-splitter horizontal" role="separator" aria-orientation="horizontal" onPointerDown={beginVerticalResize} />
              <div className="workspace-pane source-pane">{sourcePane}</div>
            </div>
            <button className="panel-collapse left" title="Hide navigator" onClick={() => setLayout((current) => ({ ...current, leftCollapsed: true }))}>‹</button>
            <div className="workspace-splitter vertical left" role="separator" aria-orientation="vertical" onPointerDown={(event) => beginHorizontalResize('left', event)} />
          </>
        )}
      </aside>

      <main className="canvas-region">{viewport}</main>

      <aside className={`workspace-side right-panel ${layout.rightCollapsed ? 'collapsed' : ''}`}>
        {layout.rightCollapsed ? (
          <button className="panel-reopen right" title="Show inspector" onClick={() => setLayout((current) => ({ ...current, rightCollapsed: false }))}>‹</button>
        ) : (
          <>
            <div className="workspace-splitter vertical right" role="separator" aria-orientation="vertical" onPointerDown={(event) => beginHorizontalResize('right', event)} />
            <button className="panel-collapse right" title="Hide inspector" onClick={() => setLayout((current) => ({ ...current, rightCollapsed: true }))}>›</button>
            {inspector}
          </>
        )}
      </aside>

      <footer className="statusbar">{statusbar}</footer>
    </div>
  );
}
