import {
  applyCommand,
  beginPreview,
  cancelPreview,
  commitPreview,
  createEditorSession,
  redo,
  undo,
  updatePreview,
  visibleDocument,
  type EditorSession,
} from '../../editor/session.js';
import { worldPoseToAuthoredPose, type TransformTarget } from '../../editor/transform-target.js';
import { setTransformTargetPose } from '../../features/rig-transform/command.js';
import type { RigidPose, RigDocument } from '../../kernel/types.js';

export interface RigAuthoringState {
  session: EditorSession;
  selectedTarget: TransformTarget | null;
}

export function initialRigTransformTarget(document: RigDocument): TransformTarget | null {
  const frame = document.frames[0];
  if (frame) return { kind: 'frame', id: frame.id };
  const element = document.elements[0];
  return element ? { kind: 'element', id: element.id } : null;
}

function targetExists(document: RigDocument, target: TransformTarget | null): boolean {
  if (!target) return true;
  return target.kind === 'element'
    ? document.elements.some((element) => element.id === target.id)
    : document.frames.some((frame) => frame.id === target.id);
}

export function createRigAuthoringState(document: RigDocument, selectedTarget: TransformTarget | null = initialRigTransformTarget(document)): RigAuthoringState {
  if (!targetExists(document, selectedTarget)) throw new Error(`Initial ${selectedTarget?.kind ?? 'target'} ${selectedTarget?.id ?? ''} is not present in the document.`);
  return { session: createEditorSession(document), selectedTarget };
}

export function replaceRigAuthoringDocument(document: RigDocument): RigAuthoringState {
  return createRigAuthoringState(document);
}

export function selectRigAuthoringTarget(state: RigAuthoringState, target: TransformTarget | null): RigAuthoringState {
  if (!targetExists(visibleDocument(state.session), target)) throw new Error(`Selected ${target?.kind ?? 'target'} ${target?.id ?? ''} is not present in the visible document.`);
  return { ...state, selectedTarget: target };
}

export function beginRigAuthoringTransform(state: RigAuthoringState, target: TransformTarget): RigAuthoringState {
  return { ...state, selectedTarget: target, session: beginPreview(state.session, `Transform ${target.kind} ${target.id}`) };
}

export function previewRigAuthoringTransform(state: RigAuthoringState, target: TransformTarget, worldPose: RigidPose): RigAuthoringState {
  const started = state.session.preview ? state.session : beginPreview(state.session, `Transform ${target.kind} ${target.id}`);
  const baseline = started.preview?.baseline ?? started.committed;
  const authoredPose = worldPoseToAuthoredPose(baseline, target, worldPose);
  return { ...state, selectedTarget: target, session: updatePreview(started, setTransformTargetPose(target, authoredPose)) };
}

export function commitRigAuthoringTransform(state: RigAuthoringState): RigAuthoringState {
  return { ...state, session: commitPreview(state.session) };
}

export function cancelRigAuthoringTransform(state: RigAuthoringState): RigAuthoringState {
  return { ...state, session: cancelPreview(state.session) };
}

export function commitRigAuthoringPose(state: RigAuthoringState, target: TransformTarget, pose: RigidPose): RigAuthoringState {
  return { ...state, selectedTarget: target, session: applyCommand(state.session, setTransformTargetPose(target, pose)) };
}

export function undoRigAuthoring(state: RigAuthoringState): RigAuthoringState {
  return { ...state, session: undo(state.session) };
}

export function redoRigAuthoring(state: RigAuthoringState): RigAuthoringState {
  return { ...state, session: redo(state.session) };
}

export function visibleRigAuthoringDocument(state: RigAuthoringState): RigDocument {
  return visibleDocument(state.session);
}

export function canUndoRigAuthoring(state: RigAuthoringState): boolean {
  return state.session.past.length > 0 && !state.session.preview;
}

export function canRedoRigAuthoring(state: RigAuthoringState): boolean {
  return state.session.future.length > 0 && !state.session.preview;
}
