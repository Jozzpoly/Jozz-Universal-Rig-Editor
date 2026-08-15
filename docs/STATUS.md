# Status

## Current state

The owner-tested foundation is usable. Active foundation convergence work runs on `work/foundation-convergence-v1`, branched exactly from `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`.

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

### FC-1 — real JV round-trip atlas / CLOSED

Current JV evidence separates several meanings that must not collapse into one imported "rig":

- **SOURCE FACT / HINT** — exact owner assets and their node hierarchy/socket metadata. The current one-sided suspension semantic contract explicitly marks its sockets/axes as `physicsAuthority: false` and says exact glTF + owner checkpoints outrank that secondary contract.
- **CONSUMER REFERENCE: topology** — current M6 contains 19 bodies / 28 joints / 9 shapes / 4 corners. Rack, arms, wheel spin, coilovers and steering use different runtime mechanisms.
- **CONSUMER REFERENCE: geometry** — much M6 suspension geometry is still parametrically derived. Front-left source registration intentionally preserves current suspension hardpoints as provisional runtime constraints while separating source-derived steering center/axis data.
- **TEMPORARY PRODUCT BRIDGE** — current front steering is deliberately not one clean physical linkage: FL uses a separate carrier->knuckle revolute steering DOF and its #7 steering member is a live visual segment; the R1 bridge also removes the historical FR physical tie-rod and commands both front wheels kinematically.
- **CONSUMER DYNAMICS** — masses, inertia/density, friction, suspension hertz/damping/preload, rack servo force/friction, drive torque/speed, solver/contact behavior and related runtime tuning belong to current JV dynamics, not automatically to JURE authored geometry.
- **RUNTIME REPRESENTATION** — JV already distinguishes rigid visual parts from endpoint/length-derived visual segments. Historical owner visual-package tooling additionally demonstrates endpoint-aim, stretch and roll-pinned stretch behavior; these are representation evidence, not a JURE schema to copy.

Working authority chain retained for FC-2:

`SOURCE / CONSUMER REFERENCE / PROPOSAL -> explicit owner adoption/edit -> JURE AUTHORED geometry+kinematic intent -> transient TEST/EVALUATION -> derived consumer export`

Candidate authority split retained for FC-2:
- JURE geometric/kinematic authority: identities, authored rigid poses, frames/hardpoints/pivots/axes, mechanical relations/DOFs, intended geometric limits, representation mappings;
- consumer dynamic authority: masses/inertia, friction/contact/tire behavior, spring/damping force model, motor/servo force, solver and drive behavior;
- classify every datum by meaning rather than by its current variable name.

#### Interchange model falsification

**A — one monolithic JSON document: FALSIFIED as the primary project model.**

It is easy to serialize and diff, but it either embeds potentially large binary SOURCE assets as bloated encoded data or stops being one transferable owner artifact. It also encourages SOURCE/REFERENCE/AUTHORED/export data and future non-rig domains to accrete into one god document.

**B — one owner-visible logical bundle with explicit internal layers: KEEP / preferred direction.**

The logical bundle can contain a small manifest plus exact source revisions, placed source instances, consumer-reference snapshots, one or more authored domain documents, representation data and derived consumer outputs while keeping their authority separate. One exact source revision can be reused by several placed instances (for example four wheels). A changed source creates a new exact revision and existing provenance/bindings can fail closed instead of silently retargeting. A future map document can coexist at project level without becoming part of `RigDocument`.

Do **not** freeze the physical container yet. The same logical bundle may initially be represented by an extracted directory/test fixture and later by one owner-visible `.jure`/archive file without changing its authority model.

**C — loose workspace descriptor + external sidecars: FALSIFIED as the primary owner interchange.**

It keeps files independently editable but creates fragile paths, partial/stale transfers, multi-file save conflicts and a poor agent->owner->agent handoff. It may remain an implementation/storage convenience behind the logical bundle, not the owner-facing contract.

Counterexample result for model B:
- knowingly provisional JV rig -> survives because REFERENCE is not AUTHORED;
- changed exact source revision -> survives through exact revision identity + fail-closed retargeting;
- four placements of one wheel asset -> requires `SourceRevision` identity separate from placed instance identity;
- alternate suspension -> no new project/container ontology required;
- piston / rotor -> require later relation/driver semantics, not a new project model;
- later map object/workspace -> can use another authored domain document at project level rather than polluting `RigDocument`.

Result: **KEEP logical layered bundle; CHANGE project layer; DEFER physical container; do not expand `RigDocument` into a universal project schema.**

### FC-2 — project / authority contract / ACTIVE

The next implementation slice must be smaller than a package system. Define and test only the project-layer identities required by FC-1:

1. exact `SourceRevision` identity remains immutable evidence;
2. add a distinct placed `SourceInstance` concept outside renderer state;
3. represent consumer-reference snapshot identity without treating its payload as authored kernel data;
4. define a minimal project manifest that references authored domain documents rather than absorbing them;
5. keep physical bundle storage and representation-binding persistence out of this slice.

FC-2 exit gate: a pure data-model test must represent one source revision placed four times, a provisional JV reference snapshot, and one authored `RigDocument`; replacing the source revision must not silently retarget any instance/provenance claim. No React/Three/browser dependency is allowed in this contract.

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
- SOURCE reference, source provenance, consumer reference, authored rig, representation binding, transient preview, evaluated motion, and runtime/display state are distinct meanings.
- A useful JURE must support a complete mechanism with multiple simultaneous representation mappings.
- Rigid pose stays free of scale; stretch/deformation belongs to representation/evaluation.
- Motion testing starts kinematic: authored neutral truth must remain unchanged and `Reset` must restore it exactly.
- Free camera/navigation and direct spatial inspection are product requirements, not optional polish.
- Do not "fix" BIND-00 by simply replacing the singleton with an array before the representation design gate.

## Product direction after convergence

Treat JURE as an owner-first spatial authoring workbench whose first mature domain tool is rigging. It may become an authoring nucleus and stepping stone toward JES, but this run must not turn JURE into a generic framework or a browser clone of JES.

The real end-to-end rig workflow must eventually cover:

`open package/sources -> inspect SOURCE + REFERENCE -> explicitly adopt/create authored elements/frames/relations -> map representation -> diagnose -> kinematic test -> exact reset -> save/export`

A future UI redesign is intentionally downstream of the semantic gates. Preserve accepted interaction evidence (free camera, direct manipulation, world/local transforms, Focus/Fit, source/authored distinction, undo/redo), but treat the current panel arrangement and information architecture as disposable.

## Known tooling debt

There is currently no `package-lock.json`. Direct dependencies are exact-pinned in `package.json`, but transitive installs are not fully reproducible yet. Add a lockfile from a canonical successful install when convenient; this is not a reason to block the product/design work.
