# Status

## Current state

Accepted product baseline remains `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`.

Active foundation convergence is isolated on `work/foundation-convergence-v1` and aggregated in draft PR #1. The latest code checkpoint before this status commit is `d1af1d07a8735c4edccd161561cf134523b3fdfa`.

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
- `3b724f8b663598d79b3f639c26b16e533d62aee0` — architecture boundary documentation.

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

Properties now protected:
- project arrays and authored domain documents serialize deterministically;
- parse -> serialize -> parse is stable for the logical project contract;
- unknown relation type, representation binding type and authored document kind are hard errors at runtime rather than TypeScript-only assumptions;
- canonical save emits the known schema instead of carrying accidental extra JSON fields forward;
- source/rebind mismatches block serialization rather than silently retargeting authored/representation data.

Disposable foundation harness after final FC-6 hardening: **25/25 PASS** across project authority, mechanics, representation, TEST/evaluation and logical round-trip tests.

This is not a claim of canonical full-repository validation: the disposable environment uses Node 22.16.0 / TypeScript 5.8.3 while repository `package.json` declares TypeScript 7.0.2 and canonical dependencies are not installed there.

Result: **KEEP logical machine contract / DEFER physical bundle container**.

## FC-7 — state ownership / ACTIVE

Purpose: prevent the existing `App.tsx` from becoming the architecture for future SOURCE/REFERENCE/AUTHOR/REPRESENTATION/TEST and multi-workspace growth before any visual redesign.

State domains to prove against current code before refactoring:
1. durable project/authored documents;
2. external SOURCE/reference runtime cache (loaded bytes, parsed adapters, display handles) — never authored truth;
3. editor interaction state (selection, transform mode, preview/commit/cancel);
4. TEST/evaluation state;
5. workspace presentation state (camera/layout/layers);
6. file/save session state.

FC-7 exit gate: App becomes composition/orchestration glue for these explicit owners without changing accepted interaction behavior or prematurely designing the final UI. Only after this boundary is stable may the Build Web Apps redesign phase design the complete Import/Reference, Author, Representation, Test and multi-source surfaces.

## BIND-00 preserved evidence

Exact accepted test source: `OneSided_Steering_Suspension_Rig.gltf`, SHA-256 `fc1e8bd0e298a66fa79c43324708e281073ea8fb7a7aad2728702653705c0ee1`, 15 nodes / 14 joints / 1 skinned mesh. BIND-00 proved one exact source skin joint can be driven from authored rigid truth while SOURCE remains fixed and falsified one-global-binding storage.

## Product direction

JURE is an owner-first spatial authoring workbench whose first mature domain is rigging. It may become an authoring nucleus toward JES, but convergence must not turn it into a generic framework or browser clone of JES.

Target owner flow remains:

`open logical package -> inspect SOURCE + REFERENCE -> explicitly adopt/create AUTHORED assembly -> map representation -> diagnose -> TEST -> exact Reset -> save/export -> consumer adapter`

Complete UI/UX redesign remains downstream of semantic/state gates. Current panel placement will not be incrementally polished into a false final architecture.

## Tooling debt

No `package-lock.json` yet; direct dependencies are exact-pinned but transitive installs are not fully reproducible. Add the lockfile from a canonical successful install; this remains non-blocking for current semantic work.
