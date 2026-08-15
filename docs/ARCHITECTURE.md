# Architecture

The durable authority boundary is intentionally explicit:

`SOURCE / CONSUMER REFERENCE -> explicit adoption/edit -> AUTHORED domain documents -> resolved/evaluated views -> display / derived consumer export`

Only an explicit authoring path may change authored truth. SOURCE loading, consumer-reference import, preview state, Three scene state, evaluated motion, and runtime observations never write back automatically.

## Project layer

`JureProjectModel` is a thin logical project contract above authored domain documents. It is storage-format independent; it is **not** a universal document schema and does not imply a ZIP/`.jure` format yet.

Current project meanings:
- `SourceRevision`: exact immutable source identity (`sha256` + adapter identity + revision ID).
- `SourceInstance`: one placed use of an exact source revision with its own rigid pose. Several instances may reuse one revision.
- `ConsumerReferenceSnapshot`: exact external consumer evidence. Its payload remains reference material, not authored kernel truth.
- `SourceAdoptionRecord`: project-level evidence of which placed source instance + revision-local locator was explicitly used to produce an authored element/frame. Kernel provenance stays revision-local and does not depend on workspace state.
- authored domain documents: currently `RigDocument` and `RigRepresentationDocument`. Future real tools may add another explicit document kind without expanding either existing document into a god schema.

Changing a source revision or re-registering an instance must fail closed against existing adoption/provenance/representation claims. Moving a `SourceInstance` never moves authored rig data automatically.

## Rig kernel

- `RigElement`: stable authored identity + neutral rigid pose; not a physics body or renderer object.
- `RigFrame`: local rigid frame owned by a `RigElement` or rig-root. It may describe a mount, pivot, axis datum, sensor frame, hardpoint, etc.; a frame does not require a relation.
- `RigRelation`: neutral mechanical/geometric intent between two authored frames, not a Box3D joint definition.
- `RigElement.source` / `RigFrame.source`: optional exact source provenance (`SourceRevision` + revision-local locator). It answers where authored data came from; it does **not** define which placed SOURCE instance is currently visible and does not define representation binding.

Coordinates are right-handed, Y-up, metres/radians. Frames are authored locally to their owner element. Current rigid poses contain position + rotation only. There is deliberately no generic element hierarchy in the kernel yet.

### Mechanical relation vocabulary

The first real-consumer vocabulary is deliberately small:
- `origin-coincident` — diagnostic/geometric origin coincidence retained from the foundation;
- `revolute` — one rotational DOF, optional geometric angular limits;
- `prismatic` — one translational DOF, optional geometric translation limits;
- `spherical` — shared-origin spherical articulation without speculative cone/twist policy yet;
- `distance` — fixed authored distance between frame origins;
- `distance-range` — allowed geometric length interval, suitable for travel envelopes without importing spring dynamics.

For axis-bearing `revolute` and `prismatic` relations, each participating `RigFrame` is the full joint datum: its origin is the anchor and local **+Z** is the primary DOF axis. Local X/Y retain the remaining orientation/reference basis. The axis is therefore derived from frame rotation rather than duplicated as another vector field.

Authored neutral is the zero coordinate for revolute/prismatic intent. Optional limits are interpreted relative to that neutral, never relative to a transient runtime state.

The kernel does not store masses, inertia, friction, spring Hertz/damping, motor/servo forces, tire/contact behavior, solver settings, or Box3D IDs. Those are consumer/runtime dynamics unless a later real authoring requirement proves otherwise.

A separate `fixed` relation is intentionally absent for now: rigidly co-moving authored datums can live on one `RigElement`. Add a new relation type only when a real mechanism cannot be expressed cleanly with the existing vocabulary.

## SOURCE and authored representation

Opening glTF/GLB creates independently inspectable, read-only SOURCE evidence. SOURCE selection is separate from authored selection.

Source provenance, placed source instances, project-level adoption context, and authored representation are different semantics. Do not put visual scale/stretch/deformation into `RigElement` or `RigFrame` rigid pose.

`RigRepresentationDocument` is a separate authored document tied to one `RigDocument`. It is project-contextual by design because representation connects authored rig datums to exact placed source data.

Every representation target captures:
- `sourceInstanceId` — which placed use is being represented;
- `sourceRevisionId` — the exact revision against which locators are meaningful;
- `targetLocator` — the exact source object/node to drive.

The initial representation vocabulary is geometric correspondence rather than renderer behavior copied from JV:
- `rigid`: one exact source datum corresponds to one authored `RigElement` or `RigFrame`; the exact source asset supplies the target<->datum rest relationship;
- `aim`: a source anchor/aim pair corresponds to two authored frames and is transformed rigidly, suitable for endpoint pieces that must point at the other end without changing length;
- `span`: a source start/end pair corresponds to two authored frames and permits representation-only axial deformation between them;
- optional roll correspondence supplies a third source datum + authored frame when two points are insufficient to determine orientation, as in roll-pinned wishbone cases.

These mappings can coexist arbitrarily; there is no singleton representation slot. Exact locator existence and non-rigid source compatibility are source-adapter/evaluation concerns, not reasons to import glTF/Three ontology into the kernel.

BIND-00 remains prototype evidence only. Its successful exact skin-joint drive is covered conceptually by `rigid`; its one-global-binding storage model remains falsified.

New deformation types may be added to the representation domain when a real asset requires them (for example a non-affine spring/skin deformation) without changing `RigDocument`, the project authority model, or consumer physics semantics.

## Editor and evaluation

Selection/transform targets are editor concepts: `RigElement | RigFrame`, not new kernel entities.

An authored drag is `committed -> preview -> commit/cancel`. The gizmo manipulates an ephemeral world-space proxy. Element world pose writes to the element rigid pose; frame world pose is converted back to its owner-local pose. Moving an element therefore moves its resolved frames while preserving their authored local poses.

Workspace state such as selection, camera, panel layout, layers, transient SOURCE preview, loaded external bytes, and future TEST state is not serialized into `RigDocument`.

Future motion testing must preserve:

`AUTHORED NEUTRAL != transient EVALUATED motion`

The first motion path is kinematic. Test/evaluation must be resettable without mutating authored neutral truth. JURE should expose a small evaluator boundary rather than grow a generic physics framework without a demonstrated authoring need.

## Display / consumer boundary

`authored domain documents -> resolved/evaluated views -> representation output -> Three / consumer adapter`

Three is an adapter. Renderer objects are disposable and contain no authored authority. Camera/navigation is inspection infrastructure and must not inherit gameplay camera clamps.

JV is the first real consumer/falsifier. A JV adapter may map neutral JURE relation intent into Box3D/runtime structures and combine it with JV-owned dynamics, but JURE must not import JV UI/ontology or create cross-repo runtime coupling.

## Testing loop

Normal work is a small vertical slice with targeted tests protecting the semantic invariant actually at risk. Use full `npm run check` and a real browser owner gate for foundation/schema/checkpoint changes or interaction changes that cannot be proved synthetically. A synthetic PASS is not owner acceptance and is never evidence for behavior that was not inspected.
