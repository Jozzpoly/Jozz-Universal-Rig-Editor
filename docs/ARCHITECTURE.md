# Architecture

JURE's durable authority boundary is:

`SOURCE / CONSUMER REFERENCE -> explicit authoring -> AUTHORED documents -> resolved/evaluated views -> representation/display -> consumer export`

Only an explicit authoring action may change authored truth. SOURCE loading/relinking, consumer reference, preview state, Three objects, evaluated motion and runtime observations never write back automatically.

## Durable boundaries

### Rig authored truth

`RigDocument` is authored rig truth.

- `RigElement` — stable rigid authored thing; not a renderer object or physics body.
- `RigFrame` — rigid datum local to a `RigElement` or rig root; useful for mounts, pivots, axes, hardpoints and virtual reference frames.
- `RigRelation` — explicit geometric/mechanical intent between authored frames.
- `RigElement.source` / `RigFrame.source` — exact source provenance only. Provenance does not mean representation binding.

Coordinates are right-handed, Y-up, metres/radians. Authored rigid poses are position + quaternion rotation only. Scale/stretch/deformation is not part of rigid mechanical pose.

There is deliberately no generic element hierarchy, ECS, physics-body schema or renderer ontology in the kernel.

### Project/source boundary

`JureProjectModel` is a thin logical project above authored documents, not an asset database and not a physical archive format.

- `SourceRevision` — exact immutable source identity. Operational identity is exact bytes (`sha256`) plus source adapter identity/version; revision ID is the stable project address for that exact revision.
- `SourceInstance` — one independently placed use of a SourceRevision with its own rigid project pose. Several instances may reuse one exact revision.
- `ConsumerReferenceSnapshot` — exact external consumer evidence, never authored kernel truth.
- `SourceAdoptionRecord` — immutable historical evidence of an explicit SOURCE -> AUTHORED decision.

**Filename, label, URI and visual similarity are not source identity.** Two files with the same name but different bytes are different SourceRevisions. The same exact bytes may be relinked from a renamed file when the adapter identity also matches.

Runtime relink therefore remains fail-closed on exact SHA-256 + adapter identity. JURE must not silently substitute a geometry-compatible or similarly named file for an existing SourceRevision. Different exact bytes are registered/rebound explicitly as a different SourceRevision.

Moving/re-registering/removing a live SourceInstance never moves authored data automatically and never rewrites an earlier adoption event. Adoption snapshots the exact source revision, locator and SourceInstance placement that produced the authored datum. Live representation references remain separate dependencies and fail closed when their required exact revision/instance no longer agrees.

Physical `.jure`/ZIP packaging remains deferred until real owner work proves what must travel together.

### Historical BIND evidence versus current JV source

The filename `OneSided_Steering_Suspension_Rig.gltf` currently refers to at least two distinct exact byte identities in project evidence:

1. historical external BIND-00 fixture: SHA-256 `fc1e8bd0e298a66fa79c43324708e281073ea8fb7a7aad2728702653705c0ee1`; the accepted main documentation explicitly says this exact file is external to JURE and must be obtained separately for exact BIND reproduction;
2. canonical current JV/native source in `Jozzpoly/Box3d_FunProject/assets/source/OneSided_Steering_Suspension_Rig.gltf`: Git blob `06d5c66f6d13fb64863ab15a660f060358872291`, 64,264 bytes, owner-gate SHA-256 `57cda983f8f728bc819460540d2ee39b1b17288ecdac1f0dc8bb1a3e6f9ab750`.

Git history shows the canonical Box3d_FunProject blob is unchanged from its July introduction. Therefore these are not "old and new versions" of one repo blob proven by history; they are two exact SourceRevisions that happen to share a filename and closely related structure.

Historical BIND-00 claims remain scoped to `fc1e...`. RU-1C real-use validation should use the canonical current JV revision `57cda...` unless the exact historical fixture is intentionally supplied for BIND reproduction.

### Authoring interaction and history

Normal durable editing has one chronological project history owned by `ProjectSession`.

Examples of durable history entries:

- SourceInstance add/remove/re-registration/placement;
- authored RigElement/RigFrame/RigRelation edits;
- explicit SOURCE -> AUTHORED adoption.

Disposable interaction state is outside durable history:

- selection;
- camera/focus/layout/layers;
- linked runtime source bytes and browser object URLs;
- representation preview;
- transient TEST/evaluator controls/results.

A spatial authoring operation follows:

`committed -> preview -> commit/cancel`

`ProjectAuthoringState` owns ProjectSession, authored selection and the single active authoring operation. It prevents a rig transform, SourceInstance transform and SOURCE-adoption preview from hijacking one another.

The gizmo may operate in project/world space. RigFrame edits are converted back to owner-local authored poses. SourceInstance placement is a project transform and is not disguised as a RigElement.

### Runtime source ownership

`ProjectSourceRuntimeState` owns disposable browser-session SOURCE availability and selection:

- exact linked runtime bytes are keyed by SourceRevision;
- active SOURCE viewport context is a SourceInstance;
- SOURCE datum selection is `sourceInstanceId + locator`;
- relink validates exact SHA-256 + adapter before installing runtime bytes;
- one linked exact revision may serve several placed SourceInstances;
- unlink/relink does not create project history.

Any SOURCE node may be inspected. Only a verified rigid-compatible node may be resolved as `ExactPlacedSourceDatum` and cross into a rigid authored RigFrame.

### SOURCE -> AUTHORED crossing

Adoption is explicit and transactional:

`verified ExactPlacedSourceDatum -> candidate owned RigFrame + immutable adoption evidence -> Preview -> Commit/Cancel`

Commit creates authored truth and its exact evidence as one project-history action. Cancel leaves neither authored data nor history. The adopted frame is `owner-authored`; source provenance records where its measurement came from, not who has authority over it.

### AUTHOR / TEST separation

`AUTHORED NEUTRAL != transient EVALUATED motion`

`RigTestState` and the replaceable `RigEvaluator` boundary remain separate from authored documents. Evaluator output is revision-bound pose overlay + diagnostics. Stale/invalid results fail closed. Reset removes evaluator influence; TEST never silently writes back to authored neutral.

The concrete kinematic solver/consumer evaluator is not architecture yet.

### State ownership in the workbench

Keep domain truth outside React.

Current active workbench ownership is:

- `ProjectAuthoringState` / `ProjectSession` — durable project history, authored selection and active preview operation;
- `ProjectSourceRuntimeState` — linked exact SOURCE runtime bytes, active SourceInstance and SOURCE selection;
- `RigTestState` — transient TEST controls/result;
- file handles/baseline hashes — IO session state;
- camera/layout/layers/focus requests — disposable presentation state;
- BIND-00 state — legacy transient proof only.

Older `RigAuthoringState` / singleton `SourceRuntimeState` code may remain as legacy/harness implementation evidence, but must not be reintroduced as a second active durable history or source authority path.

`App.tsx` composes these owners and derives display state; new domain mutation rules should live in project/editor/state workflow modules rather than accumulating in React callbacks.

### Display/consumer boundary

`authored documents -> resolved/evaluated views -> representation output -> Three / consumer adapter`

Three is disposable display infrastructure. Camera/navigation is inspection infrastructure and must remain free of gameplay camera clamps.

JV/JV-Web is the first real consumer and falsifier. Its adapter should stay small and combine JURE-authored geometry/intent with JV-owned runtime dynamics rather than importing either product wholesale into the other.

## Provisional vocabulary — do not defend without real-use evidence

### Mechanical relations

Current candidates:

`origin-coincident | revolute | prismatic | spherical | distance | distance-range`

The current axis-bearing convention uses the relation frame origin as anchor and frame-local `+Z` as primary DOF axis. Optional limits are geometric, relative to authored neutral.

The durable rule is what is absent: no mass, inertia, friction, spring damping, motor force, tire/contact model, solver configuration or Box3D IDs in authored mechanical intent.

The exact relation list, joint-datum convention and limit semantics remain open to falsification by the full JV rig and non-vehicle examples.

### Authored representation

The separation between mechanical authored truth and visual representation remains a strong direction because real visuals can be rigid, source-hierarchical or length-changing without changing the rigid rig itself.

Current experimental representation targets use exact placed SOURCE identity:

`sourceInstanceId + sourceRevisionId + locator`

Current mapping experiments are `rigid`, `aim`, `span`, plus optional roll correspondence. The separate representation domain is the KEEP; the exact vocabulary is provisional until real wheel/knuckle/arms, spring/damper and cardan workflows falsify or confirm it.

BIND-00 remains evidence only: it proved one narrow exact glTF skin-joint path and falsified singleton binding storage.

### Workspace/task contexts

`inspect | author | represent | test` remains a state/orchestration experiment, not final navigation authority.

Durable UX requirements are:

- continuous spatial/project context where possible;
- free camera and rapid Focus/Fit;
- clear SOURCE / AUTHORED / EVALUATED distinction;
- direct manipulation plus precise numeric editing;
- transient operations cannot accidentally become durable truth;
- UI evolves from real owner work rather than internal architecture labels.

## Validation discipline

`npm run check` is the canonical repository gate for this branch. The core runner must discover all `tests/core/*.test.mjs` files rather than maintain a stale manual allow-list; otherwise newly added semantic tests can exist without actually participating in the gate.

Synthetic tests prove only their explicit invariants. Source review is not runtime PASS. Full foundation/checkpoint claims require the canonical toolchain plus a real owner/browser gate on an exact, identified SourceRevision.
