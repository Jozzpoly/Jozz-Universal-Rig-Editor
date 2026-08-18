# Status

## Current state

The owner-tested Rig foundation remains the accepted JURE baseline. Experimental Map authoring remains isolated on draft PR #5; `main` is not changed by this lane.

Active branch:

`agent/map-workspace-foundation`

Accepted base for this experiment:

`main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`

Active grounding contract:

`docs/FOUNDATION_GROUNDING_2026-08-18.md`

## Box Face Resize V2 — OWNER PASS

The owner re-tested the closeout build on Windows in a real browser and explicitly accepted Box Face Resize V2 as good enough to continue.

Owner-tested delivery head:

`f418eef579e9073bc0ea793cdf58862dc0598548`

The owner evidence confirms:

- signed local face Resize is usable;
- default opposite-face-fixed behavior is the accepted primary interaction;
- `Alt` can switch one continuous drag to center/symmetric Resize and release back to anchored Resize without cancelling the command;
- repeated `ANCHORED -> CENTER -> ANCHORED` switching survives within one pointer drag;
- the revised `face plate -> axis stem -> grip` visual language is accepted for continuing development;
- pointer release commits normally;
- Undo/Redo remains valid.

The supplied recording independently showed repeated status transitions between anchored and center semantics during one live interaction followed by a committed state.

This closes the previous owner blockers around Windows/browser Alt lifecycle and the first raw detached-cube affordance.

Durable Box Resize conclusions:

- Resize authors geometry/domain parameters, not generic rigid-pose scale;
- box face identity is explicit `axis + side` (`-X +X -Y +Y -Z +Z`);
- anchored Resize moves the dragged local face while keeping the opposite local face fixed in world space;
- `Alt` requests center/symmetric Resize from the same frozen baseline;
- exact numeric Dimensions remain center-preserving authored input;
- inversion is blocked by a transient interaction floor, not a global authored minimum;
- renderer controls remain disposable projections;
- stock Three scale remains retired from Map Resize.

World Resize is still deliberately undefined.

## Stage 1.2 — Map World/Local for Move/Rotate

The next small Stage-1 slice is now implemented and technically green.

Latest product-code checkpoint:

`9ceb9bdff6ef56a2112f65e800a6b5c2051922eb`

Current evidence-scaffolding head after retargeting the owner-preview instructions:

`3c11de64616ceb26b1d615029f4cae522dfb3765`

The Map interaction contract now distinguishes:

- stored Move/Rotate preference: `world | local`;
- effective Move/Rotate space: the stored preference;
- effective Resize space: always `local`;
- entering Resize does not overwrite the stored Move/Rotate preference;
- leaving Resize restores the previous Move/Rotate preference.

Implementation direction:

`Map UI preference -> MapViewport -> MapViewportController.setTransformSpace() -> effectiveMapTransformSpace() -> Three TransformControls.setSpace()`

Resize remains on the custom signed-face path and does not use `TransformControls` scale.

UI behavior:

- `World` is the initial Move/Rotate preference, matching the accepted Rig baseline;
- the control toggles between World and Local for Move/Rotate;
- while Resize is active the control displays `Local` and is disabled;
- while an authored preview is active the space toggle is disabled;
- the viewport hint states that Move/Rotate use World/Local while Resize uses Local signed faces.

Technical evidence on `9ceb9bd...` / run `32195783257`, job `95899377552`:

- strict TypeScript PASS;
- core suite **49/49 PASS**;
- Vite production build PASS;
- default Rig browser render smoke PASS;
- Map browser render smoke PASS;
- generated Windows owner-preview + HTTP smoke PASS.

The two new core tests prove:

1. Move and Rotate honor either preferred transform space;
2. Resize resolves to Local without mutating the stored preference, so e.g. `World -> Resize(Local) -> Move` returns to World.

The Map screenshot on the exact product head confirms the new World control renders without layout regression. It does not prove spatial Local/World manipulation.

The owner-preview workflow has been retargeted to test this exact slice. The World/Local interaction remains **owner-gated** before it becomes accepted product behavior.

## Current owner gate — World/Local Move/Rotate

The next owner test should verify:

1. Move starts in World and its gizmo follows world axes;
2. after rotating an entity, Local reorients the Move gizmo to the entity;
3. Rotate similarly distinguishes World and Local orientation;
4. repeated World/Local toggling does not disturb Undo/Redo or Esc cancellation;
5. `Local -> Resize -> Move/Rotate` returns to Local;
6. `World -> Resize` displays disabled Local, and leaving Resize returns to World;
7. Box Face Resize V2 still works as previously accepted;
8. Bumper remains Move/Rotate-capable but has no fake box-style Resize;
9. Rig <-> Map routing still works.

Acceptance boundary: World/Local applies only to Move/Rotate. A disabled Local state in Resize is intentional evidence that World Resize has not been faked.

Do not start capsule Resize until this owner gate passes.

## Accepted Rig baseline

The accepted Rig workspace still provides the regression/reference baseline for:

- rigid `RigElement` and owner-local `RigFrame` authoring;
- Move/Rotate with World/Local and exact numeric editing;
- preview/commit/cancel and Undo/Redo;
- deterministic RigDocument save/open;
- free inspection camera and Focus/Fit helpers;
- read-only glTF/GLB SOURCE inspection and provenance;
- viewport-first resizable/collapsible navigator/viewport/inspector workspace.

The later interface-unification stage must preserve this behavior.

## Experimental Map foundation

Currently implemented:

- independent `MapDocument` authored truth;
- metre/right-handed `+X` forward, `+Y` up, `+Z` right basis;
- stable authored IDs;
- rigid position+rotation poses with no generic authored scale;
- P0 box/capsule geometry;
- deterministic parse/serialize and fail-closed validation;
- shared generic `EditorSession<Document>` with domain-owned commands;
- Map viewport projection, selection, OrbitControls, Move/Rotate, preview/commit/cancel, Undo/Redo and Fit Map;
- symmetric Rig <-> Map workspace routing;
- exact box `Dimensions · m` authoring through `halfExtents`;
- owner-passed signed-face box Resize;
- technically green World/Local Move/Rotate with explicit Local-only Resize boundary;
- dedicated Map navigator/inspector, still intentionally separate from the accepted Rig shell during Stage 1 interaction grounding.

Current box Resize authority path:

`custom signed face control -> pointer ray / authored local face axis proposal -> frozen-baseline face-resize planner -> atomic pose + halfExtents command -> EditorSession preview/commit`

Current Move/Rotate authority path:

`Three TransformControls proposal -> authored rigid pose command -> EditorSession preview/commit`

Three scene objects and controls never become authored authority.

## Map model boundary

Current `box | capsule` entities are a primitive proof slice, not the final Map ontology. Keep architecture open to at least:

- primitive geometry;
- parametric obstacle/shape recipes;
- terrain/heightfield;
- imported mesh/scan geometry;
- semantic layout constructs such as spawns, anchors, zones/routes and test stations.

Do not implement a universal scene/ECS/plugin abstraction before repeated real requirements justify it.

## Donor conclusions

Useful donor projects remain technique/evidence sources, not ontology authorities:

- **HomeScan-Web-Builder** — transform sessions, domain resize, constraints, snapping and numeric input;
- **Voxel Aeronautics Workshop** — authored terrain dimensions and render/gameplay authority separation;
- **JV-Web** — real consumer boundary, explicit primitive dimensions and compatible coordinate basis;
- **Native JV / Box3d_FunProject** — terrain/obstacle/scan patterns and evidence that green data checks can miss wrong built geometry;
- **PROJECT ANVIL** — transfer only the smallest proven capability and adapt it to destination contracts.

## BIND-00 result

BIND-00 remains a transient representation-binding prototype tested against the real `OneSided_Steering_Suspension_Rig.gltf` and is not serialized as durable Rig ontology.

Exact source SHA-256 used by the accepted experiment:

`fc1e8bd0e298a66fa79c43324708e281073ea8fb7a7aad2728702653705c0ee1`

The experiment proved one authored RigElement can drive one exact rigid skin joint through a stable rest offset while SOURCE remains independently inspectable. It also falsified the singleton `representationBinding` design; multiple durable bindings remain a future design problem.

## Controlled next sequence

### Stage 1 — interaction / authoring completion

1. **Box Face Resize V2:** OWNER PASS.
2. **Map World/Local Move/Rotate:** implemented + technical evidence green; owner interaction gate pending.
3. After owner PASS only: design and falsify capsule Resize independently with explicit axial/end-point and radial/radius meanings.
4. Perform only tactical Map interaction polish required by those grounded tools.

### Stage 2 — JURE interface unification

After Stage 1 interaction semantics stabilize:

1. audit the accepted Rig `WorkspaceShell`, `ViewportChrome`, design tokens and panel primitives;
2. separate genuinely shared shell mechanics from Rig-specific slots/names;
3. neutralize the smallest shared shell contract without changing accepted Rig behavior;
4. migrate Map onto that common JURE UI system;
5. use visual and owner gates to prove Rig and Map read as workspaces of one application rather than two applications attached by routing.

### Broader Map grounding after those stages

- create/delete/duplicate;
- deterministic map save/open;
- one real non-primitive representation (parametric recipe, terrain/heightfield or imported mesh/scan) to falsify primitive-only assumptions;
- consumer lowering only through explicit adapters/contracts.

## Known tooling debt

- no `package-lock.json`; transitive installs are not fully reproducible;
- current Vite output still reports a large client chunk warning;
- Map preview still rebuilds the full primitive display projection on each preview document update; acceptable for the tiny fixture, unproved at E2R scale;
- PR browser screenshots and Windows owner-preview packaging are evidence scaffolding, not permanent product infrastructure;
- Browser plugin is unavailable in the current session and local fallback Chromium navigation is administratively blocked, so spatial interaction remains an explicit owner gate.
