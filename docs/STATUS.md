# Status

## Current state

The owner-tested Rig foundation remains the accepted JURE baseline. Experimental Map authoring remains isolated on draft PR #5; `main` is unchanged by this lane.

- accepted base: `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`
- active lane: `agent/map-workspace-foundation`
- PR #5: draft, unmerged
- active grounding contract: `docs/FOUNDATION_GROUNDING_2026-08-18.md`

Acceptance is scoped. A passed interaction slice does not accept the whole PR, the final Map ontology, or a unified JURE shell.

## Accepted interaction evidence

### Box Face Resize V2 — OWNER PASS

Owner-tested checkpoint: `f418eef579e9073bc0ea793cdf58862dc0598548`.

Accepted scope:

- explicit signed local box faces (`axis + side`);
- opposite-face-fixed default Resize;
- `Alt` center/symmetric mode inside the same frozen-baseline drag;
- accepted `face plate -> axis stem -> grip` interaction language;
- normal pointer-release commit plus Undo/Redo;
- exact numeric Dimensions remain center-preserving;
- no generic authored `pose.scale`.

World Resize, capsule semantics, mesh/scan scale semantics and final Map ontology remain outside this PASS.

### Map World/Local Move/Rotate — OWNER PASS

Product checkpoint: `9ceb9bdff6ef56a2112f65e800a6b5c2051922eb`.

Accepted scope:

- stored Move/Rotate preference is `world | local` presentation state;
- Move/Rotate use the selected space;
- Resize is always Local and does not overwrite the Move/Rotate preference;
- the space toggle is disabled during Resize and authored preview;
- transform-space changes do not author `MapDocument`;
- World Resize remains intentionally undefined.

Machine evidence and owner evidence remain distinct. The latest real World/Local test is explicitly owner-classified PASS, but its later raw recording is not preserved in the repository; do not invent unrecorded checklist observations.

## Accepted Rig baseline

The Rig workspace remains the regression/reference baseline for:

- rigid `RigElement` / owner-local `RigFrame` authoring;
- Move/Rotate World/Local and exact numeric editing;
- preview/commit/cancel and Undo/Redo;
- deterministic RigDocument Save/Open;
- inspection camera and Focus/Fit helpers;
- read-only SOURCE inspection/provenance;
- viewport-first navigator / viewport / inspector workbench behavior.

Any future JURE unification must preserve these behaviors.

## Experimental Map foundation — demonstrated before MAP-ENTITY-01

- independent `MapDocument` authored truth;
- metre/right-handed `+X` forward, `+Y` up, `+Z` right basis;
- stable authored IDs and fail-closed validation;
- rigid poses without generic authored scale;
- P0 box/capsule geometry;
- deterministic Map parse/serialize;
- shared generic `EditorSession<Document>` with domain-owned commands;
- Map viewport selection, OrbitControls, Move/Rotate, preview/commit/cancel, Undo/Redo and Fit Map;
- symmetric Rig <-> Map routing;
- exact box Dimensions;
- owner-passed signed-face Box Resize V2;
- owner-passed World/Local Move/Rotate.

## 2026-08-20 direction challenge

The previously selected next falsifier was MAP-PERSIST-01 (real Map Save/Open). That ordering was challenged before implementation.

The strongest counter-evidence was:

1. Rig already proves the real browser/file lifecycle pattern, including Open, Save, Save As, committed-only persistence and stale-file protection.
2. Map already proves deterministic canonical parse/serialize, validation and malformed-input fail-closed behavior in core tests.
3. The Map workspace still booted from a fixed `SYNTHETIC_MAP` and had never proved that users could change document structure itself.

Therefore persistence remained important but had lower immediate information value than proving that `MapDocument` is a dynamically authored world rather than only a fixed manipulation fixture.

**Decision: correct the order, do not discard persistence.**

## MAP-ENTITY-01 — minimal structural lifecycle

### Hypothesis

A Map entity can be duplicated and deleted as authored `MapDocument` structure while preserving stable identity, domain-owned semantics, normal `EditorSession` history and safe non-authored selection state.

### Frozen minimum contract

- Duplicate copies an existing authored entity exactly except for a new ID and display name.
- Duplicate does not invent new geometry defaults or a Create taxonomy.
- The experimental ID allocator is deterministic and collision-safe across both entity and spawn IDs.
- The current provisional form is `<source-id>.copy.N`; it is evidence infrastructure, not the final JURE identity scheme.
- Duplicate/Delete are normal committed domain commands and increment document revision through `EditorSession`.
- Delete of a selected entity clears presentation selection rather than serializing selection into document history.
- Undo after Delete restores the exact same authored entity and ID.
- Undo that removes a selected duplicate must reconcile selection safely instead of leaving a stale target/gizmo.
- Existing Move/Rotate/Resize semantics must work on the duplicated entity without mutating its source.
- Active preview blocks structural Duplicate/Delete.

### Implementation checkpoint

Product/evidence checkpoint before documentation closeout:

`caa5f94c677d236e46a7de52c10b3fe5f216f6dd`

Implemented there:

- `src/features/map-entity/command.ts` with deterministic duplicate planning, deep authored copy and fail-closed Delete;
- Map Workspace Duplicate/Delete controls;
- safe selection reconciliation across Delete and history transitions;
- dedicated lifecycle core tests;
- owner-preview instructions retargeted from the old World/Local gate to MAP-ENTITY-01.

The lifecycle test covers:

`Duplicate -> Move -> Resize -> Delete -> Undo -> Redo`

and additionally checks deterministic identity allocation, global collision with spawn IDs, exact restoration, source non-mutation and stale-assumption fail-closed behavior.

### Acceptance state

- implementation: **complete at the checkpoint above**;
- static/code review: **complete**;
- final exact-head CI: **must be read from live workflow evidence after this documentation closeout**;
- real owner interaction gate: **pending until the generated MAP-ENTITY-01 owner preview is exercised**.

Do not label MAP-ENTITY-01 OWNER PASS before that real interaction gate.

### Owner gate

At minimum verify in the real browser:

1. duplicate Ground slab -> a third entity appears and the new copy is selected;
2. ID is `entity.ground.copy.1` and starting authored data matches the source;
3. Move/Rotate/signed-face Resize affect only the copy;
4. Delete clears the copy and stale selection/gizmo safely;
5. Undo restores the edited copy with the exact same ID;
6. Redo removes it again;
7. another duplicate avoids collision and advances deterministically;
8. Undo of a currently selected newly-created duplicate leaves no stale selection;
9. existing World/Local, Box Resize, Dimensions, capsule non-support and Rig <-> Map navigation regressions remain normal.

## Corrected next ordering

If MAP-ENTITY-01 passes its owner gate, the next evidence sequence is:

1. **MAP-PERSIST-01** — real owner-facing Save/Open, now exercised on genuinely user-shaped Map structure rather than only the original fixture;
2. **second geometry falsifier** — likely Capsule Resize, if still highest-value against the frontier;
3. **first non-primitive representation** — challenge primitive-only Map assumptions;
4. consumer/large-map boundaries when enough authored meaning exists.

The owner has proposed that after the current structural problem is genuinely resolved, a separate stage should fundamentally examine and unify JURE's visual language, UI, shared core and Rig/Map workbench. That proposal is **not yet implementation authority**. Before starting it, re-evaluate its blast radius against the accepted Rig baseline, experimental Map state and remaining foundation falsifiers. Do not let shell/core unification silently promote provisional Map ontology or erase domain boundaries.

## Open model/product boundaries

Still not grounded as owner-accepted product behavior:

- MAP-ENTITY-01 until its real owner gate passes;
- owner-facing deterministic Map Save/Open;
- capsule geometry authoring;
- any non-primitive representation;
- World Resize semantics;
- mesh/scan transform/scale semantics;
- final identity/naming policy;
- final JURE MapPackage / consumer lowering;
- large-map/E2R performance;
- final unified Rig/Map shell and visual system.

## Known tooling debt

- no `package-lock.json`; transitive installs are not fully reproducible;
- current Vite output has a large client-chunk warning;
- Map preview rebuilds the full primitive display projection on each preview document update; acceptable for the tiny fixture, unproved at E2R scale;
- screenshots and Windows owner-preview packaging are evidence scaffolding, not permanent product infrastructure.
