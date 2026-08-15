# Status

## Authority

Accepted product authority remains:

`main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`

Active recovery line:

`work/real-use-foundation-recovery`

Latest fully validated product checkpoint before this STATUS update:

`7253b50f9f41ee9467dda6399c8c7e8e58757c23`

`main` has not been promoted or modified by RU-1. PR #2 remains the draft recovery PR.

## Product purpose

JURE is an owner-first spatial engineering workbench. Its durable job is to let the owner inspect exact real source assets, create/correct authored rig truth, express mechanical/representation intent and test it without agent-side coordinate guessing and without SOURCE, renderer or consumer runtime becoming authored truth.

JV/JV-Web is the first real consumer/falsifier, not automatic authored truth.

## Durable KEEP

- `RigDocument` is authored rig truth.
- `RigElement` / `RigFrame` use rigid position + quaternion rotation; no scale in mechanical pose.
- SOURCE / AUTHORED / PREVIEW / EVALUATED / display runtime are different meanings.
- `SourceRevision` is exact immutable source identity: SHA-256 + adapter identity/version + revision ID.
- filename/label/URI/visual similarity are not source identity.
- `SourceInstance` is one independently placed use of a SourceRevision.
- `SourceAdoptionRecord` is immutable historical evidence of explicit SOURCE -> AUTHORED adoption.
- durable edits use one chronological `ProjectSession` Undo/Redo history.
- selection, camera, layout, runtime relink and TEST/evaluator state are outside durable history.
- runtime object URLs/file handles are never project truth.
- current relation vocabulary and `rigid | aim | span` representation vocabulary remain provisional.

## RU-1A / RU-1B

Status: **IMPLEMENTED / CANONICAL TESTED**.

Canonical tests cover adoption snapshots, exact provenance fail-closed behavior, multiple SourceInstances, one SOURCE/authored Undo history, preview/commit/cancel, exact relink, runtime selection identity and deterministic project save/reopen.

Owner decision remains one durable history, e.g.:

`Move SOURCE -> Move authored frame -> Undo frame -> Undo SOURCE -> Redo SOURCE -> Redo frame`

## RU-1C — first SOURCE -> AUTHORED crossing

Status: **IMPLEMENTED / CANONICAL + CROSS-PLATFORM BROWSER GREEN / OWNER OBSERVED PARTIAL**.

Current slice:

`open/import project`
`-> open exact SOURCE`
`-> create/reuse placed SourceInstance`
`-> Move/Rotate SOURCE placement`
`-> inspect exact SOURCE nodes`
`-> select existing RigElement`
`-> Preview SOURCE datum as owned RigFrame`
`-> Commit/Cancel`
`-> unified Undo/Redo`
`-> Save/Open`
`-> exact SOURCE relink`

Deliberate limits:

- one active SourceInstance in current UI;
- adoption targets an existing RigElement;
- no arbitrary surface/vertex picking;
- no free virtual/derived construction datum workflow;
- final representation and kinematic TEST are not part of RU-1C;
- current layout is an engineering harness, not final UI authority.

## Exact real SOURCE

Canonical current JV/native source used by RU-1C:

`Jozzpoly/Box3d_FunProject/assets/source/OneSided_Steering_Suspension_Rig.gltf`

- Git blob: `06d5c66f6d13fb64863ab15a660f060358872291`
- SHA-256: `57cda983f8f728bc819460540d2ee39b1b17288ecdac1f0dc8bb1a3e6f9ab750`
- size: 64,264 bytes
- expected 15-node/socket/axis-marker structure verified.

Historical BIND-00 external fixture with SHA-256 `fc1e8bd0...` is a different exact SourceRevision. Never weaken exact relink because filenames or geometry look compatible.

## Validation infrastructure

Recovery CI owns automated validation before Owner interaction testing:

- Node `24.16.0`, npm `11.17.0`;
- `npm install` + `npm run check`;
- all `tests/core/*.test.mjs` discovered deterministically;
- real-source Chrome interaction probe on Linux;
- same real-source interaction probe on `windows-latest` + installed Chrome;
- read-only GitHub token permissions;
- checkout/setup-node actions pinned by full commit SHA.

Owner Windows is no longer used as a repeated compiler/debugger.

Current canonical core result at `7253b50f...`:

- TypeScript: PASS;
- 22 core test files;
- **116 PASS / 0 FAIL**;
- production Vite build: PASS.

The build still emits a non-blocking delivery warning: main JS bundle is about 944 kB minified / 248 kB gzip. Record for later performance work; do not divert current JURE authoring work into code splitting.

## Legacy BIND-00 owner-clarity correction

Owner screenshots first exposed that legacy transient `Bind visual preview` was easy to confuse with the current SOURCE -> AUTHORED path. That sequence did **not** prove a ProjectSession SOURCE-history failure: App cleared transient BIND-00 on Undo, creating a large visual snap.

Correction retained BIND-00 only as historical proof while removing it from the normal Owner-facing RU-1 path:

- startup synthetic project is visibly marked **DEMO / SYNTHETIC FIXTURE**;
- legacy `Bound` control is hidden;
- legacy `Bind visual preview` is quarantined.

## 2026-08-16 Owner browser evidence — SOURCE history

Owner then exercised the real `OneSided...gltf` through normal SOURCE placement and reported that **Undo correctly restored the SOURCE placement**.

Independent real-source browser probes now confirm on both Linux Chrome and Windows Chrome:

`SOURCE move -> Finish placement -> Undo -> Redo`

Result: **PASS**.

This closes the previous uncertainty around SourceInstance placement history.

## 2026-08-16 adoption-preview black-screen incident

Owner supplied a screenshot immediately before a blank/black workbench. It showed:

- `FRAME ADOPTION PREVIEW · transient` still active;
- rig status still `PREVIEW`;
- `Commit frame` / `Cancel` still visible;
- Owner attempted to drag the still-visible authored gizmo before Commit.

The uploaded Vite log only proved the dev server stayed healthy; the failure was client-side.

### Exact root cause

A dedicated browser regression reproduced the Owner action exactly:

`select Link + Chassis_Top -> Preview adopted frame -> drag authored gizmo WITHOUT Commit`

Before the fix it failed with the exact runtime stack:

`Another project authoring operation is already active. Commit or cancel it first.`

from:

`assertNoOtherOperation -> beginProjectRigTransform -> App state updater`

Classification:

**REAL UI <-> STATE-MACHINE BUG — NOT ProjectSession, SourceRevision, adoption-data or Windows/WebGL failure.**

The state machine was correct to reject a second operation while `source-frame-adoption` owned the preview. The UI was wrong to leave an authored transform target interactive during that preview. Before runtime fault instrumentation, that exception blanked the React root.

### Fix

Product fix:

`7253b50f9f41ee9467dda6399c8c7e8e58757c23`

During `source-frame-adoption` preview:

- authored selection is frozen;
- `selectedRigTarget` is cleared, removing the transform gizmo;
- `Cancel` restores the previous authored selection;
- `Commit` continues to let App select the newly adopted frame;
- the existing state-machine invariant against concurrent operations remains intact.

A top-level runtime fault boundary was also added earlier so future client exceptions surface their message/stack instead of producing an unexplained blank page.

### RED -> GREEN evidence

Before fix:

- dedicated `Preview -> drag without Commit` browser regression: **FAIL**, reproducing Owner stack exactly.

After fix, on Linux Chrome **and Windows Chrome**:

- `ADOPTION_PREVIEW_TRANSFORM_LOCK_PASS`;
- exact real `OneSided...gltf` load: PASS;
- SOURCE placement: PASS;
- SOURCE Undo/Redo: PASS;
- `Chassis_Top` adoption Preview/Commit: PASS;
- transform freshly committed adopted frame: PASS;
- Undo adopted-frame transform: PASS;
- `BROWSER_REAL_OWNER_PATH_SMOKE_PASS`.

This is considered a resolved blocker.

## Validation boundary / what remains genuinely Owner-specific

Demonstrated:

- exact current JV source identity;
- canonical typecheck/core/build;
- real-source SOURCE placement and Undo/Redo;
- adoption Preview conflict is fail-safe instead of crashing;
- committed adopted frame can be moved and undone;
- same interaction path passes on Linux and Windows Chrome;
- Owner has visually exercised real SOURCE placement and adoption preview.

Not yet manually demonstrated by Owner end-to-end:

- full `Commit adopted frame -> move -> mixed three-step Undo/Redo` sequence after the fix;
- Save As -> reopen -> exact SOURCE relink in the same real workflow.

These remaining manual checks should **not block technical progress or force another large diagnostic gate**. Keep PR #2 draft/unmerged until promotion evidence is sufficient, but continue the next small real-JV slice from this validated foundation.

## Next development direction

Do not add another generic feature pile and do not return to BIND-00.

Highest-leverage next slice for approaching real JV/JV-Web use:

**owner creation of authored RigElements plus frames from real SOURCE evidence.**

RU-1C can adopt a datum only onto an already-existing RigElement; the next useful step is to let the Owner begin constructing a real mechanism instead of relying on `fixture.synthetic-linkage` or an artificial owner target.

Use existing exact sockets/axes first. Add arbitrary mesh picking / virtual construction datums only when a concrete JV hardpoint cannot be represented from existing source datums.

## Foundation exit criterion

Foundation is complete only when the Owner can take a real JV mechanism and, without agent-side coordinate guessing, place/inspect exact source assets, author required elements/frames/mechanical intent, map representation, kinematically test/reset, save/reopen and export a small consumer-facing result.

Then return permanently to:

`small need -> small vertical slice -> targeted test -> owner-visible gate -> next`.
