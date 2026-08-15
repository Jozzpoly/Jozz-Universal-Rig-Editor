# Status

## Current state

Accepted product baseline remains `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`.

Active foundation convergence is isolated on `work/foundation-convergence-v1` and aggregated in draft PR #1. The latest implementation checkpoint remains the FC-8 workbench-state line; FC-9 work after that point is design/documentation only.

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
- A concept-generation tool call is not evidence that a concept exists. FC-9B only advances when the generated images are actually delivered and reviewable by the owner.

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

At the start of this gate, draft PR #1 had advanced one documentation-only commit beyond the previous recovery head. No product code or semantic implementation drift was introduced. `main` remained exactly `d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`.

Result: **KEEP drift commit / SAFE TO CONTINUE FC-9**.

### FC-9A — surface/state contract / CLOSED

Canonical design contract: `docs/WORKBENCH_DESIGN_CONTRACT.md`.

It defines JURE as an owner-first spatial engineering workbench; visible separation of SOURCE / REFERENCE / AUTHORED / REPRESENTATION / EVALUATED; persistent project + viewport continuity; task contexts `Inspect | Author | Represent | Test`; context-specific browser/inspector/tools; first-class revision/rebind/failure states; the complete JV round trip; and counterexamples including repeated source instances, alternate suspension, piston, rotor/thruster and a future Map Workspace.

Result: **KEEP persistent workbench anatomy + context-specific information architecture**.

### FC-9B — coordinated visual concepts / REOPENED

The first concept-generation attempt is **INVALID AS DESIGN EVIDENCE**.

Reason: the external image provider failed its connection/login path and the owner did not receive any concept images. The previous chat response incorrectly described the concept set as if it had been delivered. That claim is explicitly withdrawn. No visual concept from that attempt is accepted, reviewable, or part of project authority.

Result of failed attempt: **FALSIFIED DELIVERY / NO DESIGN ACCEPTANCE / NO IMPLEMENTATION PERMITTED**.

FC-9B is restarted with a stricter sequence:

1. **FC-9B.0 — current evidence audit**: re-read the workbench contract and owner-tested interaction evidence; identify what must survive and what must not bias the redesign.
2. **FC-9B.1 — master workbench concept**: establish one persistent visual/anatomical system first — viewport priority, project surface, task switcher, browser, inspector, status/diagnostics — using a real JURE/JV engineering scenario.
3. **FC-9B.2 — coordinated task states**: derive Inspect, Author, Represent and Test from that same master concept rather than generating unrelated screens independently.
4. **FC-9B.3 — hard states/details**: generate readable detail concepts for revision/rebind failure, active-preview blocked switching, and compact-laptop density if the primary screens do not prove those states clearly.
5. **FC-9B.4 — consistency/falsification review**: reject the set if the viewport becomes secondary, task contexts read like separate pages, authority is color-only, UI collapses into dashboard cards, source/representation state becomes hidden, or a future Map Workspace would require a different global shell.
6. **FC-9B.5 — owner review**: only actually delivered, readable images may enter owner review. Owner feedback may KEEP / CHANGE / FALSIFY the visual system or individual task states.

Visual generation must use a functioning image-generation path and must not rely on the failed provider. The repository contract, not a lost chat image, remains the reproducible source for regeneration.

### FC-9C — accepted concept -> design system -> replacement implementation / BLOCKED

Do not begin until FC-9B produces a delivered, owner-reviewed concept set.

After acceptance:
1. extract exact typography, spacing, surfaces, borders, controls, icons, status semantics and component families from the accepted concept;
2. record allowed visible copy and authority/status language;
3. define component/state ownership so `App` remains composition glue;
4. replace the old shell in small vertical slices, preserving validated mechanics until each replacement is independently proven;
5. browser-test the real workflow and compare implementation screenshots against the accepted concept after every visual slice;
6. only after visual/interaction owner evidence decide whether the convergence PR is ready for promotion.

A future Map Workspace remains the second-domain counterexample. It may share project/source/file/viewport infrastructure, but FC-9 must not introduce a speculative plugin framework or pollute rig domain schemas.

## BIND-00 preserved evidence

Accepted exact source evidence remains `OneSided_Steering_Suspension_Rig.gltf`, SHA-256 `fc1e8bd0e298a66fa79c43324708e281073ea8fb7a7aad2728702653705c0ee1`, 15 nodes / 14 joints / 1 skinned mesh. It proved exact source skin-joint drive from authored rigid truth while SOURCE remains fixed and falsified global-singleton representation storage.

## Validation / tooling boundary

Canonical full `npm run check` is still **NOT CLAIMED** in this execution environment. One direct fresh disposable clone/install attempt was stopped immediately when the environment could not resolve `github.com`; no workaround chain was pursued.

No product UI code has been added in FC-9 so far. Disposable semantic/state evidence therefore remains the FC-8 **42/42 PASS** boundary; FC-9 currently adds product/design evidence, not new runtime claims.

Repository still has no `package-lock.json`; create it from a canonical successful install rather than from an unverified environment.
