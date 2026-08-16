# Status

## Authority

- **accepted baseline:** `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`;
- **clean foundation candidate:** `promotion/foundation-ready-squash-2026-08-16@4db04eee4da0216f6bd3df6b6b0c82aa20afab5a` / draft PR #3;
- **active product work:** `work/real-jv-rig-elements`;
- **latest fully validated product SHA:** `06d5421efcf9c65f98a774de544e88ae77dba8c1`;
- **latest frozen checkpoint:** `checkpoint/real-jv-construction-frame-owner-workflow-2026-08-16@06d5421efcf9c65f98a774de544e88ae77dba8c1`;
- **checkpoint browser run:** `31957914832` — Linux Chrome PASS + Windows Chrome PASS;
- **active product review boundary:** draft PR #4 targeting the clean foundation candidate, not `main`.

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
- **Owner-facing construction-frame recipe builder** showing origin, local axes, algorithm/version and recipe provenance before authored mutation;
- invalid/degenerate recipe evidence visibly fails closed and cannot enter Preview;
- valid exact real-JV recipe enters the existing Preview/Commit adoption path and survives Undo/Redo;
- one chronological `ProjectSession` history for SOURCE placement and authored changes;
- separate mechanical-relation, representation and AUTHOR/TEST domains.

Canonical validation at `06d5421...`:

- Node `24.16.0` / npm `11.17.0`;
- locked `npm ci`: PASS;
- TypeScript: PASS;
- **25 core test files / 122 PASS / 0 FAIL**;
- Vite production build: PASS;
- exact checkpoint run `31957914832`: Linux PASS + Windows PASS.

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

Both Linux and Windows logs for run `31957914832` contain:

- `REAL_JV_WISHBONE_RECIPE_RERESOLVE_PASS`;
- `CONSTRUCTION_FRAME_INVALID_RECIPE_FAIL_CLOSED_PASS`;
- `CONSTRUCTION_FRAME_RECIPE_PREVIEW_READOUT_PASS`;
- `BROWSER_REAL_CONSTRUCTION_FRAME_AUTHORING_PASS`.

The Owner browser flow proves on the exact fixture:

`create authored owner -> open exact SOURCE -> choose four recipe components -> reject degenerate recipe -> inspect origin/+Z/locator -> Preview -> Commit -> Undo -> Redo`.

The same checkpoint preserves earlier browser evidence:

- `ADOPTION_PREVIEW_TRANSFORM_LOCK_PASS`;
- `REAL_SOURCE_CONSTRUCTION_X_ENDS_PASS`;
- `OWNER_RIG_ELEMENT_CREATE_UNDO_REDO_PASS`;
- `SOURCE_DERIVED_RIG_ELEMENT_CREATE_UNDO_REDO_PASS`;
- `REAL_SOURCE_PARENT_CHILD_LOCAL_POSE_PASS [ -1.125, 0, -0.8125 ]`;
- `BROWSER_REAL_OWNER_PATH_SMOKE_PASS`.

## Semantic boundaries

A construction **point** is not a frame. A constructed frame exists only when independent evidence supplies enough information for a rigid orientation and the complete derivation can be re-resolved from the exact `SourceRevision`.

The self-resolving recipe locator is subordinate SOURCE evidence, not authored authority and not a new asset database. Once explicitly adopted, the resulting `RigFrame` is Owner-authored truth; SOURCE provenance records where its measured proposal came from and does not create writeback authority.

No real `revolute` is authored yet. The wishbone-side hinge frame is grounded. The next missing evidence is **body ownership on both sides of the same physical hinge**, not a second geometric hardpoint. A neutral revolute should use coincident hinge frames owned by two distinct authored bodies; those body assignments must be explicit and independently justified.

## Current product limitations

- UI exposes one active `SourceInstance` context even though the project model supports multiple instances.
- Element authoring remains intentionally small; rename/delete/reparent information architecture is not final.
- The recipe builder currently needs to preserve its disposable recipe while Preview/Commit temporarily takes over project authoring so that one physical hinge can be explicitly adopted onto the second body without re-entering the recipe.
- No arbitrary surface/vertex picker exists because current real work has not justified one.
- Mechanical relation vocabulary/axis conventions remain provisional.
- Representation separation is strong, but the exact Owner workflow and `rigid/aim/span/...` vocabulary remain provisional.
- No final kinematic evaluator/solver architecture exists.
- No JURE -> JV-Web consumer export/adapter exists yet.
- Current layout remains an engineering harness, not final information architecture.

## Next falsifier

Build the smallest **two-body lower-wishbone hinge** without importing the whole JV topology:

1. preserve the already validated construction recipe in disposable UI state across Preview/Cancel/Commit;
2. make committed frame SOURCE provenance visible in the Inspector;
3. explicitly ground one authored lower-arm body from the exact `Chassis_Bottom` SOURCE part;
4. explicitly ground one authored chassis body using exact/Owner/secondary evidence without pretending the chosen chassis element origin is the hinge itself;
5. adopt the **same lower-hinge construction recipe** as a frame on both bodies;
6. prove the two resolved world frames coincide and their local `+Z` axes agree while their owner-local poses remain independently authored;
7. persist both frames/provenance through Save/Open/relink;
8. only after that add one minimal neutral `revolute` command and validate it through the existing single `ProjectSession` history;
9. then consider a tiny replaceable kinematic evaluator slice.

Do not implement the whole suspension, generic CAD/picking, final representation, consumer export or solver in this slice.

## Owner / promotion boundary

Useful later Owner judgement:

- whether the construction recipe interaction is understandable and spatially useful;
- `Save As -> reopen -> exact SOURCE relink` with a real two-body authored mechanism;
- first real revolute and motion judgement.

Before any promotion to `main`, independently resolve PR #3 and exact `4db04eee...`, compare with `main`, retain PR #2 as recovery evidence and obtain explicit Owner approval. **Do not merge without explicit Owner approval.**

## Foundation exit criterion

Foundation is complete when the Owner can take a real JV mechanism and, without agent-side coordinate guessing:

`place/inspect exact SOURCE -> create authored elements/frames/mechanical intent -> map representation -> kinematically test/reset -> save/reopen -> export a small consumer-facing result`

Permanent rhythm after that:

`real need -> smallest vertical slice -> targeted falsifier -> rendered/Owner gate when useful -> next`.
