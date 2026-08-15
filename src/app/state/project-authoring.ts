import { worldPoseToAuthoredPose, type TransformTarget } from '../../editor/transform-target.js';
import { setTransformTargetPose } from '../../features/rig-transform/command.js';
import type { RigidPose, RigDocument } from '../../kernel/types.js';
import {
  applyProjectCommand,
  beginProjectPreview,
  canRedoProject,
  canUndoProject,
  cancelProjectPreview,
  commitProjectPreview,
  createProjectSession,
  redoProject,
  undoProject,
  updateProjectPreview,
  visibleProject,
  type ProjectSession,
} from '../../project/session.js';
import { applyRigCommandToProject, setSourceInstancePose } from '../../project/commands.js';
import type { JureProjectModel } from '../../project/types.js';

export type ProjectAuthoringTransform =
  | { kind: 'rig'; target: TransformTarget }
  | { kind: 'source-instance'; sourceInstanceId: string };

export interface ProjectAuthoringState {
  session: ProjectSession;
  rigDocumentId: string;
  selectedRigTarget: TransformTarget | null;
  activeTransform: ProjectAuthoringTransform | null;
}

function rigDocument(project: JureProjectModel, rigDocumentId: string): RigDocument {
  const entry = project.authoredDocuments.find((candidate) => candidate.kind === 'rig' && candidate.document.documentId === rigDocumentId);
  if (!entry || entry.kind !== 'rig') throw new Error(`RigDocument ${rigDocumentId} not found in project.`);
  return entry.document;
}

function targetExists(document: RigDocument, target: TransformTarget | null): boolean {
  if (!target) return true;
  return target.kind === 'element'
    ? document.elements.some((element) => element.id === target.id)
    : document.frames.some((frame) => frame.id === target.id);
}

function sameTarget(a: TransformTarget, b: TransformTarget): boolean {
  return a.kind === b.kind && a.id === b.id;
}

function initialRigTarget(document: RigDocument): TransformTarget | null {
  const frame = document.frames[0];
  if (frame) return { kind: 'frame', id: frame.id };
  const element = document.elements[0];
  return element ? { kind: 'element', id: element.id } : null;
}

function assertRigTransformCompatible(state: ProjectAuthoringState, target: TransformTarget): void {
  if (!state.activeTransform) return;
  if (state.activeTransform.kind !== 'rig' || !sameTarget(state.activeTransform.target, target)) throw new Error('Another project authoring transform is already active. Commit or cancel it first.');
}

function assertSourceTransformCompatible(state: ProjectAuthoringState, sourceInstanceId: string): void {
  if (!state.activeTransform) return;
  if (state.activeTransform.kind !== 'source-instance' || state.activeTransform.sourceInstanceId !== sourceInstanceId) throw new Error('Another project authoring transform is already active. Commit or cancel it first.');
}

export function createProjectAuthoringState(
  project: JureProjectModel,
  rigDocumentId: string,
  selectedRigTarget?: TransformTarget | null,
): ProjectAuthoringState {
  const rig = rigDocument(project, rigDocumentId);
  const selected = selectedRigTarget === undefined ? initialRigTarget(rig) : selectedRigTarget;
  if (!targetExists(rig, selected)) throw new Error(`Initial rig target ${selected?.id ?? '<none>'} is not present in ${rigDocumentId}.`);
  return { session: createProjectSession(project), rigDocumentId, selectedRigTarget: selected, activeTransform: null };
}

export function replaceProjectAuthoringProject(project: JureProjectModel, rigDocumentId: string): ProjectAuthoringState {
  return createProjectAuthoringState(project, rigDocumentId);
}

export function visibleProjectAuthoringProject(state: ProjectAuthoringState): JureProjectModel {
  return visibleProject(state.session);
}

export function visibleProjectAuthoringRig(state: ProjectAuthoringState): RigDocument {
  return rigDocument(visibleProjectAuthoringProject(state), state.rigDocumentId);
}

export function selectProjectRigTarget(state: ProjectAuthoringState, target: TransformTarget | null): ProjectAuthoringState {
  if (!targetExists(visibleProjectAuthoringRig(state), target)) throw new Error(`Selected rig target ${target?.id ?? '<none>'} is not present in ${state.rigDocumentId}.`);
  return { ...state, selectedRigTarget: target };
}

export function beginProjectRigTransform(state: ProjectAuthoringState, target: TransformTarget): ProjectAuthoringState {
  assertRigTransformCompatible(state, target);
  if (state.activeTransform) return state;
  if (!targetExists(visibleProjectAuthoringRig(state), target)) throw new Error(`Rig target ${target.id} is not present in ${state.rigDocumentId}.`);
  return {
    ...state,
    selectedRigTarget: target,
    activeTransform: { kind: 'rig', target },
    session: beginProjectPreview(state.session, `Transform ${target.kind} ${target.id}`),
  };
}

export function previewProjectRigTransform(
  state: ProjectAuthoringState,
  target: TransformTarget,
  worldPose: RigidPose,
): ProjectAuthoringState {
  const startedState = state.activeTransform ? state : beginProjectRigTransform(state, target);
  assertRigTransformCompatible(startedState, target);
  const baselineRig = rigDocument(startedState.session.preview?.baseline ?? startedState.session.committed, state.rigDocumentId);
  const authoredPose = worldPoseToAuthoredPose(baselineRig, target, worldPose);
  return {
    ...startedState,
    selectedRigTarget: target,
    session: updateProjectPreview(startedState.session, applyRigCommandToProject(state.rigDocumentId, setTransformTargetPose(target, authoredPose))),
  };
}

export function commitProjectRigPose(
  state: ProjectAuthoringState,
  target: TransformTarget,
  authoredPose: RigidPose,
): ProjectAuthoringState {
  if (state.activeTransform) throw new Error('Cannot commit a numeric rig pose while another project authoring transform is active.');
  return {
    ...state,
    selectedRigTarget: target,
    session: applyProjectCommand(state.session, applyRigCommandToProject(state.rigDocumentId, setTransformTargetPose(target, authoredPose))),
  };
}

export function beginProjectSourceInstanceTransform(state: ProjectAuthoringState, sourceInstanceId: string): ProjectAuthoringState {
  assertSourceTransformCompatible(state, sourceInstanceId);
  if (state.activeTransform) return state;
  if (!visibleProjectAuthoringProject(state).sourceInstances.some((instance) => instance.id === sourceInstanceId)) throw new Error(`SourceInstance ${sourceInstanceId} not found in project.`);
  return {
    ...state,
    activeTransform: { kind: 'source-instance', sourceInstanceId },
    session: beginProjectPreview(state.session, `Transform SOURCE instance ${sourceInstanceId}`),
  };
}

export function previewProjectSourceInstanceTransform(
  state: ProjectAuthoringState,
  sourceInstanceId: string,
  worldPose: RigidPose,
): ProjectAuthoringState {
  const startedState = state.activeTransform ? state : beginProjectSourceInstanceTransform(state, sourceInstanceId);
  assertSourceTransformCompatible(startedState, sourceInstanceId);
  return {
    ...startedState,
    session: updateProjectPreview(startedState.session, setSourceInstancePose(sourceInstanceId, worldPose)),
  };
}

export function commitProjectAuthoringTransform(state: ProjectAuthoringState): ProjectAuthoringState {
  if (!state.activeTransform) return state;
  return { ...state, activeTransform: null, session: commitProjectPreview(state.session) };
}

export function cancelProjectAuthoringTransform(state: ProjectAuthoringState): ProjectAuthoringState {
  if (!state.activeTransform) return state;
  return { ...state, activeTransform: null, session: cancelProjectPreview(state.session) };
}

export function undoProjectAuthoring(state: ProjectAuthoringState): ProjectAuthoringState {
  if (state.activeTransform) return state;
  return { ...state, session: undoProject(state.session) };
}

export function redoProjectAuthoring(state: ProjectAuthoringState): ProjectAuthoringState {
  if (state.activeTransform) return state;
  return { ...state, session: redoProject(state.session) };
}

export function canUndoProjectAuthoring(state: ProjectAuthoringState): boolean {
  return !state.activeTransform && canUndoProject(state.session);
}

export function canRedoProjectAuthoring(state: ProjectAuthoringState): boolean {
  return !state.activeTransform && canRedoProject(state.session);
}
