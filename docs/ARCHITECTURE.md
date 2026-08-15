# Architecture

The durable boundary is intentionally small:

`SOURCE reference -> explicit authored adoption/edit -> RigDocument -> resolved view -> representation/evaluation -> display / consumer runtime`

Only an explicit authoring path may change authored truth. SOURCE loading, preview state, Three scene state, evaluated motion, and runtime observations never write back automatically.

## Kernel

- `RigElement`: stable authored identity + neutral rigid pose; not a physics body or renderer object.
- `RigFrame`: local rigid frame owned by a `RigElement` or rig-root. It may describe a mount, pivot, axis datum, sensor frame, hardpoint, etc.; a frame does not require a relation.
- `RigRelation`: explicit intent between frames. The current foundation implements only `origin-coincident`.
- `SourceRevision`: exact source identity after explicit adoption/provenance capture. Opaque source locators are meaningful only within the adapter + exact revision that produced them.
- `RigElement.source` / `RigFrame.source`: optional exact source provenance. They answer where authored data came from; they do **not** define which visual geometry moves with an element.

Coordinates are right-handed, Y-up, metres/radians. Frames are authored locally to their owner element. Current rigid poses contain position + rotation only. There is deliberately no generic element hierarchy in the kernel yet.

## SOURCE and representation

Opening glTF/GLB creates an independently inspectable, read-only SOURCE reference. SOURCE selection is separate from authored selection.

Source provenance and representation binding are different semantics. A real assembly can require multiple representation mappings at once, including rigid parts and later length-changing/deforming visuals such as springs, dampers, and cardans. Do not put representation scale/stretch into `RigElement` or `RigFrame` rigid pose.

The persistent source-instance/registration and representation-binding model is intentionally **not frozen**. BIND-00 is a prototype/evidence layer, not a kernel contract.

## Editor and evaluation

Selection/transform targets are editor concepts: `RigElement | RigFrame`, not new kernel entities.

An authored drag is `committed -> preview -> commit/cancel`. The gizmo manipulates an ephemeral world-space proxy. Element world pose writes to the element rigid pose; frame world pose is converted back to its owner-local pose. Moving an element therefore moves its resolved frames while preserving their authored local poses.

Workspace state such as selection, camera, panel layout, layers, and transient SOURCE preview is not serialized in `RigDocument`.

Future motion testing must preserve:

`AUTHORED NEUTRAL != transient EVALUATED motion`

The first motion path is kinematic. Test/evaluation must be resettable without mutating authored neutral truth. JURE should expose a small evaluator boundary rather than grow a generic physics/constraint solver without a real need.

## Display / consumer boundary

`RigDocument -> ResolvedRigView -> representation/evaluated poses -> Three / consumer adapter`

Three is an adapter. Renderer objects are disposable and contain no authored authority. Camera/navigation is inspection infrastructure and must not inherit gameplay camera clamps.

JV is the first real consumer/falsifier. JURE should stay neutral enough for later native JV or JV/VAW use, but consumer neutrality must not expand the kernel without evidence.

## Testing loop

Normal feature: targeted tests protecting expensive semantic invariants. Use full `npm run check` and a real browser owner gate for foundation/schema/checkpoint changes or interaction changes that cannot be proved synthetically.
