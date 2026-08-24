# Status

## Authority

- **accepted baseline:** `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`;
- **clean foundation candidate:** `promotion/foundation-ready-squash-2026-08-16@4db04eee4da0216f6bd3df6b6b0c82aa20afab5a` / PR #3;
- **active product work:** `work/real-jv-rig-elements`;
- **latest fully validated product SHA:** `2af0e789d22eb4284e65ab2342ca933d21fe9315`;
- **validated tree:** `671aa88dce3bc643eecc30519b904dadf7402b83`;
- **latest frozen checkpoint:** `checkpoint/donor-03a-coherent-neutral-wishbone-2026-08-24@2af0e789d22eb4284e65ab2342ca933d21fe9315`;
- **validation run:** `32782422063` — Linux browser PASS + Windows browser PASS + final checkpoint status SUCCESS;
- **validation review boundary:** closed evidence-only PR #7, never merge;
- **previous validated donor boundary:** `checkpoint/donor-02f-observable-validation-2026-08-24@f3302b434972b0a4df2dd693100fc8805891594f`, run `32781647237`;
- **historical paused product boundary:** closed PR #4; it no longer describes the current product head.

PR #7's validation merge ref `422e7d12d9669666eb65cd592b3540a4736b2935` and work head `2af0e789d22eb4284e65ab2342ca933d21fe9315` resolve to the same tree `671aa88dce3bc643eecc30519b904dadf7402b83`. The PR-triggered Linux/Windows run therefore validated the current work product tree rather than a different merge composition.

`main` remains untouched. PR #2 retains recovery/foundation evidence; PR #3 remains the explicit clean promotion boundary. Validation/recovery PRs are evidence laboratories only and must never be merged. No promotion to `main` is authorized without explicit Owner approval.

## Product purpose

JURE is an Owner-first spatial rigging workbench. The Owner should be able to inspect exact real assets, create/correct authored rig truth, express neutral mechanical and representation intent, test mechanisms without mutating authored neutral truth, save/reopen deterministically and export a small reliable result to a consumer without agent-side coordinate guessing.

End-to-end Owner authoring is part of the product definition. For a supported mechanism, the target is:

`place/inspect exact SOURCE -> author elements/frames/relations -> diagnose -> TEST/Reset -> correct -> Save/Open -> export deterministic neutral truth`

JV/JV-Web is the first real consumer/falsifier. JURE owns authored neutral geometry/mechanical/representation truth; JV owns runtime physics, forces, solver state, controls and rendering integration.

## Current machine-proven capability

The validated line proves the complete small Owner-operated lower-hinge path:

`exact SOURCE -> authored bodies -> authored hinge frames -> Owner revolute -> diagnostic -> transient Owner TEST -> Reset -> exact AUTHORED -> Undo/Redo`

It also proves Owner spherical relation authoring and, as of DONOR-03A, a complete coherent neutral four-relation wishbone at the model/evidence level.

Validated capability now includes:

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
- exact-source browser spherical control proving UI/workflow without claiming its control point is a real ball joint;
- one chronological `ProjectSession` as the only durable project history;
- **coherent neutral wishbone:** 4 elements, 8 independently owner-local frames, 2 inboard revolutes + 2 outboard sphericals, clean diagnostics, deterministic Save/Open and exact SOURCE relink.

Validation run `32782422063` passed on Linux and Windows with canonical `npm run check`, pinned exact SOURCE identity, all real-JV probes, the coherent wishbone probe and all Owner/browser regressions.

## Exact real JV evidence

Pinned fixture:

`Jozzpoly/Box3d_FunProject@959aefb78587ce60cf2b8eb03ff82797a4165142/assets/source/OneSided_Steering_Suspension_Rig.gltf`

- Git blob: `06d5c66f6d13fb64863ab15a660f060358872291`;
- SHA-256: `57cda983f8f728bc819460540d2ee39b1b17288ecdac1f0dc8bb1a3e6f9ab750`;
- size: 64,264 bytes.

Validated wishbone geometry on this exact unmirrored left fixture:

```text
Chassis_Top X min    = [-0.8125, 0.96875, 0]
Chassis_Top X max    = [ 0.5,    0.96875, 0]
Chassis_Bottom X min = [-0.8125, 0.03125, 0]
Chassis_Bottom X max = [ 0.5,    0.03125, 0]
travel up             = Axis_SuspensionTravel_Bottom -> Axis_SuspensionTravel_Top
upper inboard origin  = [0.5, 0.96875, 0]
lower inboard origin  = [0.5, 0.03125, 0]
local +X              = [1, 0, 0]
local +Y              = [0, 1, 0]
local +Z              = [0, 0, 1]
```

For this fixture, current JV S2 evidence establishes max-X as chassis/inboard and min-X as wheel/outboard. That ordering is fixture evidence, not generic JURE semantics.

### Owner-accepted wheel-side role split

Owner-accepted JV S2 evidence distinguishes:

- `Socket_ChassisMount_b` = suspension-side / non-steering structural role;
- `Socket_WheelCenter` = distinct steerable structural role relative to it;
- steering DOF exists between those roles;
- wheel spin is another distinct DOF.

Accordingly, JURE uses `Socket_ChassisMount_b` as the suspension-side carrier reference and keeps `Socket_WheelCenter` as separate steerable reference evidence.

### Outboard semantic boundary

The X-min ends of `Chassis_Top` and `Chassis_Bottom` are provenance-backed wheel-end **mating candidates**. They are not Owner-accepted ball-joint truth.

DONOR-03A proves that those candidate world frames can be independently represented in upper/lower arm local space and suspension-carrier local space, joined by neutral spherical relations, serialized deterministically and re-resolved after exact relink. It does **not** prove that their physical positions are the final intended ball-joint centers.

The next Owner/workbench gate must establish or correct those mating frames.

## DONOR-03A coherent neutral wishbone evidence

Exact machine-proven topology:

```text
Owner chassis reference
  <-> upper arm        : revolute at upper X-max hinge
  <-> lower arm        : revolute at lower X-max hinge

suspension-side carrier reference (Socket_ChassisMount_b space)
  <-> upper arm        : spherical at upper X-min candidate
  <-> lower arm        : spherical at lower X-min candidate
```

Probe invariants:

- 4 authored elements;
- 8 independently owner-local authored frames;
- 4 relations exactly: 2 revolute + 2 spherical;
- 11 exact SOURCE adoption receipts;
- zero/near-zero neutral relation residuals without projection or coordinate patches;
- every physical joint locator authored on both owning elements with different local poses but identical resolved world pose;
- serialize -> parse -> serialize is byte-identical;
- relation IDs/types/endpoints survive Save/Open;
- exact SOURCE relink preserves all four physical locators and their provenance;
- final neutral diagnostics remain clean after Save/Open/relink.

Primary marker:

- `REAL_JV_COHERENT_WISHBONE_NEUTRAL_PASS`.

Other retained evidence markers include:

- `REAL_JV_WISHBONE_RECIPE_RERESOLVE_PASS`;
- `REAL_JV_TWO_BODY_HINGE_OWNERSHIP_PASS`;
- `REAL_JV_LOWER_WISHBONE_REVOLUTE_PASS`;
- `REAL_JV_REVOLUTE_DIAGNOSTIC_PASS`;
- `REAL_JV_SINGLE_REVOLUTE_EVALUATOR_PASS`;
- `REAL_JV_OUTBOARD_CANDIDATE_GEOMETRY_PASS`;
- `REAL_JV_OUTBOARD_CANDIDATE_OWNERSHIP_PASS`;
- `BROWSER_REAL_TWO_BODY_HINGE_AUTHORING_PASS`;
- `BROWSER_REAL_REVOLUTE_AUTHORING_PASS`;
- `BROWSER_REAL_REVOLUTE_TEST_UI_PASS`;
- `BROWSER_SPHERICAL_AUTHORING_CONTROL_PASS`.

## Semantic boundaries

SOURCE evidence proposes measurements; explicit adoption creates authored truth. Moving/relinking SOURCE never moves authored rig truth.

A construction point is not a frame. A constructed frame exists only when independent evidence supplies orientation and the derivation can be re-resolved from the exact SourceRevision.

`revolute` and `spherical` express neutral mechanical intent only. They do not contain mass, inertia, friction, damping, spring laws, motors, solver configuration or Box3D/native runtime identity.

Durable `RigRelation` does not encode assembly parent/child hierarchy. The coherent wishbone PASS specifically shows that a mechanical relation graph with the required four neutral constraints does not require hierarchy to exist in the relation model.

`AUTHORED NEUTRAL != transient EVALUATED motion`. Current TEST is a disposable single-revolute evaluator, not a general mechanism solver.

Future assembly hierarchy and a future multi-relation/physics evaluator remain valid JURE directions, but neither is required to represent the current neutral wishbone truth.

## Current product gaps

- **Owner acceptance/correction of the real upper/lower outboard mating frames is still open.** Machine coherence is proven; final mating geometry is not.
- Current SOURCE renderer loads a whole glTF under one `sourceRoot`; there is no per-node/per-part SOURCE Hide/Solo/Isolate. Do not implement it merely from a checklist — first run the real Owner mating gate and prove visibility is the blocker.
- Revolute/spherical relations are visible in the navigator and diagnostics, but viewport relation presentation remains minimal. Improve only if the Owner gate proves readability inadequate.
- The Rig Navigator has no durable multi-level assembly hierarchy. This remains a strategic full-JURE requirement, not a prerequisite for the neutral donor mechanism.
- UI exposes one active SourceInstance context even though the project model supports multiple instances.
- No arbitrary surface/vertex picker exists; add only if real Owner correction cannot be achieved with existing frame tools.
- No multi-relation mechanism evaluator exists yet. Do not build one until neutral Owner authoring is complete and motion testing becomes the demonstrated next blocker.
- Representation is separate and structurally supports rigid/aim/span/roll, but real damper/cardAN Owner mapping remains unproven.
- No deterministic JURE -> consumer multi-relation donor fragment exists yet.
- Current layout remains an engineering harness, not final information architecture.

## Next falsifier — DONOR-03B Owner candidate inspection

The next stage is no longer a kernel/model test. The model has passed.

Expose the machine-proven coherent candidate to the Owner in the actual workbench and answer one question:

> Can the Owner understand, inspect and correct the proposed upper/lower wishbone-to-suspension-carrier mating frames without agent-side coordinate editing?

Required progression:

1. prepare a deterministic, clearly labelled **CANDIDATE / NOT AUTHORITY** JURE project or equivalent reproducible Owner-openable state containing the proven four-element/eight-frame/four-relation mechanism;
2. relink the exact pinned SOURCE and present the candidate in the normal workbench;
3. make upper/lower outboard candidate frames and their owning arm/carrier contexts easy to identify;
4. ask the Owner to inspect whether the mating points are physically intended and, where needed, correct them using normal JURE transforms;
5. do not change relation semantics to make a bad candidate look correct;
6. if the Owner is blocked by source geometry occlusion, implement the smallest real SOURCE per-node/per-part Hide/Solo/Isolate slice and repeat the gate;
7. if selection precision is the blocker, add the smallest justified picking/construction primitive and repeat the gate;
8. if relation readability is the blocker, improve only the necessary relation visualization;
9. after Owner acceptance, freeze the corrected authored frames and prove Save/Open/relink again;
10. only then design/freeze the deterministic neutral donor fragment.

Do not implement Map, generic CAD, full hierarchy, a general solver, consumer dynamics, whole-vehicle automation or public Friends integration in this stage.

## Owner / promotion boundary

Next useful Owner judgement:

- are upper/lower outboard mating candidates physically understandable and correctable?
- is visibility sufficient, especially around suspension carrier / steerable member / wheel region?
- can frame transforms and relation diagnostics support correction without typed coordinate surgery?
- after correction, does Save/Open/relink preserve the intended mechanism?

Before any promotion to `main`, independently resolve PR #3 and exact `4db04eee...`, compare with accepted `main`, retain recovery evidence and obtain explicit Owner approval. **Do not merge without explicit Owner approval.**

## Foundation exit criterion

Foundation is complete when the Owner can take a real mechanism and, without agent-side coordinate guessing or agent-operated rig reconstruction:

`place/inspect exact SOURCE -> create authored elements/frames/mechanical intent -> fit/map representation -> kinematically test/reset -> correct -> save/reopen -> export a small consumer-facing result`

Permanent rhythm:

`real need -> smallest vertical slice -> targeted falsifier -> rendered/Owner gate when useful -> next`.
