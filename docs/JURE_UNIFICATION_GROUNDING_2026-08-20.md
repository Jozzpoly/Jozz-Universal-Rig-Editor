# JURE-UNIFY-00 Grounding — 2026-08-20

Status: **next-stage design / audit / falsification contract**.

This document does not authorize a broad refactor. It defines what must be understood and frozen before JURE-wide UI/core unification work is implemented.

## 1. Why this stage exists

JURE now has two real authored domains in one product experiment:

- accepted Rig workbench behavior on `main`;
- experimental Map workbench behavior on draft PR #5, including owner-passed Box Face Resize, World/Local Move/Rotate and MAP-ENTITY-01 structural lifecycle.

The current product presentation is still visibly split: Rig and Map use different shell composition, panel structures, toolbar placement and styling even though they increasingly expose analogous editor concerns.

The owner wants the next project direction to examine JURE fundamentally as one coherent application: visual language, UI, core mechanics and the relationship between Rig and Map.

That goal is legitimate. The risk is equally real: premature unification can turn provisional Map concepts into permanent shared ontology or damage owner-accepted Rig behavior merely to reduce superficial duplication.

## 2. Entry evidence

JURE-UNIFY-00 begins only because the following evidence exists:

- `RigDocument` and `MapDocument` already coexist without sharing authored schemas;
- generic `EditorSession<Document>` is proven by both domains;
- symmetric workspace routing exists;
- both domains have real viewport authoring, selection, history and transform concerns;
- Map has owner-passed geometry editing and structural lifecycle rather than only a fixed fixture;
- MAP-ENTITY-01 exact owner-tested product head is `5740a0510a74b98450d14ec2b7f2293ca042ce95`;
- exact-head CI `check` run #98 / id `32415027293` passed before owner testing;
- owner explicitly PASSed MAP-ENTITY-01 and supplied two detailed recordings consistent with that verdict.

This is enough to investigate shared product/editor seams. It is not enough to declare a universal editor model.

## 3. Hard invariants during unification

Unless separately falsified and explicitly accepted:

1. `RigDocument` remains authored Rig truth.
2. `MapDocument` remains authored Map truth.
3. Renderer/Three objects remain disposable projections.
4. Selection, camera, workspace layout and transform-space preference remain non-authored presentation/editor state.
5. Domain commands remain domain-owned.
6. Accepted Rig behavior is a regression baseline, not expendable prototype behavior.
7. Owner-passed Map Box Resize, World/Local and MAP-ENTITY behavior are regression gates for their accepted scope.
8. World Resize remains undefined.
9. Capsule Resize remains undefined.
10. `.copy.N` identity/naming remains provisional.
11. Product/UI unity must not imply authored-domain unity.

## 4. The architecture hypothesis to falsify

The strongest current hypothesis is:

```text
JURE product shell
  ├─ shared visual system / tokens / UI primitives
  ├─ shared proven editor mechanics
  ├─ workspace navigation / document chrome
  └─ domain workspaces
       ├─ Rig adapter -> RigDocument + rig commands + rig projections
       └─ Map adapter -> MapDocument + map commands + map projections
```

This is preferred over:

```text
Universal Scene/Object/Entity editor
  -> one generic authored object model
  -> Rig and Map forced into the same ontology
```

The first model must still earn its exact component boundaries through code audit and narrow implementation evidence.

## 5. Four layers that must be kept separate during the audit

### A. Product unity

Candidate shared concerns:

- JURE branding and workspace switcher;
- top-level application shell;
- panel docking/collapse/resize behavior;
- topbar/document/history chrome;
- status bar;
- visual design tokens;
- typography, spacing, controls, focus/disabled/active states;
- common viewport overlay language;
- consistent Navigator/Inspector affordances.

These are the safest first unification targets because they can improve product coherence without changing authored semantics.

### B. Shared editor mechanics

Already proven:

- `EditorSession<Document>` revision/preview/history lifecycle;
- small workspace routing seam.

Candidates that require evidence before extraction:

- selection lifecycle/reconciliation;
- transform lifecycle contract;
- transform-space presentation state;
- numeric field primitives;
- camera/focus utilities;
- dirty-state/document-state UX;
- file-operation chrome;
- diagnostics/status presentation.

### C. Domain semantics

Must remain separate unless explicit evidence proves otherwise:

Rig:

- element/frame/relation semantics;
- SOURCE and provenance;
- representation binding;
- owner-local frame transformations.

Map:

- entity/spawn semantics;
- collision shapes;
- surface semantics;
- signed-face box resize;
- future capsule/non-primitive authoring.

### D. Projection/runtime adapters

Three/render/controller infrastructure may share utilities only where both real consumers prove identical needs. Shared renderer technology is not evidence for shared authored meaning.

## 6. Required JURE-UNIFY-00 audit

Before broad implementation, inspect the live code and produce an explicit matrix for at least:

- Rig `WorkspaceShell` vs Map grid shell;
- Rig `TopBar` vs Map topbar;
- Rig `ViewportChrome` vs Map transform/fit chrome;
- Rig Navigator patterns vs Map entity/spawn navigator;
- Rig Inspector patterns vs Map Inspector;
- status bars;
- design tokens and duplicated CSS values;
- responsive behavior;
- document identity/revision/history affordances;
- workspace routing;
- selection and transform state ownership;
- file/open/save boundaries;
- render/controller boundaries.

For every candidate seam classify it as:

- **PROVEN SHARED** — safe to extract/use now;
- **VISUALLY SHARED** — product primitive only; domain behavior stays injected;
- **DOMAIN-SPECIFIC** — do not generalize;
- **PROVISIONAL** — defer until another falsifier;
- **UNKNOWN** — requires experiment.

## 7. Required regression gates

Any first unification implementation slice must preserve at minimum:

### Rig baseline

- workspace opens normally;
- Navigator/viewport/Inspector composition remains usable;
- Move/Rotate World/Local works;
- numeric pose editing works;
- preview/commit/cancel + Undo/Redo works;
- Open/Save/Save As remains functional;
- SOURCE inspection remains distinct from authored selection;
- Focus/Fit behavior remains functional.

### Map accepted slices

- Rig <-> Map routing remains symmetric;
- Move/Rotate World/Local remains correct;
- Resize remains Local-only;
- Box Face Resize opposite-face-fixed + Alt center behavior remains correct;
- exact Dimensions remain center-preserving;
- Duplicate/Delete/history/selection reconciliation remains correct;
- capsule Resize remains unavailable rather than accidentally inheriting box semantics.

## 8. Recommended sequencing

The next work should proceed in this order unless the audit finds contrary evidence:

1. **JURE-UNIFY-00 audit** — live code comparison and classification matrix; no broad refactor.
2. **Freeze the first narrow unification slice** with explicit before/after owner criteria.
3. Prefer a low-semantic-risk slice such as shared shell/design tokens/panel primitives before shared domain mechanics.
4. Implement only that slice and run full machine + owner regression gates in both Rig and Map.
5. Reassess whether the next slice should be UI/core unification or MAP-PERSIST-01.
6. Keep MAP-PERSIST-01 and first non-primitive representation inside the broader Map-foundation stop condition.

## 9. Persistence decision rule

MAP-PERSIST-01 must not be forgotten merely because UI unification is attractive.

During JURE-UNIFY-00 decide whether persistence should be:

- implemented before shell changes because document lifecycle drives the shell contract;
- implemented as a Map-specific consumer of a small shared document/file chrome;
- implemented directly after the first shell slice once the shared UX boundary is clearer.

Do **not** create a universal file-I/O framework merely to satisfy symmetry.

## 10. Stop conditions for JURE-UNIFY-00

The design/audit stage is complete only when:

- the live Rig/Map overlap matrix exists;
- regression gates are explicit;
- shared vs domain-specific boundaries are written down;
- one smallest high-information implementation slice is selected;
- the owner-facing visual/product goal for that slice is concrete enough to test;
- the relationship to MAP-PERSIST-01 is explicitly decided;
- no provisional Map ontology is silently promoted into shared core.

Only then should broad implementation begin.

## 11. Current readiness verdict

MAP-ENTITY-01 is closed and does not block this stage.

JURE is **ready to enter JURE-UNIFY-00 design/audit/freeze**.

JURE is **not yet ready for an unconstrained whole-application refactor**.
