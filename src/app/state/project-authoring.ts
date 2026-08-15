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
import { adoptSourceDatumAsFrame, type AdoptSourceDatumAsFrameInput } from '../../project/source-frame-adoption.js';
import type { JureProjectModel } from '../../project/types.js';

export type ProjectAuthoringOperation =
  | { kind: 'rig-transform'; target: TransformTarget }
  | { kind: 'source-instance-transform'; sourceInstanceId: string }
  | { kind: 'source-frame-adoption'; frameId: string; adoptionId: string };

export interface ProjectAuthoringState {
  session: ProjectSession;
  rigDocumentId: string;
  selectedRigTarget: TransformTarget | null;
  activeOperation: ProjectAuthoringOperation | null;
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

function assertNoOtherOperation(state: ProjectAuthoringState, expected?: ProjectAuthoringOperation): void {
  if (!state.activeOperation) return;
  if (expected?.kind === 'rig-transform' && state.activeOperation.kind === 'rig-transform' && sameTarget(expected.target, state.activeOperation.target)) return;
  if (expected?.kind === 'source-instance-transform' && state.activeOperation.kind === 'source-instance-transform' && expected.sourceInstanceId === state.activeOperation.sourceInstanceId) return;
  if (expected?.kind === 'source-frame-adoption' && state.activeOperation.kind === 'source-frame-adoption' && expected.adoptionId === state.activeOperation.adoptionId) return;
  throw new Error('Another project authoring operation is already active. Commit or cancel it first.');
}

export function createProjectAuthoringState(
  project: JureProjectModel,
  rigDocumentId: string,
  selectedRigTarget?: TransformTarget | null,
): ProjectAuthoringState {
  const rig = rigDocument(project, rigDocumentId);
  const selected = selectedRigTarget === undefined ? initialRigTarget(rig) : selectedRigTarget;
  if (!targetExists(rig, selected)) throw new Error(`Initial rig target ${selected?.id ?? '<none>'} is not present in ${rigDocumentId}.`);
  return { session: createProjectSession(project), rigDocumentId, selectedRigTarget: selected, activeOperation: null };
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
  const expected: ProjectAuthoringOperation = { kind: 'rig-transform', target };
  assertNoOtherOperation(state, expected);
  if (state.activeOperation) return state;
  if (!targetExists(visibleProjectAuthoringRig(state), target)) throw new Error(`Rig target ${target.id} is not present in ${state.rigDocumentId}.`);
  return {
    ...state,
    selectedRigTarget: target,
    activeOperation: expected,
    session: beginProjectPreview(state.session, `Transform ${target.kind} ${target.id}`),
  };
}

export function previewProjectRigTransform(state: ProjectAuthoringState, target: TransformTarget, worldPose: RigidPose): ProjectAuthoringState {
  const startedState = state.activeOperation ? state : beginProjectRigTransform(state, target);
  assertNoOtherOperation(startedState, { kind: 'rig-transform', target });
  const baselineRig = rigDocument(startedState.session.preview?.baseline ?? startedState.session.committed, state.rigDocumentId);
  const authoredPose = worldPoseToAuthoredPose(baselineRig, target, worldPose);
  return {
    ...startedState,
    selectedRigTarget: target,
    session: updateProjectPreview(startedState.session, applyRigCommandToProject(state.rigDocumentId, setTransformTargetPose(target, authoredPose))),
  };
}

export function commitProjectRigPose(state: ProjectAuthoringState, target: TransformTarget, authoredPose: RigidPose): ProjectAuthoringState {
  if (state.activeOperation) throw new Error('Cannot commit a numeric rig pose while another project authoring operation is active.');
  return {
    ...state,
    selectedRigTarget: target,
    session: applyProjectCommand(state.session, applyRigCommandToProject(state.rigDocumentId, setTransformTargetPose(target, authoredPose))),
  };
}

export function beginProjectSourceInstanceTransform(state: ProjectAuthoringState, sourceInstanceId: string): ProjectAuthoringState {
  const expected: ProjectAuthoringOperation = { kind: 'source-instance-transform', sourceInstanceId };
  assertNoOtherOperation(state, expected);
  if (state.activeOperation) return state;
  if (!visibleProjectAuthoringProject(state).sourceInstances.some((instance) => instance.id === sourceInstanceId)) throw new Error(`SourceInstance ${sourceInstanceId} not found in project.`);
  return {
    ...state,
    activeOperation: expected,
    session: beginProjectPreview(state.session, `Transform SOURCE instance ${sourceInstanceId}`),
  };
}

export function previewProjectSourceInstanceTransform(state: ProjectAuthoringState, sourceInstanceId: string, worldPose: RigidPose): ProjectAuthoringState {
  const startedState = state.activeOperation ? state : beginProjectSourceInstanceTransform(state, sourceInstanceId);
  assertNoOtherOperation(startedState, { kind: 'source-instance-transform', sourceInstanceId });
  return { ...startedState, session: updateProjectPreview(startedState.session, setSourceInstancePose(sourceInstanceId, worldPose)) };
}

export function beginProjectSourceFrameAdoption(state: ProjectAuthoringState, input: AdoptSourceDatumAsFrameInput): ProjectAuthoringState {
  if (input.rigDocumentId !== state.rigDocumentId) throw new Error(`Adoption targets ${input.rigDocumentId}, but the active rig is ${state.rigDocumentId}.`);
  const expected: ProjectAuthoringOperation = { kind: 'source-frame-adoption', frameId: input.frameId, adoptionId: input.adoptionId };
  assertNoOtherOperation(state, expected);
  if (state.activeOperation) return state;
  const started = beginProjectPreview(state.session, `Adopt SOURCE datum as frame ${input.frameId}`);
  return {
    ...state,
    activeOperation: expected,
    session: updateProjectPreview(started, adoptSourceDatumAsFrame(input)),
  };
}

export function commitProjectAuthoringOperation(state: ProjectAuthoringState): ProjectAuthoringState {
  if (!state.activeOperation) return state;
  return { ...state, activeOperation: null, session: commitProjectPreview(state.session) };
}

export function cancelProjectAuthoringOperation(state: ProjectAuthoringState): ProjectAuthoringState {
  if (!state.activeOperation) return state;
  return { ...state, activeOperation: null, session: cancelProjectPreview(state.session) };
}

export const commitProjectAuthoringTransform = commitProjectAuthoringOperation;
export const cancelProjectAuthoringTransform = cancelProjectAuthoringOperation;

export function undoProjectAuthoring(state: ProjectAuthoringState): ProjectAuthoringState {
  if (state.activeOperation) return state;
  return { ...state, session: undoProject(state.session) };
}

export function redoProjectAuthoring(state: ProjectAuthoringState): ProjectAuthoringState {
  if (state.activeOperation) return state;
  return { ...state, session: redoProject(state.session) };
}

export function canUndoProjectAuthoring(state: ProjectAuthoringState): boolean {
  return !state.activeOperation && canUndoProject(state.session);
}

export function canRedoProjectAuthoring(state: ProjectAuthoringState): boolean {
  return !state.activeOperation && canRedoProject(state.session);
}
