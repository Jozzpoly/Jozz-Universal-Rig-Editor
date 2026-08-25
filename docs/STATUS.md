# Status

## Authority

- **accepted baseline:** `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`;
- **clean foundation candidate:** `promotion/foundation-ready-squash-2026-08-16@4db04eee4da0216f6bd3df6b6b0c82aa20afab5a` / PR #3;
- **active product work:** `work/real-jv-rig-elements`;
- **latest fully machine-validated donor SHA:** `53ce6cc31233cfe1b45d41081c7b58d4c8baa5c4`;
- **validated tree:** `6dce314b3ed086998f03075a2b641be8a9988aea`;
- **latest frozen checkpoint:** `checkpoint/donor-03b-synthesis-ready-2026-08-25@53ce6cc31233cfe1b45d41081c7b58d4c8baa5c4`;
- **validation run:** `32846835489` — Linux browser PASS + Windows browser PASS + final checkpoint status SUCCESS;
- **validation review boundary:** PR #8, evidence-only / never merge; close after evidence is recorded;
- **previous validated donor boundary:** `checkpoint/donor-03a-coherent-neutral-wishbone-2026-08-24@2af0e789d22eb4284e65ab2342ca933d21fe9315`, run `32782422063`;
- **historical paused product boundary:** closed PR #4; it no longer describes the current product head.

PR #8's validation merge ref `5e77e1e46eaf9c7f267a97622f8053a83eca24c4` and validated work head `53ce6cc31233cfe1b45d41081c7b58d4c8baa5c4` resolve to the same tree `6dce314b3ed086998f03075a2b641be8a9988aea`. The PR-triggered Linux/Windows run therefore validated the actual DONOR-03B product tree rather than a different merge composition.

`main` remains untouched. PR #2 retains recovery/foundation evidence; PR #3 remains the explicit clean promotion boundary. Validation/recovery PRs are evidence laboratories only and must never be merged. No promotion to `main` is authorized without explicit Owner approval.

## Program status — synthesis-ready donor

JURE is an Owner-first spatial rigging workbench and an optional authored-rig donor for JV/JV-Web. It owns authored neutral geometry, mechanical relations, representation intent and exact SOURCE provenance; JV/JV-Web owns runtime physics, forces, solver state, controls, rendering integration and release behavior.

The current donor has reached the intended stop point for cross-project synthesis. DONOR-03A proved a coherent neutral four-relation wishbone model. DONOR-03B proved that the same canonical project can be opened in the normal workbench, relinked to exact SOURCE, corrected through normal Owner editing, diagnosed and undone without agent-side coordinate surgery.

JV-Web has ingested this donor into its provisional cross-project Inheritance Matrix at `Jozzpoly/JV-Box3D-Web-experiment@b6f78369b7d245f73532d58b41d23d98f52862e4`. The recipient verdict is: **JURE has earned influence, not ownership**. No JURE consumer schema, direct `RigDocument` intake or runtime substitution is authorized yet.

Accordingly, active JURE feature expansion is paused until one of these provides a concrete new need:

1. Owner chooses to run the real physical mating gate/correction;
2. sealed JV_CORE G-RIG evidence requires a specific authored-rig decision;
3. JV-Web recipient synthesis proves that the current neutral lowering surface is insufficient for a concrete fragment.

Do not build hierarchy, a general solver, Map integration, new domains, generic CAD/picking, SOURCE isolation, damper/cardan pipelines or a JURE -> JV-Web export format merely to make the donor look more complete.

## Current machine-proven capability

The validated line proves:

- free and exact-SOURCE-derived `RigElement` creation;
- exact SOURCE datum -> owner-local `RigFrame` adoption;
- conservative geometry-derived point datums without invented orientation;
- right-handed constructed frames from origin + radial endpoint + independent up span;
- versioned self-resolving construction-frame locators;
- exact re-resolution, deterministic Save/Open and exact relink;
- Owner construction-recipe workflow with visible provenance;
- one physical hinge authored independently on two bodies with distinct local poses but one coincident world frame;
- Owner-facing neutral `revolute` creation with origin/+Z residual preview and one ProjectSession Undo/Redo action;
- transient revolute TEST `0° -> +30° -> Reset -> End TEST` with authored revision/history unchanged by TEST controls;
- neutral `spherical` semantics constraining shared origin only, not frame orientation;
- spherical origin residual diagnostics;
- Owner-facing `+ Spherical` creation with pre-commit residual and Undo/Redo;
- one chronological `ProjectSession` as the only durable project history;
- **DONOR-03A coherent neutral wishbone:** 4 elements, 8 independently owner-local frames, 2 inboard revolutes + 2 outboard sphericals, clean diagnostics, deterministic Save/Open and exact SOURCE relink;
- **DONOR-03B deterministic candidate artifact:** canonical JURE project emitted directly from the already-proven coherent builder, parsed and verified by a fresh process as 4 elements / 8 frames / 4 relations / 11 exact SOURCE adoption receipts;
- **DONOR-03B Owner correction path:** normal `Open Project -> exact SOURCE relink -> numeric frame correction -> spherical warning/residual -> Undo -> exact neutral recovery` in browser UI.

Validation run `32846835489` passed canonical `npm run check`, pinned exact SOURCE identity, all real-JV probes, the independent candidate-file verifier and the complete browser Owner-ready flow on Linux and Windows.

## Exact donor evidence

Pinned fixture:

`Jozzpoly/Box3d_FunProject@959aefb78587ce60cf2b8eb03ff82797a4165142/assets/source/OneSided_Steering_Suspension_Rig.gltf`

- Git blob: `06d5c66f6d13fb64863ab15a660f060358872291`;
- SHA-256: `57cda983f8f728bc819460540d2ee39b1b17288ecdac1f0dc8bb1a3e6f9ab750`;
- size: 64,264 bytes.

DONOR-03B candidate evidence:

- producer: `53ce6cc31233cfe1b45d41081c7b58d4c8baa5c4` / tree `6dce314b3ed086998f03075a2b641be8a9988aea`;
- generated filename: `CANDIDATE__real-jv-coherent-wishbone__NOT-AUTHORITY.json`;
- canonical serialized size observed in validation: 20,124 bytes;
- project/document identity: `project.real-jv-coherent-wishbone` / `rig.real-jv-coherent-wishbone`;
- 4 elements / 8 frames / 4 relations / 11 exact SOURCE adoption receipts;
- independent verifier marker: `REAL_JV_COHERENT_WISHBONE_CANDIDATE_FILE_PASS`;
- Owner browser marker: `BROWSER_COHERENT_CANDIDATE_OPEN_RELINK_CORRECT_UNDO_PASS`;
- semantic status: **candidate / not Owner-accepted ball-joint authority**.

The candidate is reproducible from the exact frozen producer and is required to serialize canonically byte-for-byte. A separate candidate-file SHA was not recorded in DONOR-03B; do not invent one after the fact or create a new validation campaign solely for that metric.

## Physical truth boundary

For the exact unmirrored left fixture, current evidence establishes max-X as chassis/inboard and min-X as wheel/outboard. The X-min ends of `Chassis_Top` and `Chassis_Bottom` are provenance-backed wheel-end **mating candidates** only.

Machine evidence proves that those candidate world frames can be independently represented in upper/lower arm local space and suspension-carrier local space, joined by neutral spherical relations, serialized deterministically, reopened, relinked and corrected through the normal Owner path.

It does **not** prove that their physical positions are the final intended ball-joint centers. Final physical mating remains **Owner-open** and must be corroborated against sealed JV_CORE G-RIG evidence before a concrete JV-Web lowering/runtime substitution is frozen.

Owner-accepted JV evidence continues to distinguish:

- `Socket_ChassisMount_b` = suspension-side / non-steering structural role;
- `Socket_WheelCenter` = distinct steerable structural role;
- steering DOF exists between those roles;
- wheel spin is another distinct DOF.

Accordingly, the current coherent donor uses `Socket_ChassisMount_b` as the suspension-side carrier reference and preserves `Socket_WheelCenter` as distinct steerable reference evidence.

## Semantic boundaries

SOURCE evidence proposes measurements; explicit adoption creates authored truth. Moving/relinking SOURCE never moves authored rig truth.

A construction point is not a frame. A constructed frame exists only when independent evidence supplies orientation and the derivation can be re-resolved from the exact SourceRevision.

`revolute` and `spherical` express neutral mechanical intent only. They do not contain mass, inertia, friction, damping, spring laws, motors, solver configuration or Box3D/native runtime identity.

Durable `RigRelation` does not encode assembly parent/child hierarchy. The coherent wishbone PASS shows that the required neutral relation graph does not require hierarchy to exist.

`AUTHORED NEUTRAL != transient EVALUATED motion`. Current TEST is a disposable single-revolute evaluator, not a general mechanism solver.

A JURE authoring project is not the JV-Web consumer format. Current cross-project evidence supports a future narrow lowering/adaptation seam, not a unified schema or direct `RigDocument` runtime intake.

## Open / deferred

### Owner-open evidence

- physical acceptance/correction of the real upper/lower outboard mating frames;
- whether SOURCE visibility, selection precision or relation readability actually block that manual gate.

Do not implement SOURCE Hide/Solo/Isolate, a generic picker or additional viewport relation visualization until the real Owner gate proves one is necessary.

### Deferred to cross-project synthesis

- deterministic JURE -> JV-Web consumer fragment/schema;
- explicit coordinate-space/root placement conversion for a real fragment;
- full-frame orientation/provenance lowering requirements;
- coherent runtime substitution;
- multi-relation mechanism evaluation;
- real damper/spring/cardan representation mapping;
- assembly hierarchy;
- Map authoring integration.

The future consumer fragment must be designed from the combination of exact JURE authored evidence, sealed JV_CORE G-RIG physical truth and the live JV-Web recipient contract. Do not freeze it from JURE alone.

## Next material trigger

There is no automatic next JURE feature slice.

The next material JURE work is one of:

1. **Owner Physical Mating Gate** — if the Owner chooses to inspect/correct the candidate or cross-project synthesis needs the physical judgement;
2. **cross-project response** — a focused change required by sealed JV_CORE G-RIG + JV-Web Inheritance Matrix evidence;
3. **independent future JURE product work** explicitly prioritized by the Owner after the JV-Web priority program allows it.

Until one of those occurs, preserve the frozen donor evidence and do not expand the donor merely for completeness.

## Owner / promotion boundary

Before any promotion to `main`, independently resolve PR #3 and exact `4db04eee...`, compare with accepted `main`, retain recovery evidence and obtain explicit Owner approval. **Do not merge without explicit Owner approval.**

Permanent rhythm:

`real need -> smallest vertical slice -> targeted falsifier -> rendered/Owner gate when useful -> next`.
