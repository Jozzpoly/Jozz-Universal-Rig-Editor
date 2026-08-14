import { useCallback, useMemo, useRef, useState } from 'react';
import { buildRigDisplayModel } from '../display/build-display-model.js';
import type { RigDisplayModel } from '../display/types.js';
import { applyCommand, beginPreview, cancelPreview, commitPreview, createEditorSession, redo, undo, updatePreview, visibleDocument, type EditorSession } from '../editor/session.js';
import { worldPoseToAuthoredPose, type TransformTarget } from '../editor/transform-target.js';
import { setTransformTargetPose } from '../features/rig-transform/command.js';
import { SYNTHETIC_RIG } from '../fixtures/synthetic-rig.js';
import { resolveRigDocument } from '../kernel/resolve.js';
import type { RigidPose, RigDocument } from '../kernel/types.js';
import { openRigFile, saveRigFile, saveRigFileAs } from '../io/rig-file.js';
import { openSourceAsset, type OpenSourceAsset } from '../io/source-file.js';
import type { CameraPreset, ViewFitTarget } from '../render/rig-viewport-controller.js';
import { RigViewport } from './RigViewport.js';
import { InspectorPanel } from './workspace/InspectorPanel.js';
import { RigNavigator } from './workspace/RigNavigator.js';
import { SourceNavigator } from './workspace/SourceNavigator.js';
import { TopBar } from './workspace/TopBar.js';
import { ViewportChrome } from './workspace/ViewportChrome.js';
import { WorkspaceShell } from './workspace/WorkspaceShell.js';
import './styles.css';

interface FileState { handle: FileSystemFileHandle; baselineHash: string; name: string }

const EMPTY_DISPLAY_MODEL: RigDisplayModel = { items: [] };

function initialTransformTarget(document: RigDocument): TransformTarget | null {
  const frame = document.frames[0];
  if (frame) return { kind: 'frame', id: frame.id };
  const element = document.elements[0];
  return element ? { kind: 'element', id: element.id } : null;
}

export function App() {
  const [session, setSession] = useState<EditorSession>(() => createEditorSession(SYNTHETIC_RIG));
  const [selectedTarget, setSelectedTarget] = useState<TransformTarget | null>({ kind: 'frame', id: 'frame.link.mount' });
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('perspective');
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate'>('translate');
  const [transformSpace, setTransformSpace] = useState<'world' | 'local'>('world');
  const [fileState, setFileState] = useState<FileState | null>(null);
  const [sourceAsset, setSourceAsset] = useState<OpenSourceAsset | null>(null);
  const [selectedSourceLocator, setSelectedSourceLocator] = useState<string | null>(null);
  const [rigVisible, setRigVisible] = useState(true);
  const [sourceVisible, setSourceVisible] = useState(true);
  const [viewRequest, setViewRequest] = useState<{ id: number; target: ViewFitTarget } | null>(null);
  const [status, setStatus] = useState('Synthetic fixture · unsaved');
  const sourceUrlRef = useRef<string | null>(null);

  const document = visibleDocument(session);
  const resolved = useMemo(() => resolveRigDocument(document), [document]);
  const displayModel = useMemo(() => buildRigDisplayModel(document, resolved, selectedTarget), [document, resolved, selectedTarget]);
  const selectedElement = selectedTarget?.kind === 'element'
    ? document.elements.find((element) => element.id === selectedTarget.id) ?? null
    : null;
  const selectedFrame = selectedTarget?.kind === 'frame'
    ? document.frames.find((frame) => frame.id === selectedTarget.id) ?? null
    : null;
  const selectedSourceNode = sourceAsset?.inspection.nodes.find((node) => node.locator === selectedSourceLocator) ?? null;
  const sourceSelectionPose = selectedSourceNode?.worldRigidPose ?? null;

  const requestView = useCallback((target: ViewFitTarget) => {
    setViewRequest((current) => ({ id: (current?.id ?? 0) + 1, target }));
  }, []);

  const handleTransformStart = useCallback((target: TransformTarget) => {
    setSession((current) => beginPreview(current, `Transform ${target.kind} ${target.id}`));
  }, []);

  const handleTransformPreview = useCallback((target: TransformTarget, worldPose: RigidPose) => {
    setSession((current) => {
      const started = current.preview ? current : beginPreview(current, `Transform ${target.kind} ${target.id}`);
      const baseline = started.preview?.baseline ?? started.committed;
      const authoredPose = worldPoseToAuthoredPose(baseline, target, worldPose);
      return updatePreview(started, setTransformTargetPose(target, authoredPose));
    });
  }, []);

  const handleTransformCommit = useCallback((target: TransformTarget) => {
    setSession((current) => commitPreview(current));
    setStatus(`Authored ${target.kind} committed · unsaved`);
  }, []);

  const handleTransformCancel = useCallback((target: TransformTarget) => {
    setSession((current) => cancelPreview(current));
    setStatus(`${target.kind === 'element' ? 'Element' : 'Frame'} transform cancelled`);
  }, []);

  const commitNumericPosition = useCallback((target: TransformTarget, pose: RigidPose, axis: 'x' | 'y' | 'z', value: number) => {
    if (!Number.isFinite(value)) return;
    const nextPose = { ...pose, position: { ...pose.position, [axis]: value } };
    setSession((current) => applyCommand(current, setTransformTargetPose(target, nextPose)));
    setStatus(`Authored ${target.kind} committed · unsaved`);
  }, []);

  const handleOpenRig = async () => {
    try {
      const opened = await openRigFile();
      setSession(createEditorSession(opened.document));
      setFileState({ handle: opened.handle, baselineHash: opened.baselineHash, name: opened.name });
      setSelectedTarget(initialTransformTarget(opened.document));
      setStatus(`Opened ${opened.name}`);
    } catch (error) { setStatus(error instanceof Error ? error.message : String(error)); }
  };

  const handleSave = async () => {
    try {
      if (!fileState) { await handleSaveAs(); return; }
      const baselineHash = await saveRigFile(fileState.handle, fileState.baselineHash, session.committed);
      setFileState({ ...fileState, baselineHash });
      setStatus(`Saved ${fileState.name} · revision ${session.committed.revision}`);
    } catch (error) { setStatus(error instanceof Error ? error.message : String(error)); }
  };

  const handleSaveAs = async () => {
    try {
      const saved = await saveRigFileAs(session.committed);
      setFileState(saved);
      setStatus(`Saved ${saved.name} · revision ${session.committed.revision}`);
    } catch (error) { setStatus(error instanceof Error ? error.message : String(error)); }
  };

  const handleOpenSource = async () => {
    try {
      if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
      const opened = await openSourceAsset();
      sourceUrlRef.current = opened.objectUrl;
      setSourceAsset(opened);
      setSourceVisible(true);
      setSelectedSourceLocator(null);
      setStatus(`SOURCE only: ${opened.name} · sha256 ${opened.sha256.slice(0, 12)}…`);
    } catch (error) { setStatus(error instanceof Error ? error.message : String(error)); }
  };

  const warningCount = resolved.diagnostics.filter((item) => item.severity === 'warning').length;
  const selectedPose = selectedElement?.pose ?? selectedFrame?.pose ?? null;

  return (
    <WorkspaceShell
      topbar={(
        <TopBar
          documentId={document.documentId}
          revision={session.committed.revision}
          canUndo={session.past.length > 0 && !session.preview}
          canRedo={session.future.length > 0 && !session.preview}
          onOpenRig={handleOpenRig}
          onSave={() => void handleSave()}
          onSaveAs={() => void handleSaveAs()}
          onOpenSource={handleOpenSource}
          onUndo={() => setSession((current) => undo(current))}
          onRedo={() => setSession((current) => redo(current))}
        />
      )}
      rigPane={(
        <RigNavigator
          document={document}
          selectedTarget={selectedTarget}
          visible={rigVisible}
          onVisibleChange={setRigVisible}
          onSelect={setSelectedTarget}
        />
      )}
      sourcePane={(
        <SourceNavigator
          sourceAsset={sourceAsset}
          selectedSourceLocator={selectedSourceLocator}
          visible={sourceVisible}
          onVisibleChange={setSourceVisible}
          onSelect={setSelectedSourceLocator}
        />
      )}
      viewport={(
        <>
          <RigViewport
            model={rigVisible ? displayModel : EMPTY_DISPLAY_MODEL}
            selectedTarget={selectedTarget}
            cameraPreset={cameraPreset}
            transformMode={transformMode}
            transformSpace={transformSpace}
            sourceAssetUrl={sourceVisible ? sourceAsset?.objectUrl ?? null : null}
            sourceSelectionPose={sourceVisible ? sourceSelectionPose : null}
            viewRequest={viewRequest}
            onSelect={setSelectedTarget}
            onTransformStart={handleTransformStart}
            onTransformPreview={handleTransformPreview}
            onTransformCommit={handleTransformCommit}
            onTransformCancel={handleTransformCancel}
          />
          <ViewportChrome
            cameraPreset={cameraPreset}
            transformMode={transformMode}
            transformSpace={transformSpace}
            hasSource={Boolean(sourceAsset)}
            hasSourceSelection={Boolean(sourceSelectionPose)}
            onCameraPreset={setCameraPreset}
            onTransformMode={setTransformMode}
            onToggleTransformSpace={() => setTransformSpace((value) => value === 'world' ? 'local' : 'world')}
            onFit={requestView}
          />
        </>
      )}
      inspector={(
        <InspectorPanel
          selectedElement={selectedElement}
          selectedFrame={selectedFrame}
          selectedPose={selectedPose}
          selectedSourceNode={selectedSourceNode}
          onCommitNumericPosition={commitNumericPosition}
          onFocusSource={() => requestView('source-selection')}
        />
      )}
      statusbar={(
        <>
          <span>doc <strong>{document.documentId}</strong></span>
          <span>rev <strong>{session.committed.revision}</strong>{session.preview ? ' · PREVIEW' : ''}</span>
          <span className={warningCount ? 'warn' : 'ok'}>{warningCount} relation warning{warningCount === 1 ? '' : 's'}</span>
          <span className="status-message">{status}</span>
        </>
      )}
    />
  );
}
