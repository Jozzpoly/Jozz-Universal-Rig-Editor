# Status

## Authority

- **accepted baseline:** `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`;
- **clean foundation candidate:** `promotion/foundation-ready-squash-2026-08-16@4db04eee4da0216f6bd3df6b6b0c82aa20afab5a` / draft PR #3;
- **active product work:** `work/real-jv-rig-elements`;
- **latest validated product SHA:** `d35a80c8498bea96ad30131e6e4a23b9c8abfaa5`;
- **latest frozen checkpoint:** `checkpoint/real-jv-source-element-origin-2026-08-16@d35a80c8498bea96ad30131e6e4a23b9c8abfaa5`;
- **checkpoint browser run:** `31953557146` — Linux Chrome PASS + Windows Chrome PASS;
- **active product review boundary:** draft PR #4 targeting the clean foundation candidate, not `main`.

The active product line was intentionally created from the exact clean candidate rather than from `main`. `main` remains untouched. PR #2 retains recovery/foundation evidence; PR #3 remains the explicit clean promotion candidate. Neither PR #3 nor PR #4 may be merged merely because CI is green.

## Product purpose

JURE is an owner-first spatial rigging workbench. The Owner should be able to inspect exact real assets, create/correct authored rig truth, express mechanical and representation intent, test a mechanism without mutating authored neutral truth, and hand a small reliable result to a consumer without agent-side coordinate guessing.

JV/JV-Web is the first real consumer/falsifier. Native JV and later JV/VAW experiments should remain possible without making JURE vehicle-specific or turning it into a generic framework.

## Demonstrated product foundation

The active line now demonstrates:

- rigid `RigElement` and owner-local/root `RigFrame` authoring;
- Owner-facing free `RigElement` creation with deterministic IDs, immediate selection and one chronological Undo/Redo action;
- **exact SOURCE datum -> new authored `RigElement` origin** as one atomic project operation;
- immutable `SourceAdoptionRecord(kind: 'element')` plus exact kernel SOURCE provenance on that element;
- exact SOURCE datum -> authored `RigFrame` adoption into a selected element;
- correct conversion from exact SOURCE project-world pose to owner-local authored frame pose;
- Move/Rotate, world/local and numeric XYZ-degree editing over quaternion storage;
- one chronological `ProjectSession` history for SOURCE placement and authored project changes;
- exact immutable `SourceRevision` identity and independently placed `SourceInstance`s;
- deterministic logical project save/open and exact SOURCE relink boundaries;
- separate provisional mechanical-relation, representation and AUTHOR/TEST domains;
- viewport-first resizable/collapsible engineering workspace.

Canonical validation at `d35a80c...`:

- Node `24.16.0` / npm `11.17.0`;
- locked `npm ci`: PASS;
- TypeScript: PASS;
- **21 core test files / 108 PASS / 0 FAIL**;
- Vite production build: PASS;
- Work check run `31953534580`: PASS.

The Vite build still reports the existing >500 kB minified main-chunk warning. It is tracked as a non-blocking presentation/build debt, not a reason to interrupt real rig authoring before measured need.

## Exact real-SOURCE rendered evidence

Pinned SOURCE:

`Jozzpoly/Box3d_FunProject@959aefb78587ce60cf2b8eb03ff82797a4165142/assets/source/OneSided_Steering_Suspension_Rig.gltf`

- Git blob: `06d5c66f6d13fb64863ab15a660f060358872291`;
- SHA-256: `57cda983f8f728bc819460540d2ee39b1b17288ecdac1f0dc8bb1a3e6f9ab750`;
- size: 64,264 bytes;
- inspected structure used by the current probes: 15 nodes / 14 joints / 1 skinned mesh.

Checkpoint run `31953557146` protects the same exact owner path on Linux Chrome and Windows Chrome. Both platforms passed:

1. free Owner `+ Element -> Create -> Undo -> Redo`;
2. exact SOURCE open and SourceInstance placement -> Undo -> Redo;
3. select exact `Chassis_Bottom`;
4. **Create element at datum** -> a new authored element receives the exact SOURCE-derived origin/pose and immutable provenance;
5. Undo removes that element+adoption atomically and Redo restores them;
6. select exact child datum `Socket_SingleDamperLower`;
7. Preview/Commit the datum as an authored frame owned by the SOURCE-derived element;
8. verify the authored owner-local translation is exactly `[-1.125, 0, -0.8125]`, matching the exact glTF parent-child transform despite prior movement of the whole SourceInstance;
9. transform the freshly adopted frame and Undo restores the authored pose;
10. adoption-preview transform-lock regression remains PASS;
11. runtime fault / `pageerror` / unexpected `console.error` remain fail-closed.

Both Linux and Windows logs contain:

`SOURCE_DERIVED_RIG_ELEMENT_CREATE_UNDO_REDO_PASS`

`REAL_SOURCE_PARENT_CHILD_LOCAL_POSE_PASS [ -1.125, 0, -0.8125 ]`

`BROWSER_REAL_OWNER_PATH_SMOKE_PASS`

This is the first exact real-JV proof that JURE can derive a new element origin from SOURCE, preserve SOURCE placement as separate state, and recover an exact child interface as owner-local authored rig truth.

## Durable ownership / cleanup state

The active tree intentionally keeps one current path for each responsibility:

- `ProjectSession` — single durable preview/Undo/Redo history;
- `ProjectAuthoringState` — active operation + authored selection orchestration;
- `ProjectSourceRuntimeState` — exact linked SOURCE bytes, active instance and SOURCE selection;
- `RigCommand` — pure authored-rig mutation contract, not a second session;
- `src/features/rig-elements/*` — free element creation mutation;
- `src/project/source-element-adoption.ts` — atomic exact SOURCE -> element adoption;
- `src/app/state/rig-element-workflow.ts` — Owner ID allocation and project-level free/SOURCE-derived element creation;
- `src/project/source-frame-adoption.ts` — exact SOURCE -> frame adoption;
- representation and evaluation remain outside authored `RigDocument` truth.

Historical `EditorSession`, `RigAuthoringState`, singleton SOURCE state, FC-8 workspace state and active BIND-00 runtime/UI remain removed. Do not reconstruct them as alternate APIs.

## Current product limitations

- UI exposes one active SourceInstance context even though the project model supports multiple placed instances.
- Element authoring is still intentionally small: create/name/source-derived origin/selection/history; no dedicated rename/delete/reparent information architecture yet.
- We have proven one exact parent-child component structure from the real JV SOURCE, but **have not yet declared its final mechanical meaning solely from node names or secondary contracts**.
- There is no arbitrary surface/vertex picking or virtual/derived construction-datum workflow yet.
- Mechanical relation enum/axis conventions are provisional.
- Representation is separated correctly but its exact `rigid/aim/span/...` vocabulary and Owner workflow remain provisional.
- AUTHOR/TEST separation exists, but no final kinematic evaluator/solver is architecture yet.
- There is no JURE -> JV-Web consumer export/adapter yet.
- Current layout is an engineering harness, not final information architecture.

## Next falsifier

The next slice is **not** “implement the whole suspension”. The next task is to identify and author the smallest second real component/interface for which the exact SOURCE plus justified owner/secondary evidence supports one mechanical relation.

Required sequence:

1. inspect the exact SOURCE hierarchy, sockets and axis nodes around `Chassis_Bottom`, `Chassis_Top`, `Socket_ChassisMount_a`, `Socket_ChassisMount_b`, `Socket_WheelCenter` and the suspension-travel axes;
2. separate exact SOURCE facts from the current JV secondary semantic contract and from provisional M6 runtime assumptions;
3. choose the smallest pair of authored elements/frames that can support one neutral mechanical relation without inventing missing geometry;
4. encode that relation through the existing `RigDocument` relation vocabulary only if the real mechanism fits it;
5. test world/local invariants, project history and validation before adding UI or evaluator behavior;
6. return to the exact rendered SOURCE only when the relation has a real spatial consequence worth validating.

A concrete missing hardpoint is the trigger for virtual/derived construction-datum work. Do not build arbitrary picking or generic construction geometry speculatively.

Do not simultaneously implement final representation, consumer export or kinematic solver. Let the real JV mechanism falsify each abstraction as it is introduced.

## Owner/promotion boundary

Useful later Owner checks, not current technical blockers:

- judgement of the `+ Element` and `Create element at datum` interaction in the engineering workspace;
- `Save As -> reopen -> exact SOURCE relink` with real authored component data;
- spatial/mechanical judgement once the first relation connects two real components.

Before any promotion to `main`, independently resolve draft PR #3 and exact `4db04eee...`, compare it with `main`, keep PR #2 as recovery evidence, and obtain explicit Owner approval. **Do not merge without explicit Owner approval.**

## Foundation exit criterion

Foundation is complete when the Owner can take a real JV mechanism and, without agent-side coordinate guessing:

`place/inspect exact SOURCE -> create authored elements/frames/mechanical intent -> map representation -> kinematically test/reset -> save/reopen -> export a small consumer-facing result`

After that the permanent rhythm is:

`real need -> small vertical slice -> targeted test -> owner-visible gate when needed -> next`.
