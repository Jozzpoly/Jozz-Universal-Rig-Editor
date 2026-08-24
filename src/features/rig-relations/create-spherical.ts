import type { RigCommand } from '../../editor/rig-command.js';
import { distance } from '../../kernel/math.js';
import { resolveRigDocument } from '../../kernel/resolve.js';
import type { RigDocument, SphericalRelation } from '../../kernel/types.js';

export interface CreateSphericalRelationInput {
  id: string;
  frameA: string;
  frameB: string;
}

export interface SphericalCandidateInspection {
  frameA: string;
  frameB: string;
  ownerA: string | null;
  ownerB: string | null;
  originResidualM: number;
  existingRelationId: string | null;
}

function documentHasId(document: RigDocument, id: string): boolean {
  return document.sources.some((source) => source.id === id)
    || document.elements.some((element) => element.id === id)
    || document.frames.some((frame) => frame.id === id)
    || document.relations.some((relation) => relation.id === id);
}

export function inspectSphericalCandidate(
  document: RigDocument,
  frameAId: string,
  frameBId: string,
): SphericalCandidateInspection {
  const frameA = document.frames.find((frame) => frame.id === frameAId);
  const frameB = document.frames.find((frame) => frame.id === frameBId);
  if (!frameA) throw new Error(`Spherical frameA ${frameAId} not found.`);
  if (!frameB) throw new Error(`Spherical frameB ${frameBId} not found.`);
  if (frameA.id === frameB.id) throw new Error('Spherical candidate requires two distinct frames.');

  const resolved = resolveRigDocument(document);
  const frameAWorld = resolved.frameWorldPoses.get(frameA.id);
  const frameBWorld = resolved.frameWorldPoses.get(frameB.id);
  if (!frameAWorld || !frameBWorld) throw new Error('Spherical candidate could not resolve both authored frame poses.');

  const existing = document.relations.find((relation) => relation.type === 'spherical'
    && ((relation.frameA === frameA.id && relation.frameB === frameB.id)
      || (relation.frameA === frameB.id && relation.frameB === frameA.id)));

  return {
    frameA: frameA.id,
    frameB: frameB.id,
    ownerA: frameA.ownerElementId,
    ownerB: frameB.ownerElementId,
    originResidualM: distance(frameAWorld.position, frameBWorld.position),
    existingRelationId: existing?.id ?? null,
  };
}

export function createSphericalRelation(input: CreateSphericalRelationInput): RigCommand {
  const id = input.id.trim();
  const frameA = input.frameA.trim();
  const frameB = input.frameB.trim();
  if (!id) throw new Error('Spherical relation ID must be non-empty.');
  if (!frameA || !frameB) throw new Error('Spherical relation frame IDs must be non-empty.');
  if (frameA === frameB) throw new Error('Spherical relation requires two distinct frames.');

  const relation: SphericalRelation = {
    id,
    type: 'spherical',
    frameA,
    frameB,
  };

  return {
    label: `Create spherical ${id}`,
    apply(document) {
      if (documentHasId(document, id)) throw new Error(`Rig ID ${id} is already in use.`);
      const a = document.frames.find((frame) => frame.id === frameA);
      const b = document.frames.find((frame) => frame.id === frameB);
      if (!a) throw new Error(`Spherical frameA ${frameA} not found.`);
      if (!b) throw new Error(`Spherical frameB ${frameB} not found.`);
      return {
        ...document,
        relations: [...document.relations, { ...relation }],
      };
    },
  };
}
