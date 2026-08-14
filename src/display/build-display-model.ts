import type { TransformTarget } from '../editor/transform-target.js';
import type { RigDocument } from '../kernel/types.js';
import type { ResolvedRigView } from '../kernel/resolve.js';
import type { RigDisplayModel } from './types.js';

function isSelected(target: TransformTarget | null, kind: TransformTarget['kind'], id: string): boolean {
  return target?.kind === kind && target.id === id;
}

export function buildRigDisplayModel(
  document: RigDocument,
  resolved: ResolvedRigView,
  selectedTarget: TransformTarget | null,
): RigDisplayModel {
  const items: RigDisplayModel['items'] = [];
  for (const element of document.elements) {
    const pose = resolved.elementWorldPoses.get(element.id);
    if (!pose) continue;
    items.push({ kind: 'element', id: element.id, label: element.name, pose, selected: isSelected(selectedTarget, 'element', element.id) });
  }
  for (const frame of document.frames) {
    const pose = resolved.frameWorldPoses.get(frame.id);
    if (!pose) continue;
    items.push({ kind: 'frame', id: frame.id, label: frame.name, pose, role: frame.role, selected: isSelected(selectedTarget, 'frame', frame.id) });
  }
  for (const relation of document.relations) {
    if (relation.type !== 'origin-coincident') continue;
    const a = resolved.frameWorldPoses.get(relation.frameA);
    const b = resolved.frameWorldPoses.get(relation.frameB);
    if (!a || !b) continue;
    const diagnostic = resolved.diagnostics.find((item) => item.references.includes(relation.id));
    items.push({
      kind: 'segment',
      id: relation.id,
      from: [a.position.x, a.position.y, a.position.z],
      to: [b.position.x, b.position.y, b.position.z],
      severity: diagnostic?.severity ?? 'info',
    });
  }
  return { items };
}
