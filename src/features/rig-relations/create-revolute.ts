import type { RigCommand } from '../../editor/rig-command.js';
import { measureRevoluteFrameResidual } from '../../kernel/relation-frame.js';
import { resolveRigDocument } from '../../kernel/resolve.js';
import type { RevoluteRelation, RigDocument } from '../../kernel/types.js';

export interface CreateRevoluteRelationInput {
  id: string;
  frameA: string;
  frameB: string;
  limits?: {
    lowerRad: number;
    upperRad: number;
  };
}

export interface RevoluteCandidateInspection {
  frameA: string;
  frameB: string;
  ownerA: string | null;
  ownerB: string | null;
  originResidualM: number;
  axisAngleRad: number;
  axisDot: number;
  existingRelationId: string | null;
}

function documentHasId(document: RigDocument, id: string): boolean {
  return document.sources.some((source) => source.id === id)
    || document.elements.some((element) => element.id === id)
    || document.frames.some((frame) => frame.id === id)
    || document.relations.some((relation) => relation.id === id);
}

function finiteLimit(value: number, label: string): number {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite.`);
  return value;
}

export function inspectRevoluteCandidate(document: RigDocument, frameAId: string, frameBId: string): RevoluteCandidateInspection {
  const frameA = document.frames.find((frame) => frame.id === frameAId);
  const frameB = document.frames.find((frame) => frame.id === frameBId);
  if (!frameA) throw new Error(`Revolute frameA ${frameAId} not found.`);
  if (!frameB) throw new Error(`Revolute frameB ${frameBId} not found.`);
  if (frameA.id === frameB.id) throw new Error('Revolute candidate requires two distinct frames.');

  const resolved = resolveRigDocument(document);
  const frameAWorld = resolved.frameWorldPoses.get(frameA.id);
  const frameBWorld = resolved.frameWorldPoses.get(frameB.id);
  if (!frameAWorld || !frameBWorld) throw new Error('Revolute candidate could not resolve both authored frame poses.');
  const residual = measureRevoluteFrameResidual(frameAWorld, frameBWorld);
  const existing = document.relations.find((relation) => relation.type === 'revolute'
    && ((relation.frameA === frameA.id && relation.frameB === frameB.id)
      || (relation.frameA === frameB.id && relation.frameB === frameA.id)));

  return {
    frameA: frameA.id,
    frameB: frameB.id,
    ownerA: frameA.ownerElementId,
    ownerB: frameB.ownerElementId,
    originResidualM: residual.originResidualM,
    axisAngleRad: residual.axisAngleRad,
    axisDot: residual.axisDot,
    existingRelationId: existing?.id ?? null,
  };
}

export function createRevoluteRelation(input: CreateRevoluteRelationInput): RigCommand {
  const id = input.id.trim();
  const frameA = input.frameA.trim();
  const frameB = input.frameB.trim();
  if (!id) throw new Error('Revolute relation ID must be non-empty.');
  if (!frameA || !frameB) throw new Error('Revolute relation frame IDs must be non-empty.');
  if (frameA === frameB) throw new Error('Revolute relation requires two distinct frames.');

  const limits = input.limits
    ? {
        lowerRad: finiteLimit(input.limits.lowerRad, 'Revolute lower limit'),
        upperRad: finiteLimit(input.limits.upperRad, 'Revolute upper limit'),
      }
    : undefined;
  if (limits && limits.lowerRad > limits.upperRad) throw new Error('Revolute lower limit must be <= upper limit.');

  const relation: RevoluteRelation = {
    id,
    type: 'revolute',
    frameA,
    frameB,
    ...(limits ? { limits: { ...limits } } : {}),
  };

  return {
    label: `Create revolute ${id}`,
    apply(document) {
      if (documentHasId(document, id)) throw new Error(`Rig ID ${id} is already in use.`);
      const a = document.frames.find((frame) => frame.id === frameA);
      const b = document.frames.find((frame) => frame.id === frameB);
      if (!a) throw new Error(`Revolute frameA ${frameA} not found.`);
      if (!b) throw new Error(`Revolute frameB ${frameB} not found.`);
      return {
        ...document,
        relations: [...document.relations, {
          ...relation,
          ...(relation.limits ? { limits: { ...relation.limits } } : {}),
        }],
      };
    },
  };
}
