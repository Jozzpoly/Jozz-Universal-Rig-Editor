interface TopBarProps {
  projectId: string;
  documentId: string;
  revision: number;
  canUndo: boolean;
  canRedo: boolean;
  onOpenProject(): void;
  onImportRig(): void;
  onSave(): void;
  onSaveAs(): void;
  onOpenSource(): void;
  onUndo(): void;
  onRedo(): void;
}

export function TopBar({ projectId, documentId, revision, canUndo, canRedo, onOpenProject, onImportRig, onSave, onSaveAs, onOpenSource, onUndo, onRedo }: TopBarProps) {
  return (
    <>
      <div className="brand-block"><strong>JURE</strong><span>Rig Workbench</span></div>
      <div className="topbar-actions">
        <button onClick={onOpenProject}>Open Project</button>
        <button onClick={onImportRig}>Import Rig</button>
        <button onClick={onSave}>Save</button>
        <button onClick={onSaveAs}>Save As</button>
        <button onClick={onOpenSource}>Open Source</button>
      </div>
      <div className="document-chip" title={`${projectId} · ${documentId} · revision ${revision}`}>
        <span>{documentId}</span><small>{projectId} · rev {revision}</small>
      </div>
      <div className="history-actions">
        <button disabled={!canUndo} onClick={onUndo}>Undo</button>
        <button disabled={!canRedo} onClick={onRedo}>Redo</button>
      </div>
    </>
  );
}
