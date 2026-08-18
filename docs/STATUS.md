# Status

## Current state

The owner-tested Rig foundation remains the accepted baseline. The experimental Map authoring lane remains isolated on draft PR #5; `main` is not changed by this work.

The first Map proof-of-viability and the original G2 box Resize were both owner-tested. G2 proved that shape-aware Resize can author box dimensions without adding generic scale to `MapRigidPose`, but the owner **rejected center-preserving symmetric Resize as the default map-authoring interaction**. The replacement interaction — **Box Face Resize V2** — is now implemented and technically validated. Its real spatial feel still requires the owner gate before this substage is considered ergonomically grounded.

The Map slice is working but the broader fundamentalization phase is not complete. Active grounding contract:

`docs/FOUNDATION_GROUNDING_2026-08-18.md`

## Accepted Rig baseline

- rigid `RigElement` and owner-local `RigFrame` authoring;
- Move/Rotate with World/Local and exact numeric editing;
- preview/commit/cancel and undo/redo;
- deterministic RigDocument save/open;
- free inspection camera and Focus/Fit helpers;
- read-only glTF/GLB SOURCE inspection and provenance;
- viewport-first resizable/collapsible navigator/viewport/inspector workspace.

The Rig UI is the accepted current quality/reference baseline for the later JURE interface-unification stage. It is not evidence that every Rig-specific panel or name belongs in a universal shell.

## Experimental Map foundation

Implemented and still supported:

- independent `MapDocument` authored truth;
- metre/right-handed `+X` forward, `+Y` up, `+Z` right basis;
- stable authored IDs;
- rigid position+rotation poses with no generic authored scale;
- P0 box/capsule geometry;
- deterministic parse/serialize and fail-closed validation;
- shared generic `EditorSession<Document>` with domain-owned commands;
- Map viewport projection, selection, OrbitControls, Move/Rotate, preview/commit/cancel, Undo/Redo and Fit Map;
- symmetric Rig <-> Map workspace routing;
- exact user-facing box `Dimensions · m` authoring through `halfExtents`;
- dedicated Map navigator/inspector, still intentionally separate from the accepted Rig shell during the interaction-grounding stage.

Current box Resize architecture:

`custom signed face handle -> pointer ray / authored face axis proposal -> frozen-baseline face-resize planner -> atomic pose + halfExtents command -> EditorSession preview/commit`

Three scene objects and handle meshes remain disposable projections; they never become authored authority.

## Owner evidence

### First Map Lab viability

Owner-tested head:

`3f5cea513ecb7c040285fc2f9604690d3fe13428`

Owner evidence confirmed practical camera/orbit, selection, Move/Rotate and Fit Map operation and classified the build as working enough to continue. It also exposed the original one-way workspace routing defect and the need for geometry authoring beyond rigid pose. Routing was repaired through one symmetric contract.

### Original G2 box Resize

Owner tested the center-preserving Scale-like box Resize plus exact dimensions and classified the stage overall as PASS for continuing development. That test produced a decisive UX falsification:

- symmetric center Resize is useful as a modifier behavior, not the desired default;
- default map authoring should move only the dragged side while the opposite side stays fixed;
- `Alt` is the preferred working hypothesis for temporary center/symmetric behavior;
- Map also needs World/Local control and later capsule Resize;
- Map UI currently reads as a separate application compared with the accepted Rig workspace, motivating a later **separate** interface-unification stage.

The data/command architecture survived this falsification. The default interaction did not.

## Box Face Resize V2 — implementation complete, owner gate pending

The stock Three scale gizmo was intentionally retired from Map Resize. Investigation of the exact Three transform control showed two blockers for the required semantics:

- positive and negative scale pickers on one axis collapse to the same `X/Y/Z` axis identity, so the stock control cannot robustly tell which signed face the user grabbed;
- Three scale mode forces local space internally, so a `World` toggle cannot honestly create World Resize semantics.

Face Resize V2 therefore uses six explicit signed box faces:

`-X +X -Y +Y -Z +Z`

Current semantics:

- default `opposite-face`: dragged local face moves and the opposite local face remains spatially fixed;
- the authored box center shifts by exactly the amount required to preserve that fixed face;
- `Alt` switches the active drag to `center` mode from the same frozen baseline; releasing Alt returns to anchored mode without compounding;
- rotated authored boxes preserve the same opposite-face invariant in world coordinates;
- crossing through inversion is clamped at a transient tool degeneracy floor instead of flipping the authored box;
- exact numeric Dimensions deliberately remain center-preserving exact authoring and are not constrained by the gizmo-only degeneracy floor;
- no-op face drags cancel rather than creating a revision;
- `Esc`, pointer cancel and window blur cancel the active preview;
- pointer release commits through the same revision/history lifecycle;
- capsule Resize remains unavailable rather than inheriting false box semantics.

Renderer/input grounding:

- face identity is explicit `axis + side`, not inferred from renderer scale;
- pointer movement is projected to a signed world-space distance along the selected authored face axis;
- ray/axis near-parallel views fail closed instead of producing arbitrary screen-space jumps;
- handles near a spatially degenerate view are suppressed unless active;
- handle size is approximately screen-stable and back-facing handles are de-emphasized;
- active drag state stores stable semantic data rather than references to handle meshes, so the current full-document preview reprojection does not own the drag session;
- stock `TransformControls` remains the Move/Rotate path only.

Still unproved by automation and intentionally owner-gated:

- the actual tactile/readability quality of the six face handles;
- whether Alt switching feels natural during a continuous real pointer drag;
- whether hidden/de-emphasized handles behave well across the owner's normal camera angles;
- practical smoothness of full-document reprojection on substantially larger maps.

Do not start capsule generalization or claim Box Face Resize ergonomically accepted until this owner gate is exercised.

## Current exact-head evidence

Latest code-bearing checkpoint:

`0868e0443bc279371c6cc9a1b3090e902d8cd198`

GitHub Actions run `32160998792`, job `95789592092`:

- strict TypeScript PASS;
- core suite **47/47 PASS**;
- Vite production build PASS;
- headless Chromium default Rig render smoke PASS;
- headless Chromium Map render smoke PASS;
- generated Windows owner-preview package + HTTP smoke PASS.

The 47 tests include explicit falsifiers for signed face identity, fixed opposite face, contraction, rotated-box world-space invariance, degeneracy, atomic pose+geometry preview/history, pointer-ray-to-axis distance, near-parallel fail-closed behavior and `anchored -> Alt center -> anchored` switching from one frozen baseline without compounding.

The browser smoke is render evidence, not spatial-interaction evidence. The available local Chromium fallback remains administratively blocked for localhost/synthetic navigation in this environment, so real pointer feel remains an owner gate rather than a simulated claim.

Known unrelated build warning: the Vite client chunk remains above the warning threshold. The repository also still has no lockfile, so Actions are current dependency-resolution evidence rather than hermetic dependency reproduction.

## Map model boundary

Current box/capsule entities are a primitive proof slice, **not the final Map ontology**. Keep architecture open to at least:

- primitive geometry;
- parametric obstacle/shape recipes;
- terrain/heightfield;
- imported mesh/scan geometry;
- semantic layout constructs such as spawns, anchors, zones/routes and test stations.

This is a classification boundary, not a request to implement every class now.

## Donor conclusions

Useful donors remain evidence and technique libraries, not ontology authorities:

- **HomeScan-Web-Builder** — transform sessions, domain resize, axis/pivot constraints, snapping and numeric input;
- **Voxel Aeronautics Workshop** — authored terrain/patch dimensions and render/gameplay separation;
- **JV-Web** — real consumer boundary, explicit primitive dimensions and current compatible coordinate basis;
- **Native JV / Box3d_FunProject** — terrain/obstacle/scan patterns and historical evidence that green data checks can miss wrong built geometry;
- **PROJECT ANVIL** — transfer the smallest proven capability and adapt it to destination contracts.

## BIND-00 result

BIND-00 remains a transient representation-binding prototype tested on the real `OneSided_Steering_Suspension_Rig.gltf`.

Exact real SOURCE evidence:

- SHA-256 `fc1e8bd0e298a66fa79c43324708e281073ea8fb7a7aad2728702653705c0ee1`;
- self-contained glTF, 15 nodes / 14 joints / 1 skinned mesh in the tested revision;
- the asset is not stored canonically in this repo. Reproduction must use the owner's exact file and verify the SHA.

It proved one authored RigElement can drive one exact rigid skin joint through a stable rest offset while SOURCE remains independently inspectable. It also falsified the singleton `representationBinding`: a second binding replaces the first. BIND-00 therefore remains transient and un-serialized.

Exact pre-cleanup owner-evidence checkpoint:

`checkpoint/foundation-bind00-owner-tested-2026-08-15`

## Durable conclusions

- `RigElement / RigFrame / RigRelation` remain the small authored rig kernel unless real evidence falsifies them.
- `MapDocument` remains a separate authored map model and must not absorb renderer/Box3D/JV runtime ontology.
- authored truth, SOURCE/reference, display projection, transient preview and runtime/evaluated state remain distinct meanings.
- shared infrastructure is extracted only when multiple real consumers prove the overlap.
- the transform/resize authority direction remains: renderer proposes, domain command interprets, preview is disposable, commit changes authored truth.
- Box Resize now has stronger evidence for **boundary/face authoring**, not generic pose scale.
- World Resize semantics remain deliberately open; stock Three scale does not solve them.
- free camera/navigation and direct spatial inspection remain product requirements.
- do not freeze JV runtime structures or current P0 primitives as final JURE map schemas.

## Two-stage next sequence

### Stage 1 — interaction / authoring completion

1. **Box Face Resize V2:** implementation + technical gates complete; **owner spatial gate pending**.
2. After owner acceptance, add Map World/Local for Move/Rotate using the already accepted Rig interaction model. World Resize remains a separate semantic design problem, not a fake toggle.
3. Design and falsify capsule Resize independently: axial/end-point and radial/radius meanings must be explicit.
4. Perform only tactical Map UI polish needed to expose the grounded interactions clearly.

### Stage 2 — JURE interface unification (separate stage)

After Stage 1 interaction semantics are stable:

1. audit the accepted Rig `WorkspaceShell`, `ViewportChrome`, design tokens and panel primitives as the reference implementation;
2. separate genuinely shared shell mechanics from Rig-specific slots/names;
3. neutralize the smallest shared shell contract without changing accepted Rig behavior;
4. migrate Map onto that common JURE UI system;
5. use visual and owner gates to prove that Rig and Map read as workspaces of one application rather than two applications attached by routing.

Do not mix Stage 2 refactoring into the current Box Face Resize owner gate.

## Broader grounding sequence after those stages

- create/delete/duplicate and deterministic map save/open;
- then one real non-primitive representation (parametric obstacle, terrain/heightfield or imported mesh/scan) to falsify the primitive-only architecture;
- only then consider larger scene/plugin abstractions if actual repeated requirements justify them.

## Known tooling debt

- no `package-lock.json`; transitive installs are not fully reproducible;
- current Vite output has a large client chunk warning;
- Map preview still rebuilds the full primitive display projection on each preview document update; acceptable for the tiny fixture, unproved at E2R scale;
- PR browser screenshots and Windows owner-preview packaging are evidence scaffolding, not yet permanent product infrastructure;
- Browser plugin is unavailable in the current session and local fallback Chromium navigation is administratively blocked, so spatial interaction remains an explicit owner gate.
