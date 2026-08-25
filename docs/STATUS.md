# Status

## Authority

- **accepted baseline:** `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`;
- **clean foundation candidate:** `promotion/foundation-ready-squash-2026-08-16@4db04eee4da0216f6bd3df6b6b0c82aa20afab5a` / closed unmerged PR #3;
- **active product work:** `work/real-jv-rig-elements`;
- **latest fully machine-validated donor product SHA:** `53ce6cc31233cfe1b45d41081c7b58d4c8baa5c4`;
- **validated tree:** `6dce314b3ed086998f03075a2b641be8a9988aea`;
- **latest frozen donor checkpoint:** `checkpoint/donor-03b-synthesis-ready-2026-08-25@53ce6cc31233cfe1b45d41081c7b58d4c8baa5c4`;
- **DONOR-03B validation run:** `32846835489` — Linux PASS + Windows PASS + final checkpoint status SUCCESS;
- **DONOR-03B validation review boundary:** closed evidence-only PR #8, never merge;
- **Owner mating prep branch:** `checkpoint/owner-mating-prep-2026-08-25@99c54d8311470791b60c2dfe849f66e5bb9feb6f` — workflow-only child of `53ce6cc3...`;
- **Owner mating prep run:** `32866147643` — Linux PASS + Windows PASS + frozen package upload PASS;
- **previous donor checkpoint:** `checkpoint/donor-03a-coherent-neutral-wishbone-2026-08-24@2af0e789d22eb4284e65ab2342ca933d21fe9315`, run `32782422063`;
- **historical paused product boundary:** closed PR #4; it no longer describes current product work.

PR #8's validation merge ref `5e77e1e46eaf9c7f267a97622f8053a83eca24c4` and validated work head `53ce6cc31233cfe1b45d41081c7b58d4c8baa5c4` resolve to the same tree `6dce314b3ed086998f03075a2b641be8a9988aea`. The PR-triggered Linux/Windows run therefore validated the actual DONOR-03B product tree rather than a different merge composition.

`main` remains untouched. PR #3 remains the explicit clean promotion boundary. Validation/recovery PRs are evidence laboratories only and must never be merged. No promotion to `main` is authorized without explicit Owner approval.

## Program status — donor proven, first real Owner usability falsifier recorded

JURE is an Owner-first spatial rigging workbench and an optional authored-rig donor for JV/JV-Web. It owns authored neutral geometry, mechanical relations, representation intent and exact SOURCE provenance. JV/JV-Web owns runtime physics, forces, solver state, controls, rendering integration and release behavior.

DONOR-03A proved a coherent neutral four-relation wishbone model. DONOR-03B proved that the same canonical project can be opened in the normal workbench, relinked to exact SOURCE, corrected through normal Owner editing, diagnosed and undone without agent-side coordinate surgery.

JV-Web ingested this donor into its provisional Inheritance Matrix at `Jozzpoly/JV-Box3D-Web-experiment@b6f78369b7d245f73532d58b41d23d98f52862e4`. Recipient verdict: **JURE has earned influence, not ownership**. No JURE consumer schema, direct `RigDocument` intake or runtime substitution is authorized yet.

On 2026-08-25 the Owner then performed the first real manual physical-mating/usability run using the frozen DONOR-03B candidate package. The run did **not** establish ACCEPT or REJECT for the physical X-min mating candidates. It instead exposed an earlier blocker:

> **OWNER-MATING-01 = BLOCKED_TASK_CLARITY / INFORMATION_ARCHITECTURE**

This is now the current material JURE product finding.

The important distinction is:

- **machine/browser evidence proved operability** — Open Project -> exact relink -> edit -> residual/warning -> Undo works;
- **real Owner evidence falsified comprehensibility** — the ordinary engineering harness does not yet make the physical-mating task sufficiently clear or safe to judge quickly without understanding JURE's internal domain boundaries.

Therefore the physical mating positions remain **UNKNOWN / Owner-open**. Do not reinterpret the Owner run as evidence that the X-min candidates are right or wrong.

## Owner usability evidence — 2026-08-25

The Owner supplied two screen recordings: a short setup/check and a longer free exploration of the frozen candidate. The recordings are out-of-repo observational evidence; the conclusions below are the durable project record.

### What worked in the real Owner run

The Owner successfully discovered and exercised many existing capabilities without agent-side coordinate surgery:

- Open Project and exact SOURCE relink;
- free orbit/navigation and SOURCE focus;
- authored element/frame selection;
- viewport gizmo manipulation;
- numeric Inspector state;
- relation diagnostics reacting to authored misalignment;
- transient Revolute TEST and Reset/End TEST;
- SOURCE datum inspection;
- SOURCE placement editing;
- explicit SOURCE -> AUTHORED adoption/construction surfaces.

This is strong evidence that the technical foundation is materially ahead of the current information architecture.

### What blocked the intended task

The Owner was trying to understand and physically judge the upper/lower wishbone-to-carrier mating, but the normal workspace simultaneously exposed:

- authored rig selection and transforms;
- SOURCE datum selection;
- SOURCE placement editing;
- SOURCE -> element/frame adoption;
- construction-frame recipes;
- relation creation;
- Revolute TEST;
- diagnostics;
- multiple classes of viewport markers.

The system mostly prevents invalid simultaneous operations at commit time, but it does not sufficiently reduce the number of available meanings and actions before the Owner chooses an operation.

The recordings showed that ordinary inspection could naturally become durable authoring: selected authored objects immediately expose transform manipulation, making `selected` and `editing` too similar in the current harness.

The recordings also showed that relation diagnostics are mathematically useful but spatially under-explained. Current display code renders relation segments only for `origin-coincident`; the current wishbone's `revolute` and `spherical` relations therefore do not visually communicate their frame pairing in the viewport.

### What was *not* proven to be the primary blocker

Do not overgeneralize the recordings:

- SOURCE visibility/clutter was not yet proven to require Hide/Solo/Isolate;
- selection precision was not yet proven to require a new generic picker;
- the physical carrier/arm topology was not disproven;
- X-min mating was not accepted or rejected;
- a full representation-binding workflow is not required to complete the current physical-mating judgement.

## Discovered future product need — representation binding

The Owner naturally attempted to "rig the model to the rig": select real SOURCE parts, associate them with mechanical elements and expect the visual parts to follow mechanism TEST motion.

This is a legitimate product need and aligns with the existing architecture's separate representation domain. Current `RigElement.source` / `RigFrame.source` provenance is explicitly **not** representation binding. Historical BIND-00 proved one narrow bridge but its active runtime/UI was removed.

Record this as:

> **DISCOVERED / IMPORTANT / DEFERRED UNTIL CURRENT MATING/UX BLOCKER IS RESOLVED**

Do not rebuild BIND-00 or launch a full representation framework merely because the Owner looked for this workflow. It is a strong candidate for later Owner-driven JURE work after physical mating truth is obtained.

## Current machine-proven capability

The validated DONOR line proves:

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
- **DONOR-03B Owner correction path:** normal `Open Project -> exact SOURCE relink -> frame correction -> spherical warning/residual -> Undo -> exact neutral recovery` on Linux and Windows.

Validation run `32846835489` passed canonical `npm run check`, pinned exact SOURCE identity, all real-JV probes, the independent candidate-file verifier and the browser Owner-ready flow on Linux and Windows.

## Exact donor / Owner-gate evidence

Pinned fixture:

`Jozzpoly/Box3d_FunProject@959aefb78587ce60cf2b8eb03ff82797a4165142/assets/source/OneSided_Steering_Suspension_Rig.gltf`

- Git blob: `06d5c66f6d13fb64863ab15a660f060358872291`;
- SHA-256: `57cda983f8f728bc819460540d2ee39b1b17288ecdac1f0dc8bb1a3e6f9ab750`;
- size: 64,264 bytes.

DONOR-03B candidate:

- producer: `53ce6cc31233cfe1b45d41081c7b58d4c8baa5c4` / tree `6dce314b3ed086998f03075a2b641be8a9988aea`;
- generated filename: `CANDIDATE__real-jv-coherent-wishbone__NOT-AUTHORITY.json`;
- project/document identity: `project.real-jv-coherent-wishbone` / `rig.real-jv-coherent-wishbone`;
- 4 elements / 8 frames / 4 relations / 11 exact SOURCE adoption receipts;
- verifier marker: `REAL_JV_COHERENT_WISHBONE_CANDIDATE_FILE_PASS`;
- browser marker: `BROWSER_COHERENT_CANDIDATE_OPEN_RELINK_CORRECT_UNDO_PASS`;
- semantic status: **candidate / not Owner-accepted ball-joint authority**.

The Owner-gate package created by prep run `32866147643` records the concrete candidate used for manual review:

- candidate SHA-256: `a508a4fb5c33830adf18ba56986e9d9373b901955a1b5636494d7dfa4e17880c`;
- candidate size: 20,124 bytes;
- package branch: `checkpoint/owner-mating-prep-2026-08-25@99c54d8311470791b60c2dfe849f66e5bb9feb6f`;
- prep branch changes only checkpoint packaging workflow relative to frozen product `53ce6cc3...`.

The package identity does not promote the candidate to physical authority.

## Physical truth boundary

For the exact unmirrored left fixture, current evidence establishes max-X as chassis/inboard and min-X as wheel/outboard. The X-min ends of `Chassis_Top` and `Chassis_Bottom` are provenance-backed wheel-end **mating candidates** only.

Machine evidence proves that those world frames can be represented independently in arm-local and carrier-local space, joined by spherical relations, serialized, reopened, relinked and corrected.

The first real Owner run did **not** reach a trustworthy spatial judgement because task clarity failed first. Final physical mating therefore remains **Owner-open / UNKNOWN** and must later be corroborated against sealed JV_CORE G-RIG evidence before a concrete JV-Web lowering/runtime substitution is frozen.

Owner-accepted JV evidence continues to distinguish:

- `Socket_ChassisMount_b` = suspension-side / non-steering structural role;
- `Socket_WheelCenter` = distinct steerable structural role;
- steering DOF exists between those roles;
- wheel spin is another distinct DOF.

## Next planned stage — UX-01

The next planned JURE slice is:

> **JURE UX-01 — Owner Task Clarity & Safe Inspection Foundation**

Its first falsifier remains the same physical mating problem. The goal is not to build a polished general UI or a one-off tutorial; it is to make one real Owner task understandable while improving JURE in a generalizable way.

### UX-01 intended scope

#### 1. Safe Inspect

Establish a clear interaction distinction:

`SELECTED != EDITING`

Expected behavior:

- ordinary viewport click selects/inspects without immediately enabling durable transform;
- no gizmo/numeric durable mutation until explicit Edit/Correct intent;
- camera/orbit/focus remain freely available;
- entering/leaving edit context creates no project history;
- actual transform still uses existing `ProjectSession` preview -> commit/cancel and one durable history action.

Do not create a second editing/history system.

#### 2. Disposable task context

Introduce a small presentation-only `WorkspaceTaskContext` (working concept, not frozen architecture), initially with:

- normal engineering workspace;
- `physical-mating-review`.

The context must be disposable UI state: not serialized in project JSON, not durable history, not kernel truth.

For `physical-mating-review`, show only the information needed to inspect upper/lower wishbone-to-carrier mating and suppress/deactivate unrelated creation/TEST/SOURCE-placement/construction surfaces. Leaving the context restores the engineering harness.

Do **not** freeze a global `Inspect / Author / Represent / Test` mode ontology from one usability run.

#### 3. Minimal relation readability

For the relevant `spherical` / `revolute` relations, make it visually/textually obvious which two authored frames form one relation and which body owns each side.

The first implementation should answer only:

- what is paired with what;
- which side belongs to which element;
- current residual/diagnostic state.

Do not imply a solver bar/force constraint that is not part of authored neutral semantics.

#### 4. Explicit correction context

`Correct upper mating` / `Correct lower mating` should expose the intended editable candidate side explicitly and reuse existing transform/diagnostic/Undo primitives.

Do not change relation semantics merely to make geometry pass.

### UX-01 falsifiers / natural checkpoints

- **UX01-GROUND** — `OWNER-MATING-01 = BLOCKED_TASK_CLARITY`; X-min remains UNKNOWN; no evidence inflation.
- **UX01-SAFE-INSPECT** — selection/inspection cannot silently change authored revision/history.
- **UX01-TASK-CONTEXT** — entering/leaving physical-mating review changes no project truth and removes unrelated task choices.
- **UX01-RELATION-READABILITY** — upper/lower relation pairs and owners are unambiguous in the review surface.
- **UX01-CORRECTION** — explicit correction still gives preview -> residual/warning -> commit/cancel -> Undo using the existing ProjectSession.
- **UX01-MACHINE** — all DONOR-03A/03B invariants plus a new rendered browser task-context falsifier pass on Linux and Windows.
- **OWNER-MATING-02** — the Owner repeats the manual review without a detailed click-by-click tutorial. Only then classify `ACCEPT / CORRECTED / BLOCKED_VISIBILITY / BLOCKED_SELECTION / PHYSICAL_MODEL_WRONG / INCONCLUSIVE`.

A successful UX-01 machine run does not itself accept physical mating.

## Explicit non-goals for UX-01

Do not use this Owner feedback as justification to launch:

- general hierarchy/assemblies;
- general multi-relation solver;
- JURE -> JV-Web consumer schema/export;
- runtime JV substitution;
- full representation-binding framework;
- generic CAD/picking system;
- SOURCE Hide/Solo/Isolate unless OWNER-MATING-02 proves visibility is still a blocker;
- full workspace/tab ontology;
- Map integration;
- damper/spring/cardan pipelines;
- whole-vehicle authoring.

## Semantic boundaries to preserve

SOURCE evidence proposes measurements; explicit adoption creates authored truth. Moving/relinking SOURCE never moves authored rig truth.

A construction point is not a frame. A constructed frame exists only when independent evidence supplies orientation and the derivation can be re-resolved from exact SOURCE identity.

`revolute` and `spherical` express neutral mechanical intent only. They do not contain dynamics/solver authority.

Durable `RigRelation` does not encode assembly hierarchy.

`AUTHORED NEUTRAL != transient EVALUATED motion`. Current TEST is a disposable single-revolute evaluator, not a general mechanism solver.

A JURE authoring project is not the JV-Web consumer format. Future lowering must be designed from JURE evidence + sealed JV_CORE G-RIG + the live JV-Web recipient contract.

## Priority / cross-project direction

JV-Web remains the program priority. Its current provisional matrix explicitly treats current JURE X-min mating as `BLOCKED` pending Owner physical judgement and primary-donor corroboration.

UX-01 is justified because it directly addresses the missing Owner judgement and improves JURE's Owner-first product invariant. It is **not** authorization to expand JURE indefinitely while JV-Web waits.

If sealed JV_CORE evidence or JV-Web recipient requirements change the target before UX-01 implementation begins, re-ground first and adjust the slice rather than defending this plan.

## New-conversation takeover target

A new orchestrator should:

1. resolve live `main`, `work/real-jv-rig-elements`, `checkpoint/donor-03b-synthesis-ready-2026-08-25` and `checkpoint/owner-mating-prep-2026-08-25`;
2. read canonical docs in the order `README.md -> AGENTS.md -> docs/ARCHITECTURE.md -> docs/STATUS.md`;
3. compare the active work head against frozen `53ce6cc3...` so docs-only continuation is not mistaken for validated product behavior;
4. preserve `OWNER-MATING-01 = BLOCKED_TASK_CLARITY` and X-min = UNKNOWN;
5. treat **UX-01** above as the planned next stage, not as already implemented architecture;
6. before writing code, critically re-plan the smallest vertical slice and its browser/Owner falsifiers from the live tree;
7. keep JV-Web priority and do not freeze consumer schema or runtime integration.

Do not restart DONOR-03A/03B, do not rerun the physical gate against the unchanged engineering harness expecting a different result, and do not infer physical truth from zero residual diagnostics.

## Owner / promotion boundary

Before any promotion to `main`, independently resolve PR #3 and exact `4db04eee...`, compare with accepted `main`, retain recovery evidence and obtain explicit Owner approval. **Do not merge without explicit Owner approval.**

Permanent rhythm:

`real need -> smallest vertical slice -> targeted falsifier -> rendered/Owner gate when useful -> next`.
