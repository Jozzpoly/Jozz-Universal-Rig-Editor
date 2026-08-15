# Status

## Current state

Accepted product baseline remains `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`.

Active foundation convergence is isolated on `work/foundation-convergence-v1` and aggregated in draft PR #1. Latest state-ownership architecture checkpoint is `eb2fb71d58a7c69f9a1b8649f18d749854b07c58`.

Accepted pre-run interaction evidence remains: rigid element/frame authoring, free inspection camera, Focus/Fit, Move/Rotate, world/local transforms, numeric editing, preview/commit/cancel, undo/redo, deterministic RigDocument save/open, exact read-only SOURCE inspection and independent SOURCE/authored selection. Current panel layout is an engineering harness, not final information architecture.

## Recovery discipline

- `main` remains accepted authority until explicit promotion.
- Every semantic stage ends in a small commit and `KEEP / CHANGE / DEFER / FALSIFIED` result.
- Current repo/JV evidence outranks chat plans and historical tooling.
- Synthetic tests prove only their exact invariant, never owner interaction/product feel.
- No speculative plugin/ECS/physics/editor framework.
- Git tree -> commit -> non-force ref update is the write boundary. One real FC-3 connection failure already proved this recovery model: the branch ref stayed intact and only the idempotent tree step had to be retried.

## FC-0 — evidence freeze / CLOSED

Run base: `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`.
Owner-tested checkpoint: `checkpoint/foundation-bind00-owner-tested-2026-08-15@548fb40f8c8d799abf35185b314696d33515261d`.
Checkpoint -> main was documentation-only; no product code changed after accepted BIND evidence.

Result: **KEEP baseline / SAFE TO REFOUND ABOVE IT**.

## FC-1 — real JV round-trip atlas / CLOSED

Current JV mixes SOURCE facts/hints, provisional runtime geometry/topology, consumer dynamics, temporary product bridges and representation. Therefore current JV runtime cannot be imported wholesale as authored truth.

Interchange model result:
- monolithic JSON: **FALSIFIED**;
- loose owner-facing sidecars: **FALSIFIED**;
- one owner-visible logical layered bundle: **KEEP**;
- physical ZIP/`.jure` container: **DEFERRED**.

Authority chain retained:

`SOURCE / CONSUMER REFERENCE / PROPOSAL -> explicit adoption/edit -> AUTHORED domain documents -> TEST/EVALUATION -> derived consumer export`

## FC-2 — project / authority contract / CLOSED

Implemented:
- `61d3d42897196333acef7372568c28a1e01cd7a6` — project authority model;
- `faf61ea56dbb79d6dbbde88e548dc7e429ae9fea` — project-level source adoption context.

Current meanings:
- `SourceRevision` = exact immutable source identity;
- `SourceInstance` = independent placed use of an exact revision;
- `ConsumerReferenceSnapshot` = external evidence, never automatic authored truth;
- `SourceAdoptionRecord` = exact placed-instance context for an explicit authored adoption;
- kernel `SourceBinding` stays revision-local (`sourceRevisionId + locator`) so standalone RigDocument does not depend on workspace/project placement state.

Result: **KEEP project layer + exact fail-closed identity + project-level adoption context**.

## FC-3 — mechanical assembly / CLOSED

Implemented:
- `0ea75fd0ca2b7c621e8be1b5d225ae75b17586e7` — neutral mechanical relations;
- `ced1be1604170c2abc47c9da4fcc695baf0d611a` — relation-frame semantics.

Vocabulary: `origin-coincident`, `revolute`, `prismatic`, `spherical`, `distance`, `distance-range`.

For revolute/prismatic relations, each RigFrame is the full joint datum: frame origin = anchor, local +Z = primary DOF axis, authored neutral = zero coordinate. Consumer dynamics such as mass, inertia, friction, Hertz/damping, motors, solver settings and Box3D IDs remain outside the authored mechanical kernel.

The same vocabulary covered a synthetic full wishbone/steering/wheel corner, piston and rotor without new kernel entity types.

Result: **KEEP neutral mechanical intent / DEFER solver + advanced spherical policy**.

## FC-4 — authored representation / CLOSED

Implemented:
- `8d270cdf6612c0a7102d74524d052fc57a7bbbad` — separate `RigRepresentationDocument` contract;
- `3b724f8b663598d79b3f639c26b16e533d62aee0` — initial representation architecture boundary.

Rejected:
- representation inside `RigDocument` — would couple mechanics to placed source/deformation;
- consumer-only representation — would lose owner-authored visual calibration.

Kept representation vocabulary:
- `rigid` — exact source datum <-> authored element/frame;
- `aim` — rigid endpoint orientation from two authored frames without length change;
- `span` — endpoint correspondence permitting representation-only axial deformation;
- optional third roll correspondence for two-point orientation ambiguity such as wishbone roll.

Every mapping stores exact `sourceInstanceId + sourceRevisionId + targetLocator`, so source re-registration requires explicit rebind. BIND-00 remains proof evidence only; singleton storage remains falsified.

Result: **KEEP separate authored representation domain / no scale or renderer ontology in RigDocument**.

## FC-5 — AUTHOR / TEST evaluation boundary / CLOSED

Implemented `6078d50e7415997184a8d3f0f7e324cfaeb22c0b`.

TEST is transient state:
- evaluator receives authored rig + transient numeric controls;
- result is tagged with evaluator ID + document ID + authored revision;
- result can only overlay element world poses;
- owned frame poses are re-resolved from those overlays + authored local frames;
- stale revision, missing element or invalid rigid pose fails closed;
- Reset clears all evaluator influence and restores exact authored view;
- no evaluated state writes back into authored truth automatically.

The evaluator implementation itself remains replaceable. Neutral kinematic solver vs controlled consumer evaluator is **DEFERRED** until the real mechanism requires it.

Result: **KEEP evaluator boundary / DEFER solver selection**.

## FC-6 — deterministic logical project round trip / CLOSED

Implemented:
- `d5b185677fe5d3bdd8f8f661bec6bffaebb29cf8` — deterministic project parse/serialize + runtime unknown-type rejection;
- `d1af1d07a8735c4edccd161561cf134523b3fdfa` — strict SourceInstance pose canonicalization.

Properties protected:
- project arrays and authored domain documents serialize deterministically;
- parse -> serialize -> parse is stable for the logical project contract;
- unknown relation type, representation binding type and authored document kind are hard runtime errors;
- canonical save emits only the known schema instead of carrying accidental JSON fields forward;
- source/rebind mismatches block serialization rather than silently retargeting authored/representation data.

Result: **KEEP logical machine contract / DEFER physical bundle container**.

## FC-7 — editor state ownership / CLOSED

Implemented as independent slices:
- `76f2385cdeff323835a41a8b2bfb9b54d95e320d` — pure `RigAuthoringState` owner for EditorSession, authored selection, preview/commit/cancel and undo/redo;
- `9d6e246be8b1b9dfa7ad2216b25ca8adc8671be2` — current App routes authoring operations through that owner;
- `e35c80342b44bb92e7ec0174bb1835bd66d9d31d` — pure SOURCE runtime owner;
- `ddc92c695eb8894c8de55e7c514055477dd3bd77` — current App routes SOURCE asset/selection lifecycle through that owner;
- `eb2fb71d58a7c69f9a1b8649f18d749854b07c58` — canonical state-ownership architecture.

State boundaries now explicit:
- durable project/authored documents — outside React;
- rig authoring interaction — `RigAuthoringState`;
- SOURCE runtime + SOURCE selection — `SourceRuntimeState`;
- TEST/evaluation — `RigTestState`;
- file handle/baseline — IO/session orchestration, not authored truth;
- camera/layout/layers/view requests — disposable presentation state;
- BIND-00 — quarantined legacy transient proof, not an extension point.

Validation:
- authoring owner: targeted replacement/preview/commit/cancel/world->local/undo/redo/selection tests;
- SOURCE owner: replacement/selection/clear/fail-closed locator tests;
- combined disposable foundation harness after FC-7 state slices: **36/36 PASS**;
- both App integration steps received syntax/transpile checks with zero parser diagnostics;
- canonical full `npm run check` is still **NOT CLAIMED**. A direct fresh disposable clone attempt was made once and stopped immediately because the execution environment could not resolve `github.com`; no workaround chain was pursued.

Result: **KEEP explicit owners / KEEP current presentation shell disposable / STOP architecture growth inside App**.

## FC-8 — owner workflow + UX architecture / ACTIVE

Purpose: use the now-stable semantic/state boundaries to design the complete owner workflow before any final UI implementation. This is the Build Web Apps design gate, not a panel-polish pass.

The design must cover together, not piecemeal:
- project/package opening and exact SOURCE revision/instance visibility;
- CONSUMER REFERENCE inspection without authority inversion;
- explicit source/reference -> authored adoption;
- authored elements/frames/relations and free virtual construction;
- multiple simultaneous representation mappings;
- AUTHOR vs TEST separation, controls, diagnostics and exact Reset;
- save/export/rebind/revision mismatch states;
- several source assets/instances in one project;
- a future second domain workspace (map authoring is the main counterexample) without turning rig UI into a generic framework.

UX alternatives to falsify before coding:
1. extend the current always-visible RIG/SOURCE/Inspector three-pane layout;
2. hard separate pages/tabs for Import, Author, Representation and Test;
3. persistent viewport/workbench shell with explicit task contexts that swap navigators/inspectors/tools while preserving camera/project context.

FC-8 exit gate: choose the information architecture by walking the real JV owner round trip plus piston/rotor/multi-source/map counterexamples through each alternative. Preserve only interaction evidence already owner-tested (free camera, Focus/Fit, direct manipulation, world/local, numeric edits, undo/redo); do not preserve current panel placement merely because it exists.

No visual redesign code should land before this gate closes.

## BIND-00 preserved evidence

Exact accepted test source: `OneSided_Steering_Suspension_Rig.gltf`, SHA-256 `fc1e8bd0e298a66fa79c43324708e281073ea8fb7a7aad2728702653705c0ee1`, 15 nodes / 14 joints / 1 skinned mesh. BIND-00 proved one exact source skin joint can be driven from authored rigid truth while SOURCE remains fixed and falsified one-global-binding storage.

## Product direction

JURE is an owner-first spatial authoring workbench whose first mature domain is rigging. It may become an authoring nucleus toward JES, but convergence must not turn it into a generic framework or browser clone of JES.

Target owner flow remains:

`open logical package -> inspect SOURCE + REFERENCE -> explicitly adopt/create AUTHORED assembly -> map representation -> diagnose -> TEST -> exact Reset -> save/export -> consumer adapter`

## Tooling debt

No `package-lock.json` yet; direct dependencies are exact-pinned but transitive installs are not fully reproducible. Add the lockfile from a canonical successful install; this remains non-blocking for current semantic/design work.
