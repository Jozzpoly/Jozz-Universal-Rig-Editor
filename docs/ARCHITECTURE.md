# Architecture

The durable boundary is intentionally small:

`SOURCE -> proposal -> AUTHORED RigDocument -> resolved view -> representation/display / consumer adapter -> runtime observation`

Only an explicit adoption/edit path may change authored truth. Preview, Three scene state and runtime observations never write back automatically.

## Kernel

- `RigElement`: stable authored identity + neutral rigid pose; not a physics body or renderer object.
- `RigFrame`: local rigid frame owned by a `RigElement` or rig-root. A frame may be a mount, pivot, axis datum, sensor frame, etc. It does not need a relation.
- `RigRelation`: explicit intent between frames. Foundation currently implements only `origin-coincident`.
- `SourceRevision`: exact source identity when a source is explicitly adopted. Its adapter identity defines the meaning of opaque revision-local locators. Merely opening a source file is transient reference state.
- `RigElement.source` / `RigFrame.source`: optional exact source provenance/bindings. They answer where an authored element/frame came from; they do **not** define which rendered geometry must move with an element.

Coordinates are right-handed, Y-up, metres/radians. Frames are authored locally to their owner element. Current v1 deliberately has no generic hierarchy and rigid poses deliberately have no scale.

## Representation boundary

Source provenance and representation binding are different semantics.

A representation binding answers which visual/source representation follows an authored or evaluated `RigElement`. SOURCE reference remains separately inspectable and read-only. BIND-00 proved that an exact glTF skin joint can be driven from an element through a stable rest pose, but also proved that a single global binding is insufficient: a real rig needs multiple simultaneous bindings.

The persistent representation model is intentionally **not frozen yet**. Do not overload `RigElement.source` / `RigFrame.source`, and do not put visual stretch/scale into rigid element/frame pose. Springs, dampers, cardans and similar length-changing visuals belong to representation/evaluation semantics.

## Editor boundary

Selection/transform targets are editor concepts: `RigElement | RigFrame`, not new kernel entities.

A drag is `committed -> preview -> commit/cancel`. The gizmo manipulates one ephemeral world-space proxy. Element world pose writes to the element rigid pose; frame world pose is converted back to its owner-local pose. Moving an element therefore moves its resolved frames while preserving their authored local poses.

Workspace UI state (selection, camera, layers, source preview) is not serialized in `RigDocument`.

Future motion testing must preserve the same truth boundary: `AUTHORED NEUTRAL != transient EVALUATED motion`. Kinematic Test state must be resettable without mutating authored neutral truth.

## Display boundary

`RigDocument -> ResolvedRigView -> representation/display -> Three`.

Three is an adapter. Renderer objects are disposable and contain no authored authority. Camera/navigation is inspection infrastructure and must not inherit gameplay camera clamps.

## Testing loop

Normal feature: only targeted tests protecting expensive semantic invariants. Full `npm run check` + real browser owner gate is used for foundation/checkpoint changes.
