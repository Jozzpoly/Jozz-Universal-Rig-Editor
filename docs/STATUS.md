# Status

## Current state

The owner-tested foundation is usable and the project is intentionally paused before the next fundamental product/design phase.

Accepted baseline:
- rigid `RigElement` and owner-local `RigFrame` authoring;
- Move/Rotate, world/local, numeric XYZ degree editing over quaternion storage;
- preview/commit/cancel, undo/redo, deterministic RigDocument save/open;
- free inspection camera with Focus/Fit helpers;
- read-only glTF/GLB SOURCE loading with SHA-256, deterministic locators, datum markers/axes, and independent SOURCE selection;
- viewport-first resizable/collapsible RIG/SOURCE/Inspector workspace with presentation-layer visibility controls.

The current UI is an accepted engineering baseline, not a promise that the final universal rig editor keeps the same information architecture.

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

- `RigElement / RigFrame / RigRelation` remain the small authored kernel unless a real consumer falsifies them.
- SOURCE reference, source provenance, authored rig, representation binding, transient preview, evaluated motion, and runtime/display state are distinct meanings.
- A useful JURE must support a complete mechanism with multiple simultaneous representation mappings.
- Rigid pose stays free of scale; stretch/deformation belongs to representation/evaluation.
- Motion testing starts kinematic: authored neutral truth must remain unchanged and `Reset` must restore it exactly.
- Free camera/navigation and direct spatial inspection are product requirements, not optional polish.
- Do not "fix" BIND-00 by simply replacing the singleton with an array before the next design pass.

## Next fundamental phase

Design JURE as the owner's practical visual rigging workbench for current projects, with JV/JV-Web as the first real consumer and later native JV / JV+VAW possible without turning the tool into a framework.

The design must cover the real end-to-end workflow:

`open/position source -> inspect -> create rig elements/frames/relations -> map real representation -> edit -> diagnose -> kinematic test -> reset/save`

The first design questions are:
- minimal `SourceRevision` vs placed source instance/registration semantics;
- how many real source joints/parts/meshes map to multiple `RigElement`s without importing renderer ontology into the kernel;
- explicit source datum -> authored frame adoption/rebind;
- rigid representation vs spring/damper/cardan stretch/deformation;
- `AUTHOR` vs transient `TEST` interaction and the smallest evaluator boundary;
- how the workflow scales to the full JV car rig: suspension, steering members, wheels, chassis/body, springs/dampers, cardans, and related hardpoints.

Do not start by implementing all of these. First design the complete workflow critically, then choose the smallest vertical slice that falsifies the design on a real asset.

## Known tooling debt

There is currently no `package-lock.json`. Direct dependencies are exact-pinned in `package.json`, but transitive installs are not fully reproducible yet. Add a lockfile from a canonical successful install when convenient; this is not a reason to block the product/design work.
