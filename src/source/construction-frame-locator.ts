import { deriveOrthogonalCrossAxisFrame, type SourceDerivedFrameDatum } from './construction-frame.js';
import type { SourceDerivedPointDatumInspection, SourceInspection, SourceNodeInspection } from './types.js';

const PREFIX = 'source.derived-frame:orthogonal-cross-axis-v1:';

export interface OrthogonalCrossAxisFrameRecipe {
  algorithm: 'orthogonal-cross-axis-frame-v1';
  originPointLocator: string;
  radialEndpointPointLocator: string;
  upStartNodeLocator: string;
  upEndNodeLocator: string;
}

function nonEmpty(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} must be non-empty.`);
  return trimmed;
}

function encodeComponent(locator: string, label: string): string {
  return encodeURIComponent(nonEmpty(locator, label));
}

function decodeComponent(value: string, label: string): string {
  try {
    return nonEmpty(decodeURIComponent(value), label);
  } catch (error) {
    if (error instanceof Error && /must be non-empty/.test(error.message)) throw error;
    throw new Error(`${label} is not valid percent-encoded text.`);
  }
}

export function createOrthogonalCrossAxisFrameLocator(recipe: Omit<OrthogonalCrossAxisFrameRecipe, 'algorithm'>): string {
  return `${PREFIX}${[
    encodeComponent(recipe.originPointLocator, 'originPointLocator'),
    encodeComponent(recipe.radialEndpointPointLocator, 'radialEndpointPointLocator'),
    encodeComponent(recipe.upStartNodeLocator, 'upStartNodeLocator'),
    encodeComponent(recipe.upEndNodeLocator, 'upEndNodeLocator'),
  ].join(':')}`;
}

export function parseOrthogonalCrossAxisFrameLocator(locator: string): OrthogonalCrossAxisFrameRecipe | null {
  if (!locator.startsWith(PREFIX)) return null;
  const components = locator.slice(PREFIX.length).split(':');
  if (components.length !== 4) throw new Error(`Invalid orthogonal-cross-axis construction locator component count ${components.length}; expected 4.`);
  return {
    algorithm: 'orthogonal-cross-axis-frame-v1',
    originPointLocator: decodeComponent(components[0], 'originPointLocator'),
    radialEndpointPointLocator: decodeComponent(components[1], 'radialEndpointPointLocator'),
    upStartNodeLocator: decodeComponent(components[2], 'upStartNodeLocator'),
    upEndNodeLocator: decodeComponent(components[3], 'upEndNodeLocator'),
  };
}

function requirePoint(inspection: SourceInspection, locator: string, label: string): SourceDerivedPointDatumInspection {
  const point = (inspection.derivedPointDatums ?? []).find((candidate) => candidate.locator === locator);
  if (!point) throw new Error(`${label} ${locator} is not present in exact SOURCE derived point evidence.`);
  return point;
}

function requireRigidNode(inspection: SourceInspection, locator: string, label: string): SourceNodeInspection {
  const node = inspection.nodes.find((candidate) => candidate.locator === locator);
  if (!node) throw new Error(`${label} ${locator} is not present in exact SOURCE node evidence.`);
  if (node.rigidCompatibility !== 'rigid' || !node.worldRigidPose) throw new Error(`${label} ${locator} is not rigid-compatible.`);
  return node;
}

/**
 * Re-resolve a full construction frame only from one exact SourceInspection and
 * its self-describing versioned locator. No project/runtime placement is used.
 */
export function resolveOrthogonalCrossAxisFrameLocator(
  inspection: SourceInspection,
  locator: string,
  name = 'Constructed SOURCE frame',
): SourceDerivedFrameDatum {
  const recipe = parseOrthogonalCrossAxisFrameLocator(locator);
  if (!recipe) throw new Error(`SOURCE locator ${locator} is not an orthogonal-cross-axis construction frame locator.`);

  const origin = requirePoint(inspection, recipe.originPointLocator, 'Construction origin point');
  const radial = requirePoint(inspection, recipe.radialEndpointPointLocator, 'Construction radial endpoint');
  const upStart = requireRigidNode(inspection, recipe.upStartNodeLocator, 'Construction up-start node');
  const upEnd = requireRigidNode(inspection, recipe.upEndNodeLocator, 'Construction up-end node');

  return deriveOrthogonalCrossAxisFrame({
    locator,
    name,
    origin: { locator: origin.locator, position: origin.sourceRevisionWorldPosition },
    radialEndpoint: { locator: radial.locator, position: radial.sourceRevisionWorldPosition },
    up: {
      startLocator: upStart.locator,
      start: upStart.worldRigidPose.position,
      endLocator: upEnd.locator,
      end: upEnd.worldRigidPose.position,
    },
  });
}
