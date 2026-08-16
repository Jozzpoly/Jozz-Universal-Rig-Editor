import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildRigDisplayModel } from '../display/build-display-model.js';
import type { TransformTarget } from '../editor/transform-target.js';
import { SYNTHETIC_RIG } from '../fixtures/synthetic-rig.js';
import { composePose } from '../kernel/math.js';
import { resolveRigDocument } from '../kernel/resolve.js';
import type { RigidPose } from '../kernel/types.js';
import { openJureProjectFile, saveJureProjectFile, saveJureProjectFileAs } from '../io/project-file.js';
import { openRigFile } from '../io/rig-file.js';
import { openSourceAsset } from '../io/source-file.js';
import { createJureRigProject } from '../project/create.js';
import type { JureProjectModel } from '../project/types.js';
import type { CameraPreset, ViewFitTarget } from '../render/rig-viewport-controller.js';
import { RigViewport } from './RigViewport.js';
import {
  applyProjectAuthoringCommand,
  beginProjectRigTransform,
  beginProjectSourceFrameAdoption,
  beginProjectSourceInstanceTransform,
  canRedoProjectAuthoring,
  canUndoProjectAuthoring,
  cancelProjectAuthoringOperation,
  commitProjectAuthoringOperation,
  commitProjectRigPose,
  createProjectAuthoringState,
  previewProjectRigTransform,
  previewProjectSourceInstanceTransform,
  redoProjectAuthoring,
  replaceProjectAuthoringProject,
  selectProjectRigTarget,
  undoProjectAuthoring,
  visibleProjectAuthoringProject,
  visibleProjectAuthoringRig,
} from './state/project-authoring.js';
import {
  activateProjectSourceInstance,
  createProjectSourceRuntimeState,
  linkExactSourceRuntimeAsset,
  linkedSourceRuntimeForInstance,
  reconcileProjectSourceRuntimeState,
  resolveExactPlacedSourceDatum,
  selectProjectSourceDatum,
  type ProjectSourceRuntimeState,
} from './state/project-source-runtime.js';
import { createProjectRigElement } from './state/rig-element-workflow.js';
import { allocateFrameAdoptionIds, planSourceOpen } from './state/source-workflow.js';
import { InspectorPanel } from './workspace/InspectorPanel.js';
import { RigNavigator, type RigLayerVisibility } from './workspace/RigNavigator.js';
import { SourceNavigator, type SourceAdoptionPreviewView, type SourceLayerVisibility } from './workspace/SourceNavigator.js';
import { TopBar } from './workspace/TopBar.js';
import { ViewportChrome } from './workspace/ViewportChrome.js';
import { WorkspaceShell } from './workspace/WorkspaceShell.js';
import './styles.css';

interface ProjectFileState { handle: FileSystemFileHandle; baselineHash: string; name: string }

const DEFAULT_RIG_LAYERS: RigLayerVisibility = { elements: true, frames: true, relations: true };
const DEFAULT_SOURCE_LAYERS: SourceLayerVisibility = { geometry: true, datum: true };
const INITIAL_PROJECT = createJureRigProject('project.synthetic', SYNTHETIC_RIG);

function firstRigDocumentId(project: JureProjectModel): string {
  const rig = project.authoredDocuments.find((entry) => entry.kind === 'rig');
  if (!rig || rig.kind !== 'rig') throw new Error('JURE project contains no authored RigDocument.');
  return rig.document.documentId;
}

function revokeRuntimeAssets(runtime: ProjectSourceRuntimeState): void {
  for (const asset of runtime.linkedAssets) URL.revokeObjectURL(asset.objectUrl);
}

export function App() {
  const [authoring, setAuthoring] = useState(() => createProjectAuthoringState(INITIAL_PROJECT, SYNTHETIC_RIG.documentId));
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('perspective');
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate'>('translate');
  const [transformSpace, setTransformSpace] = useState<'world' | 'local'>('world');
  const [fileState, setFileState] = useState<ProjectFileState | null>(null);
  const [sourceRuntime, setSourceRuntime] = useState(createProjectSourceRuntimeState);
  const sourceRuntimeRef = useRef(sourceRuntime);
  const [sourcePlacementEdit, setSourcePlacementEdit] = useState(false);
  const [rigVisible, setRigVisible] = useState(true);
  const [rigLayers, setRigLayers] = useState<RigLayerVisibility>(DEFAULT_RIG_LAYERS);
  const [sourceVisible, setSourceVisible] = useState(true);
  const [sourceLayers, setSourceLayers] = useState<SourceLayerVisibility>(DEFAULT_SOURCE_LAYERS);
  const [viewRequest, setViewRequest] = useState<{ id: number; target: ViewFitTarget } | null>(null);
  const [status, setStatus] = useState('Synthetic project fixture · unsaved');

  useEffect(() => { sourceRuntimeRef.current = sourceRuntime; }, [sourceRuntime]);
  useEffect(() => () => revokeRuntimeAssets(sourceRuntimeRef.current), []);

  const project = visibleProjectAuthoringProject(authoring);
  const document = visibleProjectAuthoringRig(authoring);
  const selectedTarget = authoring.selectedRigTarget;

  useEffect(() => {
    setSourceRuntime((current) => {
      let next = reconcileProjectSourceRuntimeState(current, project);
      if (!next.activeSourceInstanceId && project.sourceInstances.length === 1) {
        next = activateProjectSourceInstance(next, project, project.sourceInstances[0].id);
      }
      return next;
    });
  }, [project]);

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

  const activeSourceInstance = sourceRuntime.activeSourceInstanceId
    ? project.sourceInstances.find((instance) => instance.id === sourceRuntime.activeSourceInstanceId) ?? null
    : null;
  const sourceAsset = activeSourceInstance
    ? linkedSourceRuntimeForInstance(sourceRuntime, project, activeSourceInstance.id)
    : null;
  const sourceSelection = sourceRuntime.selection;
  const selectedSourceLocator = sourceSelection !== null
    && activeSourceInstance !== null
    && sourceSelection.sourceInstanceId === activeSourceInstance.id
    ? sourceSelection.locator
    : null;
  const selectedSourceNode = sourceAsset?.inspection.nodes.find((node) => node.locator === selectedSourceLocator) ?? null;
  const sourceSelectionPose = activeSourceInstance && selectedSourceNode?.worldRigidPose
    ? composePose(activeSourceInstance.pose, selectedSourceNode.worldRigidPose)
    : null;
  const sourceGeometryVisible = sourceVisible && sourceLayers.geometry;
  const sourceDatumVisible = sourceVisible && sourceLayers.datum;
  const sourcePlacement = activeSourceInstance && sourceAsset
    ? { sourceInstanceId: activeSourceInstance.id, pose: activeSourceInstance.pose, editActive: sourcePlacementEdit }
    : null;

  useEffect(() => {
    if (!activeSourceInstance || !sourceAsset) setSourcePlacementEdit(false);
  }, [activeSourceInstance?.id, sourceAsset?.sourceRevisionId]);

  const adoptionPreview: SourceAdoptionPreviewView | null = useMemo(() => {
    const operation = authoring.activeOperation;
    if (operation?.kind !== 'source-frame-adoption') return null;
    const frame = document.frames.find((candidate) => candidate.id === operation.frameId);
    if (!frame) return null;
    const owner = frame.ownerElementId ? document.elements.find((element) => element.id === frame.ownerElementId) ?? null : null;
    return { frameName: frame.name, ownerName: owner?.name ?? 'rig root' };
  }, [authoring.activeOperation, document]);

  const requestView = useCallback((target: ViewFitTarget) => {
    setViewRequest((current) => ({ id: (current?.id ?? 0) + 1, target }));
  }, []);

  const handleSelectTarget = useCallback((target: TransformTarget | null) => {
    setAuthoring((current) => selectProjectRigTarget(current, target));
  }, []);

  const handleCreateElement = useCallback((name: string) => {
    if (sourcePlacementEdit || authoring.activeOperation) {
      setStatus('Finish SOURCE placement and commit/cancel any active preview before creating an authored element.');
      return;
    }
    try {
      setAuthoring(createProjectRigElement(authoring, name));
      setStatus(`Created authored element "${name.trim()}" · unsaved`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  }, [authoring, sourcePlacementEdit]);

  const handleSelectSourceLocator = useCallback((locator: string) => {
    if (!activeSourceInstance) return;
    if (authoring.activeOperation?.kind === 'source-frame-adoption') {
      setStatus('Commit or cancel the active frame adoption preview before changing SOURCE selection.');
      return;
    }
    try {
      setSourceRuntime(selectProjectSourceDatum(sourceRuntime, project, activeSourceInstance.id, locator));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  }, [activeSourceInstance, authoring.activeOperation, project, sourceRuntime]);

  const handleTransformStart = useCallback((target: TransformTarget) => {
    setAuthoring((current) => beginProjectRigTransform(current, target));
  }, []);

  const handleTransformPreview = useCallback((target: TransformTarget, worldPose: RigidPose) => {
    setAuthoring((current) => previewProjectRigTransform(current, target, worldPose));
  }, []);

  const handleTransformCommit = useCallback((target: TransformTarget) => {
    setAuthoring((current) => commitProjectAuthoringOperation(current));
    setStatus(`Authored ${target.kind} committed to project history · unsaved`);
  }, []);

  const handleTransformCancel = useCallback((target: TransformTarget) => {
    setAuthoring((current) => cancelProjectAuthoringOperation(current));
    setStatus(`${target.kind === 'element' ? 'Element' : 'Frame'} transform cancelled`);
  }, []);

  const handleSourceTransformStart = useCallback((sourceInstanceId: string) => {
    setAuthoring((current) => beginProjectSourceInstanceTransform(current, sourceInstanceId));
  }, []);

  const handleSourceTransformPreview = useCallback((sourceInstanceId: string, worldPose: RigidPose) => {
    setAuthoring((current) => previewProjectSourceInstanceTransform(current, sourceInstanceId, worldPose));
  }, []);

  const handleSourceTransformCommit = useCallback((sourceInstanceId: string) => {
    setAuthoring((current) => commitProjectAuthoringOperation(current));
    setStatus(`SOURCE placement ${sourceInstanceId} committed · unsaved`);
  }, []);

  const handleSourceTransformCancel = useCallback((sourceInstanceId: string) => {
    setAuthoring((current) => cancelProjectAuthoringOperation(current));
    setStatus(`SOURCE placement ${sourceInstanceId} cancelled`);
  }, []);

  const commitPose = useCallback((target: TransformTarget, pose: RigidPose) => {
    if (sourcePlacementEdit || authoring.activeOperation) {
      setStatus('Finish SOURCE placement and commit/cancel any active preview before numeric authored editing.');
      return;
    }
    setAuthoring((current) => commitProjectRigPose(current, target, pose));
    setStatus(`Authored ${target.kind} committed · unsaved`);
  }, [authoring.activeOperation, sourcePlacementEdit]);

  const handleToggleSourcePlacement = useCallback(() => {
    if (!activeSourceInstance || !sourceAsset) return;
    if (authoring.activeOperation) {
      setStatus('Commit or cancel the active project operation before changing placement edit mode.');
      return;
    }
    setSourcePlacementEdit((current) => !current);
    setStatus(sourcePlacementEdit ? 'SOURCE placement editing finished' : `SOURCE placement editing: ${activeSourceInstance.name}`);
  }, [activeSourceInstance, sourceAsset, authoring.activeOperation, sourcePlacementEdit]);

  const handlePreviewAdoption = useCallback(() => {
    if (!activeSourceInstance || !selectedSourceLocator || !selectedSourceNode || !selectedElement || sourcePlacementEdit || authoring.activeOperation) return;
    try {
      const sourceDatum = resolveExactPlacedSourceDatum(sourceRuntime, project, activeSourceInstance.id, selectedSourceLocator);
      const frameName = selectedSourceNode.name ?? `Source node ${selectedSourceNode.index}`;
      const ids = allocateFrameAdoptionIds(project, document.documentId, frameName);
      setAuthoring((current) => beginProjectSourceFrameAdoption(current, {
        rigDocumentId: document.documentId,
        frameId: ids.frameId,
        frameName,
        ownerElementId: selectedElement.id,
        adoptionId: ids.adoptionId,
        sourceDatum,
      }));
      setStatus(`Frame adoption preview: ${frameName} → ${selectedElement.name}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  }, [activeSourceInstance, selectedSourceLocator, selectedSourceNode, selectedElement, sourcePlacementEdit, authoring.activeOperation, sourceRuntime, project, document.documentId]);

  const handleCommitAdoption = useCallback(() => {
    const operation = authoring.activeOperation;
    if (operation?.kind !== 'source-frame-adoption') return;
    setAuthoring((current) => {
      const committed = commitProjectAuthoringOperation(current);
      return selectProjectRigTarget(committed, { kind: 'frame', id: operation.frameId });
    });
    setStatus(`Adopted SOURCE datum as authored frame ${operation.frameId} · unsaved`);
  }, [authoring.activeOperation]);

  const handleCancelAdoption = useCallback(() => {
    if (authoring.activeOperation?.kind !== 'source-frame-adoption') return;
    setAuthoring((current) => cancelProjectAuthoringOperation(current));
    setStatus('Frame adoption preview cancelled');
  }, [authoring.activeOperation]);

  const resetRuntimeForProject = useCallback((nextProject: JureProjectModel) => {
    revokeRuntimeAssets(sourceRuntimeRef.current);
    let nextRuntime = createProjectSourceRuntimeState();
    if (nextProject.sourceInstances.length > 0) nextRuntime = activateProjectSourceInstance(nextRuntime, nextProject, nextProject.sourceInstances[0].id);
    setSourceRuntime(nextRuntime);
    setSourcePlacementEdit(false);
  }, []);

  const handleOpenProject = async () => {
    if (authoring.activeOperation) { setStatus('Commit or cancel the active preview before opening another project.'); return; }
    try {
      const opened = await openJureProjectFile();
      const rigDocumentId = firstRigDocumentId(opened.project);
      setAuthoring(replaceProjectAuthoringProject(opened.project, rigDocumentId));
      setFileState({ handle: opened.handle, baselineHash: opened.baselineHash, name: opened.name });
      resetRuntimeForProject(opened.project);
      setStatus(opened.project.sourceInstances.length > 0
        ? `Opened ${opened.name} · SOURCE instances restored; exact bytes require relink`
        : `Opened ${opened.name}`);
    } catch (error) { setStatus(error instanceof Error ? error.message : String(error)); }
  };

  const handleImportRig = async () => {
    if (authoring.activeOperation) { setStatus('Commit or cancel the active preview before importing another rig.'); return; }
    try {
      const opened = await openRigFile();
      const nextProject = createJureRigProject(`project.${opened.document.documentId}`, opened.document);
      setAuthoring(replaceProjectAuthoringProject(nextProject, opened.document.documentId));
      setFileState(null);
      resetRuntimeForProject(nextProject);
      setStatus(`Imported legacy rig ${opened.name} into a new unsaved JURE project`);
    } catch (error) { setStatus(error instanceof Error ? error.message : String(error)); }
  };

  const handleSaveAs = async () => {
    if (authoring.activeOperation) { setStatus('Commit or cancel the active preview before saving.'); return; }
    try {
      const saved = await saveJureProjectFileAs(authoring.session.committed);
      setFileState(saved);
      setStatus(`Saved project ${saved.name}`);
    } catch (error) { setStatus(error instanceof Error ? error.message : String(error)); }
  };

  const handleSave = async () => {
    if (authoring.activeOperation) { setStatus('Commit or cancel the active preview before saving.'); return; }
    try {
      if (!fileState) { await handleSaveAs(); return; }
      const baselineHash = await saveJureProjectFile(fileState.handle, fileState.baselineHash, authoring.session.committed);
      setFileState({ ...fileState, baselineHash });
      setStatus(`Saved project ${fileState.name}`);
    } catch (error) { setStatus(error instanceof Error ? error.message : String(error)); }
  };

  const handleOpenSource = async () => {
    if (authoring.activeOperation) { setStatus('Commit or cancel the active preview before opening or relinking SOURCE.'); return; }
    let opened: Awaited<ReturnType<typeof openSourceAsset>> | null = null;
    try {
      opened = await openSourceAsset();
      const plan = planSourceOpen(authoring.session.committed, sourceRuntime.activeSourceInstanceId, {
        name: opened.name,
        sha256: opened.sha256,
        adapter: opened.inspection.adapter,
      });
      const nextAuthoring = plan.command ? applyProjectAuthoringCommand(authoring, plan.command) : authoring;
      const nextProject = nextAuthoring.session.committed;
      let nextRuntime = linkExactSourceRuntimeAsset(sourceRuntime, nextProject, plan.revision.id, opened);
      nextRuntime = activateProjectSourceInstance(nextRuntime, nextProject, plan.sourceInstance.id);
      const previousAsset = sourceRuntime.linkedAssets.find((asset) => asset.sourceRevisionId === plan.revision.id);
      if (previousAsset && previousAsset.objectUrl !== opened.objectUrl) URL.revokeObjectURL(previousAsset.objectUrl);

      setAuthoring(nextAuthoring);
      setSourceRuntime(nextRuntime);
      setSourceVisible(true);
      setSourcePlacementEdit(false);
      setStatus(plan.kind === 'relink'
        ? `Relinked exact SOURCE bytes for ${plan.sourceInstance.name} · project truth unchanged`
        : `Added SOURCE instance ${plan.sourceInstance.name} · exact ${opened.sha256.slice(0, 12)}… · unsaved`);
      opened = null;
    } catch (error) {
      if (opened) URL.revokeObjectURL(opened.objectUrl);
      setStatus(error instanceof Error ? error.message : String(error));
    }
  };

  const warningCount = resolved.diagnostics.filter((item) => item.severity === 'warning').length;
  const selectedPose = selectedElement?.pose ?? selectedFrame?.pose ?? null;
  const adoptionTargetName = !authoring.activeOperation && !sourcePlacementEdit && selectedElement && selectedSourceNode?.worldRigidPose && selectedSourceNode.rigidCompatibility === 'rigid'
    ? selectedElement.name
    : null;

  return (
    <WorkspaceShell
      topbar={(
        <TopBar
          projectId={project.projectId}
          documentId={document.documentId}
          revision={document.revision}
          canUndo={canUndoProjectAuthoring(authoring)}
          canRedo={canRedoProjectAuthoring(authoring)}
          onOpenProject={() => void handleOpenProject()}
          onImportRig={() => void handleImportRig()}
          onSave={() => void handleSave()}
          onSaveAs={() => void handleSaveAs()}
          onOpenSource={() => void handleOpenSource()}
          onUndo={() => setAuthoring((current) => undoProjectAuthoring(current))}
          onRedo={() => setAuthoring((current) => redoProjectAuthoring(current))}
        />
      )}
      rigPane={(
        <RigNavigator
          document={document}
          selectedTarget={selectedTarget}
          visible={rigVisible}
          layers={rigLayers}
          createDisabled={sourcePlacementEdit || Boolean(authoring.activeOperation)}
          onVisibleChange={setRigVisible}
          onLayerChange={(layer, visible) => setRigLayers((current) => ({ ...current, [layer]: visible }))}
          onSelect={handleSelectTarget}
          onCreateElement={handleCreateElement}
        />
      )}
      sourcePane={(
        <SourceNavigator
          sourceAsset={sourceAsset}
          sourceInstance={activeSourceInstance}
          selectedSourceLocator={selectedSourceLocator}
          placementEditActive={sourcePlacementEdit}
          placementEditDisabled={Boolean(authoring.activeOperation)}
          adoptionTargetName={adoptionTargetName}
          adoptionPreview={adoptionPreview}
          visible={sourceVisible}
          layers={sourceLayers}
          onVisibleChange={setSourceVisible}
          onLayerChange={(layer, visible) => setSourceLayers((current) => ({ ...current, [layer]: visible }))}
          onTogglePlacementEdit={handleToggleSourcePlacement}
          onPreviewAdoption={handlePreviewAdoption}
          onCommitAdoption={handleCommitAdoption}
          onCancelAdoption={handleCancelAdoption}
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
            sourcePlacement={sourcePlacement}
            sourceGeometryVisible={sourceGeometryVisible}
            sourceDatumVisible={sourceDatumVisible}
            sourceSelectionPose={sourceSelectionPose}
            viewRequest={viewRequest}
            onSelect={handleSelectTarget}
            onTransformStart={handleTransformStart}
            onTransformPreview={handleTransformPreview}
            onTransformCommit={handleTransformCommit}
            onTransformCancel={handleTransformCancel}
            onSourceTransformStart={handleSourceTransformStart}
            onSourceTransformPreview={handleSourceTransformPreview}
            onSourceTransformCommit={handleSourceTransformCommit}
            onSourceTransformCancel={handleSourceTransformCancel}
          />
          <ViewportChrome
            cameraPreset={cameraPreset}
            transformMode={transformMode}
            transformSpace={transformSpace}
            hasRig={rigVisible && visibleDisplayModel.items.length > 0}
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
          selectedSourceWorldPose={sourceSelectionPose}
          sourceInstanceName={activeSourceInstance?.name ?? null}
          onCommitPose={commitPose}
          onFocusSource={() => requestView('source-selection')}
        />
      )}
      statusbar={(
        <>
          <span>project <strong>{project.projectId}</strong></span>
          <span>rig <strong>{document.documentId}</strong> · rev <strong>{document.revision}</strong>{authoring.session.preview ? ' · PREVIEW' : ''}</span>
          <span className={warningCount ? 'warn' : 'ok'}>{warningCount} relation warning{warningCount === 1 ? '' : 's'}</span>
          {sourcePlacementEdit && activeSourceInstance ? <span className="binding-status">SOURCE placement · {activeSourceInstance.name}</span> : null}
          {authoring.activeOperation?.kind === 'source-frame-adoption' ? <span className="binding-status">ADOPTION preview · transient</span> : null}
          <span className="status-message">{status}</span>
        </>
      )}
    />
  );
}
