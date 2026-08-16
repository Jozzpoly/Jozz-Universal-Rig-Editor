import { useMemo, useState } from 'react';
import {
  createOrthogonalCrossAxisFrameLocator,
  resolveOrthogonalCrossAxisFrameLocator,
} from '../../source/construction-frame-locator.js';
import type { SourceInspection } from '../../source/types.js';

interface ConstructionFrameBuilderProps {
  inspection: SourceInspection;
  adoptionTargetName?: string | null;
  disabled?: boolean;
  onPreview?(locator: string, frameName: string): void;
}

function formatCoordinate(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(6).replace(/0+$/u, '').replace(/\.$/u, '');
}

function formatVec3(value: { x: number; y: number; z: number }): string {
  return `[${formatCoordinate(value.x)}, ${formatCoordinate(value.y)}, ${formatCoordinate(value.z)}]`;
}

export function ConstructionFrameBuilder({ inspection, adoptionTargetName = null, disabled = false, onPreview }: ConstructionFrameBuilderProps) {
  const points = inspection.derivedPointDatums ?? [];
  const rigidNodes = useMemo(
    () => inspection.nodes.filter((node) => node.rigidCompatibility === 'rigid' && node.worldRigidPose),
    [inspection.nodes],
  );
  const [originPointLocator, setOriginPointLocator] = useState('');
  const [radialEndpointPointLocator, setRadialEndpointPointLocator] = useState('');
  const [upStartNodeLocator, setUpStartNodeLocator] = useState('');
  const [upEndNodeLocator, setUpEndNodeLocator] = useState('');
  const [frameName, setFrameName] = useState('Constructed frame');

  const construction = useMemo(() => {
    if (!originPointLocator || !radialEndpointPointLocator || !upStartNodeLocator || !upEndNodeLocator) return null;
    try {
      const locator = createOrthogonalCrossAxisFrameLocator({
        originPointLocator,
        radialEndpointPointLocator,
        upStartNodeLocator,
        upEndNodeLocator,
      });
      return {
        locator,
        frame: resolveOrthogonalCrossAxisFrameLocator(inspection, locator, frameName.trim() || 'Constructed frame'),
        error: null,
      };
    } catch (error) {
      return {
        locator: null,
        frame: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }, [frameName, inspection, originPointLocator, radialEndpointPointLocator, upEndNodeLocator, upStartNodeLocator]);

  if (points.length < 2 || rigidNodes.length < 2) return null;

  const canPreview = Boolean(
    construction?.locator
      && construction.frame
      && frameName.trim()
      && adoptionTargetName
      && onPreview
      && !disabled,
  );

  return (
    <div className="binding-preview-card construction-frame-builder" data-construction-frame-builder>
      <div className="binding-preview-head">
        <strong>Construct frame from SOURCE evidence</strong>
        <span>disposable recipe</span>
      </div>
      <small className="construction-help">
        Choose an origin point, a second point for radial direction, and an independent exact SOURCE span for up. JURE derives a right-handed rigid frame; nothing becomes authored until Preview/Commit.
      </small>

      <label className="construction-field">
        <span>Origin point</span>
        <select
          className="navigator-filter"
          aria-label="Construction origin point"
          value={originPointLocator}
          disabled={disabled}
          onChange={(event) => setOriginPointLocator(event.target.value)}
        >
          <option value="">Choose geometry-derived point…</option>
          {points.map((point) => <option key={point.locator} value={point.locator}>{point.name}</option>)}
        </select>
      </label>

      <label className="construction-field">
        <span>Radial endpoint</span>
        <select
          className="navigator-filter"
          aria-label="Construction radial endpoint"
          value={radialEndpointPointLocator}
          disabled={disabled}
          onChange={(event) => setRadialEndpointPointLocator(event.target.value)}
        >
          <option value="">Choose second geometry-derived point…</option>
          {points.map((point) => <option key={point.locator} value={point.locator}>{point.name}</option>)}
        </select>
      </label>

      <label className="construction-field">
        <span>Up span start</span>
        <select
          className="navigator-filter"
          aria-label="Construction up span start"
          value={upStartNodeLocator}
          disabled={disabled}
          onChange={(event) => setUpStartNodeLocator(event.target.value)}
        >
          <option value="">Choose exact rigid SOURCE datum…</option>
          {rigidNodes.map((node) => <option key={node.locator} value={node.locator}>{node.name ?? node.locator}</option>)}
        </select>
      </label>

      <label className="construction-field">
        <span>Up span end</span>
        <select
          className="navigator-filter"
          aria-label="Construction up span end"
          value={upEndNodeLocator}
          disabled={disabled}
          onChange={(event) => setUpEndNodeLocator(event.target.value)}
        >
          <option value="">Choose exact rigid SOURCE datum…</option>
          {rigidNodes.map((node) => <option key={node.locator} value={node.locator}>{node.name ?? node.locator}</option>)}
        </select>
      </label>

      <label className="construction-field">
        <span>Authored frame name</span>
        <input
          className="navigator-filter"
          aria-label="Constructed frame name"
          value={frameName}
          disabled={disabled}
          onChange={(event) => setFrameName(event.target.value)}
        />
      </label>

      {construction?.error ? (
        <div className="construction-error" role="status">Cannot construct frame: {construction.error}</div>
      ) : construction?.frame && construction.locator ? (
        <div className="construction-result" data-construction-locator={construction.locator}>
          <div><strong>Origin</strong> <code>{formatVec3(construction.frame.sourceRevisionWorldPose.position)}</code></div>
          <div><strong>+X</strong> <code>{formatVec3(construction.frame.basis.x)}</code></div>
          <div><strong>+Y</strong> <code>{formatVec3(construction.frame.basis.y)}</code></div>
          <div><strong>+Z · primary axis</strong> <code>{formatVec3(construction.frame.basis.z)}</code></div>
          <small>{construction.frame.derivation.algorithm} · |dot| {formatCoordinate(construction.frame.derivation.orthogonalityError)}</small>
          <details>
            <summary>Recipe provenance</summary>
            <code>{construction.locator}</code>
          </details>
        </div>
      ) : (
        <div className="construction-empty">Select four evidence components to resolve a construction frame.</div>
      )}

      <button
        type="button"
        className="binding-preview-button"
        disabled={!canPreview}
        title={!adoptionTargetName ? 'Select one authored RigElement as the frame owner first' : disabled ? 'Finish the active placement/preview operation first' : 'Preview this re-resolvable construction frame before committing authored truth'}
        onClick={() => {
          if (!canPreview || !construction?.locator || !onPreview) return;
          onPreview(construction.locator, frameName.trim());
        }}
      >
        {adoptionTargetName ? `Preview on ${adoptionTargetName}` : 'Select authored element to preview'}
      </button>
    </div>
  );
}
