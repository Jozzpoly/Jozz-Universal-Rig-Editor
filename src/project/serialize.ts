import { canonicalizeRigDocument } from '../kernel/serialize.js';
import { canonicalizeRigRepresentationDocument } from '../representation/serialize.js';
import type { JureProjectModel } from './types.js';
import { validateJureProjectModel } from './validate.js';

function canonicalizeProject(project: JureProjectModel): JureProjectModel {
  return {
    schemaVersion: 1,
    projectId: project.projectId,
    units: 'm-rad',
    coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sourceRevisions: [...project.sourceRevisions].sort((a,b)=>a.id.localeCompare(b.id)).map((source)=>({ id:source.id,label:source.label,uri:source.uri,sha256:source.sha256,adapter:{id:source.adapter.id,version:source.adapter.version} })),
    sourceInstances: [...project.sourceInstances].sort((a,b)=>a.id.localeCompare(b.id)).map((instance)=>({ id:instance.id,name:instance.name,sourceRevisionId:instance.sourceRevisionId,pose:{ position:{...instance.pose.position}, rotation:{...instance.pose.rotation} } })),
    consumerReferences: [...project.consumerReferences].sort((a,b)=>a.id.localeCompare(b.id)).map((reference)=>({ id:reference.id,label:reference.label,consumer:{id:reference.consumer.id,revision:reference.consumer.revision},payloadLocator:reference.payloadLocator,payloadSha256:reference.payloadSha256 })),
    sourceAdoptions: [...project.sourceAdoptions].sort((a,b)=>a.id.localeCompare(b.id)).map((adoption)=>({ id:adoption.id,sourceInstanceId:adoption.sourceInstanceId,locator:adoption.locator,target:{documentId:adoption.target.documentId,kind:adoption.target.kind,id:adoption.target.id} })),
    authoredDocuments: [...project.authoredDocuments].sort((a,b)=>a.document.documentId.localeCompare(b.document.documentId)).map((authored)=> authored.kind==='rig'
      ? { kind:'rig', document:canonicalizeRigDocument(authored.document) }
      : { kind:'rig-representation', document:canonicalizeRigRepresentationDocument(authored.document) }),
  };
}

function requireProjectShape(value: unknown): asserts value is JureProjectModel {
  if (!value || typeof value !== 'object') throw new Error('Invalid JureProjectModel: project.shape.invalid');
  const candidate=value as Record<string,unknown>;
  if (!candidate.coordinateSystem || typeof candidate.coordinateSystem !== 'object' || !Array.isArray(candidate.sourceRevisions) || !Array.isArray(candidate.sourceInstances) || !Array.isArray(candidate.consumerReferences) || !Array.isArray(candidate.sourceAdoptions) || !Array.isArray(candidate.authoredDocuments)) throw new Error('Invalid JureProjectModel: project.shape.invalid');
}

export function serializeJureProjectModel(project: JureProjectModel): string {
  const errors=validateJureProjectModel(project).filter((d)=>d.severity==='error');
  if(errors.length) throw new Error(`Cannot serialize invalid JureProjectModel: ${errors.map((d)=>d.code).join(', ')}`);
  return `${JSON.stringify(canonicalizeProject(project),null,2)}\n`;
}

export function parseJureProjectModel(text: string): JureProjectModel {
  const value: unknown=JSON.parse(text);
  requireProjectShape(value);
  const errors=validateJureProjectModel(value).filter((d)=>d.severity==='error');
  if(errors.length) throw new Error(`Invalid JureProjectModel: ${errors.map((d)=>d.code).join(', ')}`);
  return canonicalizeProject(value);
}
