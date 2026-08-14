import type { TransformTarget } from '../../editor/transform-target.js';
import type { RigidPose, RigElement, RigFrame } from '../../kernel/types.js';
import type { SourceNodeInspection } from '../../source/types.js';

interface InspectorPanelProps {
  selectedElement: RigElement | null;
  selectedFrame: RigFrame | null;
  selectedPose: RigidPose | null;
  selectedSourceNode: SourceNodeInspection | null;
  onCommitNumericPosition(target: TransformTarget, pose: RigidPose, axis: 'x' | 'y' | 'z', value: number): void;
  onFocusSource(): void;
}

function PositionEditor({ target, pose, label, onCommit }: { target: TransformTarget; pose: RigidPose; label: string; onCommit: InspectorPanelProps['onCommitNumericPosition'] }) {
  return (
    <div className="inspector-group">
      <div className="inspector-group-title">{label}</div>
      <div className="vector-grid">
        {(['x', 'y', 'z'] as const).map((axis) => (
          <label key={axis}>
            <span>{axis.toUpperCase()}</span>
            <input
              type="number"
              step="0.001"
              defaultValue={pose.position[axis]}
              key={`${target.kind}-${target.id}-${axis}-${pose.position[axis]}`}
              onBlur={(event) => onCommit(target, pose, axis, Number(event.target.value))}
            />
          </label>
        ))}
      </div>
    </div>
  );
}

function QuaternionReadout({ pose }: { pose: RigidPose }) {
  return (
    <div className="inspector-group">
      <div className="inspector-group-title">Rotation · quaternion storage</div>
      <div className="quat-readout">
        {Object.entries(pose.rotation).map(([key, value]) => <div key={key}><span>{key.toUpperCase()}</span><code>{value.toFixed(6)}</code></div>)}
      </div>
      <div className="micro-note">Human-friendly degree editing is intentionally deferred to the next UX slice; storage stays quaternion.</div>
    </div>
  );
}

export function InspectorPanel({ selectedElement, selectedFrame, selectedPose, selectedSourceNode, onCommitNumericPosition, onFocusSource }: InspectorPanelProps) {
  return (
    <div className="inspector-panel">
      <div className="panel-title">Inspector</div>
      <div className="inspector-scroll">
        <section className="selection-context authored-context">
          <div className="context-label">Authored selection</div>
          {selectedElement && selectedPose ? (
            <>
              <div className="inspector-name">{selectedElement.name}</div>
              <dl className="meta-list">
                <dt>ID</dt><dd>{selectedElement.id}</dd>
                <dt>Kind</dt><dd>RigElement</dd>
                <dt>Source</dt><dd>{selectedElement.source?.locator ?? '—'}</dd>
                <dt>Truth</dt><dd>authored rigid element</dd>
              </dl>
              <PositionEditor target={{ kind: 'element', id: selectedElement.id }} pose={selectedPose} label="Rig-root position · m" onCommit={onCommitNumericPosition} />
              <QuaternionReadout pose={selectedPose} />
              <div className="truth-note">Move/Rotate edits the whole element. Owned frames keep their local authored poses and follow in resolved world space.</div>
            </>
          ) : selectedFrame && selectedPose ? (
            <>
              <div className="inspector-name">{selectedFrame.name}</div>
              <dl className="meta-list">
                <dt>ID</dt><dd>{selectedFrame.id}</dd>
                <dt>Owner</dt><dd>{selectedFrame.ownerElementId ?? 'rig-root'}</dd>
                <dt>Role</dt><dd>{selectedFrame.role ?? '—'}</dd>
                <dt>Truth</dt><dd>{selectedFrame.provenance.kind}</dd>
              </dl>
              <PositionEditor target={{ kind: 'frame', id: selectedFrame.id }} pose={selectedPose} label="Local position · m" onCommit={onCommitNumericPosition} />
              <QuaternionReadout pose={selectedPose} />
              <div className="truth-note">Move/Rotate edits this frame in its owner-local authored space. View/camera/runtime state is not serialized.</div>
            </>
          ) : (
            <div className="empty-copy">Select a RigElement or RigFrame to author its rigid pose.</div>
          )}
        </section>

        <div className="selection-independence"><span className="selection-mark authored" /> authored <b>+</b><span className="selection-mark source" /> SOURCE can stay selected at the same time</div>

        <section className="selection-context source-context">
          <div className="context-label">Source selection · read only</div>
          {selectedSourceNode ? (
            <>
              <div className="inspector-name">{selectedSourceNode.name ?? `Node ${selectedSourceNode.index}`}</div>
              <dl className="meta-list">
                <dt>Locator</dt><dd>{selectedSourceNode.locator}</dd>
                <dt>Kind</dt><dd>{selectedSourceNode.isSkinJoint ? 'joint' : selectedSourceNode.hasMesh ? 'mesh' : 'node'}</dd>
                <dt>Rigid</dt><dd>{selectedSourceNode.rigidCompatibility}</dd>
                <dt>Authored</dt><dd>no</dd>
              </dl>
              {selectedSourceNode.worldRigidPose ? (
                <div className="inspector-group">
                  <div className="inspector-group-title">Resolved SOURCE world position · m</div>
                  <div className="source-pose-readout">
                    {(['x', 'y', 'z'] as const).map((axis) => (
                      <div key={axis}><span>{axis.toUpperCase()}</span><code>{selectedSourceNode.worldRigidPose!.position[axis].toFixed(6)}</code></div>
                    ))}
                  </div>
                  <button className="source-focus-button" onClick={onFocusSource}>Focus source datum</button>
                </div>
              ) : (
                <div className="truth-note source-warning">No rigid world pose is exposed for this node. JURE will not invent one from scaled/matrix/non-rigid ancestry.</div>
              )}
            </>
          ) : (
            <div className="empty-copy">Select a SOURCE node to inspect its exact reference datum independently from the authored rig.</div>
          )}
        </section>
      </div>
    </div>
  );
}
