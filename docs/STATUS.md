# Status

## Authority

- **accepted product baseline:** `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`;
- **active development authority:** `work/real-use-foundation-recovery` / draft PR #2;
- **latest fully validated product checkpoint:** `7253b50f9f41ee9467dda6399c8c7e8e58757c23`;
- **frozen branch for that checkpoint:** `checkpoint/ru1c-source-adoption-cross-platform-green-2026-08-16`.

The active branch is a clean fast-forward descendant of `main`; PR #2 remains draft, open and unmerged. Commits after `7253b50f...` currently document the validated state and improve development/takeover tooling; they do not establish a newer Owner-accepted product behavior by themselves.

Closed PR #1 / `work/foundation-convergence-v1`, FC-9 visual concept work, BIND-00 branches and older handoff packs are historical evidence only.

## Product purpose

JURE is an owner-first spatial rigging workbench. The Owner should be able to inspect exact real assets, create/correct authored rig truth, express mechanical and representation intent, test the mechanism without mutating authored neutral truth, and hand a small reliable result to a consumer without an agent guessing coordinates from screenshots.

JV/JV-Web is the first real consumer/falsifier. Native JV and later JV/VAW experiments should remain possible without making JURE vehicle-specific or turning it into a generic framework.

## Validated foundation

The active line currently contains these demonstrated foundations:

- rigid `RigElement` and owner-local/root `RigFrame` authoring;
- Move/Rotate, world/local and numeric XYZ-degree editing over quaternion storage;
- preview/commit/cancel;
- one chronological `ProjectSession` history for durable project changes;
- exact immutable `SourceRevision` identity and independently placed `SourceInstance`s;
- read-only glTF/GLB SOURCE inspection with deterministic locators, markers/axes and independent SOURCE selection;
- explicit verified SOURCE datum -> authored `RigFrame` adoption with immutable historical adoption evidence;
- deterministic logical project save/open and exact SOURCE relink boundaries;
- separate project/source runtime state from durable authored truth;
- provisional mechanical-relation, representation and AUTHOR/TEST domains kept outside consumer dynamics;
- free inspection camera with Focus/Fit and viewport-first resizable/collapsible workspace.

At product checkpoint `7253b50f...` canonical validation established:

- TypeScript: PASS;
- 22 core test files;
- **116 PASS / 0 FAIL**;
- Vite production build: PASS;
- real `OneSided_Steering_Suspension_Rig.gltf` SOURCE placement + Undo/Redo: PASS;
- SOURCE datum adoption Preview/Commit: PASS;
- movement + Undo of a freshly committed adopted frame: PASS;
- adoption-preview transform lock regression: PASS;
- same real-source owner path: PASS on Linux Chrome and Windows Chrome.

Owner additionally observed in the browser that moving the real SOURCE and pressing Undo correctly restored SOURCE placement. Owner visually exercised the real adoption preview path.

## Important resolved lessons

### BIND-00

Historical BIND-00 proved a narrow fact: an authored element can drive one exact glTF skin joint while read-only SOURCE stays fixed. Its single-global-binding storage was falsified immediately by real Owner use: a second bind replaced the first.

KEEP the evidence. Do **not** revive BIND-00 as current architecture or "fix" it by replacing one binding with an array. Persistent representation remains a separate domain whose exact vocabulary is provisional.

### Adoption-preview black screen

The Owner-triggered blank/black app was reproduced exactly as:

`SOURCE adoption Preview -> drag authored gizmo before Commit`

The state machine correctly rejected concurrent `source-frame-adoption` + rig-transform operations; the UI incorrectly left an interactive authored transform target visible. The fix at `7253b50f...` clears/freeze authored selection during adoption preview while preserving the invariant. A runtime fault boundary now surfaces future client exceptions instead of leaving an unexplained blank page.

This blocker is resolved and protected by browser regression.

## Exact real SOURCE for current RU-1 validation

Current JV/native fixture:

`Jozzpoly/Box3d_FunProject/assets/source/OneSided_Steering_Suspension_Rig.gltf`

Pin for reproducible external fetches:

- Box3d_FunProject commit: `959aefb78587ce60cf2b8eb03ff82797a4165142`;
- Git blob: `06d5c66f6d13fb64863ab15a660f060358872291`;
- SHA-256: `57cda983f8f728bc819460540d2ee39b1b17288ecdac1f0dc8bb1a3e6f9ab750`;
- size: 64,264 bytes;
- structure used by current probes: 15 nodes / 14 joints / 1 skinned mesh.

Historical external BIND fixture with SHA-256 `fc1e8bd0...` is a different exact SourceRevision despite sharing the filename. Never weaken exact identity/relink because two files look compatible.

## Current limitations — do not hide them

- Current UI exposes only one active SourceInstance context even though the project model supports multiple instances.
- SOURCE datum adoption currently targets an **existing** `RigElement`.
- There is no owner-facing creation workflow for real `RigElement`s yet.
- There is no arbitrary surface/vertex picking or virtual/derived construction-datum workflow yet.
- Mechanical relation enum/axis conventions are provisional.
- Representation separation is a strong KEEP; exact `rigid/aim/span/...` mapping vocabulary remains provisional.
- AUTHOR/TEST separation exists, but no final kinematic evaluator/solver is architecture yet.
- Current layout is an engineering harness, not final information architecture.
- There is no committed `package-lock.json`; direct dependencies are exact-pinned but transitives are not fully reproducible yet.

## Next development slice

Highest-leverage work for approaching real JV/JV-Web use:

**Owner-created authored `RigElement`s plus the frames required by a real SOURCE mechanism.**

The present RU-1 path can already inspect/place exact SOURCE and adopt a rigid datum as a frame, but it still relies on a synthetic/pre-existing target element. The next slice should let the Owner start constructing an actual mechanism rather than editing `fixture.synthetic-linkage`.

Start with exact existing SOURCE sockets/axes. Add arbitrary geometry picking or virtual construction datums only when a concrete required JV hardpoint cannot be represented by existing exact datums.

Keep the slice small: element creation + ownership/selection/history semantics first; do not simultaneously implement the whole suspension, final representation system or kinematic solver.

## Validation and Owner boundary

Remaining manual checks that are useful but **do not block technical progress**:

- full Owner `Commit adopted frame -> move -> mixed multi-step Undo/Redo` after the fix;
- Owner `Save As -> reopen -> exact SOURCE relink` in the same real workflow.

Do not create another large diagnostic gate just to force these checks. Automate compiler/runtime/browser facts; ask the Owner for spatial/product judgment when it adds information.

PR #2 stays draft/unmerged until the Owner explicitly promotes it. Do not silently move `main` because CI is green.

## Foundation exit criterion

Foundation is complete when the Owner can take a real JV mechanism and, without agent-side coordinate guessing:

`place/inspect exact SOURCE -> create authored elements/frames/mechanical intent -> map representation -> kinematically test/reset -> save/reopen -> export a small consumer-facing result`.

After that, the permanent operating rhythm is:

`real need -> small vertical slice -> targeted test -> owner-visible gate when needed -> next`.
