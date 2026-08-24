import { useEffect, useMemo, useState } from 'react';
import {
  revoluteTestAngleRad,
  revoluteTestMovingElementIds,
  type RevoluteTestSession,
} from '../state/revolute-test-workflow.js';
import type { RigDocument } from '../../kernel/types.js';

interface RevoluteTestPanelProps {
  document: RigDocument;
  session: RevoluteTestSession;
  startDisabled: boolean;
  onBegin(relationId: string, movingElementId: string): void;
  onAngle(angleRad: number): void;
  onReset(): void;
  onEnd(): void;
}

const RAD_TO_DEG = 180 / Math.PI;
const DEG_TO_RAD = Math.PI / 180;

function elementLabel(document: RigDocument, id: string): string {
  return document.elements.find((element) => element.id === id)?.name ?? id;
}

export function RevoluteTestPanel({ document, session, startDisabled, onBegin, onAngle, onReset, onEnd }: RevoluteTestPanelProps) {
  const revolutes = useMemo(() => document.relations.filter((relation) => relation.type === 'revolute'), [document.relations]);
  const [relationId, setRelationId] = useState(() => revolutes[0]?.id ?? '');
  const activeRelationId = session.state.active && session.relationId ? session.relationId : relationId;

  useEffect(() => {
    if (session.state.active) return;
    if (!revolutes.some((relation) => relation.id === relationId)) setRelationId(revolutes[0]?.id ?? '');
  }, [relationId, revolutes, session.state.active]);

  const movingOptions = useMemo(() => {
    if (!activeRelationId) return [];
    try { return revoluteTestMovingElementIds(document, activeRelationId); }
    catch { return []; }
  }, [activeRelationId, document]);
  const [movingElementId, setMovingElementId] = useState(() => movingOptions[0] ?? '');
  const activeMovingElementId = session.state.active && session.movingElementId ? session.movingElementId : movingElementId;

  useEffect(() => {
    if (session.state.active) return;
    if (!movingOptions.includes(movingElementId)) setMovingElementId(movingOptions[0] ?? '');
  }, [movingElementId, movingOptions, session.state.active]);

  const relation = document.relations.find((candidate) => candidate.id === activeRelationId && candidate.type === 'revolute');
  const lowerDeg = relation?.type === 'revolute' && relation.limits ? relation.limits.lowerRad * RAD_TO_DEG : -90;
  const upperDeg = relation?.type === 'revolute' && relation.limits ? relation.limits.upperRad * RAD_TO_DEG : 90;
  const angleDeg = session.state.active ? revoluteTestAngleRad(session) * RAD_TO_DEG : 0;
  const testMode = !session.state.active ? 'ready' : session.state.result ? 'evaluated' : 'authored-reset';
  const canBegin = Boolean(activeRelationId && activeMovingElementId && movingOptions.includes(activeMovingElementId) && !startDisabled && !session.state.active);

  const applyDegrees = (value: number) => {
    if (!session.state.active || !Number.isFinite(value)) return;
    onAngle(value * DEG_TO_RAD);
  };

  return (
    <div
      className="binding-preview-card"
      data-revolute-test-panel
      data-test-active={session.state.active ? 'true' : 'false'}
      data-test-mode={testMode}
    >
      <div className="binding-preview-head"><strong>Revolute TEST</strong><span>{testMode}</span></div>
      {revolutes.length === 0 ? (
        <div className="empty-copy">Create an authored revolute before starting TEST.</div>
      ) : (
        <>
          <label className="inspector-group-title" htmlFor="test-revolute-relation">Relation</label>
          <select
            id="test-revolute-relation"
            className="navigator-filter"
            aria-label="TEST revolute relation"
            value={activeRelationId}
            disabled={session.state.active}
            onChange={(event) => setRelationId(event.target.value)}
          >
            {revolutes.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.id}</option>)}
          </select>

          <label className="inspector-group-title" htmlFor="test-revolute-moving-element">Moving element</label>
          <select
            id="test-revolute-moving-element"
            className="navigator-filter"
            aria-label="TEST moving element"
            value={activeMovingElementId}
            disabled={session.state.active}
            onChange={(event) => setMovingElementId(event.target.value)}
          >
            {movingOptions.map((id) => <option key={id} value={id}>{elementLabel(document, id)} · {id}</option>)}
          </select>

          {session.state.active ? (
            <>
              <label className="inspector-group-title" htmlFor="test-revolute-angle">Angle</label>
              <input
                id="test-revolute-angle"
                type="range"
                min={lowerDeg}
                max={upperDeg}
                step={1}
                value={Math.min(upperDeg, Math.max(lowerDeg, angleDeg))}
                aria-label="TEST revolute angle slider"
                onChange={(event) => applyDegrees(Number(event.target.value))}
              />
              <input
                className="navigator-filter"
                type="number"
                min={lowerDeg}
                max={upperDeg}
                step="1"
                value={Number(angleDeg.toFixed(6))}
                aria-label="TEST revolute angle degrees"
                onChange={(event) => applyDegrees(Number(event.target.value))}
              />
              <div className="construction-result" data-test-angle-deg={angleDeg}>
                <div><strong>{session.state.result ? 'EVALUATED' : 'AUTHORED neutral'}</strong></div>
                <div>Angle {angleDeg.toFixed(3)}°</div>
                {session.state.result?.diagnostics.map((diagnostic) => <small key={diagnostic.code}>{diagnostic.message}</small>)}
                {!session.state.result ? <small>Evaluator influence cleared; authored neutral is displayed.</small> : null}
              </div>
            </>
          ) : null}

          <div className="topbar-actions">
            {!session.state.active ? (
              <button type="button" className="binding-preview-button active" disabled={!canBegin} onClick={() => onBegin(activeRelationId, activeMovingElementId)}>Start TEST</button>
            ) : (
              <>
                <button type="button" className="binding-preview-button" onClick={onReset}>Reset</button>
                <button type="button" className="binding-preview-button" onClick={onEnd}>End TEST</button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
