import type { MapDocument } from '../map/types.js';

export const SYNTHETIC_MAP: MapDocument = {
  schemaVersion: 1,
  documentId: 'map.synthetic.lab',
  revision: 0,
  units: 'meter',
  coordinateSystem: {
    handedness: 'right',
    forwardAxis: '+X',
    upAxis: '+Y',
    rightAxis: '+Z',
  },
  spawnPoints: [
    {
      id: 'spawn.default',
      pose: {
        position: { x: 0, y: 1.2, z: 0 },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
      },
    },
  ],
  entities: [
    {
      id: 'entity.ground',
      name: 'Ground slab',
      pose: {
        position: { x: 0, y: -0.25, z: 0 },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
      },
      collision: {
        kind: 'box',
        halfExtents: { x: 5, y: 0.25, z: 5 },
      },
      visual: {
        kind: 'collision-proxy',
        color: [0.32, 0.35, 0.38, 1],
      },
      surface: { friction: 0.85 },
    },
    {
      id: 'entity.bumper',
      name: 'Bumper',
      pose: {
        position: { x: 2, y: 0.2, z: 0 },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
      },
      collision: {
        kind: 'capsule',
        pointA: { x: 0, y: 0, z: -1.2 },
        pointB: { x: 0, y: 0, z: 1.2 },
        radius: 0.2,
      },
      visual: {
        kind: 'collision-proxy',
        color: [0.78, 0.44, 0.12, 1],
      },
      surface: { friction: 0.7 },
    },
  ],
};
