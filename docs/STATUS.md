# Status

## Authority

- **accepted baseline:** `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`;
- **clean foundation candidate:** `promotion/foundation-ready-squash-2026-08-16@4db04eee4da0216f6bd3df6b6b0c82aa20afab5a` / draft PR #3;
- **active product work:** `work/real-jv-rig-elements@90ce0985e85fe97e174533bd395296e8cda22dfa`;
- **latest frozen product checkpoint:** `checkpoint/real-jv-owner-element-source-adoption-2026-08-16@90ce0985e85fe97e174533bd395296e8cda22dfa`;
- **checkpoint browser run:** `31952731062` — Linux Chrome PASS + Windows Chrome PASS.

The active product line was intentionally created from the exact clean candidate rather than from `main`, so the validated foundation tree remains an explicit boundary while Owner promotion is still undecided. `main` has not moved.

PR #2 / `work/real-use-foundation-recovery` retains the full recovery/foundation evidence history. Draft PR #3 is the clean one-commit promotion candidate. Neither is merged merely because CI is green.

Closed PR #1, FC-9 concept work, BIND-00 branches and older handoff/recovery packs are historical evidence only.

## Product purpose

JURE is an owner-first spatial rigging workbench. The Owner should be able to inspect exact real assets, create/correct authored rig truth, express mechanical and representation intent, test a mechanism without mutating authored neutral truth, and hand a small reliable result to a consumer without an agent guessing coordinates from screenshots.

JV/JV-Web is the first real consumer/falsifier. Native JV and later JV/VAW experiments should remain possible without making JURE vehicle-specific or turning it into a generic framework.

## Demonstrated product foundation

The active line contains:

- rigid `RigElement` and owner-local/root `RigFrame` authoring;
- Owner-facing `RigElement` creation in the Rig navigator;
- deterministic document-wide element ID allocation with collision avoidance;
- element creation as one durable `ProjectSession` action with immediate selection and Undo/Redo;
- Move/Rotate, world/local and numeric XYZ-degree editing over quaternion storage;
- preview/commit/cancel;
- one chronological `ProjectSession` history for SOURCE placement and authored project changes;
- exact immutable `SourceRevision` identity and independently placed `SourceInstance`s;
- read-only glTF/GLB SOURCE inspection with deterministic locators, markers/axes and independent SOURCE selection;
- explicit verified SOURCE datum -> authored `RigFrame` adoption with immutable historical evidence;
- adoption of an exact real JV SOURCE datum into a freshly Owner-created `RigElement`;
- deterministic logical project save/open and exact SOURCE relink boundaries;
- separate project/source runtime state from durable authored truth;
- provisional mechanical-relation and representation domains;
- transient AUTHOR/TEST evaluator boundary;
- free inspection camera with Focus/Fit and viewport-first resizable/collapsible workspace.

Current canonical core suite is **20 files / 101 tests / 101 PASS / 0 FAIL** at `90ce0985...`. TypeScript and Vite production build also PASS under the canonical Node `24.16.0` / npm `11.17.0` Work check.

## Real-source rendered evidence

The pinned browser path now protects, on Linux Chrome and Windows Chrome:

- Owner `+ Element -> Create` through the real React workbench;
- automatic selection of the new authored element;
- creation Undo removes the element and Redo restores it;
- exact real SOURCE open and placement + Undo/Redo;
- selecting the freshly Owner-created element as the adoption target;
- exact `Chassis_Top` SOURCE datum adoption Preview/Commit into that element;
- movement + Undo of the freshly committed adopted frame;
- adoption-preview transform lock regression;
- runtime fault / `pageerror` / unexpected `console.error` fail-closed behavior.

This is the first end-to-end JURE proof where a target element is created during the Owner workflow rather than supplied by the synthetic rig fixture.

The exact validated checkpoint is:

`checkpoint/real-jv-owner-element-source-adoption-2026-08-16@90ce0985e85fe97e174533bd395296e8cda22dfa`

Checkpoint browser gate run `31952731062` completed successfully on both platforms.

## Fundamental cleanup completed

The active tree intentionally has **one** current path for each core responsibility:

- `ProjectSession` is the only durable preview/Undo/Redo session;
- `ProjectAuthoringState` is the active authoring-operation/selection orchestrator;
- `ProjectSourceRuntimeState` is the active runtime SOURCE state;
- `RigCommand` is a pure mutation contract, not a second session;
- pure `RigElement` creation lives under `src/features/rig-elements` and project orchestration under `src/app/state/rig-element-workflow.ts`;
- FC-8 `inspect|author|represent|test` workspace state is no longer active code;
- old rig-only `EditorSession`, `RigAuthoringState` and singleton `SourceRuntimeState` are removed;
- BIND-00 state/UI/props/helper/tests/CSS/second-GLTF renderer path are removed from the active tree.

BIND-00 remains useful historical evidence: one authored element successfully drove one exact glTF skin joint, and real Owner use immediately falsified singleton binding storage. Do not recreate that prototype as persistent representation architecture.

The adoption-preview black-screen incident remains a durable lesson: one operation owns preview at a time, and UI must not expose a conflicting transform target during SOURCE-adoption preview. Element creation now follows the same rule: the UI disables creation during SOURCE placement/active preview and the domain workflow independently fails closed.

## Reproducible toolchain and validation

Canonical CI toolchain:

- Node `24.16.0`;
- npm `11.17.0`;
- committed npm lockfile v3 generated by that environment;
- direct dependency versions remain exact-pinned.

Normal environment restoration and CI use `npm ci`. `npm install` is reserved for intentional dependency/lockfile changes.

Normal development uses **Work check** on `main` / `work/**`:

`npm ci -> npm run check`

Takeover/product-checkpoint rendered evidence uses **Checkpoint browser gate** on `checkpoint/**` (or manual dispatch):

- locked canonical install/check;
- exact pinned real JV SOURCE;
- adoption-preview regression;
- Owner element creation + real SOURCE placement/adoption owner path;
- Linux Chrome;
- Windows Chrome;
- runtime fault, `pageerror` and unexpected `console.error` fail closed.

The pinned real SOURCE is:

`Jozzpoly/Box3d_FunProject@959aefb78587ce60cf2b8eb03ff82797a4165142/assets/source/OneSided_Steering_Suspension_Rig.gltf`

- Git blob: `06d5c66f6d13fb64863ab15a660f060358872291`;
- SHA-256: `57cda983f8f728bc819460540d2ee39b1b17288ecdac1f0dc8bb1a3e6f9ab750`;
- size: 64,264 bytes;
- structure used by current probes: 15 nodes / 14 joints / 1 skinned mesh.

Historical fixture SHA `fc1e8bd0...` is a different exact `SourceRevision` despite sharing the filename.

## Current product limitations — keep them visible

- UI exposes one active SourceInstance context even though the project model supports multiple placed instances.
- Owner-facing `RigElement` creation now exists, but it is intentionally minimal: create/name/automatic identity/selection/history only; there is no dedicated rename/delete/reparent information architecture yet.
- SOURCE datum adoption can target an Owner-created `RigElement`, but current product work has not yet decomposed the actual JV front-corner mechanism into its real authored elements/frames.
- There is no arbitrary surface/vertex picking or virtual/derived construction-datum workflow yet.
- Mechanical relation enum/axis conventions are provisional.
- Representation is correctly separated from `RigDocument`, but the exact `rigid/aim/span/...` vocabulary is provisional and has no final Owner workflow yet.
- AUTHOR/TEST separation exists, but no final kinematic evaluator/solver is architecture yet.
- There is no consumer export/adapter from JURE into JV-Web yet.
- Current layout is an engineering harness, not final information architecture.

These are product/foundation limits, not repository-recovery problems.

## Next product slice

The generic Owner-created-element capability is now demonstrated. The next falsifier is:

**decompose the first real part of the exact one-sided JV steering/suspension SOURCE into the minimum authored `RigElement`s and exact SOURCE-derived `RigFrame`s required by the mechanism.**

Do not begin by copying the complete synthetic mechanical-corner fixture or the current JV M6 topology. Those are evidence/falsifiers, not authored truth.

Preferred order:

1. inspect the exact real SOURCE nodes/sockets/axes and choose one mechanically meaningful component whose required datums already exist explicitly in SOURCE;
2. create that real authored element through the Owner workflow;
3. adopt only the exact frames required to describe its interfaces;
4. verify local/world poses, project history and save/reopen semantics;
5. only then add the smallest mechanical relation needed to connect it to the next real component.

A concrete missing hardpoint is the trigger for virtual/derived construction-datum work. Do not build arbitrary geometry picking before such a real SOURCE deficiency blocks the mechanism.

Do not simultaneously implement the whole suspension, final representation system, consumer export or kinematic solver. The goal is to let the real JV mechanism falsify each abstraction as it is introduced.

## Owner/promotion boundary

Useful remaining manual checks, not technical blockers for the current slice:

- Owner judgement of the new `+ Element` interaction/name flow in the current engineering workspace;
- Owner `Save As -> reopen -> exact SOURCE relink` after creating/adopting real mechanism data;
- later spatial judgement of the actual front-corner decomposition and frame meaning.

Do not create another giant diagnostic package merely to force these checks. Automation owns compiler/runtime/browser facts; the Owner is most valuable for spatial/product judgment.

Before any promotion to `main`, independently resolve draft PR #3 and the exact clean candidate `4db04eee...`, compare it with `main`, keep PR #2 as recovery evidence, and obtain explicit Owner approval. **Do not merge without explicit Owner approval.**

## Foundation exit criterion

Foundation is complete when the Owner can take a real JV mechanism and, without agent-side coordinate guessing:

`place/inspect exact SOURCE -> create authored elements/frames/mechanical intent -> map representation -> kinematically test/reset -> save/reopen -> export a small consumer-facing result`

After that the permanent rhythm is:

`real need -> small vertical slice -> targeted test -> owner-visible gate when needed -> next`.
