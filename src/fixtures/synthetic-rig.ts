import { IDENTITY_POSE } from '../kernel/math.js';
import type { RigDocument } from '../kernel/types.js';

export const SYNTHETIC_RIG: RigDocument = {
  schemaVersion: 1,
  documentId: 'fixture.synthetic-linkage',
  revision: 0,
  units: 'm-rad',
  coordinateSystem: { handedness: 'right', upAxis: 'Y' },
  sources: [],
  elements: [
    { id: 'element.base', name: 'Base', pose: IDENTITY_POSE },
    { id: 'element.link', name: 'Link', pose: { position: { x: 0.55, y: 0.12, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 1 } } },
  ],
  frames: [
    { id: 'frame.base.mount', name: 'Base Mount', ownerElementId: 'element.base', pose: { position: { x: 0.25, y: 0.12, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 1 } }, role: 'mount', provenance: { kind: 'synthetic' } },
    { id: 'frame.link.mount', name: 'Link Mount', ownerElementId: 'element.link', pose: { position: { x: -0.20, y: 0.02, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 1 } }, role: 'mount', provenance: { kind: 'synthetic' } },
    { id: 'frame.link.axis', name: 'Link Axis Datum', ownerElementId: 'element.link', pose: { position: { x: 0.15, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 1 } }, role: 'axis-datum', provenance: { kind: 'synthetic' } },
  ],
  relations: [
    { id: 'relation.base-link.mount', type: 'origin-coincident', frameA: 'frame.base.mount', frameB: 'frame.link.mount', toleranceM: 0.001 },
  ],
};
