# Status

## Current state

Accepted product baseline remains `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`.

Active foundation convergence remains isolated on `work/foundation-convergence-v1` and aggregated in draft PR #1. The latest product/runtime implementation checkpoint is still FC-8. FC-9 changes are design/recovery documentation only; no replacement workbench UI has landed.

Owner-tested interaction evidence to preserve unless later falsified: free/unclamped inspection camera, Focus/Fit, direct Move/Rotate gizmo manipulation, world/local transforms, numeric editing over quaternion storage, preview/commit/cancel, undo/redo, and independent SOURCE/authored selection.

## Recovery discipline

- `main` remains accepted authority until explicit promotion.
- PR #1 remains DRAFT.
- Current repo/consumer evidence outranks chat reconstruction.
- Small recovery-safe slices end in `KEEP / CHANGE / DEFER / FALSIFIED` decisions.
- Synthetic tests prove only their exact invariant, never owner interaction or visual quality.
- Do not add speculative plugin/ECS/physics/editor frameworks.
- Visual concept images are review evidence, not repository authority.
- A successful image-generation tool call is not proof of a good or even reviewable design experiment.

## Closed foundation gates

### FC-0 — evidence freeze

Accepted owner-tested baseline was frozen; post-checkpoint `main` change was documentation-only.

Result: **KEEP accepted baseline**.

### FC-1 — JV round-trip atlas

Current JV evidence was separated into SOURCE, CONSUMER REFERENCE, provisional/runtime data, dynamics, temporary bridges and representation. Monolithic project JSON and loose owner-facing sidecars were falsified; one logical layered owner artifact remains the direction. Physical `.jure`/ZIP format remains deferred.

Result: **KEEP layered authority model**.

### FC-2 — project / authority contract

Exact `SourceRevision`, independent placed `SourceInstance`, external `ConsumerReferenceSnapshot`, project-level `SourceAdoptionRecord`, authored documents and fail-closed revision/rebind semantics are established.

Result: **KEEP exact project authority**.

### FC-3 — mechanical assembly

Neutral relation vocabulary is `origin-coincident`, `revolute`, `prismatic`, `spherical`, `distance`, `distance-range`. RigFrames carry anchor/orientation semantics; consumer dynamics remain outside authored rig truth.

Result: **KEEP neutral mechanics / DEFER solver and advanced spherical policy**.

### FC-4 — authored representation

Representation is a separate authored `RigRepresentationDocument` with multiple exact source-instance mappings (`rigid`, `aim`, `span`, optional roll correspondence). BIND-00 singleton storage is legacy proof only.

Result: **KEEP separate representation domain**.

### FC-5 — AUTHOR / TEST boundary

`RigTestState` + replaceable `RigEvaluator` provide transient revision-bound evaluated views, exact Reset and no automatic write-back into authored neutral.

Result: **KEEP evaluation boundary / DEFER solver choice**.

### FC-6 — logical round trip

Project parse/serialize is deterministic and fail-closed for unknown kinds and source/rebind mismatches. Physical bundle format remains deferred.

Result: **KEEP machine contract**.

### FC-7 — state ownership

Rig authoring, SOURCE runtime and TEST have explicit non-React state owners. App routes operations instead of owning domain mutation semantics; presentation/layout state remains disposable.

Result: **KEEP explicit owners**.

### FC-8 — owner workflow / UX architecture

Permanent RIG+SOURCE panel accumulation and disconnected Import/Author/Represent/Test pages were falsified. The retained model is one persistent spatial workbench with task contexts `Inspect | Author | Represent | Test`; project/viewport/camera continuity remains while context-specific tools/browser/inspector change.

Disposable semantic/state harness after FC-8: **42/42 PASS**.

Result: **KEEP persistent spatial workbench + task contexts**.

## FC-9 — complete workbench visual/product design / ACTIVE

No final replacement UI may land while the product/visual direction is unresolved.

### FC-9.0 — drift audit / CLOSED

No product-code drift was found before FC-9. `main` remained the exact accepted baseline.

Result: **SAFE TO CONTINUE FC-9**.

### FC-9A — surface/state contract / CLOSED

Canonical product/information contract: `docs/WORKBENCH_DESIGN_CONTRACT.md`.

It keeps visible separation of SOURCE / REFERENCE / AUTHORED / REPRESENTATION / EVALUATED; persistent project + spatial viewport continuity; context-specific Inspect/Author/Represent/Test tools; first-class revision/rebind/failure states; the real JV round trip; repeated source-instance, alternate suspension, piston, rotor/thruster and future Map Workspace counterexamples.

Result: **KEEP semantic workbench contract**.

### FC-9B.1 — previous visual-board method / FALSIFIED

Owner review on 2026-08-15 falsified the previous multi-screen visual-board approach as useful decision evidence.

Failure mechanism:
- several task contexts and several design questions were compressed into one generated board;
- images became presentation/infographic artifacts rather than readable application screens;
- density prevented practical inspection of hierarchy, controls and spatial priority;
- visual output drifted away from JURE-specific interaction despite correct high-level semantic material.

The generated boards are retained only as historical experiment evidence. They are **not** design candidates and do not satisfy FC-9B.

Result: **FALSIFIED — PRESENTATION METHODOLOGY, NOT FC-9A PRODUCT MODEL**.

### FC-9B.2 — research-grounded controlled divergence / ACTIVE

The restart first rechecked real interface evidence from JURE, HomeScan and JES, then benchmarked relevant professional spatial-tool interaction patterns. The experiment deliberately separates two variables that the failed pass mixed together: task context and design direction.

All divergent concepts now use one identical canonical stress scenario: **AUTHOR / JV M6 front-left suspension / selected authored `FL lower-ball` frame / active Move preview**. Required evidence is held constant: the same Elements, Frames and Relations; SOURCE as read-only comparison; authored transform values; World/Local; Focus/Fit; Undo/Redo; Commit/Cancel; project revision/dirty state and one geometric warning. Scale and consumer dynamics/runtime tuning are explicitly absent from authored rig UI.

Four independent master-workbench hypotheses were issued as four separate image-generation sessions with no cross-image reference contamination:

1. **A — Modular Spatial Workshop**: flexible Blender/DCC-like spatial areas, compact hierarchy/properties, maximizable viewport, expert shortcut language.
2. **B — Calm Precision Instrument**: HomeScan-derived progressive disclosure, calmer hierarchy, mixed light chrome + dark stage, comfortable technical typography.
3. **C — Assembly Engineering Workbench**: assembly/relationship-first browser, contextual Author command strip, precise grouped inspector, folded diagnostics/history.
4. **D — Immersive Contextual Instrument**: maximum viewport, retractable chrome, selection-driven contextual inspector and numeric operation HUD.

Every image prompt requires exactly one full desktop app screenshot and explicitly rejects concept boards, comparison grids, outside annotations, multiple screens, sci-fi HUDs, generic AI dashboards, glassmorphism, fake metrics and irrelevant CAD/runtime controls.

Tooling limitation: the current Apixel connector renders generated images to the owner-facing UI but does not return the image pixels/file back into the assistant's inspection context. Therefore the assistant does **not** claim visual QA of the generated pixels. Owner-visible image review (or later supplied screenshots/files) is required before any candidate can be kept or rejected visually.

Current result: **CONTROLLED DIVERGENCE GENERATED / OWNER VISUAL REVIEW NEXT / NO DESIGN ACCEPTANCE**.

### FC-9B.3 — convergence / BLOCKED ON REVIEW

After comparing A/B/C/D, keep useful traits rather than automatically selecting a whole image. Then:

1. generate one or two hybrid AUTHOR candidates as separate screens;
2. accept one master AUTHOR direction only after owner review;
3. use that accepted visual direction as the reference for separate Inspect, Represent, Test and revision/rebind screens — one generation session per screen;
4. validate the resulting family for continuity, authority semantics, long-session readability and future Map Workspace compatibility.

Only this accepted complete family can become implementation design authority.

### FC-9C — design system -> replacement implementation / BLOCKED

After FC-9B acceptance:

1. extract typography, spacing, surfaces, icons, status semantics, component families and allowed visible copy;
2. define component/state ownership so `App` remains composition glue;
3. replace the engineering shell in small vertical slices;
4. browser-test each slice and compare rendered screenshots to the accepted concept;
5. require owner interaction/visual evidence before promotion.

## Validation / tooling boundary

Canonical full `npm run check` is still **NOT CLAIMED** in this execution environment. No product UI code has been added in FC-9, so the semantic/state evidence remains the FC-8 **42/42 PASS** boundary.

Repository still has no `package-lock.json`; create it only from a canonical successful install rather than an unverified environment.
