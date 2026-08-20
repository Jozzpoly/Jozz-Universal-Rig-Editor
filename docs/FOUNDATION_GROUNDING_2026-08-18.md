# JURE Foundation Grounding — 2026-08-18

Status: **active grounding contract for draft PR #5; not a final architecture specification**.

Last epistemic closeout: **2026-08-20**.

`docs/STATUS.md` carries the exact current evidence state. This document carries durable rules, owner-tested corrections and stop conditions so short-lived experiments do not silently become permanent JURE ontology.

## 1. Authority order

When statements disagree, use this order:

1. live Git / exact current files and branch state;
2. executed evidence tied to an exact revision;
3. direct owner interaction feedback;
4. current architecture/status documentation;
5. historical plans, donor documentation, names and agent narrative.

A green synthetic/CI gate is not owner acceptance. Owner interaction is not proof of persistence, consumer lowering, large-map performance or untested geometry classes. Acceptance is always scoped to the behavior actually evidenced.

## 2. Isolation and domain authority

Active lane:

`agent/map-workspace-foundation` -> draft PR #5 -> `main`

Accepted base:

`main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`

`main` remains the accepted Rig baseline. Experimental Map behavior does not become accepted merely because it exists on the PR branch.

Durable authored boundaries:

- `RigDocument` is authored rig truth.
- `MapDocument` is authored map truth.
- Three scene objects, transform proxies, custom handles and renderer state are disposable projections.
- preview, selection, camera, transform mode/space and other interaction state are not authored document truth unless explicitly proven otherwise.
- JV/JV-Web/Box3D structures are downstream consumer/runtime authority, not JURE authored schemas.
- SOURCE/reference, authored state, representation/display state, transient preview and runtime/evaluated state remain distinct meanings.

Map coordinates remain explicit: metres, right-handed, `+X` forward, `+Y` up, `+Z` right.

## 3. Proven shared infrastructure — and the boundary around it

`EditorSession<Document>` is proven shared mechanics for independent Rig and Map domains:

`committed -> preview -> commit/cancel -> undo/redo`

A small workspace-routing contract is also proven shared.

That evidence does **not** justify a universal object model, scene graph, ECS, plugin architecture or generic authored transform model. Domain commands and authored schemas remain domain-owned.

Share mechanics only after repeated concrete overlap produces a smaller, clearer contract.

## 4. Grounded interaction-authority direction

The robust direction is:

1. renderer/input produces a transient proposal;
2. domain code interprets it against authored semantics and a frozen baseline where required;
3. preview remains disposable;
4. commit changes authored truth;
5. cancel restores committed truth.

This direction is demonstrated for rigid Move/Rotate and owner-accepted Box Face Resize.

## 5. Owner-tested corrections

### Workspace routing

The first Map owner test exposed one-way navigation. Rig <-> Map routing is now symmetric through a deliberately small shared seam. This is not evidence for a broad workspace framework.

### Map Resize is not generic authored scale

Real Map authoring proved that geometry editing is necessary, but it did not prove that generic `pose.scale` belongs in Map authored truth.

Rule:

**Resize authors shape/domain parameters; rigid pose does not silently absorb renderer scale.**

Examples remain shape-specific:

- box -> dimensions / `halfExtents`;
- capsule radial -> `radius`;
- capsule axial -> endpoints/separation/length;
- obstacle recipes -> semantic dimensions/parameters;
- mesh/scan transform/scale remains open until a real source/consumer slice defines it.

### Box Face Resize V2 — OWNER PASS

Center-preserving generic Scale-like Resize was rejected as the preferred default for map construction.

Accepted replacement:

- explicit signed local face identity: `axis ('x'|'y'|'z') + side (-1|+1)`;
- default keeps the opposite local face fixed and moves authored rigid center as required;
- `Alt` switches the same frozen-baseline drag to center/symmetric Resize;
- exact numeric Dimensions intentionally remain center-preserving;
- interactive degeneracy/inversion is guarded without introducing a fake global authored scale;
- pointer release commits, Esc/genuine cancellation cancels;
- revised `face plate -> axis stem -> grip` interaction language is accepted for continued work.

The first V2 owner test reached only `ALMOST PASS / HOLD`: releasing Alt could cancel a drag and the first controls were too ambiguous even though synthetic tests were green. That failure remains canonical evidence that CI does not substitute for real interaction gates.

World Resize, capsule semantics, mesh/scan scale and final Map ontology remain outside this PASS.

### Map World/Local Move/Rotate — OWNER PASS

Durable contract:

- stored Move/Rotate preference is `world | local` interaction state;
- Move/Rotate effective space equals that preference;
- Resize effective space is always Local;
- entering Resize does not overwrite the stored Move/Rotate preference;
- `Local -> Resize -> Move/Rotate` returns Local;
- `World -> Resize -> Move/Rotate` returns World;
- transform-space changes do not create document revisions;
- the toggle is disabled during Resize and authored preview.

The real path is:

`Map UI -> MapViewport -> MapViewportController -> effectiveMapTransformSpace() -> Three TransformControls.setSpace()`

then authored rigid pose command -> `EditorSession`.

World Resize remains intentionally undefined. Do not fake it through Three scale.

Owner acceptance is explicit but later raw World/Local recording evidence is not preserved in GitHub. Do not fabricate unrecorded checklist observations.

## 6. MAP-ENTITY-01 — corrected structural falsifier

The earlier plan selected MAP-PERSIST-01 immediately after World/Local. That ordering was challenged before persistence implementation.

The strongest counter-evidence was:

- Rig already proves a real browser File System Access lifecycle including Open/Save/Save As and committed-only document persistence;
- Map already proves deterministic canonical parse/serialize, validation and malformed-input fail-closed behavior in core tests;
- Map still booted from a fixed `SYNTHETIC_MAP` and had never proven that a user can change document structure itself.

Therefore persistence was not wrong, but it was premature as the next highest-information falsifier.

**Corrected order: prove structural authored entity lifecycle first, then test persistence on user-shaped state.**

### Frozen MAP-ENTITY-01 contract

- Duplicate copies an existing `MapEntity` exactly except for new authored ID/name.
- Do not invent a broad Create workflow, entity taxonomy or geometry defaults in this slice.
- Duplicate identity allocation is deterministic and collision-safe across both entity and spawn IDs.
- Current `.copy.N` allocation is provisional experiment infrastructure, not final identity policy.
- Duplicate/Delete are ordinary domain commands through `EditorSession`.
- Delete of selected entity clears non-authored selection safely.
- Undo after Delete restores the exact same authored entity and ID.
- Undo that removes a currently selected duplicate must not leave stale selection or gizmo state.
- Existing Move/Rotate/Resize must operate on the duplicate without changing its source.
- structural commands are blocked during active preview.
- malformed/stale identity assumptions fail closed instead of mutating document partially.

Product/evidence checkpoint before documentation closeout:

`caa5f94c677d236e46a7de52c10b3fe5f216f6dd`

Do not classify MAP-ENTITY-01 OWNER PASS until the generated real-browser owner preview is exercised successfully.

## 7. Persistence remains the intended next falsifier after structural acceptance

MAP-PERSIST-01 is deferred, not rejected.

Once MAP-ENTITY-01 is owner-accepted, Save/Open becomes a stronger test because the document can contain genuinely user-created structure rather than only transformed fixture objects.

Persistence contract remains:

- reuse deterministic `serializeMapDocument()` / `parseMapDocument()` and validation;
- save committed authored truth only;
- never serialize camera, selection, transform mode/space, Three proxies or preview state;
- valid Open creates a fresh `EditorSession` from parsed authored truth;
- invalid/malformed Open fails closed and leaves current authored state untouched;
- stale old Undo/Redo history must not survive Open;
- do not extract a universal document-I/O framework solely for this slice;
- preserve accepted Rig Save/Open behavior.

The real owner gate should include structural Duplicate/Delete edits, Move/Rotate/Resize, save, destructive later changes, reopen and exact visual/numeric restoration.

## 8. Open Map-foundation frontier

Current `box | capsule` entities are primitive falsifiers, not final Map ontology.

Still-unproved classes include:

1. MAP-ENTITY-01 real owner interaction acceptance;
2. owner-facing deterministic Map Save/Open;
3. second primitive geometry semantics — capsule axial/radial authoring without box leakage;
4. first non-primitive representation — recipe, terrain/heightfield or imported mesh/scan;
5. explicit consumer/package boundary only after enough authored meaning is grounded;
6. large-map/E2R behavior; current full display-projection rebuild is unproved at scale;
7. final unified Rig/Map shell and visual/product language.

Select falsifiers by information value, actual product need, causal blast radius and ability to challenge an architectural assumption. Numbering is not a scheduler.

## 9. Candidate shared Editor Core

Proven shared now:

- revisioned session/history lifecycle;
- small workspace-routing contract.

Strong candidates, not automatically shared:

- selection contract;
- transform lifecycle;
- transform-space / constraints;
- numeric input;
- snapping;
- diagnostics presentation;
- camera/focus utilities;
- dirty-state UX;
- file-I/O mechanics;
- panel/shell primitives.

The existence of similar features in Rig and Map is evidence to inspect, not permission to generalize them. Extract only when doing so measurably reduces duplication without contaminating authored domain meaning.

## 10. Proposed future JURE unification stage

The owner proposes that, after the current structural problem is genuinely resolved, JURE should undergo a fundamental integration pass covering visual style, UI, shared core and the relationship between Rig and Map.

This is a legitimate next-stage candidate, but it is **not yet an automatic implementation command**.

Before that work starts, perform a dedicated unification design/falsification checkpoint that answers at minimum:

- which Rig/Map similarities are truly shared mechanics versus coincidental UI resemblance;
- which current Rig behaviors are accepted regression gates that cannot be broken;
- which Map pieces are still provisional and therefore must not be promoted into shared core;
- whether unification should happen before or after MAP-PERSIST-01 and the first non-primitive falsifier;
- what shared shell/design tokens/components can be unified without merging authored schemas;
- how one coherent JURE workspace can present multiple authored domains without becoming a generic scene/ECS framework.

The desired end state may be one coherent JURE product, but **visual/product unity does not require authored-domain unity**.

## 11. Donor grounding

Donor code is evidence and technique, not authority over JURE ontology.

For every transfer:

1. identify exact donor revision/file;
2. isolate smallest proven capability;
3. identify donor-specific assumptions;
4. adapt against JURE contracts rather than transplanting whole subsystems;
5. add JURE-specific evidence/owner validation;
6. preserve licensing obligations.

## 12. Explicitly provisional / not frozen

- final Map entity/object taxonomy;
- `.copy.N` identity/naming scheme;
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
- final Map/Rig panel composition and styling;
- final JURE -> JV/JV-Web lowering schema;
- screenshot/owner-preview scaffolding as permanent infrastructure.

Do not build broad abstractions around these as if they were decided.

## 13. Validation doctrine

Substantial slices distinguish:

1. schema/unit evidence;
2. geometry/invariant evidence where relevant;
3. render/build evidence;
4. consumer/runtime evidence when crossing into JV/JV-Web/Box3D;
5. owner interaction/product evidence.

No category substitutes for another.

## 14. Stop condition for the broader foundation phase

The JURE Map foundation is not complete because one primitive can be manipulated or because a shell looks unified.

Meaningful grounding still requires:

- Rig and Map coexist without authored-domain contamination;
- shared mechanics are extracted only where repeated evidence proves overlap;
- Map has owner-accepted geometry authoring beyond rigid pose;
- Map structure can be changed with stable authored identity/history;
- authored state survives deterministic real Save/Open;
- at least one non-primitive representation challenges primitive-only assumptions;
- relevant technical/render/owner gates remain explicit;
- a downstream JV/JV-Web boundary can be described without turning JURE into a runtime-schema copy.
