import { workspaceSearch } from './workspace-navigation.js';

interface TopBarProps {
  documentId: string;
  revision: number;
  canUndo: boolean;
  canRedo: boolean;
  onOpenRig(): void;
  onSave(): void;
  onSaveAs(): void;
  onOpenSource(): void;
  onUndo(): void;
  onRedo(): void;
}

export function TopBar({ documentId, revision, canUndo, canRedo, onOpenRig, onSave, onSaveAs, onOpenSource, onUndo, onRedo }: TopBarProps) {
  const switchToMap = () => {
    window.location.search = workspaceSearch(window.location.search, 'map');
  };

  return (
    <>
      <div className="brand-block"><strong>JURE</strong><span>Rig Workbench</span></div>
      <div className="topbar-actions">
        <button onClick={onOpenRig}>Open Rig</button>
        <button onClick={onSave}>Save</button>
        <button onClick={onSaveAs}>Save As</button>
        <button onClick={onOpenSource}>Open Source</button>
        <button onClick={switchToMap}>Map Workspace</button>
      </div>
      <div className="document-chip" title={`${documentId} · revision ${revision}`}>
        <span>{documentId}</span><small>rev {revision}</small>
      </div>
      <div className="history-actions">
        <button disabled={!canUndo} onClick={onUndo}>Undo</button>
        <button disabled={!canRedo} onClick={onRedo}>Redo</button>
      </div>
    </>
  );
}
