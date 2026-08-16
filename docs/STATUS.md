# Status

## Authority

- **accepted baseline:** `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`;
- **clean foundation candidate:** `promotion/foundation-ready-squash-2026-08-16@4db04eee4da0216f6bd3df6b6b0c82aa20afab5a` / draft PR #3;
- **active product work:** `work/real-jv-rig-elements`;
- **latest fully validated product SHA:** `9807ccafb9ca7842ed25a1c4bc3fc3a0372afa4f`;
- **latest frozen checkpoint:** `checkpoint/real-jv-single-revolute-test-evaluator-2026-08-16@9807ccafb9ca7842ed25a1c4bc3fc3a0372afa4f`;
- **checkpoint run:** `31959364258` — Linux Chrome PASS + Windows Chrome PASS;
- **active product review boundary:** draft PR #4 targeting the clean foundation candidate, not `main`.

`main` remains untouched. PR #2 retains full recovery/foundation evidence; PR #3 remains the explicit clean promotion boundary. Neither PR #3 nor PR #4 may be merged merely because CI is green.

A disrupted session briefly wrote PR text referring to nonexistent `a2a394dd...` / run `31955493157`. Those identifiers are not authority and must not be reused.

## Product purpose

JURE is an owner-first spatial rigging workbench. The Owner should be able to inspect exact real assets, create/correct authored rig truth, express neutral mechanical and representation intent, test mechanisms without mutating authored neutral truth, save/reopen deterministically and export a small reliable result to a consumer without agent-side coordinate guessing.

**End-to-end Owner authoring is part of the product definition, not merely a convenience.** JURE must not require an agent to act as the recurring rigging operator. For a supported mechanism, the intended end state is that the Owner can personally load/inspect SOURCE, create and adjust authored elements/frames/relations, fit mechanical geometry and representation, inspect diagnostics, TEST/Reset motion, correct the rig, Save/Open and export deterministic authored truth. Agent-side math, diagnostics and automation should make that workflow possible rather than replace it.

JV/JV-Web is the first real consumer/falsifier and the main near-term integration partner. JURE should solve the authoring side of the JV vehicle-rig problem — exact part fit, suspension/steering relations, coherent mechanisms and moving representation such as dampers/springs — while JV remains authority for runtime physics, forces, solver state, controls and rendering integration.

JURE must remain useful for later native JV/VAW and non-vehicle mechanisms such as rotors, pistons, springs or thrusters without becoming vehicle-specific or absorbing consumer dynamics.

## Demonstrated real-use chain

The validated line now demonstrates one complete small mechanism path below the final Owner-facing relation/TEST UI boundary:

`exact SOURCE -> authored bodies -> authored hinge frames -> neutral revolute -> geometric diagnostic -> transient TEST motion -> Reset -> exact AUTHORED`

Specifically:

- Owner-facing free and exact-SOURCE-derived `RigElement` creation;
- exact SOURCE datum -> owner-local `RigFrame` adoption;
- conservative geometry-derived point datums that do not invent orientation;
- right-handed constructed frames from origin point + radial endpoint + independent up span;
- versioned self-resolving construction-frame locators with all exact component locators;
- exact runtime re-resolution, Save/Open and exact relink without a side recipe database;
- Owner-facing construction recipe builder with visible origin, local axes and provenance;
- one physical lower-wishbone hinge authored on two distinct bodies using the same recipe while preserving independent owner-local frame poses;
- first neutral `revolute` relation containing only geometric/mechanical intent, no consumer dynamics or solver configuration;
- revolute diagnostics measuring origin residual and signed `+Z` axis residual without projecting/mutating authored truth;
- first replaceable single-revolute TEST evaluator with explicit TEST-only `movingElementId` rather than durable parent/child semantics;
- zero-angle TEST reproducing AUTHORED exactly;
- transient `+30°` lower-arm motion around the real hinge while hinge origin and primary `+Z` remain fixed/aligned;
- Reset removing all evaluator influence and returning exactly to AUTHORED;
- legal neutral frame roll around the revolute axis is preserved rather than projected away;
- one chronological `ProjectSession` remains the only durable project history.

Canonical `npm run check` passes at the validated checkpoint. The exact checkpoint run `31959364258` passed on Linux and Windows, including the exact real-JV probes and all existing Owner/browser regression paths. The existing >500 kB minified main-chunk warning remains non-blocking build debt.

## Exact real JV evidence

Pinned fixture:

`Jozzpoly/Box3d_FunProject@959aefb78587ce60cf2b8eb03ff82797a4165142/assets/source/OneSided_Steering_Suspension_Rig.gltf`

- Git blob: `06d5c66f6d13fb64863ab15a660f060358872291`;
- SHA-256: `57cda983f8f728bc819460540d2ee39b1b17288ecdac1f0dc8bb1a3e6f9ab750`;
- size: 64,264 bytes.

Validated lower-wishbone construction evidence:

```text
Chassis_Bottom X min = [-0.8125, 0.03125, 0]
Chassis_Bottom X max = [ 0.5,    0.03125, 0]
travel up             = Axis_SuspensionTravel_Bottom -> Axis_SuspensionTravel_Top
hinge origin          = [0.5, 0.03125, 0]
local +X              = [1, 0, 0]
local +Y              = [0, 1, 0]
local +Z              = [0, 0, 1]
```

For this exact unmirrored left fixture, current JV S2 evidence establishes max-X as the chassis/inboard end and min-X as the wheel/outboard end. That ordering is fixture evidence, not generic JURE semantics.

The same physical lower-hinge locator is authored on:

- exact-SOURCE-derived lower-arm body;
- explicit Owner chassis-reference body.

The two authored frames have different local poses but resolve to the same world hinge and aligned signed `+Z`. Their neutral `revolute` persists through Save/Open.

Checkpoint evidence includes markers:

- `REAL_JV_WISHBONE_RECIPE_RERESOLVE_PASS`;
- `REAL_JV_TWO_BODY_HINGE_OWNERSHIP_PASS`;
- `REAL_JV_LOWER_WISHBONE_REVOLUTE_PASS`;
- `REAL_JV_REVOLUTE_DIAGNOSTIC_PASS`;
- `REAL_JV_SINGLE_REVOLUTE_EVALUATOR_PASS`;
- `CONSTRUCTION_FRAME_INVALID_RECIPE_FAIL_CLOSED_PASS`;
- `CONSTRUCTION_FRAME_RECIPE_PRESERVED_AFTER_COMMIT_PASS`;
- `BROWSER_REAL_TWO_BODY_HINGE_AUTHORING_PASS`;
- all earlier SOURCE placement/adoption/Undo/Redo browser regressions.

A separately supplied `OneSided_Steering_Suspension_Rig(1).gltf` observed during cross-project coordination has the same size and matching visible node/marker structure but different exact SHA-256 bytes from the pinned fixture. It is **not** silently promoted to source authority. Exact-source identity remains fail-closed until a deliberate revision decision is made.

## Semantic boundaries

SOURCE evidence proposes measurements; explicit adoption creates authored truth. Moving/relinking SOURCE never moves authored rig truth.

A construction point is not a frame. A constructed frame exists only when independent evidence supplies an orientation and the derivation can be re-resolved from the exact `SourceRevision`.

A `revolute` currently expresses only two authored frames and optional geometric limits. It does not contain mass, inertia, friction, damping, spring laws, motors, solver configuration or Box3D/native runtime identity.

The first TEST evaluator is deliberately not architecture for a general solver. Its TEST-only configuration explicitly selects which authored element moves. Durable `RigRelation` still does not encode parent/child hierarchy.

`AUTHORED NEUTRAL != transient EVALUATED motion`. TEST results are revision-bound pose overlays and Reset removes them entirely.

For damper/spring authoring, JURE should own neutral attachments, axis/travel geometry and representation mapping that the Owner can directly inspect and adjust. Runtime spring/damping force laws and current compression/extension remain consumer/JV state.

## Current product gaps

- Owner can author both real hinge frames in the workbench, but **cannot yet create the `revolute` relation through the UI**; relation creation is domain/exact-source proven only.
- The single-revolute TEST evaluator is domain/exact-source proven, but **there is no Owner TEST control/slider yet**.
- The coherent four-relation double-wishbone shape is cross-project proven as the minimum current replacement target, but its complete Owner authoring loop is not yet implemented.
- UI exposes one active `SourceInstance` context even though the project model supports multiple instances.
- No arbitrary surface/vertex picker exists because current real work has not justified one.
- Mechanical relation vocabulary and future limit conventions remain provisional.
- Representation remains correctly separate, but final Owner mapping workflow is still provisional.
- No JURE -> JV-Web multi-relation consumer export/adapter exists yet.
- Current layout remains an engineering harness, not final information architecture.

## Next falsifier

Close the remaining Owner gap for the already-proven mechanism before adding more relation vocabulary or consumer integration:

1. add a minimal Owner-facing `revolute` authoring flow over existing authored frames;
2. preview current neutral diagnostics (`originResidualM`, signed-axis angle) before commit;
3. create the relation through the existing `ProjectSession` as one Undo/Redo action;
4. rendered exact-JV browser proof must create the relation from the two already-authored lower-hinge sides and preserve prior regressions;
5. add a minimal TEST control for one selected revolute with explicit disposable moving-element choice;
6. prove `0° -> +30° -> Reset` in the workbench while project history and AUTHORED remain unchanged by TEST controls;
7. extend that same Owner-operable pattern to the coherent upper/lower wishbone, including the required spherical relations and visible diagnostics;
8. prove Save/Open/relink of the Owner-authored four-relation mechanism;
9. only then freeze/export the small multi-relation consumer fragment and let private JV-Web independently parse/place/compare it before any runtime substitution.

Do not implement generic CAD/picking, a general solver, consumer dynamics, whole-vehicle automation or public Friends integration in the same slice.

## Owner / promotion boundary

Useful next Owner judgement is concrete product use, not source inspection:

- whether relation creation is understandable and spatially trustworthy;
- whether TEST motion is easy to control and clearly transient;
- whether the mechanism can be corrected by the Owner without agent-side coordinate editing;
- Save/Open/relink with the real authored mechanism;
- later, whether the complete wishbone and damper/spring representation fit and move as intended.

Before any promotion to `main`, independently resolve PR #3 and exact `4db04eee...`, compare with `main`, retain PR #2 as recovery evidence and obtain explicit Owner approval. **Do not merge without explicit Owner approval.**

## Foundation exit criterion

Foundation is complete when the Owner can take a real mechanism and, without agent-side coordinate guessing or agent-operated rig reconstruction:

`place/inspect exact SOURCE -> create authored elements/frames/mechanical intent -> fit/map representation -> kinematically test/reset -> correct -> save/reopen -> export a small consumer-facing result`

Permanent rhythm after that:

`real need -> smallest vertical slice -> targeted falsifier -> rendered/Owner gate when useful -> next`.
