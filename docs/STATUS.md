# Status

## Current state

The owner-tested Rig foundation remains the accepted baseline. The experimental Map authoring lane remains isolated on draft PR #5; `main` is not changed by this work.

The first Map proof-of-viability, the original center-preserving G2 Resize, and Box Face Resize V2 have now all received real owner interaction. The latest owner test classified Face Resize V2 as **almost PASS**:

- signed-face / opposite-face-fixed Resize works as intended in real use;
- Undo/Redo works;
- the overall planned interaction behaves correctly enough to continue;
- but releasing `Alt` during one active drag cancelled the command instead of returning smoothly from center mode to anchored mode;
- and the first six floating cube handles were functionally usable but visually too raw and insufficiently self-explanatory compared with JURE's accepted transform gizmo language.

Those two findings are the only active blockers for the current Face Resize V2 checkpoint. They do **not** reopen the authored box model, frozen-baseline face planner, opposite-face semantics or atomic pose+geometry history.

A closeout implementation is now technically green:

- browser-default `Alt` behavior is suppressed only while Map Resize is active, without stopping propagation to JURE's own key handlers or weakening explicit `Esc` / pointer-cancel safety;
- the raw cube markers have been replaced by a signed-face control language consisting of a face plate, short axis stem and cube grip;
- front controls read strongly, rear controls remain available but are deliberately ghosted;
- anchored drag visually marks the opposite face as fixed;
- center/Alt drag shows the opposite control as paired plus a center cue;
- the status bar reports the exact signed face and live semantic mode, e.g. `+X · ANCHORED · -X fixed` or `+X · CENTER symmetric (Alt)`.

Real Windows/browser owner re-test is still required before this checkpoint becomes a full PASS. Do not start World/Local expansion, capsule Resize or the larger UI-unification stage before that re-test.

Active grounding contract:

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

`custom signed face control -> pointer ray / authored face axis proposal -> frozen-baseline face-resize planner -> atomic pose + halfExtents command -> EditorSession preview/commit`

Three scene objects and controls remain disposable projections; they never become authored authority.

## Owner evidence

### First Map Lab viability

Owner-tested head:

`3f5cea513ecb7c040285fc2f9604690d3fe13428`

Owner evidence confirmed practical camera/orbit, selection, Move/Rotate and Fit Map operation and classified the build as working enough to continue. It also exposed the original one-way workspace routing defect and the need for geometry authoring beyond rigid pose. Routing was repaired through one symmetric contract.

### Original G2 box Resize

The owner tested the center-preserving Scale-like box Resize plus exact dimensions and classified the stage overall as PASS for continuing development. That test produced a decisive UX falsification:

- symmetric center Resize is useful as a modifier behavior, not the desired default;
- default map authoring should move only the dragged side while the opposite side stays fixed;
- `Alt` is the preferred modifier for temporary center/symmetric behavior;
- Map also needs World/Local control and later capsule Resize;
- Map UI currently reads as a separate application compared with the accepted Rig workspace, motivating a later **separate** interface-unification stage.

The data/command architecture survived this falsification. The default interaction did not.

### Box Face Resize V2 owner almost-PASS

The owner tested the first custom signed-face build on Windows in a real browser and reported that the planned behavior works overall:

- individual signed faces resize the box successfully;
- default opposite-face-fixed behavior feels appropriate;
- Undo/Redo works;
- the implementation matches the planned interaction closely enough to classify the stage as **almost PASS**.

Two concrete failures remain:

1. `Alt` press switched to center behavior, but releasing Alt cancelled the whole command instead of returning to anchored mode during the same drag.
2. The first renderer representation — six detached colored cube handles — was too raw and ambiguous. It identified selectable locations but did not communicate axis direction, face relationship or current anchored/center meaning with the clarity expected from a mature JURE gizmo.

This owner evidence narrows the current work. It does **not** justify replacing signed-face authoring with stock scale or adding generic authored pose scale.

## Box Face Resize V2 — grounded semantics, closeout owner gate pending

The stock Three scale gizmo remains intentionally retired from Map Resize. Investigation of the exact Three transform control showed two blockers for the required semantics:

- positive and negative scale pickers on one axis collapse to the same `X/Y/Z` identity, so the stock control cannot robustly identify the signed face;
- Three scale mode forces local space internally, so a `World` toggle cannot honestly create World Resize semantics.

Face Resize V2 uses six explicit signed local box faces:

`-X +X -Y +Y -Z +Z`

Grounded semantics:

- default `opposite-face`: dragged local face moves and the opposite local face remains spatially fixed;
- authored center shifts exactly as required to preserve the fixed face;
- `Alt` requests `center` mode from the same frozen drag baseline;
- releasing Alt must return to `opposite-face` mode from that same baseline without compounding;
- rotated boxes preserve the opposite-face invariant in world coordinates;
- inversion is blocked at a transient interaction floor instead of flipping authored geometry;
- exact numeric Dimensions intentionally remain center-preserving exact authoring and are not constrained by the gizmo-only floor;
- no-op face drags cancel instead of creating a revision;
- explicit Esc and pointer-cancel remain cancellation paths;
- pointer release commits through the normal revision/history lifecycle;
- capsule Resize remains unavailable rather than inheriting false box semantics.

Current renderer/input closeout:

- face identity is explicit `axis + side`, not inferred from renderer scale;
- pointer movement maps to signed world-space distance along the selected authored local face axis;
- near-parallel ray/axis configurations fail closed instead of producing arbitrary jumps;
- active drag state stores stable semantic data rather than handle-mesh references, so current full-document preview reprojection does not own the drag session;
- while Resize is active, capturing `keydown`/`keyup` listeners suppress the browser default action for `Alt` but deliberately allow the events to propagate to JURE's existing center/anchored handlers;
- `window.blur`, pointer cancel and Esc safety paths remain intact rather than being globally disabled to hide the symptom;
- each signed face now projects a depth-aware face plate, short axis stem and cube grip;
- rear controls are ghosted instead of presented with the same visual weight as front controls;
- anchored mode marks the opposite face as a fixed cue;
- center mode shows a paired opposite control and center cue;
- status feedback names the dragged signed face and current origin semantics in real time;
- stock `TransformControls` remains the Move/Rotate path only.

The `Alt` browser-default suppression is a deliberately minimal fix for the strongest current hypothesis: Windows/browser Alt chrome/focus behavior interacted with the controller's legitimate blur-cancel safety. It is technically validated but the real event-lifecycle result remains an owner gate. If releasing Alt still cancels, do not weaken all blur/cancel safety blindly; capture the real event provenance and correct the narrower cause.

## Current executed evidence

Latest **product-code** checkpoint:

`fe201d26dc2ca93c51b9261f555ee0b88bab7df4`

GitHub Actions run `32167506363`, job `95810429525`:

- strict TypeScript PASS;
- core suite **47/47 PASS**;
- Vite production build PASS;
- headless Chromium default Rig render smoke PASS;
- headless Chromium Map render smoke PASS;
- generated Windows owner-preview package + HTTP smoke PASS.

The 47 tests continue to cover signed face identity, fixed opposite face, contraction, rotated-box world-space invariance, degeneracy, atomic pose+geometry preview/history, pointer-ray-to-axis distance, near-parallel fail-closed behavior and `anchored -> Alt center -> anchored` planner/session switching from one frozen baseline without compounding.

After that product checkpoint, the branch only changes owner-test instructions and canonical documentation to describe the already-built closeout accurately. The final branch-head workflow must remain green before a package is handed to the owner; do not use documentation-only head movement as new product evidence.

Important evidence boundary: the automated Map screenshot still starts in the normal default Map state; it proves the application renders but does **not** visually or interactively prove the new active Resize controls. The new gizmo and Windows Alt lifecycle therefore remain deliberately owner-gated rather than inferred from a green build.

The available local Chromium fallback remains administratively blocked for localhost/synthetic navigation in this environment. Known unrelated build warning: the Vite client chunk remains above the warning threshold. The repository also still has no lockfile, so Actions are current dependency-resolution evidence rather than hermetic dependency reproduction.

## Current owner closeout gate

The next owner test is intentionally narrow:

1. select Ground slab -> Resize and assess the new face plate + stem + grip control language;
2. drag a face anchored and verify the status/fixed-face cue matches the signed face actually manipulated;
3. without releasing the pointer, press Alt and confirm status + visual cues switch to center mode;
4. release Alt while the pointer is still held: the active command must remain alive, return to anchored mode, and not jump;
5. repeat Alt press/release several times during one drag;
6. verify Esc still intentionally cancels and pointer release still commits;
7. assess whether front/back ghosting, direction cues and fixed/center cues make Resize substantially more intuitive than the original detached cubes;
8. quickly regression-check Undo/Redo, rotated-box Resize, exact Dimensions, Bumper non-support and Rig <-> Map navigation.

Only a real owner pass closes Face Resize V2. Do not reinterpret CI success as acceptance of these two previously failed/partial behaviors.

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
- Box Resize now has strong owner evidence for **boundary/face authoring**, not generic pose scale.
- World Resize semantics remain deliberately open; stock Three scale does not solve them.
- free camera/navigation and direct spatial inspection remain product requirements.
- do not freeze JV runtime structures or current P0 primitives as final JURE map schemas.

## Two-stage next sequence

### Stage 1 — interaction / authoring completion

1. **Box Face Resize V2 closeout:** semantics owner-tested and almost-PASS; Alt lifecycle + visual affordance fixes technically complete; **owner re-test pending**.
2. Only after that full PASS, add Map World/Local for Move/Rotate using the accepted Rig interaction model. World Resize remains a separate semantic design problem, not a fake toggle.
3. Design and falsify capsule Resize independently: axial/end-point and radial/radius meanings must be explicit.
4. Perform only tactical Map UI polish needed to expose the grounded interactions clearly.

### Stage 2 — JURE interface unification (separate stage)

After Stage 1 interaction semantics are stable:

1. audit the accepted Rig `WorkspaceShell`, `ViewportChrome`, design tokens and panel primitives as the reference implementation;
2. separate genuinely shared shell mechanics from Rig-specific slots/names;
3. neutralize the smallest shared shell contract without changing accepted Rig behavior;
4. migrate Map onto that common JURE UI system;
5. use visual and owner gates to prove that Rig and Map read as workspaces of one application rather than two applications attached by routing.

Do not mix Stage 2 refactoring into the current Face Resize closeout.

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
