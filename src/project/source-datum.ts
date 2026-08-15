import type { RigidPose } from '../kernel/types.js';

export interface ExactPlacedSourceDatum {
  sourceInstanceId: string;
  sourceRevisionId: string;
  locator: string;
  sourceRevisionWorldPose: RigidPose;
}
