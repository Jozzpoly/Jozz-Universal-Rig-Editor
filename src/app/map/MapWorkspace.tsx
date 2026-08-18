import { useCallback, useState } from 'react';
import {
  applyCommand,
  beginPreview,
  cancelPreview,
  commitPreview,
  createEditorSession,
  redo,
  undo,
  updatePreview,
  visibleDocument,
  type EditorSession,
} from '../../editor/session.js';
import {
  planMapBoxFaceResize,
  setMapBoxFaceResizeResult,
  type MapAxis,
  type MapBoxResizeOrigin,
  type MapFaceSide,
} from '../../features/map-resize/box-face-resize.js';
import { setMapBoxHalfExtents } from '../../features/map-resize/box-resize.js';
import { setMapEntityPose } from '../../features/map-transform/command.js';
import { SYNTHETIC_MAP } from '../../fixtures/synthetic-map.js';
import type { MapDocument, MapRigidPose, MapVec3 } from '../../map/types.js';
import type { MapTransformMode } from '../../render/map-viewport-controller.js';
import { workspaceSearch } from '../workspace/workspace-navigation.js';
import { MapBoxDimensionsEditor } from './MapBoxDimensionsEditor.js';
import { MapViewport } from './MapViewport.js';
import './map-workspace.css';

function formatNumber(value: number): string {
  return Number.isFinite(value) ? value.toFixed(3) : '—';
}

function faceLabel(axis: MapAxis, side: MapFaceSide): string {
  return `${side > 0 ? '+' : '-'}${axis.toUpperCase()}`;
}

export function MapWorkspace() {
  const [session, setSession] = useState<EditorSession<MapDocument>>(() => createEditorSession(SYNTHETIC_MAP));
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>('entity.bumper');
  const [transformMode, setTransformMode] = useState<MapTransformMode>('translate');
  const [fitRequest, setFitRequest] = useState(0);
  const [status, setStatus] = useState('Synthetic map · authored primitive lab · unsaved');

  const document = visibleDocument(session);
  const selectedEntity = selectedEntityId
    ? document.entities.find((entity) => entity.id === selectedEntityId) ?? null
    : null;
  const resizeAvailable = selectedEntity?.collision.kind === 'box';

  const selectEntity = useCallback((entityId: string | null) => {
    setSelectedEntityId(entityId);
    if (!entityId) return;
    const target = document.entities.find((entity) => entity.id === entityId);
    if (transformMode === 'resize' && target?.collision.kind !== 'box') {
      setTransformMode('translate');
      setStatus(`Selected ${entityId} · Resize remains box-only until capsule semantics are grounded`);
    }
  }, [document, transformMode]);

  const handleTransformStart = useCallback((entityId: string) => {
    setSession((current) => beginPreview(
      current,
      `${transformMode === 'resize' ? 'Resize' : 'Transform'} map entity ${entityId}`,
    ));
    if (transformMode === 'resize') {
      setStatus(`Resizing ${entityId} · opposite face fixed · hold Alt for center resize`);
    }
  }, [transformMode]);

  const handleTransformPreview = useCallback((entityId: string, pose: MapRigidPose) => {
    setSession((current) => {
      const started = current.preview ? current : beginPreview(current, `Transform map entity ${entityId}`);
      return updatePreview(started, setMapEntityPose(entityId, pose));
    });
  }, []);

  const handleBoxFaceResizePreview = useCallback((
    entityId: string,
    axis: MapAxis,
    side: MapFaceSide,
    outwardDelta: number,
    origin: MapBoxResizeOrigin,
  ) => {
    setSession((current) => {
      const started = current.preview ? current : beginPreview(current, `Resize map box face ${entityId}`);
      const baseline = started.preview?.baseline ?? started.committed;
      const entity = baseline.entities.find((entry) => entry.id === entityId);
      if (!entity) throw new Error(`Map entity ${entityId} not found.`);
      if (entity.collision.kind !== 'box') {
        throw new Error(`Map entity ${entityId} is ${entity.collision.kind}, not box geometry.`);
      }
      const result = planMapBoxFaceResize(
        entity.pose,
        entity.collision.halfExtents,
        axis,
        side,
        outwardDelta,
        origin,
      );
      return updatePreview(started, setMapBoxFaceResizeResult(entityId, result));
    });

    const draggedFace = faceLabel(axis, side);
    if (origin === 'center') {
      setStatus(`Resize ${entityId} · ${draggedFace} · CENTER symmetric (Alt)`);
    } else {
      setStatus(`Resize ${entityId} · ${draggedFace} · ANCHORED · ${faceLabel(axis, side === 1 ? -1 : 1)} fixed`);
    }
  }, []);

  const commitBoxHalfExtents = useCallback((entityId: string, halfExtents: MapVec3) => {
    setSession((current) => applyCommand(current, setMapBoxHalfExtents(entityId, halfExtents)));
    setStatus(`Authored dimensions committed for ${entityId} · center preserved · unsaved`);
  }, []);

  const handleTransformCommit = useCallback((entityId: string) => {
    setSession((current) => commitPreview(current));
    setStatus(`Committed ${entityId} · unsaved`);
  }, []);

  const handleTransformCancel = useCallback((entityId: string) => {
    setSession((current) => cancelPreview(current));
    setStatus(`Cancelled ${entityId} ${transformMode === 'resize' ? 'resize' : 'transform'}`);
  }, [transformMode]);

  const switchToRig = () => {
    window.location.search = workspaceSearch(window.location.search, 'rig');
  };

  return (
    <div className="map-workspace">
      <header className="map-topbar">
        <div className="map-brand">
          <strong>JURE</strong>
          <span>Map Lab</span>
          <em>experimental</em>
        </div>
        <div className="map-toolbar" aria-label="Map authoring tools">
          <button className={transformMode === 'translate' ? 'active' : ''} onClick={() => setTransformMode('translate')}>Move</button>
          <button className={transformMode === 'rotate' ? 'active' : ''} onClick={() => setTransformMode('rotate')}>Rotate</button>
          <button
            className={transformMode === 'resize' ? 'active' : ''}
            disabled={!resizeAvailable}
            title={resizeAvailable ? 'Resize signed box faces; hold Alt to resize from center' : 'Resize currently supports box geometry only'}
            onClick={() => setTransformMode('resize')}
          >
            Resize
          </button>
          <button onClick={() => setFitRequest((value) => value + 1)}>Fit Map</button>
          <span className="map-toolbar-separator" />
          <button disabled={session.past.length === 0 || Boolean(session.preview)} onClick={() => setSession((current) => undo(current))}>Undo</button>
          <button disabled={session.future.length === 0 || Boolean(session.preview)} onClick={() => setSession((current) => redo(current))}>Redo</button>
        </div>
        <div className="map-document-chip">
          <span>{document.documentId}</span>
          <small>rev {session.committed.revision}{session.preview ? ' · preview' : ''}</small>
        </div>
        <button className="map-rig-return" onClick={switchToRig}>Rig Workspace</button>
      </header>

      <aside className="map-navigator">
        <div className="map-panel-heading">
          <span>Map entities</span>
          <small>{document.entities.length}</small>
        </div>
        <div className="map-entity-list">
          {document.entities.map((entity) => (
            <button
              key={entity.id}
              className={entity.id === selectedEntityId ? 'selected' : ''}
              onClick={() => selectEntity(entity.id)}
            >
              <span>{entity.name}</span>
              <small>{entity.collision.kind}</small>
            </button>
          ))}
        </div>
        <div className="map-panel-heading map-spawn-heading">
          <span>Spawn points</span>
          <small>{document.spawnPoints.length}</small>
        </div>
        <div className="map-spawn-list">
          {document.spawnPoints.map((spawn) => (
            <div key={spawn.id}>
              <span>{spawn.id}</span>
              <small>{formatNumber(spawn.pose.position.x)}, {formatNumber(spawn.pose.position.y)}, {formatNumber(spawn.pose.position.z)}</small>
            </div>
          ))}
        </div>
      </aside>

      <main className="map-canvas-region">
        <MapViewport
          document={document}
          selectedEntityId={selectedEntityId}
          transformMode={transformMode}
          fitRequest={fitRequest}
          onSelect={selectEntity}
          onTransformStart={handleTransformStart}
          onTransformPreview={handleTransformPreview}
          onBoxFaceResizePreview={handleBoxFaceResizePreview}
          onTransformCommit={handleTransformCommit}
          onTransformCancel={handleTransformCancel}
        />
        <div className="map-viewport-hint">
          LMB select · Move/Rotate gizmo · Resize: drag colored face handles · Alt = center · background orbit · wheel zoom · Esc cancels
        </div>
      </main>

      <aside className="map-inspector">
        <div className="map-panel-heading"><span>Inspector</span></div>
        {selectedEntity ? (
          <div className="map-inspector-content">
            <div className="map-inspector-title">
              <strong>{selectedEntity.name}</strong>
              <code>{selectedEntity.id}</code>
            </div>
            <section>
              <h3>Pose</h3>
              <dl>
                <div><dt>X</dt><dd>{formatNumber(selectedEntity.pose.position.x)} m</dd></div>
                <div><dt>Y</dt><dd>{formatNumber(selectedEntity.pose.position.y)} m</dd></div>
                <div><dt>Z</dt><dd>{formatNumber(selectedEntity.pose.position.z)} m</dd></div>
              </dl>
            </section>
            <section>
              <h3>Collision</h3>
              <dl>
                <div><dt>Kind</dt><dd>{selectedEntity.collision.kind}</dd></div>
              </dl>
              {selectedEntity.collision.kind === 'box' ? (
                <>
                  <MapBoxDimensionsEditor
                    entityId={selectedEntity.id}
                    halfExtents={selectedEntity.collision.halfExtents}
                    disabled={Boolean(session.preview)}
                    onCommit={(halfExtents) => commitBoxHalfExtents(selectedEntity.id, halfExtents)}
                  />
                  <details className="map-advanced-readout">
                    <summary>Half-extents storage</summary>
                    <dl>
                      <div><dt>X</dt><dd>{formatNumber(selectedEntity.collision.halfExtents.x)} m</dd></div>
                      <div><dt>Y</dt><dd>{formatNumber(selectedEntity.collision.halfExtents.y)} m</dd></div>
                      <div><dt>Z</dt><dd>{formatNumber(selectedEntity.collision.halfExtents.z)} m</dd></div>
                    </dl>
                  </details>
                </>
              ) : (
                <dl>
                  <div><dt>Radius</dt><dd>{formatNumber(selectedEntity.collision.radius)} m</dd></div>
                  <div><dt>Axis A</dt><dd>{formatNumber(selectedEntity.collision.pointA.x)}, {formatNumber(selectedEntity.collision.pointA.y)}, {formatNumber(selectedEntity.collision.pointA.z)}</dd></div>
                  <div><dt>Axis B</dt><dd>{formatNumber(selectedEntity.collision.pointB.x)}, {formatNumber(selectedEntity.collision.pointB.y)}, {formatNumber(selectedEntity.collision.pointB.z)}</dd></div>
                </dl>
              )}
            </section>
            <section>
              <h3>Surface</h3>
              <dl><div><dt>Friction</dt><dd>{formatNumber(selectedEntity.surface.friction)}</dd></div></dl>
            </section>
            <p className="map-inspector-note">
              {selectedEntity.collision.kind === 'box'
                ? 'Face Resize keeps the opposite face fixed by default and moves authored center as needed. Hold Alt to resize symmetrically from center. Exact Dimensions preserve center.'
                : 'Capsule geometry remains read-only until its independent axial/radial resize semantics are grounded.'}
            </p>
          </div>
        ) : (
          <p className="map-empty-selection">Select a map entity in the viewport or navigator.</p>
        )}
      </aside>

      <footer className="map-statusbar">
        <span>MapDocument v1</span>
        <span>+X forward · +Y up · +Z right</span>
        <span className="map-status-message">{status}</span>
      </footer>
    </div>
  );
}
