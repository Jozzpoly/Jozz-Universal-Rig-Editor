import { useMemo, useState } from 'react';
import type { TransformTarget } from '../../editor/transform-target.js';
import { inspectRevoluteCandidate } from '../../features/rig-relations/create-revolute.js';
import { inspectSphericalCandidate } from '../../features/rig-relations/create-spherical.js';
import type { RigDocument } from '../../kernel/types.js';
import type { RevoluteTestSession } from '../state/revolute-test-workflow.js';
import { RevoluteTestPanel } from './RevoluteTestPanel.js';

export interface RigLayerVisibility {
  elements: boolean;
  frames: boolean;
  relations: boolean;
}

interface RigNavigatorProps {
  document: RigDocument;
  selectedTarget: TransformTarget | null;
  visible: boolean;
  layers: RigLayerVisibility;
  createDisabled: boolean;
  testStartDisabled: boolean;
  testSession: RevoluteTestSession;
  onVisibleChange(visible: boolean): void;
  onLayerChange(layer: keyof RigLayerVisibility, visible: boolean): void;
  onSelect(target: TransformTarget): void;
  onCreateElement(name: string): void;
  onCreateRevolute(frameAId: string, frameBId: string): void;
  onCreateSpherical(frameAId: string, frameBId: string): void;
  onBeginRevoluteTest(relationId: string, movingElementId: string): void;
  onRevoluteTestAngle(angleRad: number): void;
  onResetRevoluteTest(): void;
  onEndRevoluteTest(): void;
}

function matchesFilter(value: string, filter: string): boolean {
  return value.toLocaleLowerCase().includes(filter.toLocaleLowerCase());
}

function frameOptionLabel(document: RigDocument, frameId: string): string {
  const frame = document.frames.find((candidate) => candidate.id === frameId);
  if (!frame) return frameId;
  const owner = frame.ownerElementId
    ? document.elements.find((element) => element.id === frame.ownerElementId)?.name ?? frame.ownerElementId
    : 'rig root';
  return `${frame.name} · ${owner} · ${frame.id}`;
}

export function RigNavigator({ document, selectedTarget, visible, layers, createDisabled, testStartDisabled, testSession, onVisibleChange, onLayerChange, onSelect, onCreateElement, onCreateRevolute, onCreateSpherical, onBeginRevoluteTest, onRevoluteTestAngle, onResetRevoluteTest, onEndRevoluteTest }: RigNavigatorProps) {
  const [filter, setFilter] = useState('');
  const [collapsedElements, setCollapsedElements] = useState<Set<string>>(() => new Set());
  const [creatingElement, setCreatingElement] = useState(false);
  const [newElementName, setNewElementName] = useState('');
  const [creatingRevolute, setCreatingRevolute] = useState(false);
  const [revoluteFrameA, setRevoluteFrameA] = useState('');
  const [revoluteFrameB, setRevoluteFrameB] = useState('');
  const [creatingSpherical, setCreatingSpherical] = useState(false);
  const [sphericalFrameA, setSphericalFrameA] = useState('');
  const [sphericalFrameB, setSphericalFrameB] = useState('');
  const normalizedFilter = filter.trim();

  const framesByOwner = useMemo(() => {
    const map = new Map<string | null, typeof document.frames>();
    for (const frame of document.frames) {
      const bucket = map.get(frame.ownerElementId) ?? [];
      bucket.push(frame);
      map.set(frame.ownerElementId, bucket);
    }
    return map;
  }, [document.frames]);

  const revoluteInspection = useMemo(() => {
    if (!revoluteFrameA || !revoluteFrameB || revoluteFrameA === revoluteFrameB) return null;
    try {
      return inspectRevoluteCandidate(document, revoluteFrameA, revoluteFrameB);
    } catch {
      return null;
    }
  }, [document, revoluteFrameA, revoluteFrameB]);

  const sphericalInspection = useMemo(() => {
    if (!sphericalFrameA || !sphericalFrameB || sphericalFrameA === sphericalFrameB) return null;
    try {
      return inspectSphericalCandidate(document, sphericalFrameA, sphericalFrameB);
    } catch {
      return null;
    }
  }, [document, sphericalFrameA, sphericalFrameB]);

  const toggleElement = (elementId: string) => {
    setCollapsedElements((current) => {
      const next = new Set(current);
      if (next.has(elementId)) next.delete(elementId);
      else next.add(elementId);
      return next;
    });
  };

  const submitNewElement = () => {
    const name = newElementName.trim();
    if (!name || createDisabled) return;
    onCreateElement(name);
    setNewElementName('');
    setCreatingElement(false);
  };

  const preferredFramePair = () => {
    const preferred = selectedTarget?.kind === 'frame' && document.frames.some((frame) => frame.id === selectedTarget.id)
      ? selectedTarget.id
      : document.frames[0]?.id ?? '';
    const other = document.frames.find((frame) => frame.id !== preferred)?.id ?? '';
    return [preferred, other] as const;
  };

  const toggleRevoluteBuilder = () => {
    setCreatingElement(false);
    setCreatingSpherical(false);
    setNewElementName('');
    const next = !creatingRevolute;
    setCreatingRevolute(next);
    if (!next) return;
    const [preferred, other] = preferredFramePair();
    setRevoluteFrameA(preferred);
    setRevoluteFrameB(other);
  };

  const toggleSphericalBuilder = () => {
    setCreatingElement(false);
    setCreatingRevolute(false);
    setNewElementName('');
    const next = !creatingSpherical;
    setCreatingSpherical(next);
    if (!next) return;
    const [preferred, other] = preferredFramePair();
    setSphericalFrameA(preferred);
    setSphericalFrameB(other);
  };

  const submitRevolute = () => {
    if (createDisabled || !revoluteInspection || revoluteInspection.existingRelationId) return;
    onCreateRevolute(revoluteFrameA, revoluteFrameB);
  };

  const submitSpherical = () => {
    if (createDisabled || !sphericalInspection || sphericalInspection.existingRelationId) return;
    onCreateSpherical(sphericalFrameA, sphericalFrameB);
  };

  const visibleElements = document.elements.filter((element) => {
    if (!normalizedFilter) return true;
    if (matchesFilter(element.name, normalizedFilter) || matchesFilter(element.id, normalizedFilter)) return true;
    return (framesByOwner.get(element.id) ?? []).some((frame) => matchesFilter(frame.name, normalizedFilter) || matchesFilter(frame.role ?? '', normalizedFilter));
  });
  const rootFrames = (framesByOwner.get(null) ?? []).filter((frame) => !normalizedFilter || matchesFilter(frame.name, normalizedFilter) || matchesFilter(frame.role ?? '', normalizedFilter));
  const relations = document.relations.filter((relation) => !normalizedFilter || matchesFilter(relation.id, normalizedFilter) || matchesFilter(relation.type, normalizedFilter));

  const layerToggle = (layer: keyof RigLayerVisibility, label: string) => (
    <button
      type="button"
      className={`layer-toggle auth ${layers[layer] ? 'active' : ''}`}
      aria-pressed={layers[layer]}
      disabled={!visible}
      title={`${layers[layer] ? 'Hide' : 'Show'} authored ${label.toLocaleLowerCase()}`}
      onClick={() => onLayerChange(layer, !layers[layer])}
    >
      <span className="layer-state-dot" />{label}
    </button>
  );

  return (
    <div className="navigator-pane">
      <div className="pane-head">
        <span>Rig</span>
        <span className="pane-count">{document.elements.length} el · {document.frames.length} fr</span>
        <button className={`master-visibility auth ${visible ? 'active' : ''}`} title={visible ? 'Hide authored rig' : 'Show authored rig'} onClick={() => onVisibleChange(!visible)} aria-pressed={visible}>{visible ? 'Hide' : 'Show'}</button>
      </div>
      <div className="layer-strip" aria-label="Rig display layers and authoring actions">
        {layerToggle('elements', 'Elements')}
        {layerToggle('frames', 'Frames')}
        {layerToggle('relations', 'Relations')}
        <button
          type="button"
          className={`layer-toggle auth ${creatingElement ? 'active' : ''}`}
          aria-expanded={creatingElement}
          disabled={createDisabled}
          title={createDisabled ? 'Finish TEST or the active authoring/SOURCE placement operation first' : 'Create a new authored rigid element'}
          onClick={() => {
            setCreatingElement((current) => !current);
            setCreatingRevolute(false);
            setCreatingSpherical(false);
            setNewElementName('');
          }}
        >
          + Element
        </button>
        <button
          type="button"
          className={`layer-toggle auth ${creatingRevolute ? 'active' : ''}`}
          aria-expanded={creatingRevolute}
          disabled={createDisabled || document.frames.length < 2}
          title={document.frames.length < 2 ? 'Author at least two frames before creating a revolute' : createDisabled ? 'Finish TEST or the active authoring/SOURCE placement operation first' : 'Create a neutral revolute between two authored frames'}
          onClick={toggleRevoluteBuilder}
        >
          + Revolute
        </button>
        <button
          type="button"
          className={`layer-toggle auth ${creatingSpherical ? 'active' : ''}`}
          aria-expanded={creatingSpherical}
          disabled={createDisabled || document.frames.length < 2}
          title={document.frames.length < 2 ? 'Author at least two frames before creating a spherical relation' : createDisabled ? 'Finish TEST or the active authoring/SOURCE placement operation first' : 'Create a neutral spherical relation between two authored frames'}
          onClick={toggleSphericalBuilder}
        >
          + Spherical
        </button>
      </div>
      {creatingElement ? (
        <form onSubmit={(event) => { event.preventDefault(); submitNewElement(); }}>
          <input
            className="navigator-filter"
            value={newElementName}
            onChange={(event) => setNewElementName(event.target.value)}
            placeholder="New element name…"
            aria-label="New element name"
            autoFocus
          />
          <div className="layer-strip" aria-label="Create authored element">
            <button type="submit" className="layer-toggle auth active" disabled={createDisabled || !newElementName.trim()}>Create</button>
            <button type="button" className="layer-toggle" onClick={() => { setCreatingElement(false); setNewElementName(''); }}>Cancel</button>
          </div>
        </form>
      ) : null}
      {creatingRevolute ? (
        <div className="binding-preview-card" data-revolute-builder>
          <div className="binding-preview-head"><strong>Neutral revolute</strong><span>authored relation</span></div>
          <label className="inspector-group-title" htmlFor="revolute-frame-a">Frame A</label>
          <select id="revolute-frame-a" className="navigator-filter" aria-label="Revolute frame A" value={revoluteFrameA} onChange={(event) => setRevoluteFrameA(event.target.value)}>
            <option value="">Choose authored frame…</option>
            {document.frames.map((frame) => <option key={frame.id} value={frame.id}>{frameOptionLabel(document, frame.id)}</option>)}
          </select>
          <label className="inspector-group-title" htmlFor="revolute-frame-b">Frame B</label>
          <select id="revolute-frame-b" className="navigator-filter" aria-label="Revolute frame B" value={revoluteFrameB} onChange={(event) => setRevoluteFrameB(event.target.value)}>
            <option value="">Choose authored frame…</option>
            {document.frames.map((frame) => <option key={frame.id} value={frame.id}>{frameOptionLabel(document, frame.id)}</option>)}
          </select>
          {revoluteFrameA && revoluteFrameB && revoluteFrameA === revoluteFrameB ? (
            <div className="context-warning">Choose two distinct authored frames.</div>
          ) : revoluteInspection ? (
            <div
              className={revoluteInspection.existingRelationId ? 'context-warning' : 'construction-result'}
              data-revolute-diagnostic
              data-origin-residual-m={revoluteInspection.originResidualM}
              data-axis-angle-rad={revoluteInspection.axisAngleRad}
            >
              <div><strong>Neutral diagnostic</strong></div>
              <div>Origin residual {(revoluteInspection.originResidualM * 1000).toFixed(3)} mm</div>
              <div>Signed +Z axis angle {(revoluteInspection.axisAngleRad * 180 / Math.PI).toFixed(4)}°</div>
              <small>{revoluteInspection.ownerA ?? 'rig root'} ↔ {revoluteInspection.ownerB ?? 'rig root'}</small>
              {revoluteInspection.existingRelationId ? <div>Already connected by {revoluteInspection.existingRelationId}</div> : null}
            </div>
          ) : null}
          <div className="topbar-actions">
            <button type="button" className="binding-preview-button active" disabled={createDisabled || !revoluteInspection || Boolean(revoluteInspection.existingRelationId)} onClick={submitRevolute}>Create revolute</button>
            <button type="button" className="binding-preview-button" onClick={() => setCreatingRevolute(false)}>Cancel</button>
          </div>
        </div>
      ) : null}
      {creatingSpherical ? (
        <div className="binding-preview-card" data-spherical-builder>
          <div className="binding-preview-head"><strong>Neutral spherical</strong><span>authored relation</span></div>
          <label className="inspector-group-title" htmlFor="spherical-frame-a">Frame A</label>
          <select id="spherical-frame-a" className="navigator-filter" aria-label="Spherical frame A" value={sphericalFrameA} onChange={(event) => setSphericalFrameA(event.target.value)}>
            <option value="">Choose authored frame…</option>
            {document.frames.map((frame) => <option key={frame.id} value={frame.id}>{frameOptionLabel(document, frame.id)}</option>)}
          </select>
          <label className="inspector-group-title" htmlFor="spherical-frame-b">Frame B</label>
          <select id="spherical-frame-b" className="navigator-filter" aria-label="Spherical frame B" value={sphericalFrameB} onChange={(event) => setSphericalFrameB(event.target.value)}>
            <option value="">Choose authored frame…</option>
            {document.frames.map((frame) => <option key={frame.id} value={frame.id}>{frameOptionLabel(document, frame.id)}</option>)}
          </select>
          {sphericalFrameA && sphericalFrameB && sphericalFrameA === sphericalFrameB ? (
            <div className="context-warning">Choose two distinct authored frames.</div>
          ) : sphericalInspection ? (
            <div
              className={sphericalInspection.existingRelationId ? 'context-warning' : 'construction-result'}
              data-spherical-diagnostic
              data-origin-residual-m={sphericalInspection.originResidualM}
            >
              <div><strong>Neutral diagnostic</strong></div>
              <div>Origin residual {(sphericalInspection.originResidualM * 1000).toFixed(3)} mm</div>
              <small>{sphericalInspection.ownerA ?? 'rig root'} ↔ {sphericalInspection.ownerB ?? 'rig root'}</small>
              <small>Only the shared origin is constrained; frame orientation remains authored and unconstrained.</small>
              {sphericalInspection.existingRelationId ? <div>Already connected by {sphericalInspection.existingRelationId}</div> : null}
            </div>
          ) : null}
          <div className="topbar-actions">
            <button type="button" className="binding-preview-button active" disabled={createDisabled || !sphericalInspection || Boolean(sphericalInspection.existingRelationId)} onClick={submitSpherical}>Create spherical</button>
            <button type="button" className="binding-preview-button" onClick={() => setCreatingSpherical(false)}>Cancel</button>
          </div>
        </div>
      ) : null}
      {!creatingElement ? <input className="navigator-filter" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter rig…" /> : null}
      <div className="navigator-tree">
        {rootFrames.length > 0 ? <div className="tree-section-label">Rig-root frames</div> : null}
        {rootFrames.map((frame) => (
          <button className={`nav-row indent ${selectedTarget?.kind === 'frame' && selectedTarget.id === frame.id ? 'selected-auth' : ''}`} key={frame.id} onClick={() => onSelect({ kind: 'frame', id: frame.id })}>
            <span className="row-bullet frame" />
            <span className="row-name">{frame.name}</span>
            <span className="row-kind">{frame.role ?? 'frame'}</span>
          </button>
        ))}

        {visibleElements.map((element) => {
          const ownedFrames = (framesByOwner.get(element.id) ?? []).filter((frame) => !normalizedFilter || matchesFilter(frame.name, normalizedFilter) || matchesFilter(frame.role ?? '', normalizedFilter) || matchesFilter(element.name, normalizedFilter));
          const collapsed = collapsedElements.has(element.id) && !normalizedFilter;
          return (
            <div className="element-branch" key={element.id}>
              <div className={`nav-row element-row ${selectedTarget?.kind === 'element' && selectedTarget.id === element.id ? 'selected-auth' : ''}`}>
                <button className={`disclosure ${collapsed ? 'collapsed' : ''}`} title={collapsed ? 'Expand element' : 'Collapse element'} aria-label={collapsed ? `Expand ${element.name}` : `Collapse ${element.name}`} onClick={() => toggleElement(element.id)}><span /></button>
                <button className="row-main" onClick={() => onSelect({ kind: 'element', id: element.id })}><span className="row-name">{element.name}</span></button>
                <span className="row-kind">element</span>
              </div>
              {!collapsed ? ownedFrames.map((frame) => (
                <button className={`nav-row indent ${selectedTarget?.kind === 'frame' && selectedTarget.id === frame.id ? 'selected-auth' : ''}`} key={frame.id} onClick={() => onSelect({ kind: 'frame', id: frame.id })}>
                  <span className="row-bullet frame" />
                  <span className="row-name">{frame.name}</span>
                  <span className="row-kind">{frame.role ?? 'frame'}</span>
                </button>
              )) : null}
            </div>
          );
        })}

        {relations.length > 0 ? <div className="tree-section-label">Relations</div> : null}
        {relations.map((relation) => (
          <div className="nav-row readonly" key={relation.id}>
            <span className="row-bullet relation" />
            <span className="row-name">{relation.id}</span>
            <span className="row-kind">{relation.type}</span>
          </div>
        ))}
      </div>
      <RevoluteTestPanel
        document={document}
        session={testSession}
        startDisabled={testStartDisabled}
        onBegin={onBeginRevoluteTest}
        onAngle={onRevoluteTestAngle}
        onReset={onResetRevoluteTest}
        onEnd={onEndRevoluteTest}
      />
    </div>
  );
}
