import { useMemo, useState } from 'react';
import type { OpenSourceAsset } from '../../io/source-file.js';

interface SourceNavigatorProps {
  sourceAsset: OpenSourceAsset | null;
  selectedSourceLocator: string | null;
  visible: boolean;
  onVisibleChange(visible: boolean): void;
  onSelect(locator: string): void;
}

export function SourceNavigator({ sourceAsset, selectedSourceLocator, visible, onVisibleChange, onSelect }: SourceNavigatorProps) {
  const [filter, setFilter] = useState('');
  const normalizedFilter = filter.trim().toLocaleLowerCase();
  const filteredNodes = useMemo(() => sourceAsset?.inspection.nodes.filter((node) => {
    if (!normalizedFilter) return true;
    return (node.name ?? '').toLocaleLowerCase().includes(normalizedFilter)
      || node.locator.toLocaleLowerCase().includes(normalizedFilter)
      || (node.isSkinJoint ? 'joint' : node.hasMesh ? 'mesh' : 'node').includes(normalizedFilter);
  }) ?? [], [sourceAsset, normalizedFilter]);
  const shownNodes = filteredNodes.slice(0, 240);

  return (
    <div className="navigator-pane">
      <div className="pane-head">
        <span>Source</span>
        <span className="pane-count">{sourceAsset ? 'reference' : 'none'}</span>
        <button className={`icon-toggle source ${visible ? 'active' : ''}`} disabled={!sourceAsset} title={visible ? 'Hide SOURCE layer' : 'Show SOURCE layer'} onClick={() => onVisibleChange(!visible)} aria-pressed={visible}>◉</button>
      </div>
      {sourceAsset ? (
        <>
          <div className="source-asset-head">
            <div className="source-asset-title">
              <strong>{sourceAsset.name}</strong>
              <span>REFERENCE · NOT AUTHORED</span>
            </div>
              <code>sha256 {sourceAsset.sha256} · {sourceAsset.inspection.adapter.id}/v{sourceAsset.inspection.adapter.version} · {sourceAsset.inspection.nodeCount} nodes · {sourceAsset.inspection.jointCount} joints · {sourceAsset.inspection.meshCount} mesh{sourceAsset.inspection.meshCount === 1 ? '' : 'es'}</code>
          </div>
          <input className="navigator-filter" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter source…" />
          <div className="source-summary">Rigid datums are selected independently from authored rig selection.</div>
          <div className="navigator-tree source-tree">
            {shownNodes.map((node) => (
              <button
                type="button"
                className={`nav-row source-row ${selectedSourceLocator === node.locator ? 'selected-source' : ''}`}
                key={node.locator}
                onClick={() => onSelect(node.locator)}
                title={node.worldRigidPose ? 'Select read-only SOURCE datum' : `Inspect only: ${node.rigidCompatibility}`}
              >
                <span className="row-bullet source" />
                <span className="row-name">{node.name ?? `Node ${node.index}`}</span>
                <span className="row-kind">{node.locator.replace('gltf2.', '')}</span>
                <small>{node.isSkinJoint ? 'joint' : node.hasMesh ? 'mesh' : 'node'}{node.worldRigidPose ? '' : ` · ${node.rigidCompatibility}`}</small>
              </button>
            ))}
            {filteredNodes.length > shownNodes.length ? <div className="tree-more">+{filteredNodes.length - shownNodes.length} more matches</div> : null}
          </div>
        </>
      ) : (
        <div className="empty-copy source-empty">Open a local glTF/GLB. SOURCE stays read-only until a future explicit adoption/binding flow.</div>
      )}
    </div>
  );
}
