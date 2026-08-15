# Status

## Current state

Accepted product baseline remains `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`.

Active foundation convergence is isolated on `work/foundation-convergence-v1` and aggregated in draft PR #1. The latest implementation checkpoint remains the FC-8 workbench-state line; FC-9 work after that point is design/documentation only. The design-contract checkpoint before this status update is `1040de419e206416f003ea80e740e7015ebe4490`.

The semantic/state foundation required before replacing the engineering UI is closed. Current panel placement, styling and navigation grouping remain disposable. Owner-tested interaction evidence to preserve unless falsified: free/unclamped inspection camera, Focus/Fit, direct Move/Rotate gizmo manipulation, world/local transforms, numeric editing over quaternion storage, preview/commit/cancel, undo/redo, and independent SOURCE/authored selection.

## Recovery discipline

- `main` remains accepted authority until explicit promotion.
- Work stays on `work/foundation-convergence-v1`; PR #1 remains DRAFT.
- Every gate or risky slice ends in a small recovery-safe commit and a `KEEP / CHANGE / DEFER / FALSIFIED` result.
- Current repo/JV evidence outranks chat plans and historical tooling.
- Synthetic tests prove only their exact invariant, never owner interaction/product feel.
- Do not add speculative plugin/ECS/physics/editor frameworks.
- Git tree -> commit -> non-force ref update is the write boundary. A real FC-3 connection failure already proved this recovery model: branch HEAD stayed intact and only the idempotent tree step had to be retried.
- Visual concept images are review evidence, not repository authority. `docs/WORKBENCH_DESIGN_CONTRACT.md` contains the reproducible brief/contract if a conversation or image-generation session is lost.

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

Project layer distinguishes exact `SourceRevision`, independent placed `SourceInstance`, external `ConsumerReferenceSnapshot`, project-level `SourceAdoptionRecord`, and authored domain documents. Kernel provenance stays revision-local (`sourceRevisionId + locator`) rather than depending on project placement state. Revision/rebind mismatches fail closed.

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

Explicit owners exist for rig authoring (`RigAuthoringState`), loaded SOURCE + SOURCE selection (`SourceRuntimeState`) and TEST (`RigTestState`). Project/kernel/representation remain outside React. File handle is IO-session state; camera/layout/layers are presentation state. Current `App` routes authored and SOURCE operations rather than owning their mutation semantics.

Result: **KEEP explicit owners / STOP semantic architecture growth inside App**.

### FC-8 — owner workflow / UX architecture

Three information architectures were walked through the real JV round trip plus multi-source, piston, rotor and future map-workspace counterexamples.

- permanently extend current RIG/SOURCE/Inspector layout: **FALSIFIED** — it becomes a panel accumulator;
- separate full pages for Import/Author/Representation/Test: **FALSIFIED** — breaks spatial, camera and comparison continuity;
- persistent spatial workbench + explicit task contexts: **KEEP**.

Pure `RigWorkspaceState` defines `inspect | author | represent | test` without JSX/layout/CSS. Context switching does not mutate authored truth; active authored preview blocks switching; TEST starts fresh transient state; leaving TEST discards controls/result; Reset remains transient.

Disposable foundation harness after FC-8: **42/42 PASS**.

Result: **KEEP persistent spatial workbench + task contexts**.

## FC-9 — complete workbench visual/product design / ACTIVE

Purpose: design the complete Rig Workspace before replacing the engineering shell. This is not a cosmetic retrofit. No final replacement UI code may land while the visual/product concept is unresolved.

### FC-9.0 — drift audit / CLOSED

At the start of this gate, draft PR #1 had advanced one commit beyond the previous recovery head. The extra commit was `59d4781958ea9f1ccdbddb71014e5cb08790fc46` (`foundation: open FC-9 workbench design gate`). Exact comparison against `fd2f2da49a5250cff7dec27ee5bc35b626819460` showed one changed file only: `docs/STATUS.md`. No product code or semantic implementation drift was introduced. `main` remained exactly `d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`.

Result: **KEEP drift commit / SAFE TO CONTINUE FC-9**.

### FC-9A — surface/state contract / CLOSED

Canonical design contract: `docs/WORKBENCH_DESIGN_CONTRACT.md`.

It defines:
- JURE as an owner-first spatial engineering workbench, not a Box3D parameter/debug dashboard;
- visible separation of SOURCE / REFERENCE / AUTHORED / REPRESENTATION / EVALUATED authority;
- persistent project + viewport/camera continuity;
- task contexts `Inspect | Author | Represent | Test` that swap task-oriented browser/inspector/tools instead of stacking permanent panels;
- workbench-level project/source/revision/export health;
- exact context contracts, actions and forbidden behaviors;
- persistent vs context-local state;
- first-class revision/rebind/failure states;
- full JV agent -> JURE -> owner -> export -> JV adapter walkthrough;
- counterexamples: four instances from one source revision, alternate suspension, piston, rotor/thruster and future Map Workspace;
- visual-direction constraints and the complete FC-9B concept inventory.

The contract survived the real JV round-trip constraints and the listed counterexamples without a new global ontology, vehicle-specific workbench primitive or speculative plugin system.

Result: **KEEP persistent workbench anatomy + context-specific information architecture**.

### FC-9B — coordinated visual concepts / OWNER REVIEW GATE

A coordinated concept pass was generated from one shared design brief for:
1. **Inspect** — multi-source + consumer reference comparison and explicit adoption actions;
2. **Author** — elements/frames/relations, direct gizmo manipulation, numeric transforms and diagnostics;
3. **Represent** — multiple simultaneous mappings, span/roll correspondence and broken-rebind state;
4. **Test** — authored editing locked, transient controls, evaluated-vs-neutral comparison and exact Reset;
5. **Revision/rebind failure detail** — exact old/new revision comparison, authored target unchanged, Save/Test vs Export blocking semantics.

Shared direction: serious modern CAD/creative engineering tool; viewport-first; dark neutral graphite/charcoal; restrained cool interaction accent; muted warnings; low ornament; precise 1px surfaces; medium density; no sci-fi HUD, dashboard cards, glassmorphism, decorative gradients or nested bento layouts.

Important boundary: generated concept images are **not yet accepted design authority**. They require owner visual/product review. Their reproducible requirements live in `docs/WORKBENCH_DESIGN_CONTRACT.md`; if image evidence is lost, regenerate from that contract rather than reconstructing from memory.

Result: **DESIGN CANDIDATE GENERATED / IMPLEMENTATION BLOCKED ON OWNER CONCEPT REVIEW**.

### FC-9C — accepted concept -> design system -> replacement implementation / BLOCKED

Do not begin until FC-9B is owner-reviewed and accepted or revised.

After acceptance:
1. extract exact typography, spacing, surfaces, borders, controls, icons, status semantics and component families from the accepted concept;
2. record the allowed visible copy and authority/status language;
3. define component/state ownership so `App` remains composition glue;
4. replace the old shell in small vertical slices, preserving validated mechanics until each replacement is independently proven;
5. browser-test the real workflow and compare implementation screenshots against the accepted concept after every visual slice;
6. only after visual/interaction owner evidence decide whether the convergence PR is ready for promotion.

A future Map Workspace remains the second-domain counterexample. It may share project/source/file/viewport infrastructure, but FC-9 must not introduce a speculative plugin framework or pollute rig domain schemas.

## BIND-00 preserved evidence

Accepted exact source evidence remains `OneSided_Steering_Suspension_Rig.gltf`, SHA-256 `fc1e8bd0e298a66fa79c43324708e281073ea8fb7a7aad2728702653705c0ee1`, 15 nodes / 14 joints / 1 skinned mesh in the tested revision. It proved exact source skin-joint drive from authored rigid truth while SOURCE remains fixed and falsified global-singleton representation storage.

## Validation / tooling boundary

Canonical full `npm run check` is still **NOT CLAIMED** in this execution environment. One direct fresh disposable clone/install attempt was stopped immediately when the environment could not resolve `github.com`; no workaround chain was pursued.

No product UI code has been added in FC-9 so far. Disposable semantic/state evidence therefore remains the FC-8 **42/42 PASS** boundary; FC-9 currently adds product/design evidence, not new runtime claims.

Repository still has no `package-lock.json`; create it from a canonical successful install rather than from an unverified environment.
