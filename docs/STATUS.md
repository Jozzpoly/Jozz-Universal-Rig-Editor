# Status

## Authority

- **accepted baseline:** `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`;
- **clean foundation candidate:** `promotion/foundation-ready-squash-2026-08-16@4db04eee4da0216f6bd3df6b6b0c82aa20afab5a` / draft PR #3;
- **active product work:** `work/real-jv-rig-elements`;
- **latest fully validated product SHA:** `f3302b434972b0a4df2dd693100fc8805891594f`;
- **validated tree:** `d3aa165ab12bf18c7d6883790f5131e0246013f1`;
- **latest frozen checkpoint:** `checkpoint/donor-02f-observable-validation-2026-08-24@f3302b434972b0a4df2dd693100fc8805891594f`;
- **validation run:** `32781647237` — Linux browser PASS + Windows browser PASS + final `jure/checkpoint-browser` SUCCESS;
- **validation review boundary:** closed evidence-only PR #6, never merge;
- **historical paused product boundary:** closed PR #4; it no longer describes the current product head.

The PR validation merge ref `e78259a2713d2631392345cb0ded05ab53e878e8` resolved to the same tree `d3aa165ab12bf18c7d6883790f5131e0246013f1` as the validated work head, so the PR-triggered run tested the current product tree rather than a different merge composition.

`main` remains untouched. PR #2 retains full recovery/foundation evidence; PR #3 remains the explicit clean promotion boundary. Neither PR #3 nor any validation/recovery PR may be merged merely because CI is green.

A disrupted earlier session briefly wrote PR text referring to nonexistent `a2a394dd...` / run `31955493157`. Those identifiers are not authority and must not be reused.

## Product purpose

JURE is an owner-first spatial rigging workbench. The Owner should be able to inspect exact real assets, create/correct authored rig truth, express neutral mechanical and representation intent, test mechanisms without mutating authored neutral truth, save/reopen deterministically and export a small reliable result to a consumer without agent-side coordinate guessing.

**End-to-end Owner authoring is part of the product definition, not merely a convenience.** JURE must not require an agent to act as the recurring rigging operator. For a supported mechanism, the intended end state is that the Owner can personally load/inspect SOURCE, create and adjust authored elements/frames/relations, fit mechanical geometry and representation, inspect diagnostics, TEST/Reset motion, correct the rig, Save/Open and export deterministic authored truth. Agent-side math, diagnostics and automation should make that workflow possible rather than replace it.

JV/JV-Web is the first real consumer/falsifier and the main near-term integration partner. JURE should solve the authoring side of the JV vehicle-rig problem — exact part fit, suspension/steering relations, coherent mechanisms and moving representation such as dampers/springs — while JV remains authority for runtime physics, forces, solver state, controls and rendering integration.

JURE must remain useful for later native JV/VAW and non-vehicle mechanisms such as rotors, pistons, springs or thrusters without becoming vehicle-specific or absorbing consumer dynamics.

## Demonstrated real-use chain

The validated line now demonstrates the complete small Owner-operated lower-hinge path:

`exact SOURCE -> authored bodies -> authored hinge frames -> Owner revolute -> geometric diagnostic -> transient Owner TEST -> Reset -> exact AUTHORED -> Undo/Redo`

It also demonstrates the generic Owner spherical relation workflow on exact-source-derived coincident frames, while deliberately keeping real vehicle outboard/ball-joint semantics open.

Specifically:

- Owner-facing free and exact-SOURCE-derived `RigElement` creation;
- exact SOURCE datum -> owner-local `RigFrame` adoption;
- conservative geometry-derived point datums that do not invent orientation;
- right-handed constructed frames from origin point + radial endpoint + independent up span;
- versioned self-resolving construction-frame locators with all exact component locators;
- exact runtime re-resolution, Save/Open and exact relink without a side recipe database;
- Owner-facing construction recipe builder with visible origin, local axes and provenance;
- one physical lower-wishbone hinge authored on two distinct bodies using the same recipe while preserving independent owner-local frame poses;
- Owner-facing neutral `revolute` creation over two authored frames;
- pre-commit revolute diagnostics measuring origin residual and signed `+Z` axis residual without projecting/mutating authored truth;
- one `ProjectSession` action for relation creation with Undo/Redo;
- replaceable single-revolute TEST evaluator with explicit TEST-only `movingElementId` rather than durable parent/child semantics;
- Owner TEST control with exact `0° -> +30° -> Reset -> End TEST` behavior;
- TEST angle/reset do not change authored rig revision or enter durable project history;
- transient `+30°` lower-arm motion around the real hinge while hinge origin and primary `+Z` remain fixed/aligned;
- Reset removing all evaluator influence and returning exactly to AUTHORED;
- legal neutral frame roll around the revolute axis is preserved rather than projected away;
- neutral `spherical` domain semantics that constrain shared origin only, not frame orientation;
- spherical origin-residual diagnostics;
- Owner-facing `+ Spherical` creation with pre-commit residual and one ProjectSession Undo/Redo action;
- exact-source browser spherical control proving the UI/workflow without claiming that its control point is a real wishbone ball joint;
- one chronological `ProjectSession` remains the only durable project history.

Canonical `npm run check` passes at the validated checkpoint. Validation run `32781647237` passed on Linux and Windows, including pinned exact-JV probes, corrected outboard grounding, Owner revolute/TEST flow, spherical workflow/control and prior browser regressions. The existing >500 kB minified main-chunk warning remains non-blocking build debt.

## Exact real JV evidence

Pinned fixture:

`Jozzpoly/Box3d_FunProject@959aefb78587ce60cf2b8eb03ff82797a4165142/assets/source/OneSided_Steering_Suspension_Rig.gltf`

- Git blob: `06d5c66f6d13fb64863ab15a660f060358872291`;
- SHA-256: `57cda983f8f728bc819460540d2ee39b1b17288ecdac1f0dc8bb1a3e6f9ab750`;
- size: 64,264 bytes.

Validated wishbone construction evidence:

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

For this exact unmirrored left fixture, current JV S2 evidence establishes max-X as the chassis/inboard end and min-X as the wheel/outboard end. That ordering is fixture evidence, not generic JURE semantics.

The same physical lower-hinge locator is authored on:

- exact-SOURCE-derived lower-arm body;
- explicit Owner chassis-reference body.

The two authored frames have different local poses but resolve to the same world hinge and aligned signed `+Z`. Their neutral `revolute` persists through Save/Open.

### Outboard grounding boundary

The exact source provides provenance-backed upper/lower wishbone wheel-end geometry candidates at the X-min ends. Those candidates are useful starting geometry but are **not accepted ball-joint truth**.

Owner-accepted JV S2 evidence distinguishes:

- `Socket_ChassisMount_b` as the suspension-side / non-steering structural role;
- `Socket_WheelCenter` as a distinct steerable structural role relative to it.

Accordingly, the validated JURE outboard probe uses `Socket_ChassisMount_b` as the suspension-side carrier reference space and keeps `Socket_WheelCenter` separate as steerable reference evidence. Upper/lower X-min candidate frames can be authored independently on arm-side and carrier-side owners and resolve to coincident world frames, but their final mating meaning remains an explicit Owner/workbench decision.

Checkpoint evidence includes markers:

- `REAL_JV_WISHBONE_RECIPE_RERESOLVE_PASS`;
- `REAL_JV_TWO_BODY_HINGE_OWNERSHIP_PASS`;
- `REAL_JV_LOWER_WISHBONE_REVOLUTE_PASS`;
- `REAL_JV_REVOLUTE_DIAGNOSTIC_PASS`;
- `REAL_JV_SINGLE_REVOLUTE_EVALUATOR_PASS`;
- `REAL_JV_OUTBOARD_CANDIDATE_GEOMETRY_PASS`;
- `REAL_JV_OUTBOARD_CANDIDATE_OWNERSHIP_PASS`;
- `CONSTRUCTION_FRAME_INVALID_RECIPE_FAIL_CLOSED_PASS`;
- `CONSTRUCTION_FRAME_RECIPE_PRESERVED_AFTER_COMMIT_PASS`;
- `BROWSER_REAL_TWO_BODY_HINGE_AUTHORING_PASS`;
- `BROWSER_REAL_REVOLUTE_AUTHORING_PASS`;
- `BROWSER_REAL_REVOLUTE_TEST_UI_PASS`;
- `BROWSER_SPHERICAL_AUTHORING_CONTROL_PASS`;
- all earlier SOURCE placement/adoption/Undo/Redo browser regressions.

A separately supplied `OneSided_Steering_Suspension_Rig(1).gltf` observed during cross-project coordination has the same size and matching visible node/marker structure but different exact SHA-256 bytes from the pinned fixture. It is **not** silently promoted to source authority. Exact-source identity remains fail-closed until a deliberate revision decision is made.

## Semantic boundaries

SOURCE evidence proposes measurements; explicit adoption creates authored truth. Moving/relinking SOURCE never moves authored rig truth.

A construction point is not a frame. A constructed frame exists only when independent evidence supplies an orientation and the derivation can be re-resolved from the exact `SourceRevision`.

A `revolute` currently expresses only two authored frames and optional geometric limits. A `spherical` currently expresses only the shared-origin relationship between two authored frames. Neither relation contains mass, inertia, friction, damping, spring laws, motors, solver configuration or Box3D/native runtime identity.

The first TEST evaluator is deliberately not architecture for a general solver. Its TEST-only configuration explicitly selects which authored element moves. Durable `RigRelation` still does not encode parent/child hierarchy.

`AUTHORED NEUTRAL != transient EVALUATED motion`. TEST results are revision-bound pose overlays and Reset removes them entirely.

For damper/spring authoring, JURE should own neutral attachments, axis/travel geometry and representation mapping that the Owner can directly inspect and adjust. Runtime spring/damping force laws and current compression/extension remain consumer/JV state.

## Current product gaps

- The coherent four-relation double-wishbone shape is the minimum current neutral mechanism target, but the complete real Owner-authored mechanism is **not yet validated**.
- Upper/lower outboard X-min frames are provenance-backed geometry candidates, not accepted ball-joint/mating truth; the Owner/workbench must still establish or correct final mating frames.
- Current SOURCE rendering loads a whole glTF under one `sourceRoot`; there is no per-node/per-part SOURCE Hide/Solo/Isolate yet. Do not implement it merely as a checklist item — first prove the real Owner mating gate actually needs it.
- The Rig Navigator still has no durable multi-level assembly hierarchy; that remains a strategic full-JURE requirement, not a DONOR-02 prerequisite.
- UI exposes one active `SourceInstance` context even though the project model supports multiple instances.
- No arbitrary surface/vertex picker exists because current real work has not yet justified one.
- Mechanical relation vocabulary and future limit conventions remain provisional.
- Representation remains correctly separate, but final Owner mapping workflow is still provisional.
- There is no multi-relation mechanism evaluator yet; do not build one before neutral double-wishbone authoring proves it is the next real blocker.
- No deterministic JURE -> JV-Web multi-relation consumer export/adapter exists yet.
- Current layout remains an engineering harness, not final information architecture.

## Next falsifier — DONOR-03A coherent neutral wishbone

Do **not** add another generic feature first. Require the currently validated JURE primitives to assemble one coherent neutral front-corner mechanism.

1. build a disposable exact-JV probe containing four authored elements: chassis reference, upper arm, lower arm and suspension-side carrier reference;
2. author upper/lower inboard hinge frames from the validated X-max recipes;
3. author upper/lower outboard candidate frames from the exact X-min geometry on both arm and suspension-side carrier owners;
4. create exactly four neutral relations: 2× inboard `revolute` + 2× outboard `spherical`;
5. require zero/near-zero neutral relation residuals without projection or agent-side coordinate patching;
6. require the full mechanism to survive deterministic Save/Open and exact SOURCE relink while preserving relation IDs, frame locators, owner-local poses and provenance;
7. keep the outboard pair explicitly classified as **candidate mating geometry**, not Owner-accepted ball-joint truth;
8. only after the machine mechanism passes, expose the candidate to the Owner in the real workbench and ask whether the mating frames can be understood/corrected without agent-side coordinate editing;
9. if that Owner gate is blocked by visibility, selection or relation readability, implement only the smallest concrete inspection feature proven necessary (for example SOURCE per-node isolate), then repeat the gate;
10. freeze/export a neutral multi-relation donor fragment only after the Owner-authored four-relation mechanism is accepted and Save/Open/relink is proven.

Do not implement generic CAD/picking, a general solver, consumer dynamics, whole-vehicle automation, Map work or public Friends integration in the same slice.

## Owner / promotion boundary

Useful next Owner judgement is concrete product use:

- whether the proposed upper/lower outboard mating frames are spatially understandable and correctable;
- whether revolute/spherical relation creation is understandable and trustworthy;
- whether visibility/selection is sufficient to inspect the suspension-side carrier and wishbone mating;
- whether the mechanism can be corrected without agent-side coordinate editing;
- Save/Open/relink with the real authored four-relation mechanism;
- later, whether damper/spring representation attachments, span and roll behave as intended.

Before any promotion to `main`, independently resolve PR #3 and exact `4db04eee...`, compare with `main`, retain PR #2 as recovery evidence and obtain explicit Owner approval. **Do not merge without explicit Owner approval.**

## Foundation exit criterion

Foundation is complete when the Owner can take a real mechanism and, without agent-side coordinate guessing or agent-operated rig reconstruction:

`place/inspect exact SOURCE -> create authored elements/frames/mechanical intent -> fit/map representation -> kinematically test/reset -> correct -> save/reopen -> export a small consumer-facing result`

Permanent rhythm after that:

`real need -> smallest vertical slice -> targeted falsifier -> rendered/Owner gate when useful -> next`.
