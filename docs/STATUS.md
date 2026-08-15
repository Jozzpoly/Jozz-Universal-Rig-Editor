# Status

## Authority

Accepted product authority remains:

`main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`

Active recovery line:

`work/real-use-foundation-recovery`

Latest canonical code/test checkpoint before this STATUS update:

`92c0bf0cff5f103cfa28e98e724c62410acc23bf`

`main` has not been promoted or modified by RU-1.

## Product purpose

JURE is an owner-first spatial engineering workbench. Its durable job is to let the owner inspect real source assets, create/correct authored rig truth, express mechanical/representation intent and test it without agent-side coordinate guessing and without SOURCE, renderer or consumer runtime becoming authored truth.

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

Canonical tests cover adoption snapshots, exact provenance fail-closed behavior, multiple SourceInstances, shared SOURCE/authored Undo history, preview/commit/cancel, exact relink, runtime selection identity and deterministic project save/reopen.

Owner decision remains one durable history, e.g.:

`Move SOURCE -> Move authored frame -> Undo frame -> Undo SOURCE -> Redo SOURCE -> Redo frame`

## RU-1C — first SOURCE -> AUTHORED gate

Status: **WIRED / CANONICAL AUTOMATED PASS / MANUAL BROWSER-SPATIAL VALIDATION NEXT**.

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
- BIND-00 is legacy transient representation evidence;
- final representation and kinematic TEST are not part of RU-1C;
- current layout is an engineering harness, not final UI authority.

## Exact real SOURCE evidence

Historical BIND-00 external fixture:

`OneSided_Steering_Suspension_Rig.gltf`

SHA-256:

`fc1e8bd0e298a66fa79c43324708e281073ea8fb7a7aad2728702653705c0ee1`

Canonical current JV/native source used by RU-1C:

`Jozzpoly/Box3d_FunProject/assets/source/OneSided_Steering_Suspension_Rig.gltf`

Git blob:

`06d5c66f6d13fb64863ab15a660f060358872291`

SHA-256 verified on Owner Windows:

`57cda983f8f728bc819460540d2ee39b1b17288ecdac1f0dc8bb1a3e6f9ab750`

Size: 64,264 bytes; expected 15-node/socket/axis-marker structure verified.

These are different exact SourceRevisions sharing a filename. Never weaken exact relink because of filename or geometry similarity.

## Validation infrastructure

Two process defects were fixed during RU-1C:

1. `scripts/test-core.mjs` previously used a stale FC8-era allow-list and omitted several RU-1 tests. It now discovers every `tests/core/*.test.mjs` deterministically.
2. Owner Windows was being used as a repeated compile/test loop. Recovery branch now has `.github/workflows/recovery-check.yml` and CI owns automated validation before Owner interaction testing.

Recovery CI:

- push to `work/real-use-foundation-recovery`;
- Node `24.16.0`;
- npm `11.17.0`;
- `npm install`;
- `npm run check`;
- read-only GitHub token permissions;
- checkout/setup-node pinned by full action commit SHA.

Owner machine is no longer the normal compiler/test runner. Owner gates are reserved for Windows/browser/spatial/product validation that CI cannot establish.

## 2026-08-15 canonical automated evidence

Owner Gate V3 exposed one remaining TS narrowing error. It was corrected with explicit null/identity checks rather than casts/non-null assertions.

First Recovery CI then ran the full current test set and found one failure in `roundtrip-contract.test.mjs`. Investigation showed product serialization was correct: canonical serialization sorts SourceInstances by stable ID, while the test incorrectly assumed array index 0 still meant `instance.wheel`. The test was changed to assert by stable identities; product semantics were not changed.

Recovery CI on exact checkpoint `92c0bf0cff5f103cfa28e98e724c62410acc23bf`:

- Node `v24.16.0`: PASS;
- npm `11.17.0`: PASS;
- dependency install: PASS, 0 vulnerabilities reported;
- TypeScript project check: PASS;
- 22 discovered core test files;
- **115 tests PASS / 0 FAIL**;
- Vite 8.1.5 production build: PASS, 60 modules transformed.

Build emitted one non-blocking delivery warning: main JS bundle is about 943 kB minified / 248 kB gzip. Record for later performance work; do not divert RU-1C into code splitting before real owner workflow validation.

## Validation boundary

Demonstrated now:

- exact current JV source identity;
- current TypeScript wiring compiles on canonical toolchain;
- all current core tests execute and pass;
- production build succeeds;
- tested RU-1A/B/C semantic invariants pass.

Not demonstrated yet:

- latest exact checkpoint in Owner Windows/browser;
- spatial correctness and feel of SOURCE placement;
- visual datum placement after SourceInstance transforms;
- Preview/Cancel/Commit usability;
- browser Save/Open/relink interaction;
- final representation or TEST workflow.

## Immediate next gate

Do not add another feature pile and do not send the Owner another compile/test gate.

Next is a browser/spatial Owner gate only. Validate SOURCE placement, chronological Undo/Redo, datum marker placement, adoption Preview/Cancel/Commit, frame Undo/Redo, Save/Open and exact relink.

Only after that select the next slice from observed friction. Likely candidates remain virtual frame creation, geometry picking/construction datums, multi-instance browsing, or the first real representation requirement.

## Foundation exit criterion

Foundation is complete only when the Owner can take a real JV mechanism and, without agent-side coordinate guessing, place/inspect exact source assets, author required elements/frames/mechanical intent, map representation, kinematically test/reset, save/reopen and export a small consumer-facing result.

Then return to:

`small need -> small vertical slice -> targeted test -> owner-visible gate -> next`.
