# Status

## Authority

- **accepted baseline:** `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`;
- **active development authority:** `work/real-use-foundation-recovery` / draft PR #2;
- **clean takeover/promotion-review checkpoint:** `checkpoint/foundation-clean-takeover-2026-08-16`.

PR #2 is a fast-forward descendant of `main` but remains draft/unmerged. The checkpoint freezes the cleaned active line for independent takeover/promotion review. Promotion to `main` is an explicit Owner decision, not a CI side effect.

Closed PR #1, FC-9 concept work, BIND-00 branches and older handoff/recovery packs are historical evidence only.

## Product purpose

JURE is an owner-first spatial rigging workbench. The Owner should be able to inspect exact real assets, create/correct authored rig truth, express mechanical and representation intent, test a mechanism without mutating authored neutral truth, and hand a small reliable result to a consumer without an agent guessing coordinates from screenshots.

JV/JV-Web is the first real consumer/falsifier. Native JV and later JV/VAW experiments should remain possible without making JURE vehicle-specific or turning it into a generic framework.

## Demonstrated product foundation

The active line contains:

- rigid `RigElement` and owner-local/root `RigFrame` authoring;
- Move/Rotate, world/local and numeric XYZ-degree editing over quaternion storage;
- preview/commit/cancel;
- one chronological `ProjectSession` history for SOURCE placement and authored project changes;
- exact immutable `SourceRevision` identity and independently placed `SourceInstance`s;
- read-only glTF/GLB SOURCE inspection with deterministic locators, markers/axes and independent SOURCE selection;
- explicit verified SOURCE datum -> authored `RigFrame` adoption with immutable historical evidence;
- deterministic logical project save/open and exact SOURCE relink boundaries;
- separate project/source runtime state from durable authored truth;
- provisional mechanical-relation and representation domains;
- transient AUTHOR/TEST evaluator boundary;
- free inspection camera with Focus/Fit and viewport-first resizable/collapsible workspace.

The last product-path browser evidence before structural cleanup proved on the pinned real SOURCE:

- SOURCE placement + Undo/Redo;
- SOURCE datum adoption Preview/Commit;
- movement + Undo of a freshly committed adopted frame;
- adoption-preview transform lock regression;
- the same owner path on Linux Chrome and Windows Chrome.

The structural cleanup preserved that path while removing competing historical architecture from the active tree. Current core suite after cleanup is **18 files / 94 tests**, all protecting the current architecture rather than maintaining superseded state/history/BIND-00 implementations.

## Fundamental cleanup now completed

The active tree intentionally has **one** current path for each core responsibility:

- `ProjectSession` is the only durable preview/Undo/Redo session;
- `ProjectAuthoringState` is the active authoring-operation/selection orchestrator;
- `ProjectSourceRuntimeState` is the active runtime SOURCE state;
- `RigCommand` is a pure mutation contract, not a second session;
- FC-8 `inspect|author|represent|test` workspace state is no longer active code;
- old rig-only `EditorSession`, `RigAuthoringState` and singleton `SourceRuntimeState` are removed;
- BIND-00 state/UI/props/helper/tests/CSS/second-GLTF renderer path are removed from the active tree.

BIND-00 remains useful historical evidence: one authored element successfully drove one exact glTF skin joint, and real Owner use immediately falsified singleton binding storage. Do not recreate that prototype as persistent representation architecture.

The adoption-preview black-screen incident is also preserved only as a durable lesson: one operation owns preview at a time, and UI must not expose a conflicting transform target during SOURCE-adoption preview. Browser regression protects this boundary.

## Validation model

Normal development uses **Work check** on `main` / `work/**`:

`npm install -> npm run check`

The current cleaned code passed this check with the 18-file / 94-test core suite and production build.

Takeover/promotion-quality rendered evidence uses **Checkpoint browser gate** on `checkpoint/**` (or manual dispatch):

- canonical check;
- exact pinned real JV SOURCE;
- adoption-preview regression;
- real SOURCE placement/adoption owner path;
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

## Current limitations — keep them visible

- UI exposes one active SourceInstance context even though the project model supports multiple placed instances.
- SOURCE datum adoption currently targets an **existing** `RigElement`.
- There is no Owner-facing creation workflow for real `RigElement`s yet.
- There is no arbitrary surface/vertex picking or virtual/derived construction-datum workflow yet.
- Mechanical relation enum/axis conventions are provisional.
- Representation is correctly separated from `RigDocument`, but the exact `rigid/aim/span/...` vocabulary is provisional and has no final Owner workflow yet.
- AUTHOR/TEST separation exists, but no final kinematic evaluator/solver is architecture yet.
- Current layout is an engineering harness, not final information architecture.
- There is no committed `package-lock.json`; direct dependencies are exact-pinned but transitive installs are not fully reproducible yet. Generate the lockfile only from a known-good canonical npm environment.

## Next product slice

Highest-leverage real-use work after promotion/readiness review:

**Owner-created authored `RigElement`s plus the frames required by a real SOURCE mechanism.**

The current path can already inspect/place exact SOURCE and adopt a rigid datum as a frame, but it still relies on synthetic/pre-existing target elements. The next slice should let the Owner start constructing an actual JV mechanism.

Start with exact existing SOURCE sockets/axes. Add arbitrary geometry picking or virtual construction datums only when a concrete required JV hardpoint cannot be represented by existing exact datums.

Keep the first slice narrow: element creation + ownership/selection/history semantics. Do not simultaneously implement the whole suspension, final representation system or kinematic solver.

## Owner/promotion boundary

Useful remaining manual checks, not technical blockers:

- Owner `Commit adopted frame -> move -> mixed multi-step Undo/Redo` on the current cleaned workbench;
- Owner `Save As -> reopen -> exact SOURCE relink` in the same real workflow.

Do not create another giant diagnostic package merely to force these checks. Automation owns compiler/runtime/browser facts; the Owner is most valuable for spatial/product judgment.

Before any promotion, independently resolve the clean checkpoint and its GitHub checks, compare it with `main`, review PR #2, and decide whether promotion should preserve the recovery commit history or use a cleaner squash-style boundary. **Do not merge without explicit Owner approval.**

## Foundation exit criterion

Foundation is complete when the Owner can take a real JV mechanism and, without agent-side coordinate guessing:

`place/inspect exact SOURCE -> create authored elements/frames/mechanical intent -> map representation -> kinematically test/reset -> save/reopen -> export a small consumer-facing result`

After that the permanent rhythm is:

`real need -> small vertical slice -> targeted test -> owner-visible gate when needed -> next`.
