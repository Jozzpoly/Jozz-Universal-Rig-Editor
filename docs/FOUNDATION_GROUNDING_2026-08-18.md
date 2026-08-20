# JURE Foundation Grounding — 2026-08-18

Status: **active grounding contract for draft PR #5; not a final architecture specification**.

Last epistemic closeout: **2026-08-20**.

This document protects JURE from turning short-lived experiments into permanent ontology. `docs/STATUS.md` carries the exact current evidence state; this file carries durable rules, owner-tested corrections and stop conditions.

## 1. Authority order

When statements disagree, use this order:

1. live Git / exact current files and branch state;
2. executed evidence tied to an exact revision;
3. direct owner interaction feedback;
4. current architecture/status documentation;
5. historical plans, donor documentation, names and agent narrative.

A green synthetic/CI gate is not owner acceptance. Owner interaction is not proof of persistence, consumer lowering, large-map performance or untested geometry classes. Acceptance is always scoped to the behavior actually evidenced.

## 2. Isolation / identity

Active lane:

`agent/map-workspace-foundation` -> draft PR #5 -> `main`

Accepted base for this experiment:

`d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`

`main` remains the accepted Rig baseline. The Map lane is experimental until explicitly accepted and merged. Do not rewrite accepted Rig behavior or transfer experimental Map ontology into `main` merely because an interaction slice passes.

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
2. domain code interprets it against authored semantics and a frozen baseline where required;
3. preview remains disposable;
4. commit changes authored truth;
5. cancel restores committed truth.

This direction is demonstrated for rigid Move/Rotate and owner-accepted shape-aware Box Resize.

## 4. Owner-tested falsifications and corrections

### One-way workspace routing was insufficient

The first Map owner test found Map -> Rig without Rig -> Map. Routing is now symmetric through one small shared workspace-navigation contract. This does not justify a plugin/workspace framework.

### Move/Rotate alone was insufficient for Map authoring

Real Map use proved practical geometry authoring is required. It did **not** prove generic `pose.scale` belongs in Map authored truth.

Replacement rule:

**Resize authors shape/domain parameters; rigid pose does not silently absorb renderer scale.**

Examples remain shape-specific:

- box -> dimensions / `halfExtents`;
- capsule radial -> `radius`;
- capsule axial -> endpoints/separation/length;
- obstacle recipes -> semantic dimensions/parameters;
- imported mesh/scan scale remains open until a real source/consumer slice proves its meaning.

### Center-preserving box Resize was rejected as the default UX

The original Scale-like G2 was useful as a viability test but owner use falsified center-preserving Resize as the preferred default for map construction.

Grounded replacement:

- default: manipulate one concrete boundary/face and keep the opposite face fixed;
- `Alt`: temporary center/symmetric behavior;
- exact numeric dimensions may remain center-preserving exact authoring.

### Stock Three scale cannot represent signed-face or World Resize honestly

The exact Three `TransformControls` behavior collapses positive/negative scale pickers on each axis to the same axis identity, and scale mode does not provide the signed authored-face semantics required here.

Therefore:

- do not infer `+X/-X` from generic renderer scale state;
- do not expose fake World Resize backed by stock Three scale;
- box Resize uses explicit signed authored faces and its own interaction path;
- World Resize remains a separate geometry-semantics problem.

### Face Resize V2 failure then closeout

The first custom signed-face build reached `ALMOST PASS / HOLD` in a real Windows/browser test because releasing `Alt` could cancel the active drag and the controls were visually too ambiguous. Synthetic tests had remained green, so this is canonical evidence that interaction gates cannot be replaced by CI.

The later closeout preserved the authored model and corrected the interaction layer. The owner re-tested in a real Windows browser and accepted the resulting signed-face tool for continued development.

Accepted Box Resize behavior is limited to the contract below; it does not freeze World Resize, capsule semantics, generic scale, mesh/scan scale or the final Map ontology.

## 5. Box Face Resize V2 — OWNER PASS

Face identity is explicit:

`axis ('x'|'y'|'z') + side (-1|+1)`

Six box boundaries exist:

`-X +X -Y +Y -Z +Z`

### Default: opposite-face anchored

Dragging a signed local face changes that box dimension and shifts the authored rigid center so the opposite local face remains fixed in world space. The invariant must survive authored rotation.

### `Alt`: center origin

During the same active drag, `Alt` switches to center/symmetric Resize. Anchored -> center -> anchored always re-evaluates against the same frozen preview baseline. It must not compound prior previews or create a revision until pointer release.

### Exact dimensions

Inspector Dimensions are precise authored values and intentionally preserve center. They share domain/history infrastructure with viewport authoring but do not need to mimic face-drag semantics.

### Degeneracy / inversion

Interactive face drag clamps before inversion or exact degeneracy. This is a tool-interaction guard, not a global authored minimum. Exact numeric authoring remains governed by the MapDocument finite-positive contract.

### Pointer/lifecycle contract

- pointer ray maps to signed distance along the selected authored local face axis;
- near-parallel ray/axis configurations fail closed;
- no-op drag -> cancel/no revision;
- pointer release after preview -> commit;
- `Esc` / pointer cancellation / genuine window loss may cancel safely;
- browser/system behavior caused merely by using `Alt` must not be misclassified as user cancellation;
- semantic drag state survives disposable handle reprojection;
- Move/Rotate use stock `TransformControls`; Resize uses the custom signed-face path.

Current owner-accepted visual direction is:

`depth-aware face plate -> short axis stem -> grip`

with signed-face identity and anchored/center feedback.

## 6. Map World / Local Move/Rotate — OWNER PASS

The previous grounding document correctly described the implementation but incorrectly left the owner gate pending after the later real test. That status is closed as of the 2026-08-20 takeover.

### Durable contract

- stored Move/Rotate preference is `world | local`;
- Move/Rotate effective space equals that preference;
- initial preference is World, matching Rig;
- the preference is interaction/presentation state, not `MapDocument` authored truth;
- changing space does not create a document revision;
- Resize effective space is always Local;
- entering Resize does not overwrite the stored Move/Rotate preference;
- `Local -> Resize(Local) -> Move/Rotate` returns Local;
- `World -> Resize(Local) -> Move/Rotate` returns World;
- the space toggle is disabled during Resize and authored preview.

The implementation path is real rather than cosmetic:

`Map UI preference -> MapViewport -> MapViewportController.setTransformSpace() -> effectiveMapTransformSpace() -> Three TransformControls.setSpace()`

Rigid proposals then become Map domain commands through the existing `EditorSession` lifecycle.

### Evidence boundary

Independent repository verification confirms:

- product checkpoint `9ceb9bdff6ef56a2112f65e800a6b5c2051922eb`;
- its successful full workflow `32195783257` with 49/49 core tests, strict TypeScript, production build, Rig/Map render smoke and owner-preview packaging smoke;
- exact pre-closeout PR head `41d7104d1e9ee99ab51a04ae2e27ab0d1456c964` and successful full workflow `32197256235`;
- code paths that keep preference state separate, enforce Local-only Resize and actually call `TransformControls.setSpace()`.

The latest real World/Local owner test is explicitly classified by the owner as **PASS** during this takeover. A separate raw recording/later PR comment for that test is not currently present in GitHub. Therefore do not fabricate which old checklist lines were individually observed; acceptance covers the implemented/tested Move/Rotate World/Local behavior, not unrecorded broader claims.

### World Resize remains undefined

For an arbitrarily rotated primitive, a world-axis boundary operation may imply multiple local dimensions, shear, orientation change or a different geometry representation. Do not hide this ambiguity behind a toggle. A real use case must define World Resize per geometry class before implementation.

## 7. Capsule Resize is a candidate, not a scheduler

Capsule remains a useful independent geometry falsifier because its semantics differ materially from a box:

- axial/end-point or length authoring;
- radial/radius authoring;
- potentially different signed-handle and center/anchored behavior.

But World/Local PASS does **not** imply that Capsule Resize must be the next experiment. The previous sequence encoded a historical plan, not an evidence-based scheduler.

Do not force capsule through box semantics merely to claim genericity, and do not begin it until it is explicitly reselected against the other open foundation risks.

## 8. Open Map-foundation falsifier frontier

Current `box | capsule` entities are P0 primitive geometry, not final Map ontology. The most important still-unproved classes include:

1. **authored entity lifecycle** — create/delete/duplicate with stable identity and exact history behavior;
2. **owner-facing deterministic save/open** — prove the current authored document survives a real file lifecycle rather than only core serialization tests;
3. **second primitive geometry semantics** — capsule radial/axial authoring without box leakage;
4. **first non-primitive representation** — parametric recipe, terrain/heightfield or imported mesh/scan to challenge primitive-only assumptions;
5. **consumer boundary** — explicit JURE package/adapter only after enough authored meaning is grounded;
6. **large-map behavior** — current full display-projection rebuild is unproved at E2R-class scale.

Select falsifiers by information value, actual product need, causal blast radius and ability to challenge an architectural assumption. Do not use numbering alone as a scheduler.

## 9. Donor grounding

Donor code is evidence and technique, not authority over JURE ontology.

For every donor transfer:

1. identify the exact donor revision/file;
2. isolate the smallest proven capability;
3. identify donor-specific assumptions;
4. adapt against JURE contracts instead of transplanting the subsystem wholesale;
5. add JURE-specific evidence/owner validation;
6. preserve licensing obligations.

High-value donors include HomeScan-Web-Builder for transform sessions/domain resize/numeric input, VAW for authored terrain dimensions and authority separation, JV/JV-Web for real consumer boundaries and compatible basis, Native JV for terrain/obstacle/scan evidence, and PROJECT ANVIL for smallest-proven-capability transfer discipline.

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

Map World/Local plus Rig World/Local is evidence of conceptual overlap, but still not sufficient by itself to justify a broad generic transform framework. Extract only when repeated mechanics produce a concrete simplification.

## 11. Interface grounding / separate Stage 2

Owner comparison established that Map still reads as a separate application attached to Rig. Rig remains the accepted regression/reference baseline around `WorkspaceShell`, `ViewportChrome`, `TopBar`, inspector/navigator patterns, design tokens and resizable/collapsible panels.

Map may later migrate to a genuinely shared JURE shell, but do not let shell refactoring silently redefine authored Map semantics. Audit shared mechanics first, neutralize only the smallest justified contract, then validate both Rig regression and Map product coherence.

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
- final routing/navigation UX;
- final Map/Rig panel composition;
- Test/Simulation workspace;
- final JURE -> JV/JV-Web lowering schema;
- PR screenshot/owner-preview scaffolding as permanent infrastructure.

Do not build broad abstractions around these as if they were decided.

## 13. Validation doctrine

Substantial slices distinguish:

1. schema/unit evidence;
2. built geometry/invariant evidence where relevant;
3. render evidence;
4. consumer/runtime evidence when crossing into JV/JV-Web/Box3D;
5. owner interaction/product evidence.

No one category substitutes for another.

Face Resize is the canonical warning: planner/history tests stayed green while the first real Windows/browser Alt lifecycle failed. World/Local is the complementary case: machine evidence can establish wiring and invariants, while owner acceptance is a separate classification and must not be backfilled with invented manual observations.

## 14. Selected next falsifier — MAP-PERSIST-01

After the World/Local drift was closed, the open frontier was re-evaluated rather than following the historical Capsule sequence. The selected next falsifier is **real owner-facing Map Save/Open**.

### Why persistence first

The current Map workspace still initializes from hard-coded `SYNTHETIC_MAP` and remains visibly `unsaved`. Core tests already prove deterministic canonical parse/serialize, but that does not prove `MapDocument` is durable authored authority through a real browser/file lifecycle.

This is more fundamental at the current boundary than adding a second geometry manipulation tool. It also makes later capsule, lifecycle and non-primitive experiments produce durable artifacts instead of disposable lab state.

### Hypothesis

`MapDocument` and the current `EditorSession` can cross a real save/open boundary without transient renderer, preview, selection, transform-space or stale history state contaminating authored persistence.

### Frozen minimum contract

- reuse existing deterministic `serializeMapDocument()` / `parseMapDocument()` and validation;
- save committed authored truth only;
- do not serialize camera, selection, transform mode/space, Three proxies or preview state;
- opening a valid map creates a fresh session from the parsed authored document;
- invalid/malformed open fails closed and leaves the current authored map untouched;
- stale Undo/Redo history from the previous map must not survive open;
- do not extract a universal document-I/O framework solely for this slice;
- preserve accepted Rig Save/Open as regression baseline.

### Required evidence

At minimum falsify:

1. edited Move/Rotate/World/Local and Box Face Resize state survives save/open exactly;
2. canonical saved text is stable across save -> parse -> save;
3. active preview cannot silently enter the persisted document;
4. invalid input cannot partially replace current authored state;
5. opening a valid map does not retain old history;
6. presentation/renderer state is absent from the file;
7. Rig remains unchanged.

The owner gate must include a real browser save, further destructive edits, reopen of the saved file and visual/numeric confirmation that the earlier authored state returns.

### Non-goals

- Capsule Resize;
- create/delete/duplicate;
- autosave/recent files/project manager;
- final Map package/extension decision beyond current schema evidence;
- generic shared file framework;
- Stage-2 shell redesign;
- non-primitive geometry;
- consumer lowering.

**No MAP-PERSIST-01 implementation is part of the 2026-08-20 takeover/selection closeout.**

## 15. Stop condition for the broader foundation phase

The JURE Map foundation is not complete because one primitive can be manipulated or because World/Local passes.

Meaningful grounding still requires at least:

- Rig and Map coexist without authored-domain contamination;
- shared mechanics are extracted only where multiple domains prove overlap;
- Map has owner-accepted real geometry authoring beyond rigid pose;
- tested authored state survives deterministic owner-facing save/open;
- at least one non-primitive representation challenges the primitive-only model;
- relevant technical, render, geometry/runtime and owner gates are explicit;
- the next JV/JV-Web consumer boundary can be described without turning JURE into a runtime-schema copy.

Until then PR #5 remains an experimental foundation lane, not a final JURE platform release.
