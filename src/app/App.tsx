import { useCallback, useMemo, useRef, useState } from 'react';
import { buildRigDisplayModel } from '../display/build-display-model.js';
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
import './styles.css';

interface FileState { handle: FileSystemFileHandle; baselineHash: string; name: string }

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
      setSelectedSourceLocator(null);
      setStatus(`SOURCE only: ${opened.name} · sha256 ${opened.sha256.slice(0, 12)}…`);
    } catch (error) { setStatus(error instanceof Error ? error.message : String(error)); }
  };

  const warningCount = resolved.diagnostics.filter((item) => item.severity === 'warning').length;
  const selectedPose = selectedElement?.pose ?? selectedFrame?.pose ?? null;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">Jozz Universal Rig Editor <span>F0</span></div>
        <div className="toolbar-group">
          <button onClick={handleOpenRig}>Open Rig</button>
          <button onClick={() => void handleSave()}>Save</button>
          <button onClick={() => void handleSaveAs()}>Save As</button>
          <button onClick={handleOpenSource}>Open Source</button>
        </div>
        <div className="toolbar-group">
          <button className={transformMode === 'translate' ? 'active' : ''} onClick={() => setTransformMode('translate')}>Move</button>
          <button className={transformMode === 'rotate' ? 'active' : ''} onClick={() => setTransformMode('rotate')}>Rotate</button>
          <button onClick={() => setTransformSpace((value) => value === 'world' ? 'local' : 'world')}>{transformSpace}</button>
        </div>
        <div className="toolbar-group views">
          {(['perspective', 'front', 'top', 'side'] as CameraPreset[]).map((preset) => <button key={preset} className={cameraPreset === preset ? 'active' : ''} onClick={() => setCameraPreset(preset)}>{preset}</button>)}
        </div>
        <div className="toolbar-group push-right">
          <button disabled={session.past.length === 0 || !!session.preview} onClick={() => setSession((current) => undo(current))}>Undo</button>
          <button disabled={session.future.length === 0 || !!session.preview} onClick={() => setSession((current) => redo(current))}>Redo</button>
        </div>
      </header>

      <aside className="left-panel">
        <div className="panel-title">Rig</div>
        <section>
          <h3>Elements</h3>
          {document.elements.map((element) => <button className={`tree-row ${selectedTarget?.kind === 'element' && selectedTarget.id === element.id ? 'selected' : ''}`} key={element.id} onClick={() => setSelectedTarget({ kind: 'element', id: element.id })}><span className="dot element-dot" />{element.name}</button>)}
        </section>
        <section>
          <h3>Frames</h3>
          {document.frames.map((frame) => <button className={`tree-row ${selectedTarget?.kind === 'frame' && selectedTarget.id === frame.id ? 'selected' : ''}`} key={frame.id} onClick={() => setSelectedTarget({ kind: 'frame', id: frame.id })}><span className="dot frame-dot" />{frame.name}<small>{frame.role ?? 'frame'}</small></button>)}
        </section>
        <section>
          <h3>Relations</h3>
          {document.relations.map((relation) => <div className="tree-row readonly" key={relation.id}><span className="dot relation-dot" />{relation.id}</div>)}
        </section>
        <section>
          <h3>Source layer</h3>
          {sourceAsset ? (
            <div className="source-card">
              <strong>{sourceAsset.name}</strong>
              <code>{sourceAsset.sha256}</code>
              <span>REFERENCE / NOT AUTHORED</span>
              <div className="source-summary">
                {sourceAsset.inspection.adapter.id} v{sourceAsset.inspection.adapter.version} · {sourceAsset.inspection.nodeCount} nodes · {sourceAsset.inspection.jointCount} joints · {sourceAsset.inspection.meshCount} meshes
              </div>
              <div className="source-node-list">
                {sourceAsset.inspection.nodes.slice(0, 24).map((node) => (
                  <button
                    type="button"
                    className={`source-node-row ${selectedSourceLocator === node.locator ? 'selected' : ''}`}
                    key={node.locator}
                    onClick={() => setSelectedSourceLocator(node.locator)}
                    title={node.worldRigidPose ? 'Select read-only SOURCE datum' : `Inspect only: ${node.rigidCompatibility}`}
                  >
                    <span>{node.name ?? `Node ${node.index}`}</span>
                    <code>{node.locator}</code>
                    <small>{node.isSkinJoint ? 'joint' : node.hasMesh ? 'mesh' : 'node'}{node.worldRigidPose ? '' : ` · ${node.rigidCompatibility}`}</small>
                  </button>
                ))}
                {sourceAsset.inspection.nodeCount > 24 ? <div className="source-node-more">+{sourceAsset.inspection.nodeCount - 24} more nodes</div> : null}
              </div>
            </div>
          ) : <div className="empty-copy">Open a local glTF/GLB. It stays transient until a future explicit adoption flow.</div>}
        </section>
      </aside>

      <main className="canvas-region">
        <RigViewport
          model={displayModel}
          selectedTarget={selectedTarget}
          cameraPreset={cameraPreset}
          transformMode={transformMode}
          transformSpace={transformSpace}
          sourceAssetUrl={sourceAsset?.objectUrl ?? null}
          sourceSelectionPose={sourceSelectionPose}
          viewRequest={viewRequest}
          onSelect={setSelectedTarget}
          onTransformStart={handleTransformStart}
          onTransformPreview={handleTransformPreview}
          onTransformCommit={handleTransformCommit}
          onTransformCancel={handleTransformCancel}
        />
        <div className="viewport-tools" aria-label="Viewport framing">
          <button disabled={!sourceSelectionPose} onClick={() => requestView('source-selection')}>Focus Source</button>
          <button disabled={!sourceAsset} onClick={() => requestView('source')}>Fit Source</button>
          <button onClick={() => requestView('rig')}>Fit Rig</button>
          <button disabled={!sourceAsset} onClick={() => requestView('all')}>Fit All</button>
        </div>
        <div className="viewport-hint">Authored selection and SOURCE selection are independent. SOURCE markers are read-only.</div>
      </main>

      <aside className="right-panel">
        <div className="panel-title">Inspector</div>
        {selectedElement && selectedPose ? (
          <>
            <div className="inspector-name">{selectedElement.name}</div>
            <dl className="meta-list">
              <dt>ID</dt><dd>{selectedElement.id}</dd>
              <dt>Kind</dt><dd>RigElement</dd>
              <dt>Source</dt><dd>{selectedElement.source?.locator ?? '—'}</dd>
              <dt>Truth</dt><dd>authored rigid element</dd>
            </dl>
            <h3>Rig-root position · m</h3>
            <div className="vector-grid">
              {(['x', 'y', 'z'] as const).map((axis) => (
                <label key={axis}><span>{axis.toUpperCase()}</span><input type="number" step="0.001" defaultValue={selectedPose.position[axis]} key={`${selectedElement.id}-${axis}-${selectedPose.position[axis]}`} onBlur={(event) => commitNumericPosition({ kind: 'element', id: selectedElement.id }, selectedPose, axis, Number(event.target.value))} /></label>
              ))}
            </div>
            <h3>Rig-root rotation · quaternion</h3>
            <div className="quat-readout">{Object.entries(selectedPose.rotation).map(([key, value]) => <div key={key}><span>{key.toUpperCase()}</span><code>{value.toFixed(6)}</code></div>)}</div>
            <div className="truth-note">The gizmo edits the whole element pose. Owned frames keep their local authored poses and follow the element in resolved world space.</div>
          </>
        ) : selectedFrame && selectedPose ? (
          <>
            <div className="inspector-name">{selectedFrame.name}</div>
            <dl className="meta-list">
              <dt>ID</dt><dd>{selectedFrame.id}</dd>
              <dt>Owner</dt><dd>{selectedFrame.ownerElementId ?? 'rig-root'}</dd>
              <dt>Role</dt><dd>{selectedFrame.role ?? '—'}</dd>
              <dt>Truth</dt><dd>{selectedFrame.provenance.kind}</dd>
            </dl>
            <h3>Local position · m</h3>
            <div className="vector-grid">
              {(['x', 'y', 'z'] as const).map((axis) => (
                <label key={axis}><span>{axis.toUpperCase()}</span><input type="number" step="0.001" defaultValue={selectedPose.position[axis]} key={`${selectedFrame.id}-${axis}-${selectedPose.position[axis]}`} onBlur={(event) => commitNumericPosition({ kind: 'frame', id: selectedFrame.id }, selectedPose, axis, Number(event.target.value))} /></label>
              ))}
            </div>
            <h3>Local rotation · quaternion</h3>
            <div className="quat-readout">{Object.entries(selectedPose.rotation).map(([key, value]) => <div key={key}><span>{key.toUpperCase()}</span><code>{value.toFixed(6)}</code></div>)}</div>
            <div className="truth-note">The gizmo edits this frame in its owner element's local authored space. View/camera/runtime state is not serialized.</div>
          </>
        ) : <div className="empty-copy">Select a RigElement or RigFrame to author its rigid pose.</div>}

        {selectedSourceNode ? (
          <div className="source-inspector">
            <div className="source-inspector-label">SOURCE DATUM · REFERENCE / NOT AUTHORED</div>
            <div className="inspector-name">{selectedSourceNode.name ?? `Node ${selectedSourceNode.index}`}</div>
            <dl className="meta-list">
              <dt>Locator</dt><dd>{selectedSourceNode.locator}</dd>
              <dt>Kind</dt><dd>{selectedSourceNode.isSkinJoint ? 'joint' : selectedSourceNode.hasMesh ? 'mesh' : 'node'}</dd>
              <dt>Rigid</dt><dd>{selectedSourceNode.rigidCompatibility}</dd>
              <dt>Authored</dt><dd>no</dd>
            </dl>
            {selectedSourceNode.worldRigidPose ? (
              <>
                <h3>Resolved SOURCE world position · m</h3>
                <div className="source-pose-readout">
                  {(['x', 'y', 'z'] as const).map((axis) => (
                    <div key={axis}><span>{axis.toUpperCase()}</span><code>{selectedSourceNode.worldRigidPose!.position[axis].toFixed(6)}</code></div>
                  ))}
                </div>
                <button className="source-focus-button" onClick={() => requestView('source-selection')}>Focus this SOURCE datum</button>
              </>
            ) : (
              <div className="truth-note source-warning">No rigid world pose is exposed for this node. JURE will not invent one from scaled/matrix/non-rigid ancestry.</div>
            )}
          </div>
        ) : null}
      </aside>

      <footer className="statusbar">
        <span>doc <strong>{document.documentId}</strong></span>
        <span>rev <strong>{session.committed.revision}</strong>{session.preview ? ' · PREVIEW' : ''}</span>
        <span className={warningCount ? 'warn' : 'ok'}>{warningCount} relation warning{warningCount === 1 ? '' : 's'}</span>
        <span className="status-message">{status}</span>
      </footer>
    </div>
  );
}
