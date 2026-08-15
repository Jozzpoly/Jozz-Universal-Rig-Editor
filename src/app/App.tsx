import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildRigDisplayModel } from '../display/build-display-model.js';
import { createRepresentationBindingDraft, evaluateRepresentationBindingPose, representationBindingMatchesSource, type RepresentationBindingDraft } from '../editor/representation-binding-draft.js';
import type { TransformTarget } from '../editor/transform-target.js';
import { SYNTHETIC_RIG } from '../fixtures/synthetic-rig.js';
import { resolveRigDocument } from '../kernel/resolve.js';
import type { RigidPose } from '../kernel/types.js';
import { openRigFile, saveRigFile, saveRigFileAs } from '../io/rig-file.js';
import { openSourceAsset } from '../io/source-file.js';
import type { CameraPreset, ViewFitTarget } from '../render/rig-viewport-controller.js';
import { RigViewport } from './RigViewport.js';
import {
  beginRigAuthoringTransform,
  canRedoRigAuthoring,
  canUndoRigAuthoring,
  cancelRigAuthoringTransform,
  commitRigAuthoringPose,
  commitRigAuthoringTransform,
  createRigAuthoringState,
  previewRigAuthoringTransform,
  redoRigAuthoring,
  replaceRigAuthoringDocument,
  selectRigAuthoringTarget,
  undoRigAuthoring,
  visibleRigAuthoringDocument,
} from './state/rig-authoring.js';
import { createSourceRuntimeState, replaceSourceRuntimeAsset, selectSourceRuntimeLocator } from './state/source-runtime.js';
import { InspectorPanel } from './workspace/InspectorPanel.js';
import { RigNavigator, type RigLayerVisibility } from './workspace/RigNavigator.js';
import { SourceNavigator, type SourceLayerVisibility } from './workspace/SourceNavigator.js';
import { TopBar } from './workspace/TopBar.js';
import { ViewportChrome } from './workspace/ViewportChrome.js';
import { WorkspaceShell } from './workspace/WorkspaceShell.js';
import './styles.css';
import './binding.css';

interface FileState { handle: FileSystemFileHandle; baselineHash: string; name: string }

const DEFAULT_RIG_LAYERS: RigLayerVisibility = { elements: true, frames: true, relations: true, bound: true };
const DEFAULT_SOURCE_LAYERS: SourceLayerVisibility = { geometry: true, datum: true };

export function App() {
  const [authoring, setAuthoring] = useState(() => createRigAuthoringState(SYNTHETIC_RIG, { kind: 'frame', id: 'frame.link.mount' }));
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('perspective');
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate'>('translate');
  const [transformSpace, setTransformSpace] = useState<'world' | 'local'>('world');
  const [fileState, setFileState] = useState<FileState | null>(null);
  const [sourceRuntime, setSourceRuntime] = useState(createSourceRuntimeState);
  const [representationBinding, setRepresentationBinding] = useState<RepresentationBindingDraft | null>(null);
  const [rigVisible, setRigVisible] = useState(true);
  const [rigLayers, setRigLayers] = useState<RigLayerVisibility>(DEFAULT_RIG_LAYERS);
  const [sourceVisible, setSourceVisible] = useState(true);
  const [sourceLayers, setSourceLayers] = useState<SourceLayerVisibility>(DEFAULT_SOURCE_LAYERS);
  const [viewRequest, setViewRequest] = useState<{ id: number; target: ViewFitTarget } | null>(null);
  const [status, setStatus] = useState('Synthetic fixture · unsaved');

  const session = authoring.session;
  const selectedTarget = authoring.selectedTarget;
  const sourceAsset = sourceRuntime.asset;
  const selectedSourceLocator = sourceRuntime.selectedLocator;

  useEffect(() => {
    const objectUrl = sourceAsset?.objectUrl ?? null;
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [sourceAsset?.objectUrl]);

  const document = visibleRigAuthoringDocument(authoring);
  const resolved = useMemo(() => resolveRigDocument(document), [document]);
  const displayModel = useMemo(() => buildRigDisplayModel(document, resolved, selectedTarget), [document, resolved, selectedTarget]);
  const visibleDisplayModel = useMemo(() => ({
    items: displayModel.items.filter((item) => {
      if (item.kind === 'element') return rigLayers.elements;
      if (item.kind === 'frame') return rigLayers.frames;
      return rigLayers.relations;
    }),
  }), [displayModel, rigLayers.elements, rigLayers.frames, rigLayers.relations]);

  const selectedElement = selectedTarget?.kind === 'element'
    ? document.elements.find((element) => element.id === selectedTarget.id) ?? null
    : null;
  const selectedFrame = selectedTarget?.kind === 'frame'
    ? document.frames.find((frame) => frame.id === selectedTarget.id) ?? null
    : null;
  const selectedSourceNode = sourceAsset?.inspection.nodes.find((node) => node.locator === selectedSourceLocator) ?? null;
  const sourceSelectionPose = selectedSourceNode?.worldRigidPose ?? null;
  const sourceGeometryVisible = sourceVisible && sourceLayers.geometry;
  const sourceDatumVisible = sourceVisible && sourceLayers.datum;

  const activeRepresentationBinding = useMemo(() => {
    if (!representationBinding || !sourceAsset) return null;
    if (!representationBindingMatchesSource(representationBinding, sourceAsset.sha256)) return null;
    const elementWorldPose = resolved.elementWorldPoses.get(representationBinding.elementId);
    if (!elementWorldPose) return null;
    return {
      sourceLocator: representationBinding.sourceLocator,
      sourceNodeIndex: representationBinding.sourceNodeIndex,
      worldPose: evaluateRepresentationBindingPose(representationBinding, elementWorldPose),
    };
  }, [representationBinding, sourceAsset, resolved]);

  const requestView = useCallback((target: ViewFitTarget) => {
    setViewRequest((current) => ({ id: (current?.id ?? 0) + 1, target }));
  }, []);

  const handleSelectTarget = useCallback((target: TransformTarget | null) => {
    setAuthoring((current) => selectRigAuthoringTarget(current, target));
  }, []);

  const handleSelectSourceLocator = useCallback((locator: string | null) => {
    setSourceRuntime((current) => selectSourceRuntimeLocator(current, locator));
  }, []);

  const handleTransformStart = useCallback((target: TransformTarget) => {
    setAuthoring((current) => beginRigAuthoringTransform(current, target));
  }, []);

  const handleTransformPreview = useCallback((target: TransformTarget, worldPose: RigidPose) => {
    setAuthoring((current) => previewRigAuthoringTransform(current, target, worldPose));
  }, []);

  const handleTransformCommit = useCallback((target: TransformTarget) => {
    setAuthoring((current) => commitRigAuthoringTransform(current));
    setStatus(`Authored ${target.kind} committed · unsaved`);
  }, []);

  const handleTransformCancel = useCallback((target: TransformTarget) => {
    setAuthoring((current) => cancelRigAuthoringTransform(current));
    setStatus(`${target.kind === 'element' ? 'Element' : 'Frame'} transform cancelled`);
  }, []);

  const commitPose = useCallback((target: TransformTarget, pose: RigidPose) => {
    setAuthoring((current) => commitRigAuthoringPose(current, target, pose));
    setStatus(`Authored ${target.kind} committed · unsaved`);
  }, []);

  const handleBindRepresentation = useCallback(() => {
    if (!sourceAsset || !selectedElement || !selectedSourceNode?.worldRigidPose || !selectedSourceNode.isSkinJoint) return;
    const elementWorldPose = resolved.elementWorldPoses.get(selectedElement.id);
    if (!elementWorldPose) return;

    setRepresentationBinding(createRepresentationBindingDraft({
      elementId: selectedElement.id,
      elementWorldPose,
      sourceSha256: sourceAsset.sha256,
      sourceLocator: selectedSourceNode.locator,
      sourceNodeIndex: selectedSourceNode.index,
      sourceWorldPose: selectedSourceNode.worldRigidPose,
    }));
    setStatus(`BIND-00 preview: ${selectedSourceNode.name ?? selectedSourceNode.locator} → ${selectedElement.name} · transient`);
  }, [sourceAsset, selectedElement, selectedSourceNode, resolved]);

  const handleClearRepresentationBinding = useCallback(() => {
    setRepresentationBinding(null);
    setStatus('BIND-00 representation preview cleared');
  }, []);

  const handleOpenRig = async () => {
    try {
      const opened = await openRigFile();
      setAuthoring(replaceRigAuthoringDocument(opened.document));
      setFileState({ handle: opened.handle, baselineHash: opened.baselineHash, name: opened.name });
      setRepresentationBinding(null);
      setStatus(`Opened ${opened.name}`);
    } catch (error) { setStatus(error instanceof Error ? error.message : String(error)); }
  };

  const handleSave = async () => {
    try {
      if (!fileState) { await handleSaveAs(); return; }
      const baselineHash = await saveRigFile(fileState.handle, fileState.baselineHash, session.committed);
      setFileState({ ...fileState, baselineHash });
      setStatus(representationBinding
        ? `Saved ${fileState.name} · BIND-00 preview remains transient / not saved`
        : `Saved ${fileState.name} · revision ${session.committed.revision}`);
    } catch (error) { setStatus(error instanceof Error ? error.message : String(error)); }
  };

  const handleSaveAs = async () => {
    try {
      const saved = await saveRigFileAs(session.committed);
      setFileState(saved);
      setStatus(representationBinding
        ? `Saved ${saved.name} · BIND-00 preview remains transient / not saved`
        : `Saved ${saved.name} · revision ${session.committed.revision}`);
    } catch (error) { setStatus(error instanceof Error ? error.message : String(error)); }
  };

  const handleOpenSource = async () => {
    try {
      const opened = await openSourceAsset();
      setSourceRuntime((current) => replaceSourceRuntimeAsset(current, opened));
      setSourceVisible(true);
      setRepresentationBinding(null);
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
          canUndo={canUndoRigAuthoring(authoring)}
          canRedo={canRedoRigAuthoring(authoring)}
          onOpenRig={handleOpenRig}
          onSave={() => void handleSave()}
          onSaveAs={() => void handleSaveAs()}
          onOpenSource={handleOpenSource}
          onUndo={() => setAuthoring((current) => undoRigAuthoring(current))}
          onRedo={() => setAuthoring((current) => redoRigAuthoring(current))}
        />
      )}
      rigPane={(
        <RigNavigator
          document={document}
          selectedTarget={selectedTarget}
          visible={rigVisible}
          layers={rigLayers}
          onVisibleChange={setRigVisible}
          onLayerChange={(layer, visible) => setRigLayers((current) => ({ ...current, [layer]: visible }))}
          onSelect={handleSelectTarget}
        />
      )}
      sourcePane={(
        <SourceNavigator
          sourceAsset={sourceAsset}
          selectedSourceLocator={selectedSourceLocator}
          visible={sourceVisible}
          layers={sourceLayers}
          onVisibleChange={setSourceVisible}
          onLayerChange={(layer, visible) => setSourceLayers((current) => ({ ...current, [layer]: visible }))}
          onSelect={handleSelectSourceLocator}
        />
      )}
      viewport={(
        <>
          <RigViewport
            model={visibleDisplayModel}
            rigVisible={rigVisible}
            selectedTarget={selectedTarget}
            cameraPreset={cameraPreset}
            transformMode={transformMode}
            transformSpace={transformSpace}
            sourceAssetUrl={sourceAsset?.objectUrl ?? null}
            sourceGeometryVisible={sourceGeometryVisible}
            sourceDatumVisible={sourceDatumVisible}
            sourceSelectionPose={sourceSelectionPose}
            representationBinding={activeRepresentationBinding}
            boundRepresentationVisible={rigVisible && rigLayers.bound}
            viewRequest={viewRequest}
            onSelect={handleSelectTarget}
            onTransformStart={handleTransformStart}
            onTransformPreview={handleTransformPreview}
            onTransformCommit={handleTransformCommit}
            onTransformCancel={handleTransformCancel}
          />
          <ViewportChrome
            cameraPreset={cameraPreset}
            transformMode={transformMode}
            transformSpace={transformSpace}
            hasRig={rigVisible && (visibleDisplayModel.items.length > 0 || Boolean(activeRepresentationBinding && rigLayers.bound))}
            hasSource={sourceGeometryVisible && Boolean(sourceAsset)}
            hasSourceSelection={sourceDatumVisible && Boolean(sourceSelectionPose)}
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
          representationBinding={representationBinding}
          onCommitPose={commitPose}
          onFocusSource={() => requestView('source-selection')}
          onBindRepresentation={handleBindRepresentation}
          onClearRepresentationBinding={handleClearRepresentationBinding}
        />
      )}
      statusbar={(
        <>
          <span>doc <strong>{document.documentId}</strong></span>
          <span>rev <strong>{session.committed.revision}</strong>{session.preview ? ' · PREVIEW' : ''}</span>
          <span className={warningCount ? 'warn' : 'ok'}>{warningCount} relation warning{warningCount === 1 ? '' : 's'}</span>
          {representationBinding ? <span className="binding-status">BIND preview · transient</span> : null}
          <span className="status-message">{status}</span>
        </>
      )}
    />
  );
}
