import { useMemo, useState } from 'react';
import type { SourceInstance } from '../../project/types.js';
import type { LinkedProjectSourceAsset } from '../state/project-source-runtime.js';

export interface SourceLayerVisibility {
  geometry: boolean;
  datum: boolean;
}

export interface SourceAdoptionPreviewView {
  frameName: string;
  ownerName: string;
}

interface SourceNavigatorProps {
  sourceAsset: LinkedProjectSourceAsset | null;
  sourceInstance: SourceInstance | null;
  selectedSourceLocator: string | null;
  placementEditActive: boolean;
  placementEditDisabled?: boolean;
  elementCreationDisabled?: boolean;
  adoptionTargetName?: string | null;
  adoptionPreview?: SourceAdoptionPreviewView | null;
  visible: boolean;
  layers: SourceLayerVisibility;
  onVisibleChange(visible: boolean): void;
  onLayerChange(layer: keyof SourceLayerVisibility, visible: boolean): void;
  onTogglePlacementEdit(): void;
  onPreviewAdoption?(): void;
  onCommitAdoption?(): void;
  onCancelAdoption?(): void;
  onCreateElementFromSource?(name: string): void;
  onSelect(locator: string): void;
}

export function SourceNavigator({ sourceAsset, sourceInstance, selectedSourceLocator, placementEditActive, placementEditDisabled = false, elementCreationDisabled = false, adoptionTargetName = null, adoptionPreview = null, visible, layers, onVisibleChange, onLayerChange, onTogglePlacementEdit, onPreviewAdoption, onCommitAdoption, onCancelAdoption, onCreateElementFromSource, onSelect }: SourceNavigatorProps) {
  const [filter, setFilter] = useState('');
  const [creatingElementFromSource, setCreatingElementFromSource] = useState(false);
  const [elementName, setElementName] = useState('');
  const normalizedFilter = filter.trim().toLocaleLowerCase();
  const filteredNodes = useMemo(() => sourceAsset?.inspection.nodes.filter((node) => {
    if (!normalizedFilter) return true;
    return (node.name ?? '').toLocaleLowerCase().includes(normalizedFilter)
      || node.locator.toLocaleLowerCase().includes(normalizedFilter)
      || (node.isSkinJoint ? 'joint' : node.hasMesh ? 'mesh' : 'node').includes(normalizedFilter);
  }) ?? [], [sourceAsset, normalizedFilter]);
  const shownNodes = filteredNodes.slice(0, 240);

  const layerToggle = (layer: keyof SourceLayerVisibility, label: string) => (
    <button
      type="button"
      className={`layer-toggle source ${layers[layer] ? 'active' : ''}`}
      aria-pressed={layers[layer]}
      disabled={!sourceAsset || !visible}
      title={`${layers[layer] ? 'Hide' : 'Show'} SOURCE ${label.toLocaleLowerCase()}`}
      onClick={() => onLayerChange(layer, !layers[layer])}
    >
      <span className="layer-state-dot" />{label}
    </button>
  );

  const selectedNode = sourceAsset?.inspection.nodes.find((node) => node.locator === selectedSourceLocator) ?? null;
  const selectedRigidDatum = Boolean(selectedNode?.worldRigidPose && selectedNode.rigidCompatibility === 'rigid');
  const canPreviewAdoption = Boolean(selectedRigidDatum && adoptionTargetName && onPreviewAdoption);
  const canOfferElementCreation = Boolean(selectedRigidDatum && onCreateElementFromSource);

  const beginElementCreation = () => {
    if (!selectedNode || elementCreationDisabled || !onCreateElementFromSource) return;
    setElementName(selectedNode.name?.trim() || 'Element');
    setCreatingElementFromSource(true);
  };

  const submitElementCreation = () => {
    const name = elementName.trim();
    if (!name || elementCreationDisabled || !onCreateElementFromSource) return;
    onCreateElementFromSource(name);
    setCreatingElementFromSource(false);
    setElementName('');
  };

  return (
    <div className="navigator-pane">
      <div className="pane-head">
        <span>Source</span>
        <span className="pane-count">{sourceInstance ? 'instance' : sourceAsset ? 'linked' : 'none'}</span>
        <button className={`master-visibility source ${visible ? 'active' : ''}`} disabled={!sourceAsset} title={visible ? 'Hide SOURCE reference' : 'Show SOURCE reference'} onClick={() => onVisibleChange(!visible)} aria-pressed={visible}>{visible ? 'Hide' : 'Show'}</button>
      </div>
      {sourceInstance ? (
        <div className="source-asset-head source-instance-head">
          <div className="source-asset-title">
            <strong>{sourceInstance.name}</strong>
            <span>PROJECT INSTANCE · PLACEMENT EDITABLE</span>
          </div>
          <code title={sourceInstance.id}>{sourceInstance.id}</code>
          <button
            type="button"
            className={`source-focus-button ${placementEditActive ? 'active' : ''}`}
            aria-pressed={placementEditActive}
            disabled={!sourceAsset || placementEditDisabled}
            title={sourceAsset ? 'Use the viewport gizmo to Move/Rotate this placed SOURCE instance' : 'Relink exact SOURCE bytes before editing placement'}
            onClick={onTogglePlacementEdit}
          >
            {placementEditActive ? 'Finish placement' : 'Edit placement'}
          </button>
        </div>
      ) : null}
      {sourceAsset ? (
        <>
          <div className="layer-strip source-layers" aria-label="Source display layers">
            {layerToggle('geometry', 'Geometry')}
            {layerToggle('datum', 'Datum')}
          </div>
          <div className="source-asset-head">
            <div className="source-asset-title">
              <strong>{sourceAsset.name}</strong>
              <span>EXACT SOURCE BYTES · READ ONLY</span>
            </div>
            <span className="source-asset-stats">{sourceAsset.inspection.nodeCount} nodes · {sourceAsset.inspection.jointCount} joints · {sourceAsset.inspection.meshCount} mesh{sourceAsset.inspection.meshCount === 1 ? '' : 'es'}</span>
            <code title={sourceAsset.sha256}>sha256 {sourceAsset.sha256.slice(0, 16)}… · {sourceAsset.inspection.adapter.id}/v{sourceAsset.inspection.adapter.version}</code>
          </div>
          {adoptionPreview ? (
            <div className="binding-preview-card">
              <div className="binding-preview-head"><strong>Frame adoption preview</strong><span>transient</span></div>
              <div className="binding-preview-pair"><span className="selection-mark source" />{selectedNode?.name ?? selectedNode?.locator ?? 'SOURCE datum'}<span className="binding-arrow">→</span><span className="selection-mark authored" />{adoptionPreview.ownerName} / {adoptionPreview.frameName}</div>
              <div className="topbar-actions">
                <button type="button" className="binding-preview-button active" onClick={onCommitAdoption}>Commit frame</button>
                <button type="button" className="binding-preview-button" onClick={onCancelAdoption}>Cancel</button>
              </div>
            </div>
          ) : selectedRigidDatum && (canPreviewAdoption || canOfferElementCreation) ? (
            <div className="binding-preview-card">
              <div className="binding-preview-head"><strong>Author from SOURCE</strong><span>explicit adoption</span></div>
              {creatingElementFromSource ? (
                <form onSubmit={(event) => { event.preventDefault(); submitElementCreation(); }}>
                  <div className="binding-preview-pair"><span className="selection-mark source" />{selectedNode?.name ?? selectedNode?.locator}<span className="binding-arrow">→</span><span className="selection-mark authored" />new element origin</div>
                  <input
                    className="navigator-filter"
                    value={elementName}
                    onChange={(event) => setElementName(event.target.value)}
                    aria-label="SOURCE-derived element name"
                    placeholder="Element name…"
                    autoFocus
                  />
                  <div className="topbar-actions">
                    <button type="submit" className="binding-preview-button active" disabled={elementCreationDisabled || !elementName.trim()}>Create element</button>
                    <button type="button" className="binding-preview-button" onClick={() => { setCreatingElementFromSource(false); setElementName(''); }}>Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  {canPreviewAdoption ? (
                    <>
                      <div className="binding-preview-pair"><span className="selection-mark source" />{selectedNode?.name ?? selectedNode?.locator}<span className="binding-arrow">→</span><span className="selection-mark authored" />new frame on {adoptionTargetName}</div>
                      <button type="button" className="binding-preview-button" onClick={onPreviewAdoption}>Preview adopted frame</button>
                    </>
                  ) : null}
                  {canOfferElementCreation ? (
                    <button
                      type="button"
                      className="binding-preview-button"
                      disabled={elementCreationDisabled}
                      title={elementCreationDisabled ? 'Finish the active placement/preview operation first' : 'Use this exact SOURCE datum as the new authored element origin'}
                      onClick={beginElementCreation}
                    >
                      Create element at datum
                    </button>
                  ) : null}
                </>
              )}
            </div>
          ) : null}
          <input className="navigator-filter" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter source…" />
          <div className="navigator-tree source-tree">
            {shownNodes.map((node) => (
              <button
                type="button"
                className={`nav-row source-row ${selectedSourceLocator === node.locator ? 'selected-source' : ''}`}
                key={node.locator}
                onClick={() => {
                  setCreatingElementFromSource(false);
                  setElementName('');
                  onSelect(node.locator);
                }}
                title={node.worldRigidPose ? 'Select exact read-only SOURCE datum on this placed instance' : `Inspect only: ${node.rigidCompatibility}`}
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
      ) : sourceInstance ? (
        <div className="empty-copy source-empty">This SourceInstance is part of the project, but its exact source bytes are not linked in this browser session. Open the matching SOURCE file to relink by exact hash.</div>
      ) : (
        <div className="empty-copy source-empty">Open a local glTF/GLB to add an exact SOURCE revision and placed project instance.</div>
      )}
    </div>
  );
}
