# Architecture

JURE's durable authority boundary is:

`SOURCE / CONSUMER REFERENCE -> explicit authoring -> AUTHORED documents -> resolved/evaluated views -> representation/display -> consumer export`

Only an explicit authoring action may change authored truth. SOURCE loading, consumer reference, preview state, Three objects, evaluated motion and runtime observations never write back automatically.

## Durable boundaries

### Rig authored truth

`RigDocument` is the authored rig document.

- `RigElement` — stable rigid authored thing; not a renderer object or physics body.
- `RigFrame` — rigid datum local to a `RigElement` or rig root; useful for mounts, pivots, axes, hardpoints and virtual reference frames.
- `RigRelation` — explicit geometric/mechanical intent between authored frames.
- `RigElement.source` / `RigFrame.source` — exact source provenance only. Provenance does not mean representation binding.

Coordinates are right-handed, Y-up, metres/radians. Authored rigid poses are position + quaternion rotation only. Scale/stretch/deformation is not part of rigid pose.

There is deliberately no generic element hierarchy, ECS, physics-body schema or renderer ontology in the kernel.

### Project/source boundary

`JureProjectModel` is a thin logical project candidate above authored documents, not an asset database and not a physical archive format.

Current meanings that survived the first convergence pass:

- `SourceRevision` — exact immutable source identity (`sha256` + adapter identity + revision ID).
- `SourceInstance` — one placed use of an exact source revision with its own rigid pose; multiple instances may reuse one revision.
- `ConsumerReferenceSnapshot` — exact external consumer evidence, never authored kernel truth.
- `SourceAdoptionRecord` — explicit project-level record linking a placed source datum to authored output.

Moving/replacing SOURCE never moves authored data automatically. Revision mismatches fail closed for exact provenance/adoption/representation claims.

Physical `.jure`/ZIP packaging remains deferred until the real owner workflow proves what must travel together.

### Authoring interaction

Selection/transform targets are editor concepts (`RigElement | RigFrame`), not new kernel entities.

An authored drag is:

`committed -> preview -> commit/cancel`

The gizmo may operate in world space, but frame edits are converted back to owner-local authored poses. Moving an element moves its resolved frames while preserving their local authored poses.

### AUTHOR / TEST separation

`AUTHORED NEUTRAL != transient EVALUATED motion`

`RigTestState` and the replaceable `RigEvaluator` boundary are separate from authored documents. Evaluator output is revision-bound pose overlay + diagnostics. Stale/invalid results fail closed. Reset removes evaluator influence; TEST never silently writes back to authored neutral.

The concrete kinematic solver/consumer evaluator is not architecture yet.

### State ownership

Keep domain truth outside React.

- `RigAuthoringState` — authored session, authored selection, preview/commit/cancel, history.
- `SourceRuntimeState` — currently loaded SOURCE runtime data + SOURCE selection.
- `RigTestState` — transient TEST controls/result.
- file handles/baseline hashes — IO session state.
- camera/layout/layers/focus requests — disposable presentation state.
- BIND-00 state — legacy transient proof only.

`App.tsx` may compose these owners and derive display state, but new domain mutation rules must not accumulate in `App`.

### Display/consumer boundary

`authored documents -> resolved/evaluated views -> representation output -> Three / consumer adapter`

Three is disposable display infrastructure. Camera/navigation is inspection infrastructure and must remain free of gameplay camera clamps.

JV/JV-Web is the first real consumer and falsifier. Its adapter should stay small and combine JURE-authored geometry/intent with JV-owned runtime dynamics rather than importing either product wholesale into the other.

## Provisional vocabulary — do not defend without real-use evidence

The following survived synthetic/counterexample tests, but are not final product truth.

### Mechanical relations

Current candidates:

`origin-coincident | revolute | prismatic | spherical | distance | distance-range`

The current axis-bearing convention uses the relation frame origin as anchor and frame-local `+Z` as primary DOF axis. Optional limits are geometric, relative to authored neutral.

The important durable rule is what is **absent**: no mass, inertia, friction, spring damping, motor force, tire/contact model, solver configuration or Box3D IDs in authored mechanical intent.

The exact relation list, joint-datum convention and limit semantics remain open to falsification by the full JV rig and non-vehicle examples.

### Authored representation

The separation between mechanical authored truth and visual representation is a strong architectural direction because real visuals can be rigid, source-hierarchical or length-changing without changing the rigid rig itself.

The current candidate `RigRepresentationDocument` is project-contextual and can address exact placed SOURCE targets using:

`sourceInstanceId + sourceRevisionId + locator`

Current mapping experiments are:

- `rigid` — one source target follows one authored element/frame datum through an exact rest correspondence;
- `aim` — an endpoint-oriented rigid visual references two authored frames;
- `span` — a visual spans two authored frames and may change length;
- optional roll correspondence — third datum when two endpoints do not determine orientation.

The **separate representation domain** is the main KEEP. The exact `rigid/aim/span` vocabulary is provisional until tested against the real wheel/knuckle/arms, spring/damper and cardan workflows. Add or remove mapping types based on assets, not on renderer convenience.

BIND-00 remains evidence only: it proved an authored element can drive one exact glTF skin joint while SOURCE stays fixed and it falsified one-global-binding storage.

### Workspace/task contexts

`inspect | author | represent | test` currently exists as a small state experiment. It is not a final navigation model or a requirement to expose those four words as permanent UI modes.

Durable UX requirements are instead:

- one continuous spatial/project context where possible;
- free camera and rapid Focus/Fit;
- clear separation of SOURCE, AUTHORED and EVALUATED state;
- direct manipulation plus precise numeric editing;
- transient operations cannot become durable truth accidentally;
- UI evolves from the real owner workflow, not from internal architecture labels.

## Validation discipline

A normal feature should be a small vertical slice with targeted tests for the semantic risk it introduces. Full `npm run check` and a real owner/browser gate are for foundation/schema/checkpoint or important interaction changes.

Synthetic tests prove their exact invariant only. They do not convert provisional vocabulary into owner-accepted product design.