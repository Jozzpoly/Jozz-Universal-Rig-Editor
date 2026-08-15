# Status

## Current state

The owner-tested foundation is usable. Active foundation convergence work now runs on `work/foundation-convergence-v1`, branched exactly from `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`.

Accepted baseline:
- rigid `RigElement` and owner-local `RigFrame` authoring;
- Move/Rotate, world/local, numeric XYZ degree editing over quaternion storage;
- preview/commit/cancel, undo/redo, deterministic RigDocument save/open;
- free inspection camera with Focus/Fit helpers;
- read-only glTF/GLB SOURCE loading with SHA-256, deterministic locators, datum markers/axes, and independent SOURCE selection;
- viewport-first resizable/collapsible RIG/SOURCE/Inspector workspace with presentation-layer visibility controls.

The current UI is an accepted engineering baseline, not a promise that the final universal workbench keeps the same information architecture.

## Active foundation convergence run

Purpose: perform the last whole-foundation redesign by converging on a durable owner-first authoring workbench, using the real JV round trip as the primary falsifier. Do not implement speculative universality.

Recovery rules:
- `main` remains canonical accepted product evidence until this branch is explicitly promoted;
- every stage must end in a small commit with a stated result: `KEEP`, `CHANGE`, `DEFER`, or `FALSIFIED`;
- current repo/JV evidence outranks chat plans;
- do not change kernel/schema/UI merely to make the plan look complete;
- if a stage cannot prove its premise against a real mechanism, stop at evidence rather than carrying the assumption forward.

### FC-0 — evidence freeze / CLOSED

Verified on 2026-08-15:
- exact branch base: `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`;
- exact owner-tested checkpoint: `checkpoint/foundation-bind00-owner-tested-2026-08-15@548fb40f8c8d799abf35185b314696d33515261d`;
- checkpoint -> main is exactly two commits and changes only `README.md`, `AGENTS.md`, `docs/ARCHITECTURE.md`, and `docs/STATUS.md`; no code changed after the accepted owner/BIND evidence;
- no open JURE PR was active when this convergence branch was created.

Result: **KEEP baseline / SAFE TO REFOUND ABOVE IT**.

### FC-1 — real JV round-trip atlas / ACTIVE

Current JV evidence already separates several meanings that must not collapse into one imported "rig":

- **SOURCE FACT / HINT** — exact owner assets and their node hierarchy/socket metadata. The current one-sided suspension semantic contract explicitly marks its sockets/axes as `physicsAuthority: false` and says exact glTF + owner checkpoints outrank that secondary contract.
- **CONSUMER REFERENCE: topology** — current M6 contains 19 bodies / 28 joints / 9 shapes / 4 corners. Rack, arms, wheel spin, coilovers and steering use different runtime mechanisms.
- **CONSUMER REFERENCE: geometry** — much M6 suspension geometry is still parametrically derived. Front-left source registration intentionally preserves current suspension hardpoints as provisional runtime constraints while separating source-derived steering center/axis data.
- **TEMPORARY PRODUCT BRIDGE** — current front steering is deliberately not one clean physical linkage: FL uses a separate carrier->knuckle revolute steering DOF and its #7 steering member is a live visual segment; the R1 bridge also removes the historical FR physical tie-rod and commands both front wheels kinematically.
- **CONSUMER DYNAMICS** — masses, inertia/density, friction, suspension hertz/damping/preload, rack servo force/friction, drive torque/speed, solver/contact behavior and related runtime tuning belong to current JV dynamics, not automatically to JURE authored geometry.
- **RUNTIME REPRESENTATION** — JV already distinguishes rigid visual parts from endpoint/length-derived visual segments. Historical owner visual-package tooling additionally demonstrates endpoint-aim, stretch and roll-pinned stretch behavior; these are representation evidence, not a JURE schema to copy.

Working authority hypothesis to falsify before freezing architecture:

`SOURCE / CONSUMER REFERENCE / PROPOSAL -> explicit owner adoption/edit -> JURE AUTHORED geometry+kinematic intent -> transient TEST/EVALUATION -> derived consumer export`

Candidate split, not yet a contract:
- JURE geometric/kinematic authority: identities, authored rigid poses, frames/hardpoints/pivots/axes, mechanical relations/DOFs, intended geometric limits, representation mappings;
- consumer dynamic authority: masses/inertia, friction/contact/tire behavior, spring/damping force model, motor/servo force, solver and drive behavior;
- classify every datum by meaning rather than by its current variable name. A consumer parameter is not imported as JURE truth merely because it contains geometry.

Round-trip models still to attack before schema work:
1. one monolithic JSON document containing source/reference/authored/export data;
2. one owner-visible bundle with an internal manifest and explicitly separated source revisions/instances, consumer reference, authored rig and derived mappings;
3. a loose workspace descriptor referencing independent external sidecar files.

The winning model must survive at least: a knowingly provisional JV rig, changed exact source revision, four placed instances of one wheel asset, an alternate suspension, a piston, a rotor, and later a non-rig spatial/map object without forcing those concepts into `RigDocument`.

**Do not change `RigDocument`, add `SourceInstance`, persist representation bindings, or redesign the UI until FC-1 closes.**

Next FC-1 gate: walk all three interchange models through the full `JV/agent export -> JURE inspect/adopt/author/test/save -> derived JV import` lifecycle and record which model fails which counterexample. Only then derive the smallest FC-2 project/authority contract.

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

## Product direction after convergence

Treat JURE as an owner-first spatial authoring workbench whose first mature domain tool is rigging. It may become an authoring nucleus and stepping stone toward JES, but this run must not turn JURE into a generic framework or a browser clone of JES.

The real end-to-end rig workflow must eventually cover:

`open package/sources -> inspect SOURCE + REFERENCE -> explicitly adopt/create authored elements/frames/relations -> map representation -> diagnose -> kinematic test -> exact reset -> save/export`

A future UI redesign is intentionally downstream of the semantic gates. Preserve accepted interaction evidence (free camera, direct manipulation, world/local transforms, Focus/Fit, source/authored distinction, undo/redo), but treat the current panel arrangement and information architecture as disposable.

## Known tooling debt

There is currently no `package-lock.json`. Direct dependencies are exact-pinned in `package.json`, but transitive installs are not fully reproducible yet. Add a lockfile from a canonical successful install when convenient; this is not a reason to block the product/design work.
