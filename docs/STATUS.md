# Status

## Authority

Accepted product authority remains:

`main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`

Active recovery line:

`work/real-use-foundation-recovery`

Latest CI-green product checkpoint before this STATUS update:

`94bb914a273ecfcfaca6183c690365ff6eb77f1c`

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

Status: **WIRED / CANONICAL AUTOMATED PASS / OWNER WORKFLOW GATE PARTIALLY FALSIFIED BY UI CONFUSION**.

Current intended slice:

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

Recovery branch CI owns automated validation before Owner interaction testing:

- Node `24.16.0`;
- npm `11.17.0`;
- `npm install`;
- `npm run check`;
- all `tests/core/*.test.mjs` discovered deterministically;
- read-only GitHub token permissions;
- checkout/setup-node pinned by full action commit SHA.

Owner machine is no longer the normal compiler/test runner. Owner gates are reserved for Windows/browser/spatial/product validation that CI cannot establish.

## Canonical automated evidence

Recovery CI on `92c0bf0cff5f103cfa28e98e724c62410acc23bf` established:

- TypeScript project check: PASS;
- 22 discovered core test files;
- **115 tests PASS / 0 FAIL**;
- Vite 8.1.5 production build: PASS, 60 modules transformed.

Build emitted one non-blocking delivery warning: main JS bundle is about 943 kB minified / 248 kB gzip. Record for later performance work; do not divert RU-1C into code splitting before real owner workflow validation.

The later owner-clarity cleanup checkpoint `94bb914a273ecfcfaca6183c690365ff6eb77f1c` also passed the same Recovery CI.

## 2026-08-16 Owner browser evidence — important classification

Owner supplied a six-screenshot sequence showing:

1. no representation binding;
2. legacy `Bind visual preview` activated for SOURCE `Chassis_Top` and authored element `Link`;
3. authored element moved with BIND-00 active;
4. authored element moved again with BIND-00 active;
5. first Undo;
6. second Undo.

Observed effect: Undo appears to reset/snap SOURCE representation state.

Critical classification:

**OWNER OBSERVED / LEGACY-PATH CONFUSION — NOT EVIDENCE OF `ProjectSession` SOURCE-PLACEMENT FAILURE.**

Why:

- screenshots show the active project remained `project.synthetic` / `fixture.synthetic-linkage`, not the prepared RU-1C owner project;
- screenshots show `BIND-00 · legacy transient` before Undo;
- App explicitly cleared transient `representationBinding` before every durable Undo/Redo;
- therefore the first Undo combined a durable authored-history change with disappearance of the transient BIND-00 visual deformation, producing a large visual snap;
- the intended SOURCE placement -> adoption -> chronological history path was not actually exercised by this screenshot sequence.

The failure is still real at the product/UI level: legacy BIND-00 was visible next to the new SOURCE -> AUTHORED workflow and was easy to mistake for current rigging behavior.

## Owner-clarity correction

CI-green checkpoint:

`94bb914a273ecfcfaca6183c690365ff6eb77f1c`

Changes:

- startup `project.synthetic` is visibly marked **DEMO / SYNTHETIC FIXTURE** in the top bar;
- legacy `Bound` layer control is hidden from the active Rig navigator;
- legacy `Bind visual preview` UI is quarantined behind a disabled owner-facing flag;
- BIND-00 proof implementation remains in code/tests as historical evidence and is not reinterpreted as current representation architecture;
- no `ProjectSession`, SourceInstance placement, adoption, serializer or renderer semantics were changed because the screenshot evidence did not justify such changes.

## Validation boundary

Demonstrated now:

- exact current JV source identity;
- canonical TypeScript/build/test pass;
- tested RU-1A/B/C semantic invariants;
- real Owner evidence that legacy BIND-00 must not share the active RU-1 workflow surface.

Still not demonstrated in the Owner browser:

- actual placed SourceInstance Move/Rotate history without BIND-00;
- SOURCE datum marker following placed SourceInstance;
- adoption Preview/Cancel/Commit on the intended owner project;
- mixed chronological history across SOURCE placement -> frame adoption -> authored frame move;
- Save/Open/exact relink after that workflow.

## Immediate next gate

Do not add another feature pile and do not debug BIND-00.

Run one clean browser/spatial gate against exact CI-green checkpoint `94bb914a...`, with legacy BIND controls absent and with the top bar confirming a non-demo owner project before SOURCE editing.

If that gate passes, close RU-1C and select the next slice from real JV need. The current highest-leverage candidate is **owner creation of authored RigElements/frames for a real mechanism**, because RU-1C can only adopt a datum onto an already existing RigElement. Arbitrary geometry picking/construction datums should follow only when the real JV source lacks suitable exact sockets/axes.

## Foundation exit criterion

Foundation is complete only when the Owner can take a real JV mechanism and, without agent-side coordinate guessing, place/inspect exact source assets, author required elements/frames/mechanical intent, map representation, kinematically test/reset, save/reopen and export a small consumer-facing result.

Then return to:

`small need -> small vertical slice -> targeted test -> owner-visible gate -> next`.
