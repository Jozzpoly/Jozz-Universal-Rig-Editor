import type { RigCommand } from '../../editor/rig-command.js';
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
