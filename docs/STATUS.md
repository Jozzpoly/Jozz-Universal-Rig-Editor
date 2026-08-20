# Status

## Current state

The owner-tested Rig foundation remains the accepted JURE baseline on `main`. Experimental Map authoring remains isolated on draft PR #5.

- accepted base: `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`
- active lane: `agent/map-workspace-foundation`
- PR #5: open, draft, unmerged
- tested MAP-ENTITY-01 owner-preview head: `5740a0510a74b98450d14ec2b7f2293ca042ce95`
- active grounding contract: `docs/FOUNDATION_GROUNDING_2026-08-18.md`
- next-stage entry contract: `docs/JURE_UNIFICATION_GROUNDING_2026-08-20.md`

Acceptance remains scoped. Passed interaction slices do not accept the whole PR, the final Map ontology, persistence, consumer lowering or a final unified JURE architecture.

## Accepted owner interaction evidence

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

World Resize, capsule resize semantics, mesh/scan scale semantics and final Map ontology remain outside this PASS.

### Map World/Local Move/Rotate — OWNER PASS

Product checkpoint: `9ceb9bdff6ef56a2112f65e800a6b5c2051922eb`.

Accepted scope:

- stored Move/Rotate preference is `world | local` presentation state;
- Move/Rotate use the selected space;
- Resize is always Local and does not overwrite the Move/Rotate preference;
- the space toggle is disabled during Resize and authored preview;
- transform-space changes do not author `MapDocument`;
- World Resize remains intentionally undefined.

### MAP-ENTITY-01 — OWNER PASS

Owner-tested exact product head:

`5740a0510a74b98450d14ec2b7f2293ca042ce95`

Machine evidence tied to that head:

- GitHub Actions `check` run #98 / run id `32415027293`: **SUCCESS**;
- strict TypeScript: PASS;
- core suite: **53/53 PASS**;
- production build: PASS;
- Rig + Map browser render evidence: PASS;
- Windows owner-preview package generation/smoke: PASS.

Owner evidence on 2026-08-20:

- owner explicitly reported that the expected behavior matched the test;
- owner supplied two detailed browser recordings from the generated MAP-ENTITY-01 preview;
- the recordings visibly exercise duplicated authored entities beyond a single happy path, including independent Ground manipulation/Resize, capsule duplication, repeated duplication, history traversal and continued manipulation after history transitions;
- no stale selection/Inspector/gizmo behavior or source/copy coupling was observed in the reviewed recordings.

Accepted MAP-ENTITY-01 scope:

- Duplicate creates an independent authored `MapEntity` copy with a new authored ID/name;
- Delete is an authored structural command;
- Duplicate/Delete participate in normal `EditorSession` revision/history;
- duplicate identity allocation is deterministic and collision-safe for the tested provisional `.copy.N` scheme;
- Undo/Redo restore/remove authored structure coherently;
- history transitions reconcile non-authored selection rather than leaving stale editor targets;
- accepted Move/Rotate/Box Resize semantics continue to operate on duplicated entities without mutating the source;
- capsule entities can be structurally duplicated even though capsule Resize remains intentionally unsupported;
- structural operations remain separate from authored selection/presentation state.

The `.copy.N` naming/identity policy remains **provisional experiment infrastructure**. MAP-ENTITY-01 does not accept Create UX, a final entity taxonomy, final naming policy or generic scene/ECS semantics.

## Structural falsifier closeout

The question behind MAP-ENTITY-01 was:

> Is `MapDocument` a dynamically authored world, or only a fixed fixture whose existing values can be manipulated?

Current evidence answers the minimum structural question positively: the user can change authored entity structure with stable command/history semantics and then continue normal geometry/transform work on the resulting entities.

**Verdict: MAP-ENTITY-01 is CLOSED / OWNER PASS.**

No further code change is justified merely to strengthen this already-passed slice.

## Accepted Rig regression baseline

The Rig workspace remains the reference baseline for:

- rigid `RigElement` / owner-local `RigFrame` authoring;
- Move/Rotate World/Local and exact numeric editing;
- preview/commit/cancel and Undo/Redo;
- deterministic RigDocument Save/Open;
- inspection camera and Focus/Fit helpers;
- read-only SOURCE inspection/provenance;
- viewport-first navigator / viewport / inspector workbench behavior.

Any JURE-wide shell/core/UI work must preserve these behaviors.

## Next activity — JURE-UNIFY-00 design / audit / freeze

The owner has selected fundamental JURE integration/unification as the next direction to examine: visual language, UI, shared core and the product relationship between Rig and Map.

The immediate next activity is therefore **JURE-UNIFY-00**, but it starts as architecture/product design and falsification, **not as a broad implementation/refactor**.

The dedicated entry contract is `docs/JURE_UNIFICATION_GROUNDING_2026-08-20.md`.

The stage must determine:

1. what belongs to one coherent JURE product shell;
2. what mechanics are genuinely shared by two proven consumers;
3. what only looks similar but has different domain semantics;
4. which accepted Rig and Map interactions form regression gates;
5. which provisional Map concepts must stay out of shared core;
6. how to unify layout, visual language and interaction affordances without merging authored domains;
7. whether MAP-PERSIST-01 should be embedded in, adjacent to or follow the first narrow unification slices.

A likely architectural direction to test is:

`shared JURE product shell / UI primitives / proven editor mechanics`

around independent domain workspaces:

`RigDocument + rig commands/adapters`

`MapDocument + map commands/adapters`

This is a hypothesis for JURE-UNIFY-00, not yet a frozen implementation architecture.

## Persistence remains required

MAP-PERSIST-01 was deferred, not rejected. MAP-ENTITY-01 passing makes it a stronger future falsifier because Save/Open can now be exercised on genuinely user-shaped Map structure.

JURE-UNIFY-00 may change sequencing, but it must not make persistence disappear from the Map foundation stop condition.

## Still-open product/model boundaries

Not yet owner-grounded as final product behavior:

- owner-facing deterministic Map Save/Open;
- capsule geometry authoring/Resize;
- first non-primitive Map representation;
- World Resize semantics;
- mesh/scan transform/scale semantics;
- final Map identity/naming policy;
- final JURE MapPackage / consumer lowering;
- large-map/E2R performance;
- final unified Rig/Map shell, design system and shared-core boundary.

## PR / integration boundary

PR #5 remains **draft and unmerged**. Passing MAP-ENTITY-01 does not automatically accept all 35 files or authorize merge of the whole experimental Map lane.

The project is ready to proceed to the next design/falsification stage while preserving:

- `main` as accepted Rig truth;
- PR #5 as isolated experimental Map evidence;
- exact owner-tested checkpoints as regression evidence;
- authored-domain separation as a hard invariant until contrary evidence exists.

## Known tooling debt

- no `package-lock.json`; transitive installs are not fully reproducible;
- current Vite output has a large client-chunk warning;
- Map preview rebuilds the full primitive display projection on each preview document update; acceptable for the tiny fixture, unproved at E2R scale;
- screenshots and Windows owner-preview packaging are evidence scaffolding, not permanent product infrastructure.
