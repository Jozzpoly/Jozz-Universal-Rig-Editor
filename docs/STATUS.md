# Status

## Authority

- **accepted baseline:** `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`;
- **clean foundation candidate:** `promotion/foundation-ready-squash-2026-08-16@4db04eee4da0216f6bd3df6b6b0c82aa20afab5a` / closed unmerged PR #3;
- **active product work:** `work/real-jv-rig-elements`;
- **latest fully machine/browser-validated product SHA:** `a8c27d246e95d666f4080c964db4238a14290a49`;
- **validated product tree:** `e0d020564c808467a05ac510c39d84c6943a56ec`;
- **latest UX checkpoint:** `checkpoint/ux01-safe-inspect-2026-08-25@a8c27d246e95d666f4080c964db4238a14290a49`;
- **SAFE-INSPECT checkpoint run:** `32887238782` — Linux PASS + Windows PASS + final checkpoint status SUCCESS;
- **Work check for the same product SHA:** `32887139268` — canonical `npm ci` + `npm run check` SUCCESS;
- **frozen DONOR-03B product/checkpoint:** `checkpoint/donor-03b-synthesis-ready-2026-08-25@53ce6cc31233cfe1b45d41081c7b58d4c8baa5c4`, tree `6dce314b3ed086998f03075a2b641be8a9988aea`, run `32846835489`;
- **Owner mating prep:** `checkpoint/owner-mating-prep-2026-08-25@99c54d8311470791b60c2dfe849f66e5bb9feb6f`, run `32866147643`;
- **previous DONOR-03A checkpoint:** `checkpoint/donor-03a-coherent-neutral-wishbone-2026-08-24@2af0e789d22eb4284e65ab2342ca933d21fe9315`, run `32782422063`;
- **historical paused product boundary:** closed PR #4; it no longer describes current work.

`main` remains untouched. PR #3 remains an explicit Owner promotion decision. Validation/recovery PRs and checkpoint branches are evidence boundaries, not promotion authority. Do not merge or promote to `main` without explicit Owner approval.

The active work branch may be documentation-only ahead of the validated product checkpoint. Resolve and compare live refs before treating its HEAD as machine-validated behavior.

## Program status — SAFE-INSPECT machine-validated, Owner recheck next

JURE is an Owner-first spatial rigging workbench and an optional authored-rig donor for JV/JV-Web. It owns authored neutral geometry, mechanical relations, representation intent and exact SOURCE provenance. JV/JV-Web owns runtime physics, forces, solver state, controls, rendering integration and release behavior.

DONOR-03A/03B remain the frozen donor evidence for the coherent neutral four-relation wishbone and the normal Owner correction path. The current product adds one deliberately narrow UX invariant on top:

> **`SELECTED != EDITING`**

Ordinary authored selection is now inspection-only. A selected RigElement/RigFrame is visually highlighted and its pose can be read, but durable pose mutation is unavailable until the Owner explicitly chooses `Edit pose`. Arming or disarming edit intent is disposable workspace state: it does not change authored revision, project history or serialization. Actual transform authoring still uses the existing `ProjectSession` preview -> commit/cancel -> Undo path.

This is the only implemented part of the broader UX-01 direction. Task context, relation-readability and explicit mating-correction surfaces are **not** implemented merely because they were previously proposed.

JV-Web remains the program priority. JURE should now use the validated SAFE-INSPECT checkpoint to obtain a cleaner Owner physical judgement before expanding UX further.

## Owner evidence — OWNER-MATING-01 and clarity falsifier

### OWNER-MATING-01

The first real manual physical-mating/usability run on the frozen DONOR-03B package did not establish physical ACCEPT or REJECT. Its durable classification remains:

> **OWNER-MATING-01 = BLOCKED_TASK_CLARITY / INFORMATION_ARCHITECTURE**

The run proved that the technical foundation was materially ahead of its information architecture. The Owner could open/relink exact SOURCE, orbit/focus, select authored and SOURCE objects, manipulate transforms, inspect diagnostics, run/reset TEST and discover adoption/construction surfaces, but the engineering harness exposed too many meanings/actions at once.

### OWNER clarity falsifier on unchanged frozen DONOR-03B

A second short Owner run deliberately changed only one input: the Owner was told which two outboard mating pairs to inspect and was asked to **inspect only, without correction**. Candidate/SOURCE/JURE bytes remained those of the frozen DONOR-03B package.

The recording provides direct primary visual evidence of a stronger blocker:

- during the clean observation/orbit portion, the project remains at frozen authored `rev 16` with `0 relation warnings`;
- selecting `Upper arm` exposes a full transform gizmo immediately while the element still has its frozen Y position `0.96875 m`;
- ordinary exploration then changes `Upper arm` Y to approximately `1.127610 m` — about `+158.86 mm` — producing `rev 17` and `2 relation warnings`;
- by the end of the short recording the project is at `rev 21` with `4 relation warnings`;
- selected `Lower arm` is shown at Y approximately `-0.11937 m`, versus frozen `+0.03125 m`, a displacement of at least about `-150.62 mm`;
- therefore an instruction whose intended operation was only inspection accumulated five durable authored revisions.

This upgrades one causal finding from plausible to directly demonstrated:

> **OWNER clarity falsifier = BLOCKED_SAFE_INSPECTION**

The previous `BLOCKED_TASK_CLARITY` classification is not erased; SAFE-INSPECT is the first proven causal slice inside it.

The Owner also reported that the four large authored element proxies appeared to be in the expected places relative to the SOURCE. Record this as **positive coarse/gross placement evidence only**. It is not equivalent to accepting the exact two spherical X-min frame-pair mating coordinates because the recording does not cleanly isolate and judge both sides of both spherical relations before accidental edits occur.

Therefore exact physical X-min mating remains **Owner-open / not yet sealed**.

## UX01-SAFE-INSPECT — implemented and machine/browser validated

Exact validated product:

`a8c27d246e95d666f4080c964db4238a14290a49` / tree `e0d020564c808467a05ac510c39d84c6943a56ec`

Checkpoint:

`checkpoint/ux01-safe-inspect-2026-08-25@a8c27d246e95d666f4080c964db4238a14290a49`

Validation:

- Work check `32887139268` — SUCCESS;
- Checkpoint browser gate `32887238782` — Linux SUCCESS, Windows SUCCESS, `checkpoint-status` SUCCESS;
- canonical core suite: 143 tests PASS on both platforms;
- exact SOURCE identity/provenance and all DONOR-03A/03B construction/outboard/wishbone/revolute/evaluator probes remain green;
- Linux and Windows browser logs both contain `BROWSER_SAFE_INSPECT_EDIT_INTENT_PASS`;
- after that marker, both platforms still complete `BROWSER_COHERENT_CANDIDATE_OPEN_RELINK_CORRECT_UNDO_PASS`.

The executable browser contract now proves:

1. selecting the canonical carrier-side upper outboard frame leaves numeric pose controls disabled;
2. inspect-only selection creates no durable Undo history;
3. explicit `Edit pose` enables pose editing;
4. arming edit intent changes neither authored revision nor history;
5. the existing `+0.01 m -> spherical residual/warning -> Undo -> exact neutral` correction path still works;
6. a freshly adopted frame remains transformable through the viewport after explicit `Edit pose`, and Undo restores it exactly;
7. selection changes disarm edit intent rather than silently carrying authoring authority to another target.

Implementation boundary:

- no kernel changes;
- no relation-semantic changes;
- no SOURCE-authority changes;
- no ProjectSession/history replacement;
- no serializer/project-schema changes;
- no consumer/JV-Web schema or runtime changes;
- no task-context framework;
- no representation binding;
- no generic picking/visibility system.

## Current machine-proven donor capability preserved

The validated line still proves:

- free and exact-SOURCE-derived `RigElement` creation;
- exact SOURCE datum -> owner-local `RigFrame` adoption;
- conservative geometry-derived point datums without invented orientation;
- right-handed constructed frames from origin + radial endpoint + independent up span;
- versioned self-resolving construction-frame locators;
- deterministic Save/Open and exact relink;
- one chronological `ProjectSession` as the only durable project history;
- Owner-facing neutral `revolute` and `spherical` creation with diagnostics and Undo/Redo;
- transient single-revolute TEST separated from authored neutral truth;
- **DONOR-03A coherent neutral wishbone:** 4 elements, 8 independently owner-local frames, 2 inboard revolutes + 2 outboard sphericals, clean diagnostics, 11 exact SOURCE adoption receipts;
- **DONOR-03B deterministic candidate artifact:** canonical project independently reopened/verified by a fresh process;
- **DONOR-03B Owner correction path:** normal `Open Project -> exact SOURCE relink -> explicit frame correction -> spherical warning/residual -> Undo -> exact neutral recovery` on Linux and Windows;
- **SAFE-INSPECT:** ordinary selection can remain read-only until an explicit edit intent is armed.

## Exact donor evidence

Pinned SOURCE:

`Jozzpoly/Box3d_FunProject@959aefb78587ce60cf2b8eb03ff82797a4165142/assets/source/OneSided_Steering_Suspension_Rig.gltf`

- Git blob: `06d5c66f6d13fb64863ab15a660f060358872291`;
- SHA-256: `57cda983f8f728bc819460540d2ee39b1b17288ecdac1f0dc8bb1a3e6f9ab750`;
- size: 64,264 bytes.

Frozen DONOR-03B candidate:

- producer: `53ce6cc31233cfe1b45d41081c7b58d4c8baa5c4` / tree `6dce314b3ed086998f03075a2b641be8a9988aea`;
- filename: `CANDIDATE__real-jv-coherent-wishbone__NOT-AUTHORITY.json`;
- project/document: `project.real-jv-coherent-wishbone` / `rig.real-jv-coherent-wishbone`;
- 4 elements / 8 frames / 4 relations / 11 exact SOURCE adoption receipts;
- candidate SHA-256 used in Owner gate: `a508a4fb5c33830adf18ba56986e9d9373b901955a1b5636494d7dfa4e17880c`;
- candidate size: 20,124 bytes;
- verifier marker: `REAL_JV_COHERENT_WISHBONE_CANDIDATE_FILE_PASS`;
- semantic status: **candidate / not yet sealed Owner ball-joint authority**.

The two outboard spherical pairs are:

- `frame.upper-arm.outboard` <-> `frame.carrier.upper-outboard`;
- `frame.lower-arm.outboard` <-> `frame.carrier.lower-outboard`.

Machine zero-residual means only that each authored pair is geometrically coincident in the neutral candidate. It does not prove that the physical location is the correct real ball-joint center.

## Physical truth boundary

For the exact unmirrored left fixture, current machine evidence establishes max-X as chassis/inboard and min-X as wheel/outboard. The X-min ends of `Chassis_Top` and `Chassis_Bottom` remain provenance-backed wheel-end mating candidates.

The Owner's latest coarse visual observation is positive: the four large authored element proxies appear plausibly placed relative to the real SOURCE. That materially weakens the hypothesis of a grossly wrong four-element layout, but it does not yet seal the exact spherical mating coordinates.

A clean post-SAFE-INSPECT Owner review should now attempt to judge both upper/lower outboard pairs without accidentally modifying the project. Final transfer into a concrete JV-Web mechanical foundation must also be challenged against sealed JV_CORE G-RIG evidence when available.

Owner-accepted JV evidence continues to distinguish:

- `Socket_ChassisMount_b` = suspension-side / non-steering structural role;
- `Socket_WheelCenter` = distinct steerable structural role;
- steering DOF exists between those roles;
- wheel spin is another distinct DOF.

## Discovered future need — representation binding

The Owner previously looked for a workflow that associates real SOURCE parts with mechanical elements so visual parts can follow mechanism TEST motion. This remains a legitimate future product need and aligns with the separate representation domain.

Current `RigElement.source` / `RigFrame.source` provenance is **not** representation binding. Historical BIND-00 evidence does not authorize rebuilding a full framework now.

Status remains:

> **DISCOVERED / IMPORTANT / DEFERRED UNTIL CURRENT MATING/UX BLOCKER IS RESOLVED**

Do not promote this need merely because SAFE-INSPECT is complete. A later Owner run must show that representation readability is actually blocking the next real task.

## Next gate — Owner SAFE-INSPECT recheck

Do **not** automatically implement the remaining original UX-01 ideas.

The next highest-information step is a real Owner run on the exact validated SAFE-INSPECT product `a8c27d24...` using the unchanged frozen DONOR-03B candidate and exact SOURCE.

Minimal Owner task:

1. Open Project and relink exact SOURCE.
2. Inspect/orbit/select the four authored element proxies and relevant outboard frames **without pressing `Edit pose`**.
3. Confirm that ordinary selection no longer exposes an active transform gizmo or enabled numeric mutation controls and that authored revision/history remain unchanged.
4. Attempt a clean physical judgement of upper and lower outboard mating.
5. If a correction is genuinely wanted, press `Edit pose` explicitly and verify that correction/Undo remains understandable.

Decision tree after that Owner run:

- **physical judgement becomes possible and acceptable:** record the Owner result and stop expanding JURE UX; feed the evidence into JV-Web synthesis, still subject to JV_CORE corroboration;
- **physical placement is clearly wrong:** use the existing explicit correction path and record corrected physical truth before any new UX system;
- **relation pairing remains unclear:** next candidate slice is minimal relation readability;
- **visibility blocks judgement:** only then consider minimal visibility/isolation support;
- **selection blocks judgement:** only then consider a minimal selection improvement;
- **authored markers cannot be related to real parts:** only then reopen a minimal representation-binding falsifier;
- **no dominant blocker:** classify INCONCLUSIVE rather than bundling several UX changes.

The previous `WorkspaceTaskContext`, general relation overlays and explicit `Correct upper/lower mating` controls remain hypotheses, not a fixed roadmap.

## Explicit non-goals now

Do not use SAFE-INSPECT success as justification to launch:

- general hierarchy/assemblies;
- general multi-relation solver;
- JURE -> JV-Web consumer schema/export;
- runtime JV substitution;
- full representation-binding framework;
- generic CAD/picking system;
- SOURCE Hide/Solo/Isolate without direct Owner evidence;
- global workspace/tab ontology;
- Map integration;
- damper/spring/cardan pipelines;
- whole-vehicle authoring.

## Semantic boundaries to preserve

SOURCE evidence proposes measurements; explicit adoption creates authored truth. Moving/relinking SOURCE never moves authored rig truth.

A construction point is not a frame. A constructed frame exists only when independent evidence supplies orientation and the derivation can be re-resolved from exact SOURCE identity.

`revolute` and `spherical` express neutral mechanical intent only. They do not contain dynamics/solver authority.

Durable `RigRelation` does not encode assembly hierarchy.

`AUTHORED NEUTRAL != transient EVALUATED motion`. Current TEST is a disposable single-revolute evaluator, not a general mechanism solver.

A JURE authoring project is not the JV-Web consumer format. Future lowering must be designed from exact JURE evidence + sealed JV_CORE G-RIG + the live JV-Web recipient contract.

## Priority / cross-project direction

JV-Web remains the program priority. Its provisional matrix currently treats exact JURE X-min mating as blocked pending clean Owner physical judgement and primary-donor corroboration.

SAFE-INSPECT was justified because a real Owner run directly proved accidental authoring during inspection. It is not authorization to continue a broad JURE UX program while JV-Web waits.

If JV_CORE or JV-Web recipient evidence changes before the next JURE product slice, re-ground and adjust rather than defending an obsolete plan.

## New-conversation takeover target

A new orchestrator should:

1. resolve live `main`, `work/real-jv-rig-elements`, `checkpoint/ux01-safe-inspect-2026-08-25`, frozen DONOR-03B and Owner-mating prep refs;
2. read canonical docs in the order `README.md -> AGENTS.md -> docs/ARCHITECTURE.md -> docs/STATUS.md`;
3. compare active work HEAD against `a8c27d246e95d666f4080c964db4238a14290a49` so docs-only continuation is not mistaken for new validated behavior;
4. preserve the distinction: DONOR-03B geometry is frozen at `53ce6cc3...`, while SAFE-INSPECT product behavior is validated at `a8c27d24...`;
5. treat `BLOCKED_SAFE_INSPECTION` as directly demonstrated by the latest Owner recording, but do not inflate coarse placement approval into exact X-min physical acceptance;
6. run the Owner SAFE-INSPECT recheck before implementing task context/relation readability/representation work;
7. keep JV-Web priority and do not freeze consumer schema or runtime integration.

Do not restart DONOR-03A/03B, do not infer physical truth from zero residual diagnostics, and do not implement the remainder of UX-01 merely because it was previously listed.

## Owner / promotion boundary

Before any promotion to `main`, independently resolve PR #3 and exact `4db04eee...`, compare with accepted `main`, retain recovery evidence and obtain explicit Owner approval. **Do not merge without explicit Owner approval.**

Permanent rhythm:

`real need -> smallest vertical slice -> targeted falsifier -> rendered/Owner gate when useful -> next`.
