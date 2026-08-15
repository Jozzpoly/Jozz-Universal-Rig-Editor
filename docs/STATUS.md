# Status

## Current state

Accepted product baseline remains `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`.

Active foundation convergence is isolated on `work/foundation-convergence-v1` and aggregated in draft PR #1. Current pre-FC-9 head was `fd2f2da49a5250cff7dec27ee5bc35b626819460`.

The convergence branch has now closed the semantic/state foundation required before replacing the engineering UI. Current panel placement, styling and navigation grouping remain disposable. Owner-tested interaction evidence to preserve unless falsified: free/unclamped inspection camera, Focus/Fit, direct Move/Rotate gizmo manipulation, world/local transforms, numeric editing over quaternion storage, preview/commit/cancel, undo/redo, and independent SOURCE/authored selection.

## Recovery discipline

- `main` remains accepted authority until explicit promotion.
- Work stays on `work/foundation-convergence-v1`; PR #1 remains DRAFT.
- Every gate or risky slice ends in a small recovery-safe commit and a `KEEP / CHANGE / DEFER / FALSIFIED` result.
- Current repo/JV evidence outranks chat plans and historical tooling.
- Synthetic tests prove only their exact invariant, never owner interaction/product feel.
- Do not add speculative plugin/ECS/physics/editor frameworks.
- Git tree -> commit -> non-force ref update is the write boundary. A real FC-3 connection failure already proved this recovery model: branch HEAD stayed intact and only the idempotent tree step had to be retried.

## Closed convergence gates

### FC-0 — evidence freeze

Run base and owner-tested BIND/SOURCE evidence were frozen before new work. Post-checkpoint `main` changes were documentation-only.

Result: **KEEP accepted baseline / SAFE TO REFOUND ABOVE IT**.

### FC-1 — real JV round-trip atlas

Current JV separates SOURCE facts/hints, CONSUMER REFERENCE, provisional runtime geometry/topology, dynamics, temporary bridges and representation. Current JV runtime therefore cannot be imported wholesale as authored truth.

Falsification result:
- monolithic project JSON: **FALSIFIED**;
- loose owner-facing sidecars: **FALSIFIED**;
- one owner-visible logical layered bundle: **KEEP**;
- physical ZIP/`.jure` container: **DEFERRED**.

Authority chain:

`SOURCE / CONSUMER REFERENCE / PROPOSAL -> explicit adoption/edit -> AUTHORED domain documents -> TEST/EVALUATION -> derived consumer export`

### FC-2 — project / authority contract

Project layer now distinguishes exact `SourceRevision`, independent placed `SourceInstance`, external `ConsumerReferenceSnapshot`, project-level `SourceAdoptionRecord`, and authored domain documents. Kernel provenance stays revision-local (`sourceRevisionId + locator`) rather than depending on project placement state. Revision/rebind mismatches fail closed.

Result: **KEEP exact project authority + placed-instance adoption context**.

### FC-3 — mechanical assembly

Neutral relation vocabulary: `origin-coincident`, `revolute`, `prismatic`, `spherical`, `distance`, `distance-range`. For revolute/prismatic, participating RigFrames are full joint datums: origin = anchor, local +Z = primary DOF axis, authored neutral = zero coordinate. Consumer mass/inertia/friction/Hertz/damping/motors/solver/Box3D IDs remain outside the authored kernel.

Wishbone/steering/wheel, piston and rotor counterexamples passed synthetically.

Result: **KEEP neutral mechanical intent / DEFER solver + advanced spherical policy**.

### FC-4 — authored representation

Representation is a separate authored `RigRepresentationDocument`, not part of `RigDocument` and not consumer-only. Initial geometric correspondence vocabulary: `rigid`, `aim`, `span`, with optional roll correspondence. Mappings capture exact SourceInstance + SourceRevision + locator. BIND-00 singleton storage remains falsified and quarantined as proof evidence only.

Result: **KEEP separate authored representation domain**.

### FC-5 — AUTHOR / TEST boundary

`RigTestState` and replaceable `RigEvaluator` provide revision-bound transient pose overrides. Invalid/stale output fails closed; leaving/resetting TEST removes evaluated influence; evaluated state never writes back automatically to authored neutral.

Result: **KEEP evaluator boundary / DEFER solver implementation choice**.

### FC-6 — deterministic logical project round trip

Logical project parse/serialize is deterministic and fail-closed. Unknown relation/binding/document kinds are runtime errors; canonical save emits only known schema fields; source/rebind mismatch blocks serialization. Physical bundle format remains deferred.

Result: **KEEP machine contract / DEFER physical container**.

### FC-7 — state ownership

Explicit owners now exist for rig authoring (`RigAuthoringState`), loaded SOURCE + SOURCE selection (`SourceRuntimeState`) and TEST (`RigTestState`). Project/kernel/representation remain outside React. File handle is IO-session state; camera/layout/layers are presentation state. Current `App` routes authored and SOURCE operations rather than owning their mutation semantics.

Result: **KEEP explicit owners / STOP semantic architecture growth inside App**.

### FC-8 — owner workflow / UX architecture

Three information architectures were walked through the real JV round trip plus multi-source, piston, rotor and future map-workspace counterexamples.

- permanently extend current RIG/SOURCE/Inspector layout: **FALSIFIED** — it becomes a panel accumulator;
- separate full pages for Import/Author/Representation/Test: **FALSIFIED** — breaks spatial, camera and comparison continuity;
- persistent spatial workbench + explicit task contexts: **KEEP**.

Pure `RigWorkspaceState` now defines `inspect | author | represent | test` without JSX/layout/CSS. Context switching does not mutate authored truth; active authored preview blocks switching; TEST starts fresh transient state; leaving TEST discards controls/result; Reset remains transient.

Disposable foundation harness after FC-8: **42/42 PASS**.

Result: **KEEP persistent spatial workbench + task contexts**.

## FC-9 — complete workbench visual/product design / ACTIVE

Purpose: design the complete Rig Workspace before replacing the engineering shell. This is not a cosmetic retrofit and no final UI code should be landed while the visual/information concept is unresolved.

### FC-9A — surface/state atlas

Define the complete owner-visible surface and required states for one persistent project/viewport context:
- workbench-level project identity, Open/Save/Export and revision/rebind health;
- multi-SourceRevision / SourceInstance management that remains available across task contexts;
- **Inspect**: SOURCE + CONSUMER REFERENCE inspection/comparison, diagnostics, explicit proposal/adoption actions;
- **Author**: elements/frames/relations, free virtual construction, selection, direct manipulation, numeric transforms and relation diagnostics;
- **Represent**: exact source target <-> authored datum mapping, multiple bindings, rigid/aim/span/roll semantics, mismatch/rebind diagnostics;
- **Test**: transient controls/evaluation/diagnostics, authored editing locked, exact Reset, clear authored-vs-evaluated distinction;
- failure states: missing source/revision, stale REFERENCE, unresolved rebind, invalid mapping, blocked context switch due to active preview, unsaved authored work.

FC-9A must also specify what remains persistent while task context changes: project, viewport/camera, spatial selection comparison and visibility context where semantically safe. It must specify what is context-local and disposable.

### FC-9B — coordinated visual concepts

Create a coherent visual system and complete concepts for Inspect, Author, Represent and Test as states of the same workbench. Preserve the validated interaction mechanics, but do not preserve the old shell merely because it exists. Concepts must remain practical React UI, readable on a normal desktop browser, and must show enough real editor chrome/detail to become an implementation spec rather than mood art.

### FC-9C — concept acceptance -> design system -> first replacement slice

Only after the complete concept is coherent and owner-reviewed:
1. extract typography, spacing, surfaces, borders, controls, icons, status semantics and component families;
2. define the component ownership map so `App` remains composition glue;
3. replace the old shell in small vertical slices with browser/visual comparison after each slice;
4. preserve the old accepted mechanics until each replacement is independently proven.

A future Map Workspace remains the second-domain counterexample. It may share project/source/workbench infrastructure, but FC-9 must not introduce a speculative plugin framework or pollute rig domain schemas.

## BIND-00 preserved evidence

Accepted exact source evidence remains `OneSided_Steering_Suspension_Rig.gltf`, SHA-256 `fc1e8bd0e298a66fa79c43324708e281073ea8fb7a7aad2728702653705c0ee1`, 15 nodes / 14 joints / 1 skinned mesh in the tested revision. It proved exact source skin-joint drive from authored rigid truth while SOURCE remains fixed and falsified global-singleton representation storage.

## Validation / tooling boundary

Canonical full `npm run check` is still **NOT CLAIMED** in this execution environment. One direct fresh disposable clone/install attempt was stopped immediately when the environment could not resolve `github.com`; no workaround chain was pursued.

Repository still has no `package-lock.json`; create it from a canonical successful install rather than from an unverified environment.
