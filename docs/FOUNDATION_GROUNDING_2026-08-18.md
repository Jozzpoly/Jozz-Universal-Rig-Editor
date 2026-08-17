# JURE Foundation Grounding — 2026-08-18

Status: **active grounding contract for draft PR #5; not a final architecture specification**.

This document exists to prevent provisional experiments from silently becoming permanent JURE ontology. It records what current evidence actually supports after the first owner-tested Map Lab slice, what was falsified, what remains deliberately open, and how donor projects may be harvested without importing their product-specific architecture.

## 1. Authority order

When statements disagree, use this order:

1. live Git / exact current files and branch state;
2. executed evidence tied to an exact revision;
3. direct owner interaction feedback;
4. current architecture/status documents;
5. historical plans, donor documentation, names and agent narrative.

A green synthetic or CI gate is not owner/product acceptance. A working owner interaction is not proof of untested persistence, geometry correctness, runtime lowering or future scalability.

## 2. Exact checkpoint being grounded

Branch: `agent/map-workspace-foundation`

Owner-tested preview source head: `3f5cea513ecb7c040285fc2f9604690d3fe13428`

Base `main` at the start of the Map experiment: `d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`

The branch remains isolated behind draft PR #5. `main` is not changed by this grounding work unless the owner later accepts a merge.

## 3. Evidence at this checkpoint

Executed evidence on the exact owner-tested head:

- strict TypeScript: PASS;
- core tests: 28/28 PASS;
- production Vite build: PASS;
- headless browser render of default Rig workspace: PASS;
- headless browser render of `?workspace=map`: PASS;
- generated Windows owner-preview package HTTP smoke: PASS;
- owner opened the exact preview and exercised the Map workspace in a real browser;
- owner observed working camera/orbit, selection, Move/Rotate and general Map Lab operation and preliminarily classified the build as working.

Owner feedback also immediately exposed two design facts:

- navigation is asymmetric: Map can enter Rig but Rig offers no way back to Map;
- pose-only manipulation is insufficient for practical map authoring; shape resizing/creation tools are needed.

The owner explicitly did **not** close the fundamentalization phase. This checkpoint proves viability of the current path, not completeness of the platform.

## 4. Durable foundation — evidence-backed

The following are currently strong enough to build on unless future real evidence falsifies them.

### 4.1 Authority separation

- `RigDocument` is authored rig truth.
- `MapDocument` is authored map truth.
- Three scene objects, TransformControls proxies, renderer state and runtime objects are disposable projections, not authored authority.
- JV/JV-Web/Box3D consumer structures are downstream consumer/runtime authority and must not be silently imported into JURE authored schemas.
- source/reference geometry, authored state, representation/display state and runtime/evaluated state remain distinct meanings.

### 4.2 Explicit coordinates and units

Current map authored coordinates are metre-based, right-handed, `+X` forward, `+Y` up, `+Z` right. This matches the first real JV-Web world consumer and the current Native JV convention. Keep the contract explicit at every interchange boundary rather than relying on renderer defaults.

### 4.3 Stable identity and deterministic documents

Stable authored IDs, fail-closed validation and deterministic canonical serialization are useful in both Rig and Map domains. They remain domain-specific implementations until enough repeated structure justifies a smaller shared document utility.

### 4.4 Revisioned editor session

`EditorSession<Document>` is the first genuinely proven shared JURE mechanism because two independent authored domains now use the same semantics:

`committed -> preview -> commit/cancel -> undo/redo`

Domain commands remain domain-owned. Sharing the session does not imply a universal object model.

### 4.5 Ephemeral transform proxy

The current transform pattern is sound:

- renderer/gizmo proposes a change;
- authored command interprets it;
- preview state is disposable;
- commit is the only authored transition;
- cancel restores authored truth.

This pattern is independently supported by the mature HomeScan editor interaction design.

## 5. Falsified or corrected assumptions

### 5.1 One-way workspace routing is not sufficient

The current root seam proved that Rig and Map can coexist, but the product navigation is incomplete. Workspace navigation must be symmetric and use one small shared routing contract instead of separate ad-hoc buttons.

This does **not** justify a large plugin/workspace framework. A shared `WorkspaceKind` + URL/query navigation helper is enough until a third workspace proves more is needed.

### 5.2 “No scale in Map” was stated too broadly

What remains valid:

- rigid authored pose should not silently absorb scale;
- Box3D/JV primitive collision consumers already use explicit shape dimensions;
- arbitrary renderer scaling must not become authored physics by accident.

What the owner test falsified:

- Move/Rotate alone is enough for useful map authoring.

Replacement hypothesis:

**Map needs shape-aware `Resize`, which may be presented through familiar Scale-like gizmo handles while committing domain geometry parameters instead of generic pose scale.**

Examples:

- box resize -> `halfExtents`;
- capsule radial resize -> `radius`;
- capsule axial resize -> endpoint separation/length;
- future obstacle recipe -> its semantic dimensions (`width`, `height`, `length`, `angle`, `gap`, `spacing`, etc.);
- imported mesh/scan -> scale semantics remain open and must be decided from a real source/consumer slice rather than inferred from primitives.

This distinction is supported by HomeScan (`resize` as an editor operation with domain validation), VAW terrain authoring (`size`, `width`) and Native JV obstacle recipes (explicit parametric dimensions).

## 6. Map model: what exists versus what it means

Current `box | capsule` entities are **P0 primitive geometry**, not the final Map ontology.

Do not infer from the current prototype that every future map item is one primitive entity. Current donor and consumer evidence requires us to leave room for at least these representation classes:

1. **primitive geometry** — boxes/capsules and possibly later other simple collision primitives;
2. **parametric authored recipes** — ramps, steps, whoops, berms, obstacle banks and similar domain constructs compiled into one or many primitives/meshes;
3. **terrain/heightfield** — large continuous sampled surfaces with their own regeneration/source semantics;
4. **imported mesh/scan geometry** — externally sourced geometry whose visual and collision representations may differ;
5. **layout/semantic constructs** — spawn/anchors, zones, routes, entrances/exits, test stations and future gameplay/test metadata.

This is a classification boundary, not a command to implement five systems now.

## 7. Donor grounding

Donor code is evidence and a library of techniques, not an authority over JURE ontology.

### 7.1 Harvest rule

For every donor use:

1. identify the exact live donor revision/file;
2. identify the smallest proven capability needed;
3. list donor-specific assumptions;
4. rewrite/adapt the capability against JURE contracts when practical instead of importing a subsystem wholesale;
5. add a JURE-specific test or owner gate proving the transfer actually helps;
6. preserve third-party licensing obligations where applicable.

This follows the donor doctrine already used by PROJECT ANVIL.

### 7.2 HomeScan-Web-Builder

Strong donor for editor interaction mechanics:

- explicit transform sessions;
- `resize` as a first-class operation rather than generic scene scaling;
- pivot/orientation/axis constraints;
- snapping;
- numeric input;
- preview + validation + command commit;
- domain resize planning that verifies geometric invariants before commit.

Use these as interaction patterns. Do not import HomeScan building ontology into JURE.

### 7.3 Voxel Aeronautics Workshop

Useful donors:

- terrain/patch authoring with domain dimensions such as `size` and `width`;
- snapping/target-result techniques;
- explicit separation of renderer-only terrain appearance from gameplay/collision authority.

Do not import VAW’s vehicle/build taxonomy into JURE Map.

### 7.4 JV-Web

Useful real consumer/falsifier:

- explicit JURE consumer boundary already exists;
- `JvWorldData` uses explicit primitive dimensions and the same coordinate basis;
- scene package separates render and collision sources;
- current Box3D lowering confirms primitives do not require generic transform scale.

Do not freeze `JvWorldData` as the JURE authored schema. Consumer lowering must stay explicit.

### 7.5 Native JV / Box3d_FunProject

Important map lessons:

- accepted terrain foundation uses explicit world layout + tiled plate + procedural heightfield;
- obstacle kit uses semantic parameters (`length`, `width`, `height`, `radius`, `angle`, `count`, `spacing`, etc.);
- scan collision reader produces raw collision-ready geometry in lab metres without mixing renderer/physics dependencies;
- historical map audit proved that green validators can validate tables while the built geometry is wrong;
- product gates and geometric/runtime gates must therefore remain separate;
- owner sign-off checkpoints must be real stop gates, not suggestions.

JURE should eventually make these classes of mistakes easier to see before lowering into a consumer.

## 8. Candidate shared Editor Core — not all frozen

### Proven now

- revisioned editor session/history lifecycle.

### Strong candidates requiring another real use before broad extraction

- workspace navigation;
- selection contract;
- transform interaction lifecycle;
- transform-space/pivot/axis constraint representation;
- numeric input;
- snapping;
- command diagnostics/validation presentation;
- common viewport camera/focus utilities;
- file/session dirty-state UX.

Rule: when Rig and Map independently need the same capability, compare the actual requirements first. Extract the smallest intersection only after both sides exist.

## 9. Explicitly provisional / not frozen

- current `MapDocument` entity taxonomy;
- `visual: collision-proxy | none`;
- friction-only surface model;
- final map file extension/package structure;
- source asset/texture/material model;
- mesh and scan instance transform semantics;
- capsule resize semantics and gizmo UX;
- hierarchy / scene graph / ECS / plugin model;
- streaming/partitioning;
- URL-query workspace routing as final UX;
- final Map/Rig panel layouts;
- Test/Simulation workspace composition;
- final JURE -> JV/JV-Web lowering schema;
- PR screenshot/owner-preview workflow as permanent infrastructure.

Do not build architectural abstractions around these as if already decided.

## 10. Validation doctrine for the next foundation work

Every substantial slice should distinguish at least:

1. **schema/unit tests** — invariants, deterministic state, command semantics;
2. **built geometry tests** — inspect the actual generated geometry, bounds and topological/clearance properties where relevant;
3. **render evidence** — catches empty, misplaced, overlapped or visually misleading output;
4. **consumer/runtime evidence** — only when the slice crosses into JV/JV-Web/Box3D;
5. **owner interaction gate** — ergonomics, spatial readability and product value.

No one category substitutes for the others.

## 11. Grounded next sequence

Do not jump to mesh import, full terrain editing or a universal scene framework yet.

Recommended next controlled sequence:

### G1 — repair workspace symmetry

- one small shared workspace navigation helper;
- Rig -> Map and Map -> Rig use the same contract;
- preserve unrelated query parameters;
- add deterministic routing tests;
- full repo check + browser smoke.

### G2 — ground transform/resize semantics on one primitive

Use box only as the first falsifier:

- add a `Resize` authoring command that changes `halfExtents`, not pose scale;
- expose Scale-like handles if ergonomically useful;
- preserve center for symmetric resize;
- enforce positive/minimum extents;
- preview/commit/cancel/undo/redo;
- add numeric extent editing if needed to validate exact authoring;
- owner test before generalizing.

### G3 — second shape falsifier

Only after box Resize works, design capsule resize. Radial and axial resize have different semantics; do not force them through the box implementation merely to claim genericity.

### G4 — authoring operations

Once transforms are grounded, evaluate the smallest useful create/delete/duplicate workflow and map save/open. These are prerequisites for a real authoring tool, but they should use the grounded command/session model rather than bypass it.

### G5 — first non-primitive representation

Choose one real need from Native JV/VAW/JV-Web — likely a parametric obstacle recipe or terrain/mesh slice — specifically to falsify the primitive-only MapDocument design. Do not implement all representation classes at once.

## 12. Stop condition for this grounding phase

The foundation phase is not complete merely because a map can be manipulated.

It becomes meaningfully grounded when:

- Rig and Map coexist symmetrically without contaminating each other;
- shared editor mechanics are extracted only where two domains prove them;
- Map supports a real geometry-authoring operation beyond rigid pose;
- authored state survives deterministic save/open for the tested map slice;
- at least one non-primitive world representation falsifies or validates the current Map architecture;
- technical, render and owner gates all exist for the relevant slice;
- the next consumer boundary can be described without making JURE a copy of JV runtime.

Until then, PR #5 remains an experimental foundation lane, not a final JURE platform release.
