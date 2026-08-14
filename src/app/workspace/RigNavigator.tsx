import { useMemo, useState } from 'react';
import type { TransformTarget } from '../../editor/transform-target.js';
import type { RigDocument } from '../../kernel/types.js';

interface RigNavigatorProps {
  document: RigDocument;
  selectedTarget: TransformTarget | null;
  visible: boolean;
  onVisibleChange(visible: boolean): void;
  onSelect(target: TransformTarget): void;
}

function matchesFilter(value: string, filter: string): boolean {
  return value.toLocaleLowerCase().includes(filter.toLocaleLowerCase());
}

export function RigNavigator({ document, selectedTarget, visible, onVisibleChange, onSelect }: RigNavigatorProps) {
  const [filter, setFilter] = useState('');
  const [collapsedElements, setCollapsedElements] = useState<Set<string>>(() => new Set());
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

  const toggleElement = (elementId: string) => {
    setCollapsedElements((current) => {
      const next = new Set(current);
      if (next.has(elementId)) next.delete(elementId);
      else next.add(elementId);
      return next;
    });
  };

  const visibleElements = document.elements.filter((element) => {
    if (!normalizedFilter) return true;
    if (matchesFilter(element.name, normalizedFilter) || matchesFilter(element.id, normalizedFilter)) return true;
    return (framesByOwner.get(element.id) ?? []).some((frame) => matchesFilter(frame.name, normalizedFilter) || matchesFilter(frame.role ?? '', normalizedFilter));
  });
  const rootFrames = (framesByOwner.get(null) ?? []).filter((frame) => !normalizedFilter || matchesFilter(frame.name, normalizedFilter) || matchesFilter(frame.role ?? '', normalizedFilter));
  const relations = document.relations.filter((relation) => !normalizedFilter || matchesFilter(relation.id, normalizedFilter) || matchesFilter(relation.type, normalizedFilter));

  return (
    <div className="navigator-pane">
      <div className="pane-head">
        <span>Rig</span>
        <span className="pane-count">{document.elements.length} elements · {document.frames.length} frames</span>
        <button className={`icon-toggle ${visible ? 'active' : ''}`} title={visible ? 'Hide authored rig' : 'Show authored rig'} onClick={() => onVisibleChange(!visible)} aria-pressed={visible}>◉</button>
      </div>
      <input className="navigator-filter" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter rig…" />
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
                <button className="disclosure" title={collapsed ? 'Expand element' : 'Collapse element'} onClick={() => toggleElement(element.id)}>{collapsed ? '▸' : '▾'}</button>
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
    </div>
  );
}
