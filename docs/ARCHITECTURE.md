# Architecture

The durable boundary is intentionally small:

`SOURCE -> proposal -> AUTHORED RigDocument -> resolved view -> display / consumer adapter -> runtime observation`

Only an explicit adoption/edit path may change authored truth. Preview, Three scene state and runtime observations never write back automatically.

## Kernel

- `RigElement`: stable authored identity + neutral rigid pose; not a physics body or renderer object.
- `RigFrame`: local rigid frame owned by a `RigElement` or rig-root. A frame may be a mount, pivot, axis datum, sensor frame, etc. It does not need a relation.
- `RigRelation`: explicit intent between frames. Foundation currently implements only `origin-coincident`.
- `SourceRevision`: exact source identity when a source is explicitly adopted. Its adapter identity defines the meaning of opaque revision-local locators. Merely opening a source file is transient reference state.
- `RigElement.source` / `RigFrame.source`: optional exact source bindings. A later owner edit may change authored provenance without erasing where a source proposal/binding came from.

Coordinates are right-handed, Y-up, metres/radians. Frames are authored locally to their owner element. Current v1 deliberately has no generic hierarchy and rigid poses deliberately have no scale.

## Editor boundary

Selection/transform targets are editor concepts: `RigElement | RigFrame`, not new kernel entities.

A drag is `committed -> preview -> commit/cancel`. The gizmo manipulates one ephemeral world-space proxy. Element world pose writes to the element rigid pose; frame world pose is converted back to its owner-local pose. Moving an element therefore moves its resolved frames while preserving their authored local poses.

Workspace UI state (selection, camera, layers, source preview) is not serialized in `RigDocument`.

## Display boundary

`RigDocument -> ResolvedRigView -> RigDisplayModel -> Three`.

Three is an adapter. Renderer objects are disposable and contain no authored authority. Camera/navigation is inspection infrastructure and must not inherit gameplay camera clamps.

## Testing loop

Normal feature: only targeted tests protecting expensive semantic invariants. Full `npm run check` + real browser owner gate is used for foundation/checkpoint changes.
