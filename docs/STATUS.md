# Status

## Current state

The owner-tested Rig foundation remains the accepted baseline. A separate experimental Map authoring lane is active on draft PR #5. The first Map proof-of-viability slice was owner-tested, and the next grounded slice — **G2 box Resize** — is now implemented and technically validated but still awaits owner interaction validation for spatial drag ergonomics.

The Map slice is **working but not fundamentally complete**. The active grounding contract is:

`docs/FOUNDATION_GROUNDING_2026-08-18.md`

That document distinguishes durable evidence-backed foundation from provisional experiments and defines the stop condition for the current fundamentalization phase.

## Accepted Rig baseline

- rigid `RigElement` and owner-local `RigFrame` authoring;
- Move/Rotate, world/local, numeric XYZ degree editing over quaternion storage;
- preview/commit/cancel, undo/redo, deterministic RigDocument save/open;
- free inspection camera with Focus/Fit helpers;
- read-only glTF/GLB SOURCE loading with SHA-256, deterministic locators, datum markers/axes, and independent SOURCE selection;
- viewport-first resizable/collapsible RIG/SOURCE/Inspector workspace with presentation-layer visibility controls.

The current Rig UI is an accepted engineering baseline, not a promise that the final JURE information architecture stays identical.

## Experimental Map foundation

The map work remains isolated from the accepted Rig authored model. Default application entry is Rig; `?workspace=map` enters Map Lab. Workspace routing is now a small shared symmetric contract: Rig can enter Map and Map can return to Rig without separate ad-hoc query manipulation.

Implemented map foundation:

- independent `MapDocument` authored truth;
- explicit metre/right-handed `+X` forward, `+Y` up, `+Z` right coordinate contract;
- stable global IDs for spawn points and map entities;
- rigid map poses without generic transform scale;
- box and capsule P0 primitive geometry;
- independent collision-proxy/none visual intent and surface friction;
- deterministic canonical parse/serialize round-trip;
- fail-closed malformed/unsupported geometry, identity, basis, pose, visual and surface validation;
- map entity pose command with quaternion normalization and missing-target failure;
- shared generic revisioned `EditorSession<Document>` proven by both RigDocument and MapDocument while domain commands remain domain-owned;
- dedicated Map Lab viewport with box/capsule projection, spawn marker, selection, OrbitControls, Move/Rotate, preview/commit/cancel, Esc/blur cancel, Undo/Redo and Fit Map;
- symmetric Rig <-> Map workspace navigation with deterministic tests;
- G2 box-only shape-aware Resize using Three scale handles only as a transient proposal source while authored geometry changes `halfExtents`;
- baseline-relative Resize math that prevents compounding across repeated preview events and keeps rigid pose unchanged;
- exact user-facing box `Dimensions · m` editing that round-trips through authored `halfExtents` and uses the same command/history path as gizmo Resize;
- capsule Resize intentionally unavailable until its distinct radius/length semantics are grounded;
- dedicated Map navigator/inspector without refactoring the accepted Rig WorkspaceShell or Rig viewport.

## Owner validation — first Map Lab slice

Owner-tested preview source head:

`3f5cea513ecb7c040285fc2f9604690d3fe13428`

The owner opened the generated Windows preview in a real browser and preliminarily validated the build as working. The supplied screen/video evidence confirms practical Map Lab interaction including camera/orbit, Move/Rotate and Fit Map without an obvious authored-state/render desynchronization in the short test.

The same owner test immediately found two important design facts:

1. Map -> Rig navigation existed but Rig -> Map navigation did not. This was a real product defect and is now repaired through one symmetric routing helper.
2. pose-only authoring is insufficient; practical map creation needs shape resizing/creation tools.

The second finding did **not** prove that generic scale belongs in `MapRigidPose`. G2 therefore tests the narrower hypothesis: a familiar scale-like gizmo can drive a domain `Resize` operation whose authored meaning is explicit shape dimensions. For a box, Resize authors `halfExtents`; future capsule, obstacle recipe and imported mesh semantics remain separate questions.

The owner explicitly did **not** close the fundamentalization phase. The first validation proved the direction viable; G2 now needs its own owner interaction gate before box Resize is considered grounded ergonomically.

## G2 box Resize — implemented, owner gate pending

Current implementation deliberately separates four meanings:

`Three TransformControls scale -> transient scale proposal -> baseline-relative box resize math -> MapDocument halfExtents`

Three `Object3D.scale` is never serialized or copied into `MapRigidPose`.

G2 currently proves technically:

- box-only Resize can use Three scale handles without introducing generic authored pose scale;
- each preview is calculated from the frozen drag-start box geometry rather than compounding the previous preview;
- negative renderer proxy scale after crossing the center is interpreted as positive box dimension magnitude;
- an exact-degeneracy tool floor prevents a transient gizmo from collapsing a box to zero volume;
- resize changes geometry only and preserves rigid position/rotation;
- preview/cancel/commit/undo/redo use the existing `EditorSession` lifecycle;
- invalid dimensions, non-finite proposals, missing targets and non-box targets fail closed;
- exact full dimensions in metres use the same authored command/history path as gizmo Resize;
- selecting a capsule while Resize is active returns the Map tool to Move instead of pretending capsule semantics exist.

Still unproved by the owner:

- the feel/readability of actual Resize handles during spatial drag;
- whether center-preserving symmetric resize is useful enough or should later be supplemented by face/edge anchored resize;
- practical behavior when dragging through/near zero;
- whether the current full-document render rebuild during preview remains smooth on larger real maps.

Do not generalize box Resize into a universal geometry transform system until those questions and the independent capsule case are tested.

## Current executed evidence

Exact current G2 evidence head before this status-only update:

`5e5d8a797b9a0bd2a2d26336471dc306c307cc0f`

GitHub Actions run `32080339597`, job `95541956071`:

- strict TypeScript PASS;
- core suite **37/37 PASS**;
- Vite production build PASS;
- headless Chromium render PASS for default Rig and Map Lab;
- generated Windows owner-preview package + HTTP smoke PASS;
- exact run checkout used a PR merge ref built from G2 head `5e5d8a7...` and accepted `main` base `d971b8b...`;
- final screenshots were manually inspected: Rig remains intact with `Map Workspace`; Map renders normally with capsule selected and Resize correctly unavailable by default.

A deeper local Playwright interaction pass was attempted from the exact generated `dist`, but the available system Chromium is administratively blocked from navigating to both localhost and an intercepted synthetic test origin (`ERR_BLOCKED_BY_ADMINISTRATOR`). This is recorded as a tooling limitation, not product evidence. No product code was changed to work around it.

The repository still has no lockfile, so Action installs are current dependency-resolution evidence rather than hermetic dependency reproduction. The Vite large-client-chunk warning also remains known tooling/performance debt and is not introduced specifically by G2.

## Map model — current boundary

Current box/capsule entities are a primitive proof slice, **not the final Map ontology**.

Grounding evidence from JURE consumers and donor projects requires the architecture to remain open to at least:

- primitive geometry;
- parametric obstacle/shape recipes;
- terrain/heightfield;
- imported mesh/scan geometry;
- layout/semantic constructs such as spawns, anchors, zones/routes and test stations.

This is a classification boundary, not a command to implement all of those systems now.

## Donor conclusions

The project may harvest proven techniques from the owner's public/private repositories, but must not import whole product ontologies without evidence.

Current high-value donors:

- **HomeScan-Web-Builder** — transform sessions, domain `resize`, axis/pivot constraints, snapping, numeric input and validated command commit;
- **Voxel Aeronautics Workshop** — terrain/patch dimensions, placement/snapping patterns and explicit render-only vs gameplay authority;
- **JV-Web** — real consumer boundary, explicit primitive dimensions, render/collision source separation and current JURE-compatible coordinate basis;
- **Native JV / Box3d_FunProject** — accepted tiled/heightfield terrain, parametric obstacle recipes, scan collision geometry and historical evidence that green data validators can miss wrong built geometry;
- **PROJECT ANVIL** — donor doctrine: transfer the smallest proven capability and adapt it to destination contracts instead of transplanting a subsystem.

## BIND-00 result

BIND-00 remains a transient representation-binding prototype tested on the real `OneSided_Steering_Suspension_Rig.gltf`.

Exact real SOURCE evidence used for the accepted SOURCE/BIND tests:

- file: `OneSided_Steering_Suspension_Rig.gltf`;
- SHA-256: `fc1e8bd0e298a66fa79c43324708e281073ea8fb7a7aad2728702653705c0ee1`;
- self-contained glTF (embedded buffer/texture), 15 nodes / 14 joints / 1 skinned mesh in the tested revision;
- the asset is not stored canonically in this repo. If reproduction requires it, obtain the exact file from the owner/File Library and verify the SHA before use rather than substituting historical JV geometry.

What it proved:

- one authored `RigElement` can drive one exact rigid glTF skin joint through a stable rest offset;
- the bound visual can follow authored Move/Rotate while the read-only SOURCE reference stays fixed;
- SOURCE Geometry and Bound visibility can be inspected independently;
- driving a source skin joint can produce useful real hierarchy/deformation instead of only moving the whole asset rigidly.

What it falsified:

- the prototype stores one global `representationBinding`; creating a second binding replaces the first, so the previous driven joint returns to its unmodified pose;
- therefore the singleton binding model is not a viable final representation/assembly model.

BIND-00 is deliberately transient and not serialized. Exact pre-cleanup owner-evidence checkpoint:

`checkpoint/foundation-bind00-owner-tested-2026-08-15`

## Durable conclusions

- `RigElement / RigFrame / RigRelation` remain the small authored rig kernel unless a real consumer falsifies them.
- `MapDocument` remains a separate authored map model; it must not absorb renderer, Box3D or JV runtime ontology.
- SOURCE reference, source provenance, authored rig, representation binding, transient preview, evaluated motion, runtime/display state and authored map truth are distinct meanings.
- Shared infrastructure is extracted only when multiple real consumers prove the overlap; the generic editor session is the first proven case.
- The transform proxy pattern remains valid: renderer proposes, domain command interprets, preview is disposable, commit changes authored truth.
- Box G2 strengthens the case for shape-aware Resize without adding generic scale to rigid pose, but its spatial UX is not accepted until the owner tests the real gizmo.
- Free camera/navigation and direct spatial inspection remain product requirements.
- Do not freeze `JvWorldData`, Native JV structures or the current small MapDocument primitives as the final JURE map schema.
- Do not fix BIND-00 by simply replacing the singleton with an array before the next real rig representation design pass.

## Grounded next sequence

1. **G1 complete:** symmetric Rig <-> Map workspace routing with tests and browser evidence.
2. **G2 implementation complete / owner gate pending:** box shape-aware Resize + exact dimensions, preserving rigid pose and authored history semantics.
3. After owner validation of G2, design capsule Resize independently; radial and axial semantics must not be forced through the box implementation merely to claim genericity.
4. Ground create/delete/duplicate and deterministic map save/open.
5. Then choose one real non-primitive representation (parametric obstacle, terrain/heightfield or imported mesh/scan) to falsify the primitive-only architecture.

Do not jump directly to a universal scene framework, ECS/plugin system or full terrain editor.

## Known tooling debt

- no `package-lock.json`; transitive installs are not fully reproducible;
- current Vite output has a large client chunk warning;
- current Map preview rebuilds the full primitive display projection on each preview document change; harmless for the tiny P0 fixture but not yet proven on E2R-class maps;
- PR browser screenshots and Windows owner-preview packaging are evidence scaffolding, not yet permanent product infrastructure;
- Browser plugin is unavailable in the current session, and local fallback Chromium is blocked by administrator navigation policy, so G2 spatial interaction still requires the generated owner preview gate.
