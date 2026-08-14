import type { Diagnostic, RigidPose, RigId } from '../kernel/types.js';

export interface ElementDisplayItem {
  kind: 'element';
  id: RigId;
  label: string;
  pose: RigidPose;
  selected: boolean;
}

export interface FrameDisplayItem {
  kind: 'frame';
  id: RigId;
  label: string;
  pose: RigidPose;
  selected: boolean;
  role?: string;
}

export interface SegmentDisplayItem {
  kind: 'segment';
  id: RigId;
  from: [number, number, number];
  to: [number, number, number];
  severity: Diagnostic['severity'];
}

export type DisplayItem = ElementDisplayItem | FrameDisplayItem | SegmentDisplayItem;

export interface RigDisplayModel {
  items: DisplayItem[];
}
