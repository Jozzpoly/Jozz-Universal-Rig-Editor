# Status

## Current state

The owner-tested Rig foundation remains the accepted baseline. A separate experimental Map authoring lane is active on draft PR #5 and has now completed its first owner-tested proof-of-viability slice.

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

The map work remains isolated from the accepted Rig authored model. Default application entry is Rig; `?workspace=map` enters Map Lab. After owner feedback on the first preview, workspace routing is being grounded as a small shared symmetric contract so Rig and Map can navigate to each other without separate ad-hoc routing logic.

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
- dedicated Map Lab viewport with box/capsule projection, spawn marker, selection, OrbitControls, Move/Rotate TransformControls, preview/commit/cancel, Esc/blur cancel, Undo/Redo and Fit Map;
- dedicated Map navigator/inspector without refactoring the accepted Rig WorkspaceShell or Rig viewport.

## Owner validation — first Map Lab slice

Owner-tested preview source head:

`3f5cea513ecb7c040285fc2f9604690d3fe13428`

The owner opened the generated Windows preview in a real browser and preliminarily validated the build as working. The supplied screen/video evidence confirms practical Map Lab interaction including camera/orbit, Move/Rotate and Fit Map without an obvious authored-state/render desynchronization in the short test.

The same owner test immediately found two important design facts:

1. Map -> Rig navigation existed but Rig -> Map navigation did not. This is a real product defect, not user error.
2. pose-only authoring is insufficient; practical map creation needs shape resizing/creation tools.

The second finding does **not** yet prove that generic scale belongs in `MapRigidPose`. Current grounding instead treats shape-aware `Resize` as the leading hypothesis: box extents, capsule radius/length and future parametric shape dimensions should be authored explicitly unless a real mesh/source case proves different semantics are needed.

The owner explicitly did **not** close the fundamentalization phase. This validation proves the direction is viable and can continue.

## Current executed evidence

On exact owner-tested head `3f5cea5...`:

- strict TypeScript PASS;
- core suite 28/28 PASS;
- Vite production build PASS;
- headless browser render PASS for default Rig and Map Lab;
- generated owner-preview HTTP smoke PASS;
- real owner browser interaction: preliminary PASS with the limitations above.

Subsequent grounding work adds donor research, status/architecture grounding and symmetric workspace routing. Each code-bearing head must pass the same repository check and browser smoke before becoming the next evidence checkpoint.

The repository still has no lockfile, so Action installs are current dependency-resolution evidence rather than hermetic dependency reproduction.

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
- The current transform proxy pattern is valid: renderer proposes, domain command interprets, preview is disposable, commit changes authored truth.
- Rigid pose stays free of generic scale for now. Map shape authoring is reopened as a domain Resize problem rather than declared solved.
- Free camera/navigation and direct spatial inspection remain product requirements.
- Do not freeze `JvWorldData`, Native JV structures or the current small MapDocument primitives as the final JURE map schema.
- Do not fix BIND-00 by simply replacing the singleton with an array before the next real rig representation design pass.

## Grounded next sequence

1. close symmetric Rig <-> Map workspace routing with tests and browser evidence;
2. use one box as the first shape-aware Resize falsifier, editing geometry dimensions rather than pose scale;
3. test capsule resize separately rather than forcing genericity;
4. ground create/delete/duplicate and deterministic map save/open;
5. then choose one real non-primitive representation (parametric obstacle, terrain/heightfield or imported mesh/scan) to falsify the primitive-only architecture.

Do not jump directly to a universal scene framework, ECS/plugin system or full terrain editor.

## Known tooling debt

- no `package-lock.json`; transitive installs are not fully reproducible;
- current Vite output has a large client chunk warning;
- PR browser screenshots and Windows owner-preview packaging are evidence scaffolding, not yet permanent product infrastructure.
