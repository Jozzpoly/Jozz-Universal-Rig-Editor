# JURE Foundation Grounding — 2026-08-18

Status: **active grounding contract for draft PR #5; not a final architecture specification**.

This document prevents provisional experiments from silently becoming permanent JURE ontology. `docs/STATUS.md` carries the exact current checkpoint/evidence; this file carries the more durable rules, corrections and stop conditions.

## 1. Authority order

When statements disagree, use this order:

1. live Git / exact current files and branch state;
2. executed evidence tied to an exact revision;
3. direct owner interaction feedback;
4. current architecture/status documentation;
5. historical plans, donor documentation, names and agent narrative.

A green synthetic/CI gate is not owner acceptance. Owner interaction is not proof of persistence, consumer lowering, large-map performance or untested geometry classes.

## 2. Isolation / identity

Active branch:

`agent/map-workspace-foundation`

Base `main` for this experiment:

`d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`

Work remains behind draft PR #5. Do not merge, rewrite accepted Rig behavior or treat the branch as final platform architecture without an explicit owner gate.

## 3. Durable evidence-backed foundation

### Authored authority remains domain-specific

- `RigDocument` is authored rig truth.
- `MapDocument` is authored map truth.
- Three scene objects, proxies, custom handles and renderer state are disposable projections.
- JV/JV-Web/Box3D structures are downstream consumer/runtime authority, not JURE authored schemas.
- SOURCE/reference, authored state, display/representation, transient preview and runtime/evaluated state remain distinct meanings.

### Coordinates and units are explicit

Current Map authoring is metre-based, right-handed:

- `+X` forward;
- `+Y` up;
- `+Z` right.

Do not rely on renderer defaults at interchange boundaries.

### Stable identity / deterministic documents

Stable authored IDs, fail-closed validation and deterministic serialization are valuable in both domains. Keep domain implementations separate until a repeated real requirement proves a smaller shared utility.

### Revisioned EditorSession is proven shared infrastructure

`EditorSession<Document>` is used by independent Rig and Map authored domains:

`committed -> preview -> commit/cancel -> undo/redo`

Domain commands remain domain-owned. A shared session is not evidence for a universal object model.

### Renderer proposal -> domain interpretation is the authority direction

The robust interaction pattern is:

1. renderer/input produces a transient proposal;
2. domain code interprets that proposal against authored semantics and a frozen baseline;
3. preview remains disposable;
4. commit is the authored transition;
5. cancel restores committed truth.

This now holds for rigid Move/Rotate and shape-aware box Resize.

## 4. Owner-tested falsifications and corrections

### One-way workspace routing was insufficient

The first Map owner test found Map -> Rig without Rig -> Map. Routing is now symmetric through one small shared workspace-navigation contract.

This does not justify a plugin/workspace framework.

### Move/Rotate alone was insufficient for Map authoring

The first Map test proved practical geometry authoring is required. This did **not** prove generic `pose.scale` belongs in Map authored truth.

Replacement rule:

**Resize authors shape/domain parameters; rigid pose does not silently absorb renderer scale.**

Examples:

- box -> dimensions / `halfExtents`;
- capsule radial -> `radius`;
- capsule axial -> endpoints/separation/length;
- obstacle recipes -> semantic width/height/length/angle/gap/spacing etc.;
- imported mesh/scan scale remains open until a real source/consumer slice proves its meaning.

### Center-preserving box Resize was rejected as the default UX

Original G2 used Three scale handles as a transient proposal and preserved the box center. The owner tested that build and classified the stage as viable/PASS for continuing, but immediately rejected center Resize as the desired default for map construction.

Owner requirement grounded for Box V2:

- default: drag one boundary/face, keep the opposite face fixed;
- modifier: `Alt` requests symmetric resize from center;
- exact numeric dimensions may remain center-preserving exact authoring;
- capsule also needs resize later;
- Map needs World/Local control, but World Resize semantics must not be faked.

### Stock Three scale cannot represent signed-face or World Resize correctly

Inspection of the exact Three TransformControls behavior established:

- positive and negative scale pickers for one axis collapse to the same `X/Y/Z` axis identity;
- scale mode forces local orientation internally regardless of the transform `space` setting.

Therefore:

- do not infer `+X/-X` from generic Three scale state;
- do not expose a `World Resize` toggle backed by stock Three scale;
- Box Face Resize V2 uses explicit signed faces and its own input path;
- World Resize remains a separate geometry-semantics problem.

### First Box Face Resize V2 owner test almost passed, but exposed real input and affordance failures

The owner tested the custom signed-face implementation in a real Windows browser and reported the underlying behavior works as planned enough to classify the checkpoint as **almost PASS**:

- signed face dragging works;
- default opposite-face-fixed behavior is useful in practice;
- Undo/Redo works;
- the face-boundary interaction is preferable to center-preserving default Resize.

Two concrete failures were owner-observed:

1. pressing `Alt` switched to center behavior, but releasing Alt during the same pointer drag cancelled the command instead of returning to anchored mode;
2. six detached colored cube handles were too raw and ambiguous compared with JURE's mature transform gizmo language. They exposed selectable locations but did not communicate axis direction, face relationship or current anchored/center semantics clearly enough.

These findings **do not reopen** the signed-face planner, rigid-pose/no-generic-scale decision, opposite-face invariant or atomic history model. The closeout problem is narrower: real browser modifier lifecycle + renderer affordance.

## 5. Box Face Resize V2 contract

Face identity is explicit:

`axis ('x'|'y'|'z') + side (-1|+1)`

Six box boundaries exist:

`-X +X -Y +Y -Z +Z`

### Default: opposite-face anchored

Dragging a signed face changes that local box dimension and shifts the authored rigid center so the opposite local face remains fixed in world space.

This invariant must survive authored rotation.

### Alt: center origin

During the same active drag, `Alt` switches the resize origin to the center. The pose remains at the original center and the opposite boundary mirrors the dragged side.

Switching anchored -> center -> anchored must always re-evaluate against the same frozen preview baseline. It must not compound prior previews or create a revision until pointer release.

The planner/session implementation already proves this synthetically. Real browser delivery of Alt press/release is a separate interaction-layer concern and must be owner-tested.

### Exact dimensions

Inspector Dimensions are precise authored values and intentionally preserve the box center. They share domain/history infrastructure with viewport authoring but do not have to mimic a face drag.

### Degeneracy / inversion

Interactive face drag must clamp before an authored box inverts or becomes exactly degenerate. This is a tool-interaction guard only, not a global authored minimum. Exact numeric authoring remains governed by the MapDocument finite-positive contract.

### Pointer mapping

Spatial drag maps the pointer ray to a signed scalar along the selected authored face axis. If the viewing ray is nearly parallel to that axis, the mapping is ill-conditioned and must fail closed/suppress the handle rather than inventing an arbitrary screen multiplier.

### Lifecycle

- no-op drag -> cancel/no new revision;
- pointer release after preview -> commit;
- explicit `Esc` -> cancel;
- pointer cancellation -> cancel;
- loss of the application/window may still cancel as a safety path;
- browser/system behavior caused merely by using the `Alt` modifier must **not** be misclassified as the user's intent to cancel;
- handle meshes may be destroyed/reprojected during preview and must not own semantic drag state;
- Move/Rotate continue to use stock TransformControls; Resize uses the custom signed-face path.

Current closeout uses capturing key listeners while Resize is active to suppress the browser's default `Alt` action without stopping propagation to JURE's existing `keydown/keyup` handlers. Existing explicit cancel paths remain intact. This is deliberately narrower than globally removing blur or pointer-cancel safety. If owner re-test still reproduces cancellation, gather the actual event provenance rather than weakening cancellation semantics blindly.

### Resize visual language

Resize should look like a member of the same JURE manipulation-tool family as Move/Rotate without pretending to be stock Scale.

Required semantic affordance:

- the control belongs to a concrete signed authored face;
- the allowed drag direction is visible;
- front/back spatial relationship remains legible;
- anchored mode communicates the opposite fixed boundary;
- center mode communicates symmetric pairing and the center origin.

The current closeout representation therefore uses, per signed face:

`depth-aware face plate -> short axis stem -> cube grip`

with stronger front controls and ghosted rear controls. Anchored mode marks the opposite face as fixed; center mode presents the opposite control as paired and shows a center cue. This representation remains disposable renderer UI; it does not alter authored semantics.

The latest **product-code** checkpoint implementing this closeout is:

`fe201d26dc2ca93c51b9261f555ee0b88bab7df4`

Subsequent branch-head changes may update owner-test instructions and these canonical documents. Treat those later documentation-only heads as delivery/evidence synchronization, not as additional product behavior.

The exact current evidence and owner-gate status are recorded in `docs/STATUS.md`.

## 6. World / Local grounding

### Move / Rotate

World/Local already exists in accepted Rig interaction and is a strong candidate for the Map Stage-1 follow-up only after Box Face Resize V2 receives a full owner PASS.

### Resize

Local face Resize is currently defined.

World Resize is deliberately **not defined yet**. For an arbitrarily rotated primitive, moving a world-axis boundary may imply multiple local dimensions, shear, orientation change or a different geometry representation. Do not hide that ambiguity behind a UI toggle.

A later real use case must define what World Resize means per geometry class before implementation.

## 7. Capsule is the next independent shape falsifier

Do not force capsule through box semantics merely to claim genericity.

At minimum distinguish:

- axial/end-point or length authoring;
- radial/radius authoring.

Whether center/anchored modifiers and handle layout transfer from the box must be validated by a real capsule implementation and owner gate.

Do not start capsule work before the current Box Face Resize closeout receives owner acceptance.

## 8. Map model boundary

Current `box | capsule` entities are P0 primitive geometry, not final Map ontology.

Leave architecture open to:

1. primitive geometry;
2. parametric authored recipes (ramps, steps, whoops, berms, obstacle banks, etc.);
3. terrain/heightfield;
4. imported mesh/scan geometry;
5. semantic layout constructs (spawns, anchors, zones, routes, test stations, etc.).

This classification is a design guard, not an instruction to implement all classes now.

## 9. Donor grounding

Donor code is evidence and technique, not authority over JURE ontology.

For every donor transfer:

1. identify the exact donor revision/file;
2. isolate the smallest proven capability;
3. identify donor-specific assumptions;
4. adapt against JURE contracts instead of transplanting the subsystem wholesale;
5. add JURE-specific evidence/owner validation;
6. preserve licensing obligations.

High-value donors currently identified:

- **HomeScan-Web-Builder** — transform sessions, resize as a domain operation, axis/pivot constraints, snapping, numeric input, validated preview/commit;
- **Voxel Aeronautics Workshop** — authored terrain dimensions and render/gameplay authority separation;
- **JV-Web** — real JURE consumer boundary, explicit primitive dimensions, render/collision source separation and compatible basis;
- **Native JV / Box3d_FunProject** — tiled/heightfield terrain, semantic obstacle recipes, scan collision geometry, and evidence that green data validators can miss wrong built geometry;
- **PROJECT ANVIL** — smallest-proven-capability donor doctrine.

## 10. Candidate shared Editor Core

### Proven shared now

- revisioned editor session/history lifecycle;
- small workspace routing contract.

### Strong candidates, not yet automatically shared

- selection contract;
- transform lifecycle;
- transform-space/pivot/axis constraint representation;
- numeric input;
- snapping;
- diagnostics/validation presentation;
- camera/focus utilities;
- document dirty-state UX;
- panel/shell primitives.

Rule: compare actual Rig and Map requirements first, then extract only the smallest common intersection.

## 11. Interface grounding / separate Stage 2

Owner comparison of current Rig and Map surfaces established that Map reads as a separate application attached by routing. This is a real product-system issue, not merely color polish.

Live Rig already contains a more mature system around:

- `WorkspaceShell`;
- `ViewportChrome`;
- `TopBar`;
- inspector/navigator patterns;
- shared design tokens in `styles.css`;
- resizable/collapsible side panels and status chrome.

Map currently maintains its own shell and CSS. That was acceptable for an isolated proof-of-viability slice, but must not become permanent duplication.

**Do not mix this refactor into interaction grounding.**

After Stage 1 semantics are stable, Stage 2 should:

1. audit which Rig shell mechanics are genuinely shared versus Rig-specific;
2. neutralize the smallest shared slot/component contract without changing accepted Rig behavior;
3. migrate Map to the common JURE shell/tokens/primitives;
4. validate visually and with the owner that Rig/Map feel like workspaces of one tool rather than two attached applications.

Current names such as `rigPane/sourcePane` are not automatically universal merely because `WorkspaceShell` is reusable mechanically.

## 12. Explicitly provisional / not frozen

- final Map entity/object taxonomy;
- collision-proxy-only visual model;
- friction-only surface model;
- final map extension/package/interchange format;
- materials/textures/source asset model;
- mesh/scan transform/scale semantics;
- capsule resize UX;
- World Resize semantics;
- hierarchy/scene graph/ECS/plugin model;
- streaming/partitioning;
- URL query routing as final UX;
- final Map/Rig panel composition;
- Test/Simulation workspace;
- final JURE -> JV/JV-Web lowering schema;
- PR screenshot/owner-preview scaffolding as permanent infrastructure.

Do not build broad abstractions around these as if they were decided.

## 13. Validation doctrine

Substantial slices should distinguish:

1. schema/unit evidence;
2. built geometry/invariant evidence where relevant;
3. render evidence;
4. consumer/runtime evidence when crossing into JV/JV-Web/Box3D;
5. owner interaction/product gate.

No one category substitutes for the others.

The current Face Resize closeout is a concrete example: planner/history tests stayed green while the real Windows/browser Alt lifecycle still failed. The owner gate therefore has authority over the synthetic assumption for that interaction layer.

Historical Native JV map work is another explicit warning: green tables/tests can coexist with wrong built geometry.

## 14. Controlled next sequence

### Current closeout gate

1. Re-test Box Face Resize V2 with the Alt browser-default suppression and the revised face plate/stem/grip controls.
2. Require one continuous pointer drag to survive repeated `anchored -> Alt center -> anchored` switching without cancellation or jump.
3. Require the revised visual language to be materially clearer than detached cube handles.
4. Preserve Esc/pointer-cancel, Undo/Redo and rotated-box behavior.
5. Only an explicit owner PASS closes this checkpoint.

### Stage 1 — interaction / authoring completion after closeout PASS

1. Map World/Local for Move/Rotate using accepted Rig behavior; keep Resize local until World Resize is semantically defined.
2. Capsule axial/radial Resize as an independent falsifier.
3. Tactical interaction polish only; avoid large shell redesign.

### Stage 2 — interface unification

After Stage 1 interaction semantics stabilize, migrate Map to a genuinely shared JURE shell/design system while preserving Rig as the regression baseline.

### Broader map grounding after those stages

- create/delete/duplicate;
- deterministic map save/open;
- one real non-primitive representation to falsify primitive-only assumptions;
- consumer lowering only through explicit adapters/contracts.

Do not jump to a universal scene framework, ECS/plugin system or full terrain editor before evidence requires it.

## 15. Stop condition for the broader foundation phase

The JURE Map foundation is not complete because one primitive can be manipulated.

Meaningful grounding requires at least:

- Rig and Map coexist without authored-domain contamination;
- shared mechanics are extracted only where multiple domains prove the overlap;
- Map has owner-accepted real geometry authoring beyond rigid pose;
- tested authored state survives deterministic save/open;
- at least one non-primitive representation challenges the primitive-only model;
- relevant technical, render, geometry/runtime and owner gates are explicit;
- the next JV/JV-Web consumer boundary can be described without turning JURE into a runtime-schema copy.

Until then PR #5 remains an experimental foundation lane, not a final JURE platform release.
