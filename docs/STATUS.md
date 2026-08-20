# Status

## Current state

The owner-tested Rig foundation remains the accepted JURE baseline. Experimental Map authoring remains isolated on draft PR #5; `main` is unchanged by this lane.

Active branch:

`agent/map-workspace-foundation`

Accepted base for this experiment:

`main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`

Last independently verified pre-closeout PR head:

`41d7104d1e9ee99ab51a04ae2e27ab0d1456c964`

Active grounding contract:

`docs/FOUNDATION_GROUNDING_2026-08-18.md`

### Epistemic closeout — 2026-08-20

The previous repository state was internally stale: it correctly recorded Box Face Resize V2 as owner-accepted, but still described Map World/Local Move/Rotate as an owner gate pending and therefore treated Capsule Resize as the automatic next step after that gate.

This takeover independently re-verified the live refs, implementation path, tests and exact workflows before changing status. The corrected state is:

- **Box Face Resize V2: OWNER PASS**, scoped to the tested signed-local-face interaction described below;
- **Map World/Local Move/Rotate: OWNER PASS**, scoped to the implemented Move/Rotate transform-space contract described below;
- **World Resize: undefined / not accepted**;
- **Capsule Resize: not accepted and not automatically selected as next work**;
- **PR #5 remains draft and unmerged**.

Machine evidence and owner evidence remain distinct. In particular, the repository does not contain a separate raw recording or later PR conversation comment for the newest World/Local owner test. The owner explicitly classified that latest real test as accepted during the 2026-08-20 takeover. Repository verification independently confirms the exact implementation and technical evidence supporting that tested slice; it does not invent unrecorded manual observations.

## Box Face Resize V2 — OWNER PASS

Owner-tested delivery checkpoint:

`f418eef579e9073bc0ea793cdf58862dc0598548`

The first Face Resize V2 owner pass was **not** accepted: real Windows/browser testing found that releasing `Alt` could cancel an active drag and that the raw detached-cube controls were too ambiguous. That `ALMOST PASS / HOLD` evidence remains important because it proves the synthetic tests alone were insufficient.

The later closeout corrected that interaction layer while preserving the authored model. Current accepted scope is:

- signed local face Resize is practically usable;
- default opposite-face-fixed behavior is accepted;
- `Alt` temporarily switches the same frozen-baseline drag to center/symmetric Resize and can return to anchored mode without starting a new command;
- revised `face plate -> axis stem -> grip` controls are accepted for continued development;
- pointer release commits normally;
- Undo/Redo remains valid;
- exact numeric Dimensions remain center-preserving authored input;
- Resize authors box geometry plus the rigid-center shift required by the anchored-face invariant; it does not introduce generic authored `pose.scale`.

The repository records a final real-browser owner re-test and a recording showing repeated anchored/center status transitions followed by commit. The raw recording itself is not stored as repository evidence, so acceptance must not be expanded beyond the recorded interaction contract.

World Resize, capsule semantics, mesh/scan scale semantics, final Map ontology and JV/JV-Web lowering remain outside this PASS.

## Map World/Local Move/Rotate — OWNER PASS

Latest product-code checkpoint:

`9ceb9bdff6ef56a2112f65e800a6b5c2051922eb`

Last verified evidence/documentation head before this closeout:

`41d7104d1e9ee99ab51a04ae2e27ab0d1456c964`

The implemented contract is:

- stored Move/Rotate preference is `world | local` interaction state, not `MapDocument` authored truth;
- Move/Rotate effective space equals that preference;
- initial preference is World;
- Resize effective space is always Local because it manipulates authored local signed faces;
- entering Resize does not overwrite the Move/Rotate preference;
- `Local -> Resize(Local) -> Move/Rotate` returns Local;
- `World -> Resize(Local) -> Move/Rotate` returns World;
- the space toggle is disabled during Resize and while an authored preview is active;
- changing transform space does not create a document revision;
- World Resize remains intentionally undefined rather than faked through Three scale.

The authority path remains:

`Map UI interaction state -> MapViewport -> MapViewportController -> effectiveMapTransformSpace() -> Three TransformControls.setSpace()`

for rigid Move/Rotate proposals, followed by:

`authored rigid pose command -> EditorSession preview/commit`

Resize stays on the separate custom signed-face path. Three objects and controls are disposable projections and never authored authority.

### Independently verified machine evidence

Product head `9ceb9bd...` / workflow run `32195783257`:

- strict TypeScript PASS;
- core suite **49/49 PASS**;
- Vite production build PASS;
- default Rig browser render smoke PASS;
- Map browser render smoke PASS;
- generated Windows owner-preview + HTTP smoke PASS.

The transform-space tests prove that Move/Rotate honor either preferred space and that Resize resolves to Local without mutating the stored preference.

Exact pre-closeout PR head `41d7104...` also completed the full `check` workflow successfully in run `32197256235`.

Code inspection additionally confirms that the UI stores the preference separately, disables the toggle at the intended boundaries, and the viewport controller actually forwards the effective value to `TransformControls.setSpace()` rather than merely changing a label.

### Owner acceptance boundary

The latest real World/Local owner test is classified by the owner as **PASS**. This promotes the implemented Move/Rotate World/Local behavior from technically green to accepted interaction behavior.

Because the later raw owner-test trace is not currently preserved in GitHub, do **not** infer that every old checklist item was individually re-observed unless separately evidenced. The accepted claim is the tested product behavior above, not World Resize, generic transform-space infrastructure, capsule behavior or broader Map-foundation completion.

## Accepted Rig baseline

The accepted Rig workspace remains the regression/reference baseline for:

- rigid `RigElement` and owner-local `RigFrame` authoring;
- Move/Rotate with World/Local and exact numeric editing;
- preview/commit/cancel and Undo/Redo;
- deterministic RigDocument save/open;
- free inspection camera and Focus/Fit helpers;
- read-only glTF/GLB SOURCE inspection and provenance;
- viewport-first resizable/collapsible navigator/viewport/inspector workspace.

Later interface unification must preserve this behavior.

## Experimental Map foundation — currently demonstrated

- independent `MapDocument` authored truth;
- metre/right-handed `+X` forward, `+Y` up, `+Z` right basis;
- stable authored IDs;
- rigid position+rotation poses with no generic authored scale;
- P0 box/capsule geometry;
- deterministic parse/serialize and fail-closed validation;
- shared generic `EditorSession<Document>` with domain-owned commands;
- Map viewport projection, selection, OrbitControls, Move/Rotate, preview/commit/cancel, Undo/Redo and Fit Map;
- symmetric Rig <-> Map workspace routing;
- exact box `Dimensions · m` authoring through `halfExtents`;
- owner-passed signed-face Box Resize V2;
- owner-passed World/Local Move/Rotate with explicit Local-only Resize boundary;
- dedicated Map navigator/inspector, still intentionally separate from the accepted Rig shell during interaction grounding.

Current box Resize authority path:

`custom signed face control -> pointer ray / authored local face axis proposal -> frozen-baseline face-resize planner -> atomic pose + halfExtents command -> EditorSession preview/commit`

Current Move/Rotate authority path:

`Three TransformControls proposal -> authored rigid pose command -> EditorSession preview/commit`

## Open model/product boundaries

Current `box | capsule` entities are primitive falsifiers, not final Map ontology. Architecture must remain open to parametric obstacle recipes, terrain/heightfield, imported mesh/scan geometry and semantic layout constructs without pre-building a universal scene/ECS/plugin framework.

Still not grounded as owner-accepted product behavior:

- capsule geometry authoring;
- create/delete/duplicate lifecycle;
- owner-facing deterministic Map save/open;
- any real non-primitive representation;
- World Resize semantics;
- mesh/scan transform/scale semantics;
- consumer lowering / final JURE MapPackage;
- large-map/E2R performance;
- final unified Rig/Map shell.

## Selected next falsifier — MAP-PERSIST-01

**Real owner-facing `MapDocument` Save/Open is the next falsifier. No implementation is part of the 2026-08-20 takeover/selection closeout.**

### Why this beats Capsule Resize now

The current Map workspace still boots from hard-coded `SYNTHETIC_MAP` and presents itself as `unsaved`. Core code already proves deterministic canonical `serializeMapDocument()` / `parseMapDocument()`, but that is not evidence that a real authored map survives an actual browser/file lifecycle.

A second primitive Resize would deepen geometry interaction while leaving the more fundamental claim — that `MapDocument` is durable authored authority rather than a disposable manipulation fixture — untested.

MAP-PERSIST-01 also increases the value of every later falsifier: capsule, entity lifecycle and non-primitive experiments can produce owner-created states that are actually saved, closed and reopened.

### Hypothesis

The current `MapDocument` + `EditorSession` boundary can survive a real file lifecycle without renderer state, preview state, selection state or stale history leaking into authored persistence.

### Minimum experiment contract

- reuse existing deterministic Map parse/serialize and validation; do not change schema merely to add file UI;
- save only committed authored truth, never transient preview/proxy state;
- opening a valid map creates a fresh editor session from the parsed document rather than inheriting old preview/Undo/Redo state;
- invalid/malformed open fails closed and leaves the currently authored map untouched;
- selection/camera/transform-space are presentation state and are not serialized into `MapDocument`;
- no generic cross-workspace document-I/O framework is extracted solely for this slice;
- accepted Rig Save/Open remains the regression baseline.

### Required falsifiers

At minimum verify:

1. Move/Rotate/World/Local and Box Face Resize edits can be saved and reopened exactly as authored;
2. canonical save -> parse -> canonical save is byte-stable for the real edited file;
3. active preview cannot silently enter the saved file;
4. malformed/invalid file cannot replace or partially mutate the current session;
5. opening a valid file does not retain stale undo/redo history from the previous map;
6. renderer/proxy/UI state is absent from the serialized document;
7. Rig workspace behavior remains unchanged.

Owner gate should include a real browser save, further destructive edits, reopen of the saved map and visual/numeric confirmation that the earlier authored state returns exactly.

### Explicit non-goals

- Capsule Resize;
- create/delete/duplicate;
- autosave/recent-files/project manager;
- final Map package/extension decision beyond the current schema evidence;
- shared universal file framework;
- Stage-2 shell redesign;
- terrain/mesh/scan authoring;
- consumer lowering.

## Known tooling debt

- no `package-lock.json`; transitive installs are not fully reproducible;
- current Vite output reports a large client chunk warning;
- Map preview rebuilds the full primitive display projection on each preview document update; acceptable for the tiny fixture, unproved at E2R scale;
- PR browser screenshots and Windows owner-preview packaging are evidence scaffolding, not permanent product infrastructure.
