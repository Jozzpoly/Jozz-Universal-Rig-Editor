# JURE Foundation Grounding — 2026-08-18

Status: **active grounding contract for draft PR #5; not a final architecture specification**.

This document protects JURE from turning short-lived experiments into permanent ontology. `docs/STATUS.md` carries the exact current SHA/run/evidence state; this file carries durable rules, owner-tested corrections and stop conditions.

## 1. Authority order

When statements disagree, use this order:

1. live Git / exact current files and branch state;
2. executed evidence tied to an exact revision;
3. direct owner interaction feedback;
4. current architecture/status documentation;
5. historical plans, donor documentation, names and agent narrative.

A green synthetic/CI gate is not owner acceptance. Owner interaction is not proof of persistence, consumer lowering, large-map performance or untested geometry classes.

## 2. Isolation / identity

Active lane:

`agent/map-workspace-foundation` -> draft PR #5 -> `main`

Accepted base for this experiment:

`d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`

Do not merge, rewrite accepted Rig behavior or treat this experimental lane as final platform architecture without explicit gates.

## 3. Durable authored-authority foundation

### Domains remain separate

- `RigDocument` is authored rig truth.
- `MapDocument` is authored map truth.
- Three scene objects, transform proxies, custom handles and renderer state are disposable projections.
- JV/JV-Web/Box3D structures are downstream consumer/runtime authority, not JURE authored schemas.
- SOURCE/reference, authored state, display/representation, transient preview and runtime/evaluated state remain distinct meanings.

### Coordinates and units remain explicit

Current Map authoring is metre-based and right-handed:

- `+X` forward;
- `+Y` up;
- `+Z` right.

Do not rely on renderer defaults at interchange boundaries.

### Identity and serialization

Stable authored IDs, fail-closed validation and deterministic serialization are durable requirements. Keep domain implementations separate until repeated real requirements prove a smaller shared utility.

### `EditorSession<Document>` is proven shared infrastructure

Independent Rig and Map domains both use:

`committed -> preview -> commit/cancel -> undo/redo`

Domain commands remain domain-owned. A shared session is not evidence for a universal object model.

### Interaction authority direction is grounded

The robust direction is:

1. renderer/input produces a transient proposal;
2. domain code interprets the proposal against authored semantics and a frozen baseline;
3. preview remains disposable;
4. commit changes authored truth;
5. cancel restores committed truth.

This is proven for rigid Move/Rotate and owner-accepted shape-aware box Resize.

## 4. Owner-tested falsifications and corrections

### One-way workspace routing was insufficient

The first Map owner test found Map -> Rig without Rig -> Map. Routing is now symmetric through one small shared workspace-navigation contract.

This does not justify a plugin/workspace framework.

### Move/Rotate alone was insufficient for Map authoring

The first Map test proved practical geometry authoring is required. It did **not** prove generic `pose.scale` belongs in Map authored truth.

Replacement rule:

**Resize authors shape/domain parameters; rigid pose does not silently absorb renderer scale.**

Examples:

- box -> dimensions / `halfExtents`;
- capsule radial -> `radius`;
- capsule axial -> endpoints/separation/length;
- obstacle recipes -> semantic width/height/length/angle/gap/spacing etc.;
- imported mesh/scan scale remains open until a real source/consumer slice proves its meaning.

### Center-preserving box Resize was rejected as the default UX

The original Scale-like G2 preserved center and was useful as a viability test, but owner use immediately falsified it as the preferred default for map construction.

Grounded replacement:

- default: manipulate one concrete boundary/face and keep the opposite face fixed;
- `Alt`: temporary center/symmetric behavior;
- exact numeric dimensions may remain center-preserving exact authoring.

### Stock Three scale cannot represent signed-face or World Resize honestly

Inspection of the exact Three `TransformControls` behavior established:

- positive and negative scale pickers on one axis collapse to the same `X/Y/Z` identity;
- scale mode forces local orientation internally regardless of transform `space`.

Therefore:

- do not infer `+X/-X` from generic renderer scale state;
- do not expose fake World Resize backed by stock Three scale;
- box Resize uses explicit signed authored faces and its own interaction path;
- World Resize remains a separate geometry-semantics problem.

### First Face Resize V2 owner test exposed two real interaction defects

The first custom signed-face build was almost accepted, but owner testing exposed:

1. release of `Alt` could cancel the active Windows/browser drag;
2. detached cube handles were too raw and ambiguous compared with JURE's mature transform-gizmo language.

These failures were correctly classified as interaction-layer problems, not reasons to reopen the authored model, frozen-baseline planner, opposite-face invariant or atomic history.

### Face Resize V2 closeout is now OWNER PASS

The closeout kept explicit signed-face semantics and added:

- narrow suppression of browser-default `Alt` behavior while Resize is active without stopping JURE's own key events;
- `face plate -> axis stem -> grip` visual language;
- stronger front controls and ghosted rear controls;
- fixed-opposite-face cue in anchored mode;
- paired/opposite + center cue in Alt/center mode;
- semantic status feedback naming signed face and current origin mode.

The owner re-tested this build in a real Windows browser and explicitly accepted it for continued development. Real owner evidence confirmed repeated `ANCHORED -> CENTER -> ANCHORED` switching inside one continuous drag without cancellation, followed by normal commit. Undo/Redo remained valid.

Therefore Box Face Resize V2 is no longer a pending closeout. It is the current owner-accepted box interaction primitive.

## 5. Box Face Resize V2 contract

Face identity is explicit:

`axis ('x'|'y'|'z') + side (-1|+1)`

Six box boundaries exist:

`-X +X -Y +Y -Z +Z`

### Default: opposite-face anchored

Dragging a signed local face changes that box dimension and shifts the authored rigid center so the opposite local face remains fixed in world space.

The invariant must survive authored rotation.

### `Alt`: center origin

During the same active drag, `Alt` switches to center/symmetric Resize. Anchored -> center -> anchored always re-evaluates against the same frozen preview baseline. It must not compound prior previews or create a revision until pointer release.

Both synthetic planner/session tests and real owner browser interaction now support this contract.

### Exact dimensions

Inspector Dimensions are precise authored values and intentionally preserve center. They share domain/history infrastructure with viewport authoring but do not need to mimic face drag semantics.

### Degeneracy / inversion

Interactive face drag clamps before inversion or exact degeneracy. This is a tool-interaction guard only, not a global authored minimum. Exact numeric authoring remains governed by the MapDocument finite-positive contract.

### Pointer mapping

Spatial drag maps the pointer ray to signed distance along the selected authored face axis. Near-parallel ray/axis configurations fail closed instead of inventing arbitrary screen multipliers.

### Lifecycle

- no-op drag -> cancel/no revision;
- pointer release after preview -> commit;
- explicit `Esc` -> cancel;
- pointer cancellation -> cancel;
- real application/window loss may cancel as a safety path;
- browser/system behavior caused merely by using `Alt` must not be misclassified as user cancellation;
- semantic drag state must survive disposable handle reprojection;
- Move/Rotate use stock `TransformControls`; Resize uses the custom signed-face path.

### Visual language

Resize should read as a member of the same JURE manipulation-tool family as Move/Rotate without pretending to be stock Scale.

Current owner-accepted direction:

`depth-aware face plate -> short axis stem -> grip`

with signed-face identity, direction, front/back cues and anchored/center semantic feedback.

## 6. World / Local grounding

### Move / Rotate

World/Local is accepted in Rig and has now been implemented in Map as a small Stage-1 slice using the same underlying Three transform-space semantics.

The durable Map contract is:

- stored Move/Rotate preference is `world | local`;
- Move/Rotate effective space equals that preference;
- initial preference is World, matching Rig;
- the preference is presentation/interaction state, not MapDocument authored truth;
- changing transform space does not create a document revision.

The implementation is technically green and has render evidence. Real spatial World/Local behavior remains owner-gated before it is classified as accepted Map behavior.

### Resize

Resize is explicitly Local because its controls manipulate concrete authored local faces.

Entering Resize must **not** overwrite the stored Move/Rotate preference. Therefore:

- `Local -> Resize(Local) -> Move/Rotate` returns Local;
- `World -> Resize(Local) -> Move/Rotate` returns World.

The Resize space control may display Local while disabled to communicate the effective contract rather than imply an unavailable fake World mode.

### World Resize remains undefined

For an arbitrarily rotated primitive, a world-axis boundary operation may imply multiple local dimensions, shear, orientation change or a different geometry representation. Do not hide this ambiguity behind a toggle.

A later real use case must define World Resize semantics per geometry class before implementation.

## 7. Capsule is the next independent geometry falsifier

Do not force capsule through box semantics merely to claim genericity.

At minimum distinguish:

- axial/end-point or length authoring;
- radial/radius authoring.

Whether center/anchored modifiers and signed-handle layout transfer from box must be validated by the real capsule implementation and owner gate.

**Do not start capsule Resize until the current Map World/Local Move/Rotate owner gate passes.**

## 8. Map model boundary

Current `box | capsule` entities are P0 primitive geometry, not final Map ontology.

Leave architecture open to:

1. primitive geometry;
2. parametric authored recipes (ramps, steps, whoops, berms, obstacle banks, etc.);
3. terrain/heightfield;
4. imported mesh/scan geometry;
5. semantic layout constructs (spawns, anchors, zones, routes, test stations, etc.).

This classification is a design guard, not an instruction to implement every class now.

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

- **HomeScan-Web-Builder** — transform sessions, resize as domain operation, constraints, snapping, numeric input and validated preview/commit;
- **Voxel Aeronautics Workshop** — authored terrain dimensions and render/gameplay authority separation;
- **JV-Web** — real JURE consumer boundary, explicit primitive dimensions, render/collision separation and compatible basis;
- **Native JV / Box3d_FunProject** — tiled/heightfield terrain, semantic obstacle recipes, scan collision geometry and evidence that green data checks can miss wrong built geometry;
- **PROJECT ANVIL** — smallest-proven-capability donor doctrine.

## 10. Candidate shared Editor Core

### Proven shared now

- revisioned editor session/history lifecycle;
- small workspace routing contract.

### Strong candidates, not automatically shared

- selection contract;
- transform lifecycle;
- transform-space/pivot/axis constraint representation;
- numeric input;
- snapping;
- diagnostics/validation presentation;
- camera/focus utilities;
- document dirty-state UX;
- panel/shell primitives.

The Map World/Local slice is **not** by itself sufficient evidence to extract a generic transform-space framework. Rig and Map currently share a tiny concept and can keep thin domain-facing implementations until more repeated behavior requires extraction.

## 11. Interface grounding / separate Stage 2

Owner comparison of current Rig and Map surfaces established that Map still reads as a separate application attached by routing. This is a real product-system issue, not merely color polish.

Rig already contains a more mature system around:

- `WorkspaceShell`;
- `ViewportChrome`;
- `TopBar`;
- inspector/navigator patterns;
- shared design tokens in `styles.css`;
- resizable/collapsible side panels and status chrome.

Map still maintains its own shell and CSS. That was acceptable for interaction proof slices, but must not become permanent duplication.

**Do not mix Stage 2 shell refactoring into Stage 1 interaction grounding.**

After Stage 1 semantics are stable, Stage 2 should:

1. audit which Rig shell mechanics are genuinely shared versus Rig-specific;
2. neutralize the smallest shared slot/component contract without changing accepted Rig behavior;
3. migrate Map to the common JURE shell/tokens/primitives;
4. validate visually and with the owner that Rig/Map feel like workspaces of one tool rather than two attached applications.

Current names such as `rigPane/sourcePane` are not automatically universal merely because the shell is mechanically reusable.

## 12. Explicitly provisional / not frozen

- final Map entity/object taxonomy;
- collision-proxy-only visual model;
- friction-only surface model;
- final map extension/package/interchange format;
- materials/textures/source asset model;
- mesh/scan transform/scale semantics;
- capsule Resize UX;
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

No one category substitutes for another.

Face Resize is the canonical current example: planner/history tests stayed green while the first real Windows/browser Alt lifecycle failed. The second owner test then closed that interaction defect. Both layers of evidence matter.

Historical Native JV map work remains another warning: green tables/tests can coexist with wrong built geometry.

## 14. Controlled next sequence

### Current gate

Map World/Local Move/Rotate is implemented and technically green but not yet owner-accepted.

Owner gate must establish that:

1. World and Local visibly orient Move against world versus authored object axes;
2. Rotate similarly distinguishes World and Local;
3. transform-space toggling does not disturb normal preview/cancel/commit/Undo/Redo behavior;
4. Resize remains visibly Local-only;
5. entering/leaving Resize preserves the prior Move/Rotate preference;
6. owner-passed Face Resize remains intact.

### Stage 1 after World/Local PASS

1. design and falsify capsule axial/end-point and radial/radius Resize independently;
2. perform only tactical interaction polish required by grounded tools;
3. avoid large shell redesign inside this stage.

### Stage 2 — interface unification

After Stage 1 interaction semantics stabilize, migrate Map to a genuinely shared JURE shell/design system while preserving Rig as the regression baseline.

### Broader Map grounding after those stages

- create/delete/duplicate;
- deterministic map save/open;
- one real non-primitive representation to challenge primitive-only assumptions;
- consumer lowering only through explicit adapters/contracts.

Do not jump to a universal scene framework, ECS/plugin system or full terrain editor before evidence requires it.

## 15. Stop condition for the broader foundation phase

The JURE Map foundation is not complete because one primitive can be manipulated.

Meaningful grounding requires at least:

- Rig and Map coexist without authored-domain contamination;
- shared mechanics are extracted only where multiple domains prove overlap;
- Map has owner-accepted real geometry authoring beyond rigid pose;
- tested authored state survives deterministic save/open;
- at least one non-primitive representation challenges the primitive-only model;
- relevant technical, render, geometry/runtime and owner gates are explicit;
- the next JV/JV-Web consumer boundary can be described without turning JURE into a runtime-schema copy.

Until then PR #5 remains an experimental foundation lane, not a final JURE platform release.
