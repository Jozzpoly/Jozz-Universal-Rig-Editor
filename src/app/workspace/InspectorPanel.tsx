import { type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Euler, MathUtils, Quaternion } from 'three';
import type { TransformTarget } from '../../editor/transform-target.js';
import type { RigidPose, RigElement, RigFrame } from '../../kernel/types.js';
import type { SourceNodeInspection } from '../../source/types.js';

interface InspectorPanelProps {
  selectedElement: RigElement | null;
  selectedFrame: RigFrame | null;
  selectedPose: RigidPose | null;
  selectedSourceNode: SourceNodeInspection | null;
  selectedSourceWorldPose: RigidPose | null;
  sourceInstanceName: string | null;
  onCommitPose(target: TransformTarget, pose: RigidPose): void;
  onFocusSource(): void;
}

const AXES = ['x', 'y', 'z'] as const;
type Axis = typeof AXES[number];

function commitOnEnter(event: ReactKeyboardEvent<HTMLInputElement>) {
  if (event.key === 'Enter') event.currentTarget.blur();
}

function PositionEditor({ target, pose, label, onCommit }: { target: TransformTarget; pose: RigidPose; label: string; onCommit: InspectorPanelProps['onCommitPose'] }) {
  return (
    <div className="inspector-group transform-group">
      <div className="inspector-group-title">{label}</div>
      <div className="vector-grid">
        {AXES.map((axis) => (
          <label key={axis} className={`axis-field axis-${axis}`}>
            <span>{axis.toUpperCase()}</span>
            <input
              type="number"
              step="0.001"
              defaultValue={pose.position[axis]}
              key={`${target.kind}-${target.id}-${axis}-${pose.position[axis]}`}
              onKeyDown={commitOnEnter}
              onBlur={(event) => {
                const value = Number(event.target.value);
                if (!Number.isFinite(value) || value === pose.position[axis]) return;
                onCommit(target, { ...pose, position: { ...pose.position, [axis]: value } });
              }}
            />
          </label>
        ))}
      </div>
    </div>
  );
}

function quaternionToEulerDegrees(pose: RigidPose): Record<Axis, number> {
  const quaternion = new Quaternion(pose.rotation.x, pose.rotation.y, pose.rotation.z, pose.rotation.w).normalize();
  const euler = new Euler().setFromQuaternion(quaternion, 'XYZ');
  return { x: MathUtils.radToDeg(euler.x), y: MathUtils.radToDeg(euler.y), z: MathUtils.radToDeg(euler.z) };
}

function poseWithEulerAxis(pose: RigidPose, axis: Axis, degrees: number): RigidPose {
  const quaternion = new Quaternion(pose.rotation.x, pose.rotation.y, pose.rotation.z, pose.rotation.w).normalize();
  const euler = new Euler().setFromQuaternion(quaternion, 'XYZ');
  euler[axis] = MathUtils.degToRad(degrees);
  const next = new Quaternion().setFromEuler(euler).normalize();
  return { ...pose, rotation: { x: next.x, y: next.y, z: next.z, w: next.w } };
}

function RotationEditor({ target, pose, onCommit }: { target: TransformTarget; pose: RigidPose; onCommit: InspectorPanelProps['onCommitPose'] }) {
  const degrees = quaternionToEulerDegrees(pose);
  const rotationKey = `${pose.rotation.x}:${pose.rotation.y}:${pose.rotation.z}:${pose.rotation.w}`;
  return (
    <div className="inspector-group transform-group">
      <div className="inspector-group-title">Rotation · XYZ Euler · deg</div>
      <div className="vector-grid rotation-grid">
        {AXES.map((axis) => (
          <label key={axis} className={`axis-field axis-${axis}`}>
            <span>{axis.toUpperCase()}</span>
            <input
              type="number"
              step="0.1"
              defaultValue={Number(degrees[axis].toFixed(4))}
              key={`${target.kind}-${target.id}-${axis}-${rotationKey}`}
              onKeyDown={commitOnEnter}
              onBlur={(event) => {
                const value = Number(event.target.value);
                if (!Number.isFinite(value) || Math.abs(value - degrees[axis]) < 1e-10) return;
                onCommit(target, poseWithEulerAxis(pose, axis, value));
              }}
            />
          </label>
        ))}
      </div>
      <details className="advanced-readout">
        <summary>Quaternion storage</summary>
        <div className="quat-inline">
          {Object.entries(pose.rotation).map(([key, value]) => <span key={key}><b>{key.toUpperCase()}</b> {value.toFixed(6)}</span>)}
        </div>
      </details>
    </div>
  );
}

function AuthoredInspector({ selectedElement, selectedFrame, selectedPose, onCommitPose }: Pick<InspectorPanelProps, 'selectedElement' | 'selectedFrame' | 'selectedPose' | 'onCommitPose'>) {
  if (selectedElement && selectedPose) {
    const target: TransformTarget = { kind: 'element', id: selectedElement.id };
    return (
      <section className="selection-context authored-context">
        <div className="context-label"><span className="context-dot" />Authored · Element</div>
        <div className="inspector-name">{selectedElement.name}</div>
        <dl className="meta-list compact-meta">
          <dt>ID</dt><dd>{selectedElement.id}</dd>
          <dt>Source</dt><dd>{selectedElement.source?.locator ?? '—'}</dd>
          <dt>Space</dt><dd>rig-root rigid pose</dd>
        </dl>
        <PositionEditor target={target} pose={selectedPose} label="Position · m" onCommit={onCommitPose} />
        <RotationEditor target={target} pose={selectedPose} onCommit={onCommitPose} />
        <div className="context-footnote">Moving the element carries its owned frames without changing their local authored poses.</div>
      </section>
    );
  }

  if (selectedFrame && selectedPose) {
    const target: TransformTarget = { kind: 'frame', id: selectedFrame.id };
    return (
      <section className="selection-context authored-context">
        <div className="context-label"><span className="context-dot" />Authored · Frame</div>
        <div className="inspector-name">{selectedFrame.name}</div>
        <dl className="meta-list compact-meta">
          <dt>ID</dt><dd>{selectedFrame.id}</dd>
          <dt>Owner</dt><dd>{selectedFrame.ownerElementId ?? 'rig-root'}</dd>
          <dt>Role</dt><dd>{selectedFrame.role ?? '—'}</dd>
          <dt>Truth</dt><dd>{selectedFrame.provenance.kind}</dd>
        </dl>
        <PositionEditor target={target} pose={selectedPose} label="Local position · m" onCommit={onCommitPose} />
        <RotationEditor target={target} pose={selectedPose} onCommit={onCommitPose} />
        <div className="context-footnote">This frame is authored in its owner's local rigid space.</div>
      </section>
    );
  }

  return (
    <section className="selection-context authored-context empty-context">
      <div className="context-label"><span className="context-dot" />Authored</div>
      <div className="empty-copy">Select a RigElement or RigFrame to edit its rigid pose.</div>
    </section>
  );
}

function SourceInspector({ selectedSourceNode, selectedSourceWorldPose, sourceInstanceName, onFocusSource }: Pick<InspectorPanelProps, 'selectedSourceNode' | 'selectedSourceWorldPose' | 'sourceInstanceName' | 'onFocusSource'>) {
  return (
    <section className={`selection-context source-context ${selectedSourceNode ? '' : 'empty-context'}`}>
      <div className="context-label"><span className="context-dot" />Source · Exact reference</div>
      {selectedSourceNode ? (
        <>
          <div className="inspector-name">{selectedSourceNode.name ?? `Node ${selectedSourceNode.index}`}</div>
          <dl className="meta-list compact-meta">
            <dt>Instance</dt><dd>{sourceInstanceName ?? '—'}</dd>
            <dt>Locator</dt><dd>{selectedSourceNode.locator}</dd>
            <dt>Kind</dt><dd>{selectedSourceNode.isSkinJoint ? 'joint' : selectedSourceNode.hasMesh ? 'mesh' : 'node'}</dd>
            <dt>Rigid</dt><dd>{selectedSourceNode.rigidCompatibility}</dd>
            <dt>Truth</dt><dd>read-only source datum</dd>
          </dl>
          {selectedSourceWorldPose ? (
            <div className="inspector-group source-position-group">
              <div className="inspector-group-title">Placed project-world position · m</div>
              <div className="source-pose-readout">
                {AXES.map((axis) => (
                  <div key={axis} className={`axis-readout axis-${axis}`}><span>{axis.toUpperCase()}</span><code>{selectedSourceWorldPose.position[axis].toFixed(6)}</code></div>
                ))}
              </div>
              <button className="source-focus-button" onClick={onFocusSource}>Focus source datum</button>
            </div>
          ) : (
            <div className="context-warning">No rigid placed pose exposed. JURE will not invent one from scaled, matrix or non-rigid ancestry.</div>
          )}
        </>
      ) : (
        <div className="empty-copy">Select a SOURCE node to inspect its exact datum on the active placed instance.</div>
      )}
    </section>
  );
}

export function InspectorPanel({ selectedElement, selectedFrame, selectedPose, selectedSourceNode, selectedSourceWorldPose, sourceInstanceName, onCommitPose, onFocusSource }: InspectorPanelProps) {
  const hasAuthored = Boolean((selectedElement || selectedFrame) && selectedPose);
  return (
    <div className="inspector-panel">
      <div className="panel-title">Inspector</div>
      <div className="inspector-scroll">
        <AuthoredInspector selectedElement={selectedElement} selectedFrame={selectedFrame} selectedPose={selectedPose} onCommitPose={onCommitPose} />
        {hasAuthored && selectedSourceNode ? (
          <div className="selection-pair"><span className="selection-mark authored" />Authored <span className="pair-connector">+</span><span className="selection-mark source" />Source <span className="pair-note">independent selections</span></div>
        ) : null}
        <SourceInspector selectedSourceNode={selectedSourceNode} selectedSourceWorldPose={selectedSourceWorldPose} sourceInstanceName={sourceInstanceName} onFocusSource={onFocusSource} />
      </div>
    </div>
  );
}
