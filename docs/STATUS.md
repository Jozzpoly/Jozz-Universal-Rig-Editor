# Status

## Authority

- **accepted baseline:** `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`;
- **clean foundation candidate:** `promotion/foundation-ready-squash-2026-08-16@4db04eee4da0216f6bd3df6b6b0c82aa20afab5a` / draft PR #3;
- **active product work:** `work/real-jv-rig-elements`;
- **latest fully validated product SHA:** `b94f17e4bc2b89e9dd2c30993d9875039f3bdc4f`;
- **latest frozen checkpoint:** `checkpoint/real-jv-wishbone-recipe-reresolve-2026-08-16@b94f17e4bc2b89e9dd2c30993d9875039f3bdc4f`;
- **checkpoint browser run:** `31957259877` — Linux Chrome PASS + Windows Chrome PASS;
- **active product review boundary:** draft PR #4 targeting the clean foundation candidate, not `main`;
- **newer work beyond the validated checkpoint:** Owner-facing construction-frame recipe UI; canonical Work check is required and rendered acceptance remains pending until a later checkpoint.

`main` remains untouched. PR #2 retains full recovery/foundation evidence; PR #3 remains the explicit clean promotion boundary. Neither PR #3 nor PR #4 may be merged merely because CI is green.

A disrupted session briefly wrote PR text that referred to nonexistent `a2a394dd...` / run `31955493157`. Those identifiers are not authority and must not be reused. Live GitHub evidence was reconstructed before continuing.

## Product purpose

JURE is an owner-first spatial rigging workbench. The Owner should be able to inspect exact real assets, create/correct authored rig truth, express neutral mechanical and representation intent, test mechanisms without mutating authored neutral truth, save/reopen deterministically and export a small reliable result to a consumer without agent-side coordinate guessing.

JV/JV-Web is the first real consumer/falsifier. The architecture must remain useful for later native JV/VAW and non-vehicle mechanisms such as rotors, pistons, springs or thrusters without turning JURE into a vehicle-specific editor or generic simulation framework.

## Demonstrated foundation

The validated line now demonstrates:

- rigid `RigElement` and owner-local/root `RigFrame` authoring;
- Owner-facing free `RigElement` creation with deterministic IDs, selection and chronological Undo/Redo;
- exact rigid SOURCE datum -> new authored `RigElement` origin with immutable provenance;
- exact rigid SOURCE datum -> authored owner-local `RigFrame` adoption;
- geometry-derived **point-only** construction datums recovered conservatively from rigid skin geometry;
- generic right-handed constructed frames derived from origin point + radial endpoint + independent up span;
- local `+Z` as the explicit primary axis for current axis-bearing experiments;
- versioned self-resolving construction-frame locators containing all exact component locators;
- exact runtime re-resolution of those locators only from linked exact SOURCE bytes;
- transactional constructed-frame adoption through the existing `ProjectSession` path;
- deterministic Save/Open preserving the construction locator in `RigFrame.source` and `SourceAdoptionRecord`;
- exact relink followed by deterministic re-resolution without a parallel recipe database;
- one chronological `ProjectSession` history for SOURCE placement and authored changes;
- separate mechanical-relation, representation and AUTHOR/TEST domains.

Canonical validation at `b94f17e4...`:

- Node `24.16.0` / npm `11.17.0`;
- locked `npm ci`: PASS;
- TypeScript: PASS;
- **25 core test files / 122 PASS / 0 FAIL**;
- Vite production build: PASS;
- exact checkpoint run `31957259877`: Linux PASS + Windows PASS.

The existing >500 kB minified main-chunk warning remains non-blocking build debt.

## Exact real JV SOURCE evidence

Pinned SOURCE:

`Jozzpoly/Box3d_FunProject@959aefb78587ce60cf2b8eb03ff82797a4165142/assets/source/OneSided_Steering_Suspension_Rig.gltf`

- Git blob: `06d5c66f6d13fb64863ab15a660f060358872291`;
- SHA-256: `57cda983f8f728bc819460540d2ee39b1b17288ecdac1f0dc8bb1a3e6f9ab750`;
- size: 64,264 bytes;
- inspected structure used by the current probes: 15 nodes / 14 joints / 1 skinned mesh.

The exact geometry-derived wishbone points remain:

```text
Chassis_Top    X min = [-0.8125, 0.96875, 0]
Chassis_Top    X max = [ 0.5,    0.96875, 0]
Chassis_Bottom X min = [-0.8125, 0.03125, 0]
Chassis_Bottom X max = [ 0.5,    0.03125, 0]
```

Current JV S2 evidence for this exact unmirrored left fixture establishes max-X as the inboard/chassis end and min-X as the wheel/outboard end. This ordering is **fixture evidence**, not a generic JURE assumption.

Using exact `Axis_SuspensionTravel_Bottom -> Axis_SuspensionTravel_Top` as the independent up span, the validated self-resolving recipes reconstruct:

```text
upper hinge origin = [0.5, 0.96875, 0]
lower hinge origin = [0.5, 0.03125, 0]
local +X           = [1, 0, 0]
local +Y           = [0, 1, 0]
local +Z           = [0, 0, 1]
quaternion         = [0, 0, 0, 1]
orthogonality err = 0
```

Both Linux and Windows logs for run `31957259877` contain:

`REAL_JV_WISHBONE_RECIPE_RERESOLVE_PASS`

The lower hinge recipe is additionally adopted, serialized, reopened, exact-relinked and re-resolved while preserving the same self-describing locator. The same checkpoint preserves earlier browser evidence:

- `ADOPTION_PREVIEW_TRANSFORM_LOCK_PASS`;
- `REAL_SOURCE_CONSTRUCTION_X_ENDS_PASS`;
- `OWNER_RIG_ELEMENT_CREATE_UNDO_REDO_PASS`;
- `SOURCE_DERIVED_RIG_ELEMENT_CREATE_UNDO_REDO_PASS`;
- `REAL_SOURCE_PARENT_CHILD_LOCAL_POSE_PASS [ -1.125, 0, -0.8125 ]`;
- `BROWSER_REAL_OWNER_PATH_SMOKE_PASS`.

## Semantic boundaries

A construction **point** is not a frame. A constructed frame exists only when independent evidence supplies enough information for a rigid orientation and the complete derivation can be re-resolved from the exact `SourceRevision`.

The self-resolving recipe locator is subordinate SOURCE evidence, not authored authority and not a new asset database. Once explicitly adopted, the resulting `RigFrame` is Owner-authored truth; SOURCE provenance records where its measured proposal came from and does not create writeback authority.

No real `revolute` is authored yet. The wishbone-side hinge frame is grounded, but the second authored body/frame at the same physical hinge still requires independent justification. Inventing that second side merely to create a relation would weaken the evidence model.

## Current product limitations

- UI exposes one active `SourceInstance` context even though the project model supports multiple instances.
- Element authoring remains intentionally small; rename/delete/reparent information architecture is not final.
- The validated constructed-frame recipe/re-resolution path is domain/runtime proven; the newer Owner-facing recipe builder still requires rendered browser validation before it becomes a product claim.
- No arbitrary surface/vertex picker exists because current real work has not justified one.
- Mechanical relation vocabulary/axis conventions remain provisional.
- Representation separation is strong, but the exact Owner workflow and `rigid/aim/span/...` vocabulary remain provisional.
- No final kinematic evaluator/solver architecture exists.
- No JURE -> JV-Web consumer export/adapter exists yet.
- Current layout remains an engineering harness, not final information architecture.

## Next falsifier

Finish the smallest **Owner-reviewable construction-frame workflow** over the already validated recipe model:

1. Owner selects origin point, radial endpoint, exact up-start and exact up-end from one linked exact SOURCE revision;
2. JURE displays the resulting origin, local axes, algorithm/version and recipe provenance before any authored mutation;
3. invalid/degenerate/non-orthogonal evidence fails visibly and cannot be previewed;
4. with one authored `RigElement` selected, explicit Preview enters the existing `source-frame-adoption` operation;
5. Commit creates the frame + adoption evidence atomically; Cancel creates neither;
6. rendered browser proof on the real JV SOURCE verifies the lower wishbone recipe and preserves all existing owner-path regressions;
7. Save/Open/relink semantics remain protected by the already passing core + real-source checkpoint;
8. only after this Owner workflow is validated should the second body/frame at the hinge be independently grounded;
9. only then author one real neutral `revolute` and test local `+Z` mechanically.

Do not implement the whole suspension, generic CAD/picking, final representation, consumer export or solver in this slice.

## Owner / promotion boundary

Useful later Owner judgement:

- whether the construction recipe interaction is understandable and spatially useful;
- `Save As -> reopen -> exact SOURCE relink` with a real authored mechanism;
- first two-body mechanical relation and motion judgement.

Before any promotion to `main`, independently resolve PR #3 and exact `4db04eee...`, compare with `main`, retain PR #2 as recovery evidence and obtain explicit Owner approval. **Do not merge without explicit Owner approval.**

## Foundation exit criterion

Foundation is complete when the Owner can take a real JV mechanism and, without agent-side coordinate guessing:

`place/inspect exact SOURCE -> create authored elements/frames/mechanical intent -> map representation -> kinematically test/reset -> save/reopen -> export a small consumer-facing result`

Permanent rhythm after that:

`real need -> smallest vertical slice -> targeted falsifier -> rendered/Owner gate when useful -> next`.
