# Status

## Authority

- **accepted baseline:** `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`;
- **clean foundation candidate:** `promotion/foundation-ready-squash-2026-08-16@4db04eee4da0216f6bd3df6b6b0c82aa20afab5a` / draft PR #3;
- **active product work:** `work/real-jv-rig-elements`;
- **latest validated product SHA:** `4fc36d2b8430bfd699c4699500c7bb273ebe60d7`;
- **latest frozen checkpoint:** `checkpoint/real-jv-rigid-geometry-construction-points-2026-08-16@4fc36d2b8430bfd699c4699500c7bb273ebe60d7`;
- **checkpoint browser run:** `31954362885` — Linux Chrome PASS + Windows Chrome PASS;
- **active product review boundary:** draft PR #4 targeting the clean foundation candidate, not `main`.

The active product line was intentionally created from the exact clean candidate rather than from `main`. `main` remains untouched. PR #2 retains recovery/foundation evidence; PR #3 remains the explicit clean promotion candidate. Neither PR #3 nor PR #4 may be merged merely because CI is green.

## Product purpose

JURE is an owner-first spatial rigging workbench. The Owner should be able to inspect exact real assets, create/correct authored rig truth, express mechanical and representation intent, test a mechanism without mutating authored neutral truth, and hand a small reliable result to a consumer without agent-side coordinate guessing.

JV/JV-Web is the first real consumer/falsifier. Native JV and later JV/VAW experiments should remain possible without making JURE vehicle-specific or turning it into a generic framework.

## Demonstrated product foundation

The active line now demonstrates:

- rigid `RigElement` and owner-local/root `RigFrame` authoring;
- free Owner-facing `RigElement` creation with deterministic IDs, selection and chronological Undo/Redo;
- exact SOURCE datum -> new authored `RigElement` origin as one atomic project operation;
- immutable `SourceAdoptionRecord(kind: 'element')` plus exact kernel SOURCE provenance;
- exact SOURCE datum -> authored `RigFrame` adoption into a selected element;
- correct conversion from exact SOURCE project-world pose to owner-local authored frame pose;
- **geometry-derived point construction datums from conservatively recovered rigid skin geometry**;
- explicit point-only semantics for those construction datums: position is derived, mechanical orientation is not invented;
- Move/Rotate, world/local and numeric XYZ-degree editing over quaternion storage;
- one chronological `ProjectSession` history for SOURCE placement and authored project changes;
- exact immutable `SourceRevision` identity and independently placed `SourceInstance`s;
- deterministic logical project save/open and exact SOURCE relink boundaries;
- separate provisional mechanical-relation, representation and AUTHOR/TEST domains.

Canonical validation at `4fc36d2...`:

- Node `24.16.0` / npm `11.17.0`;
- locked `npm ci`: PASS;
- TypeScript: PASS;
- **23 core test files / 113 PASS / 0 FAIL**;
- Vite production build: PASS;
- Work check run `31954326144`: PASS.

The existing >500 kB minified main-chunk warning remains non-blocking build debt; it is not evidence to interrupt current real rig authoring.

## Exact real-SOURCE rendered evidence

Pinned SOURCE:

`Jozzpoly/Box3d_FunProject@959aefb78587ce60cf2b8eb03ff82797a4165142/assets/source/OneSided_Steering_Suspension_Rig.gltf`

- Git blob: `06d5c66f6d13fb64863ab15a660f060358872291`;
- SHA-256: `57cda983f8f728bc819460540d2ee39b1b17288ecdac1f0dc8bb1a3e6f9ab750`;
- size: 64,264 bytes;
- current inspection: 15 nodes / 14 joints / 1 skinned mesh.

Checkpoint run `31954362885` passes on Linux Chrome and Windows Chrome. Both platform logs contain:

`REAL_SOURCE_CONSTRUCTION_X_ENDS_PASS`

with **14 total construction points** and identical exact wishbone-piece X endpoints:

```text
Chassis_Top   X min = [-0.8125, 0.96875, 0]
Chassis_Top   X max = [ 0.5,    0.96875, 0]
Chassis_Bottom X min = [-0.8125, 0.03125, 0]
Chassis_Bottom X max = [ 0.5,    0.03125, 0]
```

The construction rows point back to exact SOURCE joint nodes `gltf2.node:3` (`Chassis_Top`) and `gltf2.node:5` (`Chassis_Bottom`) and use versioned derived locators such as:

`gltf2.derived:rigid-x-end-v1:gltf2.node%3A5:max`

The workbench deliberately renders these as **read-only geometry-derived construction points**. They are not selectable as authored rigid frames and explicitly state that no authored/mechanical orientation is claimed.

The same checkpoint also preserves all earlier real-owner-path evidence:

- `ADOPTION_PREVIEW_TRANSFORM_LOCK_PASS`;
- `OWNER_RIG_ELEMENT_CREATE_UNDO_REDO_PASS`;
- `SOURCE_DERIVED_RIG_ELEMENT_CREATE_UNDO_REDO_PASS`;
- `REAL_SOURCE_PARENT_CHILD_LOCAL_POSE_PASS [ -1.125, 0, -0.8125 ]`;
- `BROWSER_REAL_OWNER_PATH_SMOKE_PASS`.

## Why construction points were justified

Current JV S2 evidence falsified the assumption that the `Chassis_Top` / `Chassis_Bottom` node origins are the real wishbone hinge/end hardpoints. The current source-registration tooling recovers the relevant inboard/outboard points from rigid-part geometry X extremes instead.

That was the concrete missing-datum case required by the JURE plan before adding any construction geometry. JURE therefore implemented only the demonstrated need: deterministic rigid-geometry X-end points. It did **not** add an arbitrary vertex picker or generic CAD/construction subsystem.

The glTF extractor is conservative:

- rigid one-joint skin ownership is accepted;
- soft/mixed weights do not yield construction datums;
- mixed-owner triangles do not yield construction datums;
- external-buffer glTF remains inspectable but does not pretend unavailable geometry-derived points exist.

## Durable semantic boundary

A construction **point** is not a `RigFrame`.

The real wishbone hinge now has evidence for its origin, but a revolute relation requires an oriented frame whose local `+Z` defines its primary axis. JURE must not obtain that orientation by copying an arbitrary node quaternion or assigning identity.

Current JV S2 provides a useful falsifier for the next step: it combines the exact suspension-travel direction with the geometry-derived arm axial direction and forms the wishbone spread/hinge direction by a cross product. That relationship must be independently encoded and validated in JURE before any first real revolute relation is authored.

## Current product limitations

- UI exposes one active SourceInstance context even though the project model supports multiple placed instances.
- Element authoring remains intentionally small: create/name/source-derived origin/selection/history; no dedicated rename/delete/reparent information architecture yet.
- Construction points are currently inspection-only; no constructed oriented frame workflow exists yet.
- There is no arbitrary surface/vertex picking because no current real need justifies it.
- Mechanical relation enum/axis conventions are provisional.
- Representation is separated correctly but its exact `rigid/aim/span/...` vocabulary and Owner workflow remain provisional.
- AUTHOR/TEST separation exists, but no final kinematic evaluator/solver is architecture yet.
- There is no JURE -> JV-Web consumer export/adapter yet.
- Current layout is an engineering harness, not final information architecture.

## Next falsifier

Build the **smallest evidence-backed oriented construction frame** needed for the first real wishbone hinge, without yet creating the whole suspension.

Required sequence:

1. treat geometry X-end point as hinge-origin evidence only;
2. derive the arm axial direction from the matching geometry min/max endpoints;
3. derive the SOURCE up/travel direction from exact `Axis_SuspensionTravel_Bottom -> Axis_SuspensionTravel_Top`;
4. verify the two directions are finite, non-degenerate and orthogonal within a strict tolerance on the exact real asset;
5. derive the hinge/spread axis by cross product;
6. construct one deterministic right-handed rigid frame with explicit component provenance and local `+Z` equal to that hinge axis;
7. only after core + real-source validation allow that full construction frame to cross into authored `RigFrame` truth;
8. then test whether one real `revolute` relation genuinely fits the mechanism.

Do not infer final meaning solely from node names, copy the full JV M6 topology, or implement final representation/export/solver in the same slice.

## Owner/promotion boundary

Useful later Owner checks, not current technical blockers:

- judgement of free element, SOURCE-derived element and future construction-frame interactions;
- `Save As -> reopen -> exact SOURCE relink` with real authored mechanism data;
- spatial/mechanical judgement once the first relation connects real components.

Before any promotion to `main`, independently resolve draft PR #3 and exact `4db04eee...`, compare it with `main`, keep PR #2 as recovery evidence, and obtain explicit Owner approval. **Do not merge without explicit Owner approval.**

## Foundation exit criterion

Foundation is complete when the Owner can take a real JV mechanism and, without agent-side coordinate guessing:

`place/inspect exact SOURCE -> create authored elements/frames/mechanical intent -> map representation -> kinematically test/reset -> save/reopen -> export a small consumer-facing result`

After that the permanent rhythm is:

`real need -> small vertical slice -> targeted test -> owner-visible gate when needed -> next`.
