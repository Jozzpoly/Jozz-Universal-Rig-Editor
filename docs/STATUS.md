# Status

## Current state

The owner-tested Rig foundation remains the accepted baseline. A separate experimental Map authoring lane is now being developed without replacing or reinterpreting that accepted Rig state.

Accepted Rig baseline:
- rigid `RigElement` and owner-local `RigFrame` authoring;
- Move/Rotate, world/local, numeric XYZ degree editing over quaternion storage;
- preview/commit/cancel, undo/redo, deterministic RigDocument save/open;
- free inspection camera with Focus/Fit helpers;
- read-only glTF/GLB SOURCE loading with SHA-256, deterministic locators, datum markers/axes, and independent SOURCE selection;
- viewport-first resizable/collapsible RIG/SOURCE/Inspector workspace with presentation-layer visibility controls.

The current Rig UI is an accepted engineering baseline, not a promise that the final JURE information architecture stays identical.

## Experimental Map foundation

The active map work is isolated from the default Rig workspace behind the root workspace seam. The accepted Rig `App` is still the default application path; `?workspace=map` enters the experimental map lane.

Implemented foundation on the active map branch:
- independent `MapDocument` authored truth;
- explicit metre/right-handed `+X` forward, `+Y` up, `+Z` right coordinate contract;
- stable global IDs for spawn points and map entities;
- rigid map poses with no transform scale;
- box and capsule collision primitives;
- independent collision-proxy/none visual intent and surface friction;
- deterministic canonical parse/serialize round-trip;
- fail-closed malformed/unsupported geometry, identity, basis, pose, visual and surface validation;
- map entity pose command with quaternion normalization and missing-target failure;
- shared generic revisioned editor session now proven by both RigDocument and MapDocument while `RigCommand` remains rig-specific.

This is deliberately **not** yet a finished map format or editor. Not frozen or implemented yet:
- triangle meshes / large E2R-class terrain;
- map source assets, textures or material packaging;
- map open/save UI and final extension/package layout;
- final `JURE MapPackage` interchange schema;
- JV-Web parser/lowering/runtime integration;
- map hierarchy, streaming, partitioning or a generic scene graph;
- owner-validated 3D map authoring interaction.

The next useful vertical slice is a separate map viewport that projects the synthetic MapDocument into Three and lets the owner select and Move/Rotate one primitive through the existing preview/commit/cancel semantics. It should reuse proven Rig viewport mechanics locally before any universal viewport abstraction is considered.

## Map validation evidence

The map foundation is being validated on a draft PR branch because the current execution environment cannot install repository dependencies locally. The branch-owned PR check uses Node 22 and runs the repository-owned `npm run check` after a normal dependency install.

Current strongest executed evidence before the first 3D interaction slice:
- strict TypeScript PASS;
- core suite **28/28 PASS**, including deterministic/fail-closed MapDocument tests, shared editor-session map history, and map transform command falsifiers;
- production Vite build PASS;
- existing large JS chunk warning remains non-blocking and is not attributed to the map foundation.

The repository still has no lockfile, so this is current dependency-resolution evidence rather than a hermetic dependency reproduction claim.

## BIND-00 result

BIND-00 is a transient representation-binding prototype tested on the real `OneSided_Steering_Suspension_Rig.gltf`.

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
- therefore the singleton binding model is **not** a viable final representation/assembly model.

BIND-00 is deliberately transient and not serialized. No persistent representation schema was frozen from it.

Exact pre-cleanup owner-evidence checkpoint is preserved on:
`checkpoint/foundation-bind00-owner-tested-2026-08-15`

## Durable conclusions

- `RigElement / RigFrame / RigRelation` remain the small authored rig kernel unless a real consumer falsifies them.
- `MapDocument` remains a separate authored map model; it must not absorb renderer, Box3D or JV runtime ontology.
- SOURCE reference, source provenance, authored rig, representation binding, transient preview, evaluated motion, runtime/display state and authored map truth are distinct meanings.
- Shared infrastructure is extracted only when multiple real consumers prove the overlap; the generic editor session is the first such proven case.
- A useful JURE must support a complete mechanism with multiple simultaneous representation mappings.
- Rigid pose stays free of scale; stretch/deformation belongs to representation/evaluation, while map primitive dimensions belong to geometry rather than transform scale.
- Motion testing starts kinematic: authored neutral truth must remain unchanged and `Reset` must restore it exactly.
- Free camera/navigation and direct spatial inspection are product requirements, not optional polish.
- Do not "fix" BIND-00 by simply replacing the singleton with an array before the next rig design pass.
- Do not freeze `JvWorldData` or the current small JV scene-package as the JURE authored map schema.

## Rig next fundamental phase

The paused Rig design problem remains: evolve JURE as the owner's practical visual rigging workbench for current projects, with JV/JV-Web as the first real consumer and later native JV / JV+VAW possible without turning the tool into a framework.

The design must cover the real end-to-end rig workflow:

`open/position source -> inspect -> create rig elements/frames/relations -> map real representation -> edit -> diagnose -> kinematic test -> reset/save`

The first rig design questions remain:
- minimal `SourceRevision` vs placed source instance/registration semantics;
- how many real source joints/parts/meshes map to multiple `RigElement`s without importing renderer ontology into the kernel;
- explicit source datum -> authored frame adoption/rebind;
- rigid representation vs spring/damper/cardan stretch/deformation;
- `AUTHOR` vs transient `TEST` interaction and the smallest evaluator boundary;
- how the workflow scales to the full JV car rig: suspension, steering members, wheels, chassis/body, springs/dampers, cardans, and related hardpoints.

Map work must not silently answer or rewrite these Rig questions merely because both workspaces share JURE.

## Known tooling debt

There is currently no `package-lock.json`. Direct dependencies are exact-pinned in `package.json`, but transitive installs are not fully reproducible yet. Add a lockfile from a canonical successful install when convenient; this is not a reason to block the product/design work.
