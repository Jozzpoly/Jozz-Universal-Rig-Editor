# Architecture

The durable rig boundary is intentionally small:

`SOURCE reference -> explicit authored adoption/edit -> RigDocument -> resolved view -> representation/evaluation -> display / consumer runtime`

Only an explicit authoring path may change authored truth. SOURCE loading, preview state, Three scene state, evaluated motion, and runtime observations never write back automatically.

The experimental map lane follows the same authority rule without sharing rig ontology:

`explicit map authoring -> MapDocument -> display / future package export -> consumer adapter`

`RigDocument` and `MapDocument` are separate authored documents. Shared editor mechanics may be extracted only when both are real consumers; shared renderer, physics, scene graph, asset database, or generic entity infrastructure is not implied.

## Rig kernel

- `RigElement`: stable authored identity + neutral rigid pose; not a physics body or renderer object.
- `RigFrame`: local rigid frame owned by a `RigElement` or rig-root. It may describe a mount, pivot, axis datum, sensor frame, hardpoint, etc.; a frame does not require a relation.
- `RigRelation`: explicit intent between frames. The current foundation implements only `origin-coincident`.
- `SourceRevision`: exact source identity after explicit adoption/provenance capture. Opaque source locators are meaningful only within the adapter + exact revision that produced them.
- `RigElement.source` / `RigFrame.source`: optional exact source provenance. They answer where authored data came from; they do **not** define which visual geometry moves with an element.

Coordinates are right-handed, Y-up, metres/radians. Frames are authored locally to their owner element. Current rigid poses contain position + rotation only. There is deliberately no generic element hierarchy in the kernel yet.

## Map authored foundation

`MapDocument` is the authored truth for the experimental map workspace. It is not `JvWorldData`, a Three scene, a Box3D world, or a frozen JV-Web interchange package.

Foundation v1 deliberately covers only the first primitive-world slice needed to falsify the design:

- stable document/entity/spawn identities;
- explicit metres and right-handed `+X` forward / `+Y` up / `+Z` right coordinates;
- rigid position + quaternion poses with no transform scale;
- box and capsule collision geometry;
- independent `none | collision-proxy` visual intent;
- per-entity surface friction;
- deterministic canonical serialization and fail-closed validation.

Meshes, source assets, texture/material packages, map hierarchy, streaming/partitioning, JV-Web lowering and a final `JURE MapPackage` are deliberately **not frozen** by this foundation. They must be introduced only by a real vertical slice, with large geometry tested against the actual E2R-class workload before a package contract is declared stable.

The intended future consumer boundary is:

`MapDocument -> deterministic versioned JURE MapPackage -> strict consumer validation -> consumer-owned lowering/runtime`

JV-Web remains responsible for its renderer, Box3D identities/runtime and product lifecycle. JURE must not become coupled to those implementations merely because JV-Web is the first map consumer.

## SOURCE and representation

Opening glTF/GLB creates an independently inspectable, read-only SOURCE reference. SOURCE selection is separate from authored selection.

Source provenance and representation binding are different semantics. A real assembly can require multiple representation mappings at once, including rigid parts and later length-changing/deforming visuals such as springs, dampers, and cardans. Do not put representation scale/stretch into `RigElement` or `RigFrame` rigid pose.

The persistent source-instance/registration and representation-binding model is intentionally **not frozen**. BIND-00 is a prototype/evidence layer, not a kernel contract.

## Editor and evaluation

The editor session owns document-history mechanics, not rig semantics. `EditorSession<Document>` requires only a revisioned authored document and provides committed/preview state plus undo/redo. `RigCommand` remains the rig-specialized command type; map commands use the same session without importing rig ontology.

Rig selection/transform targets remain editor concepts: `RigElement | RigFrame`, not new kernel entities.

An authored drag is `committed -> preview -> commit/cancel`. The gizmo manipulates an ephemeral world-space proxy. Element world pose writes to the element rigid pose; frame world pose is converted back to its owner-local pose. Moving an element therefore moves its resolved frames while preserving their authored local poses.

Map primitive poses are authored directly in map space. The map transform feature must preserve the same preview/commit/cancel invariant without turning Three objects into authored state.

Workspace state such as selection, camera, panel layout, layers, and transient SOURCE preview is not serialized in authored documents.

Future rig motion testing must preserve:

`AUTHORED NEUTRAL != transient EVALUATED motion`

The first motion path is kinematic. Test/evaluation must be resettable without mutating authored neutral truth. JURE should expose a small evaluator boundary rather than grow a generic physics/constraint solver without a real need.

## Display / consumer boundary

`RigDocument -> ResolvedRigView -> representation/evaluated poses -> Three / consumer adapter`

`MapDocument -> map display projection -> Three / future package adapter`

Three is an adapter. Renderer objects are disposable and contain no authored authority. Camera/navigation is inspection infrastructure and must not inherit gameplay camera clamps.

JV is the first real rig and map consumer/falsifier. JURE should stay neutral enough for later native JV or JV/VAW use, but consumer neutrality must not expand either authored model without evidence.

## Workspace boundary

The accepted Rig `App` remains the default workspace. The map lane is currently isolated behind the root workspace seam and is explicitly experimental. The seam exists to protect accepted Rig behavior while map authoring is falsified independently; it is not a final navigation design.

Do not extract a universal viewport or generic workspace framework merely because Rig and Map both render with Three. Reuse proven mechanics locally first; extract only the overlap demonstrated by both working editors.

## Testing loop

Normal feature: targeted tests protecting expensive semantic invariants. Use full `npm run check` and a real browser owner gate for foundation/schema/checkpoint changes or interaction changes that cannot be proved synthetically.

Map schema changes additionally require malformed-input falsifiers and deterministic round-trip evidence. Future JV compatibility must add independent consumer validation and runtime evidence rather than treating a successful JURE parse/build as proof of Box3D or rendered parity.
