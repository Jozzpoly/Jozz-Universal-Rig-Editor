# Architecture

JURE's durable authority flow is:

`SOURCE / CONSUMER REFERENCE -> explicit authoring -> AUTHORED documents -> resolved/evaluated views -> representation/display -> consumer export`

Only explicit authoring changes authored truth. Loading/relinking SOURCE, inspecting consumer state, manipulating preview, rendering Three objects or evaluating TEST motion never writes back automatically.

## 1. Authored rig kernel

`RigDocument` is authored rig truth.

- `RigElement` — stable rigid authored thing; not a renderer object or physics body.
- `RigFrame` — rigid datum local to a `RigElement` or rig root; used for mounts, pivots, axes, hardpoints and virtual reference frames.
- `RigRelation` — explicit geometric/mechanical intent between authored frames.
- `RigElement.source` / `RigFrame.source` — exact source provenance only. Provenance is not representation binding and does not give SOURCE authority over authored data.

Coordinates are right-handed, Y-up. Distance is metres. Mechanical angles/limits are radians internally. Authored rigid pose is position + quaternion rotation only.

**Scale/stretch/deformation is not part of rigid mechanical pose.** Visual length change belongs to representation/evaluation semantics.

There is deliberately no generic element hierarchy, ECS, physics-body schema, Box3D identity or renderer ontology in the kernel.

## 2. Project and SOURCE identity

`JureProjectModel` is a thin logical project above authored documents. It is not an asset database and does not imply a final `.jure` archive format.

- `SourceRevision` — one immutable exact SOURCE identity. Operational identity is exact bytes (`sha256`) plus source adapter identity/version; its revision ID is the stable project address for that exact revision.
- `SourceInstance` — one independently placed use of a `SourceRevision` with a rigid project/world pose. Multiple instances may reuse one exact revision.
- `ConsumerReferenceSnapshot` — external consumer evidence. It can guide decisions but is never authored kernel truth.
- `SourceAdoptionRecord` — immutable historical evidence that an explicit SOURCE datum produced an authored target at a specific placed-source state.

Filename, label, URI and visual similarity are not source identity. Different bytes are a different `SourceRevision`; relink of an existing revision fails closed unless exact SHA-256 + adapter identity agree.

Moving, re-registering or removing a live `SourceInstance` never moves authored rig data automatically and never rewrites historical adoption evidence.

Physical packaging is deferred until real work proves what must travel together.

## 3. One chronological durable history

`ProjectSession` is the **only active session/history abstraction**. It owns committed/preview project state and one chronological Undo/Redo history for durable project changes.

Examples of durable actions:

- add/remove/re-register/place `SourceInstance`;
- `RigElement` / `RigFrame` / `RigRelation` edits;
- explicit SOURCE -> AUTHORED adoption.

Disposable state is outside durable history:

- selection;
- camera/focus/layout/layer visibility;
- browser file handles/object URLs and linked runtime SOURCE bytes;
- representation preview;
- TEST controls/evaluated result.

Spatial editing follows:

`committed -> preview -> commit | cancel`

Only one authoring operation owns preview at a time. A rig transform, SOURCE placement transform and SOURCE-adoption preview may not hijack one another.

`RigCommand` is a pure authored-rig mutation embedded inside project-level commands when required. It deliberately owns **no** history, preview or Undo/Redo state. Do not introduce a second `RigDocument`-local session.

The viewport gizmo may operate in project/world space. `RigFrame` world edits are converted back to owner-local authored pose. `SourceInstance` placement remains a project transform and is never disguised as a `RigElement`.

## 4. Runtime SOURCE boundary

`ProjectSourceRuntimeState` owns disposable browser-session SOURCE availability and SOURCE selection.

- linked bytes are keyed by exact `SourceRevision`;
- active viewport SOURCE context is a `SourceInstance`;
- SOURCE datum selection is `sourceInstanceId + locator`;
- relink verifies exact SHA-256 + adapter before installing runtime bytes;
- one linked exact revision may serve multiple placed instances;
- unlink/relink creates no project history.

Any SOURCE node may be inspected. Only a node verified as rigid-compatible may resolve to `ExactPlacedSourceDatum` and cross into rigid authored truth.

SOURCE geometry itself stays read-only. Registration/placement moves the `SourceInstance`, not individual SOURCE nodes.

## 5. SOURCE -> AUTHORED crossing

Adoption is explicit and transactional:

`verified ExactPlacedSourceDatum -> candidate authored target + immutable adoption evidence -> Preview -> Commit | Cancel`

For the current RU-1 slice the target is an owned `RigFrame`.

Commit creates the authored frame and its adoption evidence as one durable history action. Cancel creates neither. The frame is owner-authored; provenance records where its measurement came from, not who controls it afterward.

This crossing must remain a small explicit boundary. Future geometry picking/construction datums may produce additional exact/derived evidence types, but must not create an implicit SOURCE-writeback path.

## 6. Mechanical intent is separate from consumer dynamics

Current relation candidates are:

`origin-coincident | revolute | prismatic | spherical | distance | distance-range`

For current axis-bearing experiments, relation frame origin is the anchor and frame-local `+Z` is the primary DOF axis. Optional limits are geometric and relative to authored neutral.

The durable architectural rule is what mechanical authored intent **does not** contain:

- mass/inertia;
- friction/contact/tire model;
- spring/damper force law;
- motor force/torque;
- solver iterations/configuration;
- Box3D/native runtime IDs.

The exact relation list, datum convention and limit vocabulary remain provisional until full real mechanisms falsify/confirm them.

## 7. Representation is a separate domain

Mechanical authored truth and visual representation have different responsibilities. Real visuals may be rigid, source-hierarchical, aimed between datums or length-changing without adding scale to rigid rig poses.

Current representation experiments target exact placed SOURCE identity:

`sourceInstanceId + sourceRevisionId + locator`

Current mapping vocabulary includes `rigid`, `aim`, `span` and optional roll correspondence. **The separation of representation from `RigDocument` is the strong architectural direction; the exact mapping vocabulary remains provisional.**

Historical BIND-00 proved one narrow exact skin-joint bridge and falsified singleton binding storage. Its runtime/UI implementation has been removed from the active tree; Git history preserves the experiment. Do not recreate BIND-00 as a shortcut to persistent representation.

## 8. AUTHOR and TEST are different meanings

`AUTHORED NEUTRAL != transient EVALUATED motion`

`RigTestState` and a replaceable `RigEvaluator` boundary remain separate from authored documents. Evaluator output is a revision-bound pose overlay + diagnostics. Stale/invalid output fails closed.

Reset removes evaluator influence. TEST never silently writes evaluated pose back to authored neutral.

The first real motion workflow is kinematic. A concrete solver/consumer evaluator is not architecture yet; do not build a generic physics/constraint solver merely to fill this boundary.

## 9. Application state ownership

Domain truth stays outside React. Active ownership is intentionally singular:

- `src/kernel/*` — authored rig types, math/validation/serialization;
- `src/project/*` — logical project, exact SOURCE identity, project commands, `ProjectSession`, adoption;
- `src/editor/rig-command.ts` — pure authored-rig mutation contract with no history;
- `src/editor/transform-target.ts` — spatial transform target/space conversion contract;
- `src/representation/*` — provisional authored representation domain;
- `src/evaluation/*` — transient TEST/evaluator boundary;
- `src/app/state/project-authoring.ts` — one active authoring operation, selection and ProjectSession orchestration;
- `src/app/state/project-source-runtime.ts` — linked exact SOURCE bytes, active instance and SOURCE selection;
- `src/app/state/source-workflow.ts` — SOURCE open/relink/register planning;
- `src/io/*` — logical project/source/legacy-rig browser I/O;
- `src/render/*` — Three/display interaction bridge;
- `src/app/workspace/*` — disposable presentation/workspace UI.

`App.tsx` composes these owners and derives display state. New domain mutation rules belong in the relevant project/kernel/state module rather than accumulating in React callbacks.

Superseded rig-only authoring/history state, singleton SOURCE runtime state, the FC-8 workspace-context experiment and active BIND-00 runtime have been removed from the current tree. Their existence in Git history is evidence, not an invitation to maintain parallel paths.

## 10. Display and consumer boundary

`authored documents -> resolved/evaluated views -> representation output -> Three / consumer adapter`

Three is disposable display infrastructure. Camera/navigation is inspection infrastructure and remains free of gameplay camera clamps.

JV/JV-Web is the first real consumer and falsifier. Its adapter should combine JURE-authored geometry/intent with JV-owned runtime dynamics rather than importing either product wholesale into the other.

## 11. UX constraints that are architectural enough to preserve

Exact panel placement/style is not architecture. These interaction requirements are:

- viewport-first spatial work;
- free camera and rapid Focus/Fit;
- clear SOURCE / AUTHORED / PREVIEW / EVALUATED distinction;
- direct manipulation plus precise numeric editing;
- workspace/presentation state remains disposable;
- transient operations cannot accidentally become durable truth;
- real Owner workflow drives information architecture instead of internal enum/module names.

`inspect | author | represent | test` may be useful conceptual vocabulary, but it is not final navigation authority until real workflow proves it.

## 12. Design rule for future slices

When a new feature appears, first decide which existing boundary owns it. Add a new durable entity/domain only when a real consumer cannot be represented truthfully by the current boundaries.

Prefer:

`real example -> minimal model -> targeted invariant -> owner-visible falsifier`

over speculative completeness.

Validation procedure belongs in `AGENTS.md`; current evidence and exact fixture/checkpoint identities belong in `docs/STATUS.md`.
