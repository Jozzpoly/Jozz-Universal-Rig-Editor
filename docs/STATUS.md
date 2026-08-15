# Status

## Current state

The accepted owner-tested product baseline remains `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`.

Active convergence work is isolated on `work/foundation-convergence-v1` and collected in draft PR #1. The latest semantic checkpoint before this status update is `ced1be1604170c2abc47c9da4fcc695baf0d611a`.

Accepted pre-run interaction evidence still includes:
- rigid `RigElement` and owner-local `RigFrame` authoring;
- Move/Rotate, world/local, numeric XYZ degree editing over quaternion storage;
- preview/commit/cancel, undo/redo, deterministic RigDocument save/open;
- free inspection camera with Focus/Fit helpers;
- read-only glTF/GLB SOURCE inspection with exact SHA-256/locators and independent SOURCE selection;
- viewport-first resizable/collapsible engineering workspace.

The current UI layout remains an engineering harness, not final information architecture.

## Recovery discipline

Purpose of this branch: converge on the last whole-foundation redesign before returning to ordinary small feature development.

Rules:
- `main` stays accepted authority until explicit promotion;
- each gate ends in a small commit and a `KEEP / CHANGE / DEFER / FALSIFIED` result;
- current repo/JV evidence outranks chat plans and historical tooling;
- synthetic tests prove only their exact invariant, never owner interaction or product feel;
- no speculative plugin/ECS/physics/editor framework;
- if a connection fails between GitHub tree/commit/ref steps, the last branch ref remains the recovery point. This already occurred once during FC-3: tree creation disconnected, branch HEAD stayed intact, and the idempotent tree step was safely repeated without force-push or reconstruction.

## FC-0 — evidence freeze / CLOSED

Verified 2026-08-15:
- run base: `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`;
- owner-tested checkpoint: `checkpoint/foundation-bind00-owner-tested-2026-08-15@548fb40f8c8d799abf35185b314696d33515261d`;
- checkpoint -> main is two documentation-only commits; no product code changed after accepted BIND evidence;
- no competing JURE PR was open when the branch was created.

Result: **KEEP baseline / SAFE TO REFOUND ABOVE IT**.

## FC-1 — real JV round-trip atlas / CLOSED

Real current JV separates meanings that must not collapse into one imported "rig": SOURCE facts/hints, provisional runtime geometry/topology, consumer dynamics, temporary product bridges and visual representation.

Important falsifier: the current front mechanism itself mixes different authority levels. FL has a source-registered steering center/axis but provisional suspension constraints and a temporary steering bridge; the #7 steering member can be a live visual segment without being the physical steering joint. Therefore current JV runtime cannot be imported as authored truth.

Interchange alternatives:
- monolithic JSON project: **FALSIFIED** — binary/source bloat and god-schema pressure;
- loose owner-facing sidecars: **FALSIFIED** — fragile paths, partial/stale transfers and poor agent<->owner handoff;
- one owner-visible logical layered bundle: **KEEP** — exact sources, placed instances, consumer REFERENCE, authored domain documents, representation and derived outputs stay separate internally.

Physical container format remains **DEFERRED**. The same logical contract may begin as fixtures/directories and later become one archive/`.jure` artifact without changing authority semantics.

Result: **KEEP layered logical bundle / CHANGE project layer / DEFER storage container**.

## FC-2 — project / authority contract / CLOSED

Implemented in small slices:
- `61d3d42897196333acef7372568c28a1e01cd7a6` — pure `src/project` authority model;
- `faf61ea56dbb79d6dbbde88e548dc7e429ae9fea` — project-level source-adoption context.

Current contract:
- `SourceRevision` = exact immutable source identity;
- `SourceInstance` = one placed use of an exact revision, with independent rigid pose;
- `ConsumerReferenceSnapshot` = exact external evidence, not authored rig data;
- `SourceAdoptionRecord` = which placed source instance + revision-local locator was explicitly used for an authored element/frame;
- authored project documents currently include `RigDocument` explicitly, leaving future real domains to extend the union rather than making `RigDocument` universal.

A rejected alternative was adding `sourceInstanceId` directly to kernel `SourceBinding`. That would make a standalone `RigDocument` depend on project/workspace state it cannot itself validate. Kernel provenance therefore remains exact `sourceRevisionId + locator`; placed-instance context lives one layer above.

Synthetic evidence in the available disposable environment:
- project contract: 7/7 targeted tests PASS;
- one exact revision can back four independent placed instances;
- two instances may adopt the same revision-local locator while remaining distinguishable;
- moving a SOURCE instance does not mutate authored truth;
- source revision changes/re-registration fail closed against adoption/provenance;
- CONSUMER REFERENCE remains outside `RigDocument`.

Result: **KEEP project layer + exact fail-closed identity + project-level adoption context**.

## FC-3 — mechanical assembly / CLOSED

Implemented:
- `0ea75fd0ca2b7c621e8be1b5d225ae75b17586e7` — neutral mechanical relation vocabulary + validation;
- `ced1be1604170c2abc47c9da4fcc695baf0d611a` — full relation-frame axis semantics + canonical architecture update.

Current relation vocabulary:
- `origin-coincident`;
- `revolute` with optional geometric angle limits;
- `prismatic` with optional geometric translation limits;
- `spherical`;
- `distance`;
- `distance-range`.

Semantics:
- relations connect authored `RigFrame`s, not consumer bodies;
- for `revolute` and `prismatic`, frame origin is the anchor and local **+Z** is the primary DOF axis; X/Y retain orientation/reference basis;
- authored neutral defines zero for revolute/prismatic coordinates; limits are interpreted relative to that intended neutral, not a transient runtime state;
- distance/range are geometric intent only; no spring/motor dynamics are imported;
- no `fixed` relation yet because rigidly co-moving datums can live on one `RigElement` until a real mechanism falsifies that choice.

Falsifiers passed:
- full synthetic wishbone/steering/wheel corner can be expressed without mass, inertia, friction, Hertz, damping, motors, solver or Box3D IDs;
- piston uses the same `prismatic` vocabulary;
- rotor uses the same `revolute` vocabulary;
- invalid geometric limits fail closed;
- local +Z axis extraction was separately tested under arbitrary frame rotation.

Result: **KEEP neutral relation vocabulary + frame-defined DOF axis / DEFER solver and advanced spherical limits**.

## FC-4 — representation architecture / ACTIVE

Do not extend BIND-00 by making its singleton an array.

Real representation evidence to cover:
- rigid chassis/wheel/knuckle/part following an authored element;
- exact source skin joint driven by an authored rigid target (BIND-00 proof);
- steering rod / cardan / damper spanning two moving endpoints;
- endpoint pieces that aim along a span;
- middle pieces that stretch along a source-local axis;
- wishbone evidence that may need roll-pinned span orientation rather than naive stretch;
- repeated source instances and exact revision-local source targets.

Storage alternatives to falsify before code:
1. representation mappings inside `RigDocument`;
2. separate authored rig-representation document at project level, referencing a RigDocument plus exact SourceInstances;
3. consumer-only representation with JURE storing nothing persistent.

FC-4 exit gate: select the smallest model that persists complete representation intent without putting scale/deformation into rigid poses, survives multiple simultaneous mappings, source revision failure/rebind and wheel/damper/cardan/wishbone counterexamples, and does not make the mechanical kernel depend on Three/glTF renderer ontology.

## BIND-00 preserved evidence

Exact tested SOURCE:
- `OneSided_Steering_Suspension_Rig.gltf`;
- SHA-256 `fc1e8bd0e298a66fa79c43324708e281073ea8fb7a7aad2728702653705c0ee1`;
- 15 nodes / 14 joints / 1 skinned mesh in the accepted revision.

BIND-00 proved one exact glTF skin joint can be driven by one authored `RigElement` through a stable rest offset while SOURCE remains fixed. It falsified the one-global-binding model. No persistent representation schema is inherited from the prototype.

## Product direction after convergence

JURE is treated as an owner-first spatial authoring workbench whose first mature domain tool is rigging. It may become an authoring nucleus/stepping stone toward JES, but this run must not turn it into a generic framework or a browser clone of JES.

Target owner workflow remains:

`open logical package -> inspect SOURCE + REFERENCE -> explicitly adopt/create AUTHORED assembly -> map representation -> diagnose -> TEST -> exact Reset -> save/export -> consumer adapter`

The complete UI/UX redesign is intentionally downstream of semantic gates. Build Web Apps guidance will be used there to design the complete editor state surface before implementation; current panel placement will not be incrementally polished into a false final architecture.

## Validation/tooling boundary

Current disposable synthetic checks use available Node 22.16.0 / TypeScript 5.8.3. Repository `package.json` declares TypeScript 7.0.2 and dependencies are not installed in this execution environment, so canonical full `npm run check` is **not claimed** yet.

The repository still has no `package-lock.json`; that reproducibility debt remains non-blocking until a canonical successful install is available.
