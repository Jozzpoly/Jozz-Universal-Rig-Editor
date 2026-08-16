import type { SourceAdoptionRecord, SourceInstance } from './types.js';

export interface CreateSourceAdoptionRecordInput {
  id: string;
  sourceInstance: SourceInstance;
  locator: string;
  target: SourceAdoptionRecord['target'];
}

export function createSourceAdoptionRecord(input: CreateSourceAdoptionRecordInput): SourceAdoptionRecord {
  const { sourceInstance } = input;
  return {
    id: input.id,
    source: {
      sourceInstanceId: sourceInstance.id,
      sourceRevisionId: sourceInstance.sourceRevisionId,
      sourceInstancePose: {
        position: {
          x: sourceInstance.pose.position.x,
          y: sourceInstance.pose.position.y,
          z: sourceInstance.pose.position.z,
        },
        rotation: {
          x: sourceInstance.pose.rotation.x,
          y: sourceInstance.pose.rotation.y,
          z: sourceInstance.pose.rotation.z,
          w: sourceInstance.pose.rotation.w,
        },
      },
      locator: input.locator,
    },
    target: {
      documentId: input.target.documentId,
      kind: input.target.kind,
      id: input.target.id,
    },
  };
}
